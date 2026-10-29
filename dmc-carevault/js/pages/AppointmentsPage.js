/*
 * AppointmentsPage.js
 * Purpose: the Queuing page. This replaces the old Appointments and Patient Queue pages.
 * Staff adds patients to the queue and moves them through the steps.
 * Doctors see their own patients in the queue (view only).
 *
 * Steps for each patient:
 *   1. Check in            (Scheduled / Confirmed -> Waiting, gets the next queue number)
 *   2. Record vital signs  (before the patient is sent to the doctor)
 *   3. Send to doctor      (Waiting -> In Consultation, needs vital signs first)
 *   4. Mark completed      (In Consultation -> Completed)
 */
class AppointmentsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
        this.filterDate = dateHelper.getTodayString();
        this.filterStatus = "";
        // First come, first served: { appointmentId: the patient who must be sent to the doctor first }.
        this.serveFirstMap = {};
    }

    start() {
        const page = this;
        const layout = new PageLayout("appointments");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    // ---------- Page layout ----------

    showPage() {
        let html = "<h2>Queuing</h2>";
        html += '<div id="nextPatientBar"></div>';
        html += '<div class="toolbar">';
        html += '<input id="searchInput" placeholder="Search patient or reason...">';
        html += '<input id="dateFilter" type="date" title="Clear the date to see all dates" value="' + this.filterDate + '">';
        html += '<select id="statusFilter"><option value="">All statuses</option>';
        for (let i = 0; i < appointmentService.validStatuses.length; i++) {
            html += "<option>" + appointmentService.validStatuses[i] + "</option>";
        }
        html += "</select>";
        html += '<span class="sp"></span>';
        if (permissionService.userCan("appointments.manage")) {
            html += '<button class="btn" id="addQueueButton">+ Add to Queue</button>';
        }
        html += "</div>";
        html += '<div class="card" id="queueTable"></div>';

        this.mainElement.innerHTML = html;
        this.connectEvents();
        this.refreshTable();
    }

    connectEvents() {
        const page = this;

        document.getElementById("searchInput").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value.toLowerCase().trim();
            page.refreshTable();
        });
        document.getElementById("dateFilter").addEventListener("change", function (event) {
            page.filterDate = event.target.value;
            page.refreshTable();
        });
        document.getElementById("statusFilter").addEventListener("change", function (event) {
            page.filterStatus = event.target.value;
            page.refreshTable();
        });

        const addButton = document.getElementById("addQueueButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                page.openQueueForm(null);
            });
        }

        document.getElementById("queueTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
    }

    // ---------- Table ----------

    // Applies the date, status and search filters.
    getFilteredEntries() {
        const allEntries = appointmentService.getAppointmentsForCurrentUser();
        const result = [];

        for (let i = 0; i < allEntries.length; i++) {
            const entry = allEntries[i];

            if (this.filterDate !== "" && entry.date !== this.filterDate) {
                continue;
            }
            if (this.filterStatus !== "" && entry.status !== this.filterStatus) {
                continue;
            }

            const searchableText = (patientService.getPatientNameById(entry.patientId) + " " +
                entry.patientId + " " + entry.reason).toLowerCase();
            if (this.searchKeyword !== "" && !searchableText.includes(this.searchKeyword)) {
                continue;
            }

            result.push(entry);
        }

        // One day: queue order (1, 2, 3...). All dates: newest day first.
        if (this.filterDate !== "") {
            result.sort(function (first, second) {
                return appointmentService.compareQueueOrder(first, second);
            });
        } else {
            result.sort(function (first, second) {
                return appointmentService.compareNewestFirst(first, second);
            });
        }
        return result;
    }

    refreshTable() {
        const page = this;
        this.serveFirstMap = appointmentService.getServeFirstMap(appointmentService.getAppointmentsForCurrentUser());
        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Queue #", getCellHtml: function (item) {
                if (item.queueNumber === null || item.queueNumber === undefined) {
                    return "-";
                }
                return item.queueNumber;
            } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Vitals", getCellHtml: function (item) {
                if (!item.vitals) {
                    return '<span class="badge pending">Not recorded</span>';
                }
                return '<span class="badge">Recorded</span> <small>BP ' + htmlHelper.escapeText(item.vitals.bloodPressure) + "</small>";
            } },
            { title: "Time In", getCellHtml: function (item) { return dateHelper.formatTime(item.queuedAt); } },
            { title: "Time Started", getCellHtml: function (item) { return dateHelper.formatTime(item.startedAt); } },
            { title: "Time Done", getCellHtml: function (item) { return dateHelper.formatTime(item.completedAt); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } }
        ];

        document.getElementById("queueTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getFilteredEntries(), "No patients in the queue for this date.");
        this.refreshNextPatientBar();
    }

    // Green bar above the table: the patient who is next in line today (lowest queue number still waiting).
    // It ignores the date and status filters, so it always answers "who is next?".
    refreshNextPatientBar() {
        const barElement = document.getElementById("nextPatientBar");
        if (barElement === null) {
            return;
        }

        // Today's list is already in queue order.
        const todayAppointments = appointmentService.getTodayAppointments();
        const waitingList = [];
        for (let i = 0; i < todayAppointments.length; i++) {
            if (todayAppointments[i].status === "Waiting") {
                waitingList.push(todayAppointments[i]);
            }
        }

        let html = '<div class="ready-bar"><div class="ready-bar-row">';
        if (waitingList.length === 0) {
            html += "<span>No patients waiting in the queue.</span>";
        } else {
            const nextEntry = waitingList[0];
            html += "<span>Next patient:</span> <b>#" + htmlHelper.escapeText(nextEntry.queueNumber) + " " +
                htmlHelper.escapeText(patientService.getPatientNameById(nextEntry.patientId)) + "</b>";
            html += " <span>" + htmlHelper.escapeText(nextEntry.reason) + "</span>";
            html += " <small>(" + waitingList.length + " waiting)</small>";
        }
        html += "</div></div>";
        barElement.innerHTML = html;
    }

    // Returns { nextStatus, buttonText } for the current status, or null when there is no next step.
    getNextStep(currentStatus) {
        if (currentStatus === "Scheduled" || currentStatus === "Confirmed") {
            return { nextStatus: "Waiting", buttonText: "Check in" };
        }
        if (currentStatus === "Waiting") {
            return { nextStatus: "In Consultation", buttonText: "Send to doctor" };
        }
        if (currentStatus === "In Consultation") {
            return { nextStatus: "Completed", buttonText: "Mark completed" };
        }
        return null;
    }

    // Vital signs can be recorded (or changed) only before the patient is sent to the doctor.
    canRecordVitals(entry) {
        const isBeforeDoctor = entry.status === "Scheduled" ||
            entry.status === "Confirmed" ||
            entry.status === "Waiting";
        return isBeforeDoctor && permissionService.userCan("vitals.record");
    }

    // Only the buttons the current user may use are created.
    buildActionButtons(entry) {
        const id = entry.id;
        let html = "";

        if (this.canRecordVitals(entry)) {
            let vitalsText = "Record vitals";
            if (entry.vitals) {
                vitalsText = "Edit vitals";
            }
            html += '<button class="btn sm ghost" data-vitals="' + id + '">' + vitalsText + "</button> ";
        }

        const nextStep = this.getNextStep(entry.status);
        if (nextStep !== null && permissionService.userCan("queue.manage")) {
            const mustGoFirst = this.serveFirstMap[id];
            if (nextStep.nextStatus === "In Consultation" && mustGoFirst !== undefined) {
                // First come, first served: someone who arrived earlier is still waiting.
                html += '<button class="btn sm ghost" disabled title="Queue number ' + mustGoFirst.queueNumber +
                    ' arrived first and must be served first">Wait for #' + mustGoFirst.queueNumber + "</button> ";
            } else {
                html += '<button class="btn sm" data-step-id="' + id + '" data-step-status="' + nextStep.nextStatus + '">' +
                    nextStep.buttonText + "</button> ";
            }
        }

        const isFinished = entry.status === "Completed" || entry.status === "Cancelled";
        if (!isFinished && permissionService.userCan("appointments.manage")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + id + '">Edit</button> ';
            html += '<button class="btn sm danger" data-action="cancel" data-id="' + id + '">Cancel</button>';
        }
        return html;
    }

    findEntryById(entryId) {
        const allEntries = appointmentService.getAppointmentsForCurrentUser();
        for (let i = 0; i < allEntries.length; i++) {
            if (allEntries[i].id === entryId) {
                return allEntries[i];
            }
        }
        return null;
    }

    handleTableButtonClick(event) {
        const vitalsButton = event.target.closest("button[data-vitals]");
        if (vitalsButton !== null) {
            this.openVitalsForm(vitalsButton.getAttribute("data-vitals"));
            return;
        }

        const stepButton = event.target.closest("button[data-step-id]");
        if (stepButton !== null) {
            this.runQueueStep(stepButton.getAttribute("data-step-id"), stepButton.getAttribute("data-step-status"));
            return;
        }

        const actionButton = event.target.closest("button[data-action]");
        if (actionButton === null) {
            return;
        }

        const entry = this.findEntryById(actionButton.getAttribute("data-id"));
        if (entry === null) {
            notifier.showError("Queue entry not found.");
            return;
        }

        try {
            if (actionButton.getAttribute("data-action") === "edit") {
                this.openQueueForm(entry);
            } else {
                this.cancelQueueEntry(entry);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    runQueueStep(entryId, nextStatus) {
        try {
            appointmentService.changeStatus(entryId, nextStatus);
            notifier.showSuccess("Queue updated.");
            this.refreshTable();
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    cancelQueueEntry(entry) {
        if (confirm("Cancel this queue entry?") === false) {
            return;
        }
        appointmentService.changeStatus(entry.id, "Cancelled");
        notifier.showSuccess("Queue entry cancelled.");
        this.refreshTable();
    }

    // ---------- Add / Edit form ----------

    buildQueueFields(isEditing, existingEntry) {
        const doctorOptions = [];
        const doctors = userService.getActiveDoctors();
        for (let i = 0; i < doctors.length; i++) {
            doctorOptions.push({ value: doctors[i].username, label: doctors[i].fullName });
        }

        return [
            { name: "patientId", label: "Patient", type: "searchselect", isRequired: true, isFullWidth: true,
                options: patientService.getPatientSelectOptions(), placeholder: "Type a name or patient ID to search..." },
            { name: "doctorUsername", label: "Doctor", type: "select", options: doctorOptions },
            { name: "reason", label: "Reason", type: "text", isRequired: true, isFullWidth: true, maxLength: 100 }
        ];
    }

    // entry is null when adding a new patient to the queue.
    openQueueForm(entry) {
        const page = this;
        const isEditing = entry !== null;
        const fields = this.buildQueueFields(isEditing, entry);

        let existingValues = {};
        let dialogTitle = "Add to Queue";
        if (isEditing) {
            existingValues = entry;
            dialogTitle = "Edit Queue Entry";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            onSave: function () {
                page.saveQueueFromForm(fields, entry);
            }
        });
        dialog.open();
        formBuilder.connectFields(dialog.getElement(), fields);
        this.addReasonSuggestions(dialog.getElement());
    }

    // The reason is typed freely. The services (Check-up, X-ray...) are only suggestions while typing.
    addReasonSuggestions(dialogElement) {
        const reasonBox = dialogElement.querySelector("#field_reason");
        reasonBox.setAttribute("list", "reasonSuggestions");
        reasonBox.setAttribute("placeholder", "Type the reason, or pick a service");

        let html = '<datalist id="reasonSuggestions">';
        for (let i = 0; i < appointmentService.validReasons.length; i++) {
            html += '<option value="' + htmlHelper.escapeText(appointmentService.validReasons[i]) + '"></option>';
        }
        html += "</datalist>";
        reasonBox.insertAdjacentHTML("afterend", html);
    }

    saveQueueFromForm(fields, entry) {
        const formValues = formBuilder.readFormValues(fields);

        if (entry === null) {
            // New entries are always for today, and get the next queue number right away.
            formValues.id = "";
            formValues.date = dateHelper.getTodayString();
            const savedEntry = appointmentService.saveAppointment(formValues);
            notifier.showSuccess("Patient added to the queue. Queue number " + savedEntry.queueNumber + ".");
        } else {
            // Editing changes only the patient, doctor and reason. Status changes use the step buttons.
            formValues.id = entry.id;
            formValues.date = entry.date;
            appointmentService.saveAppointment(formValues);
            notifier.showSuccess("Queue entry updated.");
        }
        this.refreshTable();
    }

    // ---------- Vital signs form ----------

    buildVitalsFields() {
        return [
            { name: "bloodPressure", label: "Blood Pressure (mmHg, e.g. 120/80)", type: "text", isRequired: true, isFullWidth: true },
            { name: "heartRate", label: "Heart Rate (beats per minute)", type: "number", isRequired: true, min: 30, max: 220 },
            { name: "temperature", label: "Temperature (°C)", type: "number", isRequired: true, min: 0 },
            { name: "respiratoryRate", label: "Respiratory Rate (breaths per minute)", type: "number", isRequired: true, min: 5, max: 60 },
            { name: "weight", label: "Weight (kg)", type: "number", isRequired: true, min: 1, max: 300 },
            { name: "height", label: "Height (cm), optional", type: "number", min: 30, max: 250 }
        ];
    }

    openVitalsForm(entryId) {
        const page = this;
        const entry = this.findEntryById(entryId);
        if (entry === null) {
            notifier.showError("Queue entry not found.");
            return;
        }

        const fields = this.buildVitalsFields();
        const existingValues = entry.vitals ? entry.vitals : {};
        const patientName = patientService.getPatientNameById(entry.patientId);

        const dialog = new ModalDialog("Vital Signs - " + patientName, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Vital Signs",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                appointmentService.saveVitals(entryId, values);
                notifier.showSuccess("Vital signs saved.");
                page.refreshTable();
            }
        });
        dialog.open();
    }
}

const appointmentsPage = new AppointmentsPage();
appointmentsPage.start();