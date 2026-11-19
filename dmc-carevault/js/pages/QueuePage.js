/*
 * QueuePage.js
 * Purpose: the queue for a chosen date, first come, first served.
 *   Walk-ins join the line when they check in at the desk.
 *   Booked visits join the line at their booked time.
 *   The clinic decides the doctor on the day. Staff choose it with "Assign doctor".
 *   Whoever joined the line first is served first.
 *   A booked patient who is not back within 5 minutes of being called goes on hold.
 *   The clinic is closed on Sundays.
 */
class QueuePage {
    constructor() {
        this.mainElement = null;
        this.refreshSeconds = 30;
        this.selectedDate = dateHelper.getTodayString();
    }

    start() {
        const page = this;
        const layout = new PageLayout("appointments");

        layout.show(function (mainElement, currentUser) {
            const canAddWalkIn = permissionService.userCan("appointments.manage");
            const walkInButton = canAddWalkIn
                ? '<button class="btn" id="walkInButton" type="button">+ Walk-in</button>'
                : "";

            page.mainElement = mainElement;
            page.mainElement.innerHTML =
                '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:8px">' +
                '<h2 style="margin:0" id="queueTitle">Patient Queue</h2>' + walkInButton + "</div>" +
                '<div class="toolbar" style="margin-bottom:10px">' +
                '<label for="queueDate" style="margin:0">Date</label>' +
                '<input type="date" id="queueDate" value="' + page.selectedDate + '" style="width:auto">' +
                '<button class="btn ghost sm" id="queueToday" type="button">Today</button>' +
                "</div>" +
                '<p style="color:var(--tx2);margin:0 0 12px">First come, first served. Walk-ins join the line when they check in. ' +
                "Booked patients join the line at their booked time. The clinic assigns the doctor on the day. " +
                "A booked patient who is not back within " + appointmentService.getHoldMinutes() +
                " minutes of being called is put on hold.</p>" +
                '<div class="card" id="queueTable"></div>';

            if (canAddWalkIn) {
                document.getElementById("walkInButton").addEventListener("click", function () {
                    page.openWalkInDialog();
                });
            }

            document.getElementById("queueDate").addEventListener("change", function (event) {
                const value = event.target.value || dateHelper.getTodayString();
                if (page.isSunday(value)) {
                    notifier.showWarning("The clinic is closed on Sundays. Choose another date.");
                    event.target.value = page.selectedDate;
                    return;
                }
                page.selectedDate = value;
                page.refreshTable();
            });

            document.getElementById("queueToday").addEventListener("click", function () {
                page.selectedDate = dateHelper.getTodayString();
                document.getElementById("queueDate").value = page.selectedDate;
                page.refreshTable();
            });

            document.getElementById("queueTable").addEventListener("click", function (event) {
                page.handleButtonClick(event);
            });

            page.refreshTable();
            setInterval(function () { page.refreshTable(); }, page.refreshSeconds * 1000);
        });
    }

    isToday(dateText) {
        return dateText === dateHelper.getTodayString();
    }

    isSunday(dateText) {
        const parts = dateText.split("-");
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getDay() === 0;
    }

    // Applies the booked-visit rules (for today only), then redraws the table.
    refreshTable() {
        try {
            this.announce(appointmentService.runScheduleRules());
        } catch (error) {
            notifier.showError(error.message);
        }

        const page = this;
        const viewingToday = this.isToday(this.selectedDate);
        const queue = this.getQueueList();
        const nextEntry = queue.find(function (item) { return item.status === "Waiting"; });
        const nextId = viewingToday && nextEntry ? nextEntry.id : "";

        document.getElementById("queueTitle").textContent = viewingToday
            ? "Patient Queue - Today"
            : "Patient Queue - " + this.selectedDate;

        const columns = [
            { title: "Date", getCellHtml: function (item) {
                return htmlHelper.escapeText(item.date) + (page.isToday(item.date) ? ' <small style="color:var(--g)">Today</small>' : "");
            } },
            { title: "Queue #", getCellHtml: function (item) {
                return item.queueNumber === null || item.queueNumber === undefined ? "-" : String(item.queueNumber);
            } },
            { title: "Booked", getCellHtml: function (item) {
                return appointmentService.isScheduledVisit(item) ? page.formatSlot(item) : "Walk-in";
            } },
            { title: "Patient", getCellHtml: function (item) {
                return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId));
            } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Doctor", getCellHtml: function (item) { return page.doctorLabel(item); } },
            { title: "Status", getCellHtml: function (item) {
                const next = item.id === nextId ? ' <small style="color:var(--g);font-weight:600">Next</small>' : "";
                return page.buildStatusHtml(item) + next;
            } },
            { title: "Vitals", getCellHtml: function (item) {
                if (!item.vitals) {
                    return '<span class="badge pending">Not recorded</span>';
                }
                return '<span class="badge">Recorded</span> <small>BP ' + htmlHelper.escapeText(item.vitals.bloodPressure) + "</small>";
            } },
            { title: "Joined line", getCellHtml: function (item) { return dateHelper.formatTime(item.queuedAt); } },
            { title: "Time Started", getCellHtml: function (item) { return dateHelper.formatTime(item.startedAt); } },
            { title: "Time Done", getCellHtml: function (item) { return dateHelper.formatTime(item.completedAt); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionHtml(item); } }
        ];

