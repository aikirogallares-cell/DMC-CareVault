/*
 * ConsultationsPage.js
 * Purpose: consultation records. Doctors can create and edit; Admin can only view.
 * When a doctor starts a new consultation for a patient, the vital signs staff recorded today
 * are filled in automatically. The doctor can still change them.
 */
class ConsultationsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
        this.filterDate = "";
        this.filterStatus = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("consultations");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        const canWrite = permissionService.userCan("consultations.write");

        let html = "<h2>Consultations</h2>";
        html += '<div class="toolbar">';
        html += '<input id="searchInput" placeholder="Search patient, complaint or diagnosis...">';
        html += '<input id="dateFilter" type="date" title="Show only this date. Clear it to see all dates.">';
        html += '<select id="statusFilter"><option value="">All statuses</option><option>In Progress</option><option>Completed</option></select>';
        html += '<span class="sp"></span>';
        if (canWrite) {
            html += '<button class="btn" id="addConsultationButton">+ New Consultation</button>';
        }
        html += "</div>";
        html += '<div class="card" id="consultationTable"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        if (canWrite) {
            document.getElementById("addConsultationButton").addEventListener("click", function () {
                page.openConsultationForm(null);
            });
        }
        document.getElementById("consultationTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
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

        this.refreshTable();

        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && canWrite) {
            this.openConsultationForm(null);
        }
    }

    // Applies the search, date and status filters. Newest first.
    getFilteredConsultations() {
        const allConsultations = consultationService.getConsultationsForCurrentUser();
        const result = [];

        for (let i = 0; i < allConsultations.length; i++) {
            const item = allConsultations[i];

            if (this.filterDate !== "" && item.date !== this.filterDate) {
                continue;
            }
            if (this.filterStatus !== "" && item.status !== this.filterStatus) {
                continue;
            }

            const searchableText = (item.id + " " + item.patientId + " " + patientService.getPatientNameById(item.patientId) + " " +
                item.complaint + " " + item.diagnosis).toLowerCase();
            if (this.searchKeyword !== "" && !searchableText.includes(this.searchKeyword)) {
                continue;
            }

            result.push(item);
        }

        result.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });
        return result;
    }

    refreshTable() {
        const page = this;
        const consultations = this.getFilteredConsultations();
        const isFiltering = this.searchKeyword !== "" || this.filterDate !== "" || this.filterStatus !== "";

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Chief Complaint", getCellHtml: function (item) { return htmlHelper.escapeText(item.complaint); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } }
        ];

        document.getElementById("consultationTable").innerHTML =
            tableBuilder.buildTableHtml(columns, consultations, isFiltering ? "No consultations match your search." : "No consultations yet.");
    }

    buildActionButtons(consultation) {
        let html = '<button class="btn sm ghost" data-action="view" data-id="' + consultation.id + '">View</button>';

        if (permissionService.userCan("consultations.write")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + consultation.id + '">Edit</button>';
        }
        return html;
    }

    findConsultationById(consultationId) {
        const consultations = consultationService.getConsultationsForCurrentUser();
        for (let i = 0; i < consultations.length; i++) {
            if (consultations[i].id === consultationId) {
                return consultations[i];
            }
        }
        return null;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const consultation = this.findConsultationById(button.getAttribute("data-id"));
        if (button.getAttribute("data-action") === "edit") {
            this.openConsultationForm(consultation);
        } else {
            this.openViewDialog(consultation);
        }
    }

    // The newest vital signs staff recorded today for this patient, or null if there are none.
    findTodayVitalsForPatient(patientId) {
        if (patientId === "") {
            return null;
        }

        const today = dateHelper.getTodayString();
        const appointments = appointmentService.getAppointmentsForCurrentUser();
        let newest = null;

        for (let i = 0; i < appointments.length; i++) {
            const item = appointments[i];
            if (item.patientId === patientId && item.date === today && item.vitals) {
                if (newest === null || String(item.vitals.recordedAt).localeCompare(String(newest.recordedAt)) > 0) {
                    newest = item.vitals;
                }
            }
        }
        return newest;
    }

    // Returns the text for a vital sign box, or "" when the staff did not record it.
    valueFromVitals(vitals, name) {
        if (vitals === null || vitals[name] === undefined) {
            return "";
        }
        return String(vitals[name]);
    }

    buildFormFields(isEditing) {
        const chosenPatientId = new URLSearchParams(window.location.search).get("patient") || "";

        // Vital signs are filled in only for a new consultation.
        let staffVitals = null;
        if (isEditing === false) {
            staffVitals = this.findTodayVitalsForPatient(chosenPatientId);
        }

        const fields = [];
        fields.push({ name: "patientId", label: "Patient", type: "select", options: patientService.getPatientSelectOptions(), isFullWidth: true, defaultValue: chosenPatientId });
        fields.push({ name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() });
        fields.push({ name: "status", label: "Consultation Status", type: "select", options: formBuilder.createOptionsFromTexts(["In Progress", "Completed"]) })
        fields.push({ name: "complaint", label: "Chief Complaint", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "symptoms", label: "Symptoms", type: "textarea", isFullWidth: true });

        fields.push({ sectionTitle: "Vital Signs" });
        fields.push({ name: "bloodPressure", label: "Blood Pressure", type: "text", defaultValue: this.valueFromVitals(staffVitals, "bloodPressure") });
        fields.push({ name: "heartRate", label: "Heart Rate", type: "text", defaultValue: this.valueFromVitals(staffVitals, "heartRate") });
        fields.push({ name: "temperature", label: "Temperature (°C)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "temperature") });
        fields.push({ name: "respiratoryRate", label: "Respiratory Rate", type: "text", defaultValue: this.valueFromVitals(staffVitals, "respiratoryRate") });
        fields.push({ name: "weight", label: "Weight (kg)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "weight") });
        fields.push({ name: "height", label: "Height (cm)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "height") });

        fields.push({ sectionTitle: "Assessment" });
        fields.push({ name: "diagnosis", label: "Diagnosis", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "treatment", label: "Treatment", type: "textarea", isFullWidth: true });
        fields.push({ name: "notes", label: "Doctor's Notes", type: "textarea", isFullWidth: true });
        return fields;
    }

        openConsultationForm(consultationToEdit) {
        const page = this;
        const fields = this.buildFormFields(consultationToEdit !== null);

        let existingValues = {};
        let dialogTitle = "New Consultation";
        if (consultationToEdit !== null) {
            existingValues = consultationToEdit;
            dialogTitle = "Edit Consultation";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Consultation",
            onSave: function () {
                const formValues = formBuilder.readFormValues(fields);
                formValues.id = consultationToEdit === null ? "" : consultationToEdit.id;

                const result = consultationService.saveConsultation(formValues);
                page.showSaveMessage(formValues.status, result);
                page.refreshTable();
            }
        });
        dialog.open();

        // The save button tells the doctor what will happen when they press it.
        const dialogElement = dialog.getElement();
        const statusBox = dialogElement.querySelector("#field_status");
        const saveButton = dialogElement.querySelector("#dialogSaveButton");
        const updateSaveButtonText = function () {
            if (statusBox.value === "Completed") {
                saveButton.textContent = "Finish & Send to Billing";
            } else {
                saveButton.textContent = "Save Consultation";
            }
        };
        statusBox.addEventListener("change", updateSaveButtonText);
        updateSaveButtonText();
    }
        showSaveMessage(status, result) {
        if (status !== "Completed") {
            notifier.showSuccess("Consultation saved successfully.");
            return;
        }
        if (result.finishedEntry !== null) {
            notifier.showSuccess("Consultation finished. Staff and admin have been notified, and the bill is ready in Billing.");
            return;
        }
        if (result.isNewConsultation) {
            notifier.showWarning("Consultation saved, but this patient is not in consultation with you today, so no bill was created.");
            return;
        }
        notifier.showSuccess("Consultation saved.");
    }
    
    openViewDialog(consultation) {
        const vitalsText = "BP " + consultation.bloodPressure + " | HR " + consultation.heartRate +
            " | Temp " + consultation.temperature + " °C | RR " + consultation.respiratoryRate +
            " | " + consultation.weight + " kg | " + consultation.height + " cm";

        const rows = [
            ["Date", consultation.date],
            ["Status", consultation.status],
            ["Chief Complaint", consultation.complaint],
            ["Symptoms", consultation.symptoms],
            ["Vital Signs", vitalsText],
            ["Diagnosis", consultation.diagnosis],
            ["Treatment", consultation.treatment],
            ["Doctor's Notes", consultation.notes]
        ];

        let html = '<dl class="kv">';
        for (let i = 0; i < rows.length; i++) {
            let shownValue = rows[i][1];
            if (shownValue === "" || shownValue === undefined) {
                shownValue = "-";
            }
            html += "<dt>" + rows[i][0] + "</dt><dd>" + htmlHelper.escapeText(shownValue) + "</dd>";
        }
        html += "</dl>";

        const title = "Consultation - " + patientService.getPatientNameById(consultation.patientId);
        new ModalDialog(title, html, { isWide: true }).open();
    }
}

const consultationsPage = new ConsultationsPage();
consultationsPage.start();