        document.getElementById("queueTable").innerHTML =
            tableBuilder.buildTableHtml(columns, queue, "No patients in the queue for " + this.selectedDate + ".");
    }

    // The doctor's name, or a "Not assigned" badge while the clinic has not decided.
    doctorLabel(item) {
        if (!item.doctorUsername) {
            return '<span class="badge pending">Not assigned</span>';
        }
        return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername));
    }

    // Options for a doctor drop-down. Doctors who are ready now are marked.
    doctorOptionsHtml(selectedUsername) {
        const escape = htmlHelper.escapeText;
        let html = '<option value="">Not decided yet</option>';
        userService.getActiveDoctors().forEach(function (doctor) {
            const ready = doctorAvailabilityService.isReadyNow(doctor.username) ? " (ready now)" : "";
            const selected = doctor.username === selectedUsername ? " selected" : "";
            html += '<option value="' + escape(doctor.username) + '"' + selected + ">" +
                escape(doctor.fullName) + ready + "</option>";
        });
        return html;
    }

    // The entries for the selected date, in serving order.
    getQueueList() {
        const selected = this.selectedDate;
        const list = appointmentService.getAppointmentsForCurrentUser().filter(function (item) {
            return item.date === selected && item.status !== "Cancelled";
        });
        list.sort(function (first, second) {
            return appointmentService.compareServeOrder(first, second);
        });
        return list;
    }

    // Staff choose the doctor for a patient still in the queue. The clinic decides this on the day.
    openAssignDialog(appointmentId) {
        const page = this;
        const appointment = this.findQueueItem(appointmentId);
        if (appointment === null) {
            notifier.showError("Queue entry not found.");
            return;
        }

        const escape = htmlHelper.escapeText;
        const patientName = patientService.getPatientNameById(appointment.patientId);
        const body =
            '<p class="popup-lead"><b>' + escape(patientName) + "</b> · " + escape(appointment.reason) +
            " · " + escape(appointment.date) + "</p>" +
            '<p class="popup-lead">Choose the doctor who is available for this patient.</p>' +
            '<div class="fg"><label for="assignDoctor">Doctor</label><select id="assignDoctor">' +
            page.doctorOptionsHtml(appointment.doctorUsername || "") + "</select></div>";

        const dialog = new ModalDialog("Assign doctor", body, {
            saveButtonText: "Save doctor",
            onSave: function (openDialog) {
                const value = openDialog.getElement().querySelector("#assignDoctor").value;
                appointmentService.assignDoctor(appointmentId, value);
                notifier.showSuccess(value ? "Doctor assigned." : "Doctor cleared.");
                page.refreshTable();
            }
        });
        dialog.open();
    }

        // Walk-in: the patient joins today's line now, with the next queue number.
        // Walk-in: the patient joins today's line now, with the next queue number.
        openWalkInDialog() {
            const page = this;
            const escape = htmlHelper.escapeText;
            const patientList = patientService.getPatientSelectOptions();

            let reasonOptions = '<option value="">Choose a reason...</option>';
            appointmentService.validReasons.forEach(function (reason) {
                reasonOptions += "<option>" + escape(reason) + "</option>";
            });

            const body =
                '<p class="popup-lead">The patient joins today\'s line now and is served in the order they arrived.</p>' +
                '<div class="fg"><label for="walkSearch">Search patient (name, ID or contact number)</label>' +
                '<input id="walkSearch" placeholder="Type to filter the list..." autocomplete="off"></div>' +
                '<div class="fg"><label for="walkPatient">Patient</label>' +
                '<select id="walkPatient" size="6"></select></div>' +
                '<div class="fg"><label for="walkDoctor">Doctor (optional, the clinic can assign later)</label>' +
                '<select id="walkDoctor">' + page.doctorOptionsHtml("") + "</select></div>" +
                '<div class="fg"><label for="walkReason">Reason for visit</label>' +
                '<select id="walkReason">' + reasonOptions + "</select></div>";

            const dialog = new ModalDialog("Add walk-in to the queue", body, {
                saveButtonText: "Add to queue",
                onSave: function (openDialog) {
                    if (page.isSunday(dateHelper.getTodayString())) {
                        throw new Error("The clinic is closed on Sundays. Walk-ins cannot be added today.");
                    }
                    const root = openDialog.getElement();
                    appointmentService.saveAppointment({
                        id: "",
                        patientId: root.querySelector("#walkPatient").value,
                        doctorUsername: root.querySelector("#walkDoctor").value,
                        reason: root.querySelector("#walkReason").value,
                        date: dateHelper.getTodayString(),
                        priority: "Regular"
                    });
                    notifier.showSuccess("Walk-in added to the queue.");
                    page.selectedDate = dateHelper.getTodayString();
                    document.getElementById("queueDate").value = page.selectedDate;
                    page.refreshTable();
                }
            });
            dialog.open();

            // Filter the patient list as the staff member types.
            const root = dialog.getElement();
            page.renderWalkInPatients(root, patientList, "");
            root.querySelector("#walkSearch").addEventListener("input", function (event) {
                page.renderWalkInPatients(root, patientList, event.target.value);
            });
            root.querySelector("#walkSearch").focus();
        }

        // Fills the patient list with the patients that match the search text.
        renderWalkInPatients(root, patientList, keyword) {
            const escape = htmlHelper.escapeText;
            const text = String(keyword || "").toLowerCase().trim();
            const select = root.querySelector("#walkPatient");
            const previous = select.value;

            let html = '<option value="">Choose a patient...</option>';
            let shown = 0;
            patientList.forEach(function (option) {
                if (text === "" || option.searchText.toLowerCase().includes(text)) {
                    html += '<option value="' + escape(option.value) + '">' + escape(option.label) + "</option>";
                    shown = shown + 1;
                }
            });
            select.innerHTML = html;

            // Keeps the chosen patient selected while the list changes.
            if (previous !== "" && select.querySelector('option[value="' + previous + '"]') !== null) {
                select.value = previous;
            }
            if (shown === 0) {
                select.innerHTML = '<option value="">No patient matches that search</option>';
            }
        }

    // Tells staff when a booked patient was called into the line or put on hold.
    announce(result) {
        const page = this;
        result.called.forEach(function (item) {
            notifier.showWarning(patientService.getPatientNameById(item.patientId) +
                " (booked " + page.formatSlot(item) + ") has joined the line.");
        });
        result.held.forEach(function (item) {
            notifier.showWarning(patientService.getPatientNameById(item.patientId) +
                " did not return within " + appointmentService.getHoldMinutes() + " minutes and is on hold.");
        });
    }

    formatSlot(item) {
        return appointmentService.getSlotTime(item).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    // The time a called booked patient goes on hold if they have not come back.
    holdTime(item) {
        const deadline = new Date(new Date(item.queuedAt).getTime() + appointmentService.getHoldMinutes() * 60 * 1000);
        return dateHelper.formatTime(deadline.toISOString());
    }

    buildStatusHtml(item) {
        if (item.status === "Missing") {
            return '<span class="badge missing">On hold</span>';
        }
        if (item.status === "Scheduled") {
            return '<span class="badge scheduled">Booked</span>';
        }
        return htmlHelper.buildStatusBadge(item.status);
    }

    // Vital signs can be recorded (or changed) only for today, before the patient is sent to the doctor.
    canRecordVitals(appointment) {
        const isBeforeDoctor = appointment.status === "Scheduled" || appointment.status === "Waiting";
        return this.isToday(appointment.date) && isBeforeDoctor && permissionService.userCan("vitals.record");
    }

    buildActionHtml(item) {
        const idText = htmlHelper.escapeText(item.id);
        const isInQueue = item.status === "Scheduled" || item.status === "Waiting" || item.status === "Missing";
        let html = "";

        // The doctor can be chosen for any day that is still open.
        if (isInQueue && permissionService.userCan("appointments.manage")) {
            html += '<button class="btn sm ghost" data-assign="' + idText + '">' +
                (item.doctorUsername ? "Change doctor" : "Assign doctor") + "</button> ";
        }

        // Future and past dates are view-only for the queue steps.
        if (!this.isToday(item.date)) {
            const note = item.status === "Completed" || item.status === "Cancelled"
                ? "Closed"
                : "Acts on " + htmlHelper.escapeText(item.date);
            return html + '<small style="color:var(--tx2)">' + note + "</small>";
        }

        if (this.canRecordVitals(item)) {
            html += '<button class="btn sm ghost" data-vitals="' + idText + '">' +
                (item.vitals ? "Edit vitals" : "Record vitals") + "</button> ";
        }

        if (item.status === "Scheduled") {
            html += '<small style="color:var(--tx2)">Joins the line at ' + this.formatSlot(item) + "</small>";
        } else if (item.status === "Waiting") {
            if (item.doctorUsername) {
                html += '<button class="btn sm" data-id="' + idText + '" data-status="In Consultation">Send to doctor</button> ';
            } else {
                html += '<small style="color:var(--amb)">Assign a doctor before sending in</small> ';
            }
            if (appointmentService.isScheduledVisit(item)) {
                html += '<div><small style="color:var(--tx2)">Called at ' + dateHelper.formatTime(item.queuedAt) +
                    ", on hold after " + this.holdTime(item) + "</small></div>";
            } else {
                html += '<button class="btn sm ghost" data-id="' + idText + '" data-status="Missing">Hold</button>';
            }
        } else if (item.status === "Missing") {
            html += '<button class="btn sm" data-id="' + idText + '" data-status="Waiting">Back in line</button>';
        } else if (item.status === "In Consultation") {
            html += '<button class="btn sm" data-id="' + idText + '" data-status="Completed">Mark completed</button>';
        }
        return html;
    }

    handleButtonClick(event) {
        const assignButton = event.target.closest("button[data-assign]");
        if (assignButton !== null) {
            this.openAssignDialog(assignButton.getAttribute("data-assign"));
            return;
        }

        const vitalsButton = event.target.closest("button[data-vitals]");
        if (vitalsButton !== null) {
            this.openVitalsForm(vitalsButton.getAttribute("data-vitals"));
            return;
        }

        const statusButton = event.target.closest("button[data-status]");
        if (statusButton === null) {
            return;
        }

        try {
            appointmentService.changeStatus(statusButton.getAttribute("data-id"), statusButton.getAttribute("data-status"));
            notifier.showSuccess("Queue updated.");
            this.refreshTable();
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    // ----- Vital signs form -----

    findQueueItem(appointmentId) {
        const all = appointmentService.getAppointmentsForCurrentUser();
        for (let i = 0; i < all.length; i++) {
            if (all[i].id === appointmentId) {
                return all[i];
            }
        }
        return null;
    }

    buildVitalsFields() {
        return [
            { name: "bloodPressure", label: "Blood Pressure (mmHg, e.g. 120/80)", type: "text", isRequired: true, isFullWidth: true },
            { name: "heartRate", label: "Heart Rate (beats per minute)", type: "number", isRequired: true, min: 30, max: 220 },
            { name: "temperature", label: "Temperature (°C)", type: "number", isRequired: true, min: 34, max: 43 },
            { name: "respiratoryRate", label: "Respiratory Rate (breaths per minute)", type: "number", isRequired: true, min: 5, max: 60 },
            { name: "weight", label: "Weight (kg)", type: "number", isRequired: true, min: 1, max: 300 },
            { name: "height", label: "Height (cm), optional", type: "number", min: 30, max: 250 }
        ];
    }

    openVitalsForm(appointmentId) {
        const page = this;
        const appointment = this.findQueueItem(appointmentId);
        if (appointment === null) {
            notifier.showError("Queue entry not found.");
            return;
        }

        const fields = this.buildVitalsFields();
        const existingValues = appointment.vitals ? appointment.vitals : {};
        const patientName = patientService.getPatientNameById(appointment.patientId);

        const dialog = new ModalDialog("Vital Signs - " + patientName, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Vital Signs",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                appointmentService.saveVitals(appointmentId, values);
                notifier.showSuccess("Vital signs saved.");
                page.refreshTable();
            }
        });
        dialog.open();
    }
}

const queuePage = new QueuePage();
queuePage.start();