/*
 * ConsultationsPage.js
 * Purpose: consultation records. Doctors can create and edit; Admin can only view.
 */
class ConsultationsPage {
    constructor() {
        this.mainElement = null;
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
        html += '<div class="toolbar"><span class="sp"></span>';
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

        this.refreshTable();

        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && canWrite) {
            this.openConsultationForm(null);
        }
    }

    refreshTable() {
        const page = this;
        const consultations = consultationService.getConsultationsForCurrentUser();

        consultations.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Chief Complaint", getCellHtml: function (item) { return htmlHelper.escapeText(item.complaint); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } }
        ];

        document.getElementById("consultationTable").innerHTML =
            tableBuilder.buildTableHtml(columns, consultations, "No consultations yet.");
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

    buildFormFields() {
        const fields = [];
        fields.push({ name: "patientId", label: "Patient", type: "select", options: patientService.getPatientSelectOptions(), isFullWidth: true });
        fields.push({ name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() });
        fields.push({ name: "status", label: "Status", type: "select", options: formBuilder.createOptionsFromTexts(["In Progress", "Completed"]) });
        fields.push({ name: "complaint", label: "Chief Complaint", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "symptoms", label: "Symptoms", type: "textarea", isFullWidth: true });

        fields.push({ sectionTitle: "Vital Signs" });
        fields.push({ name: "bloodPressure", label: "Blood Pressure", type: "text" });
        fields.push({ name: "heartRate", label: "Heart Rate", type: "text" });
        fields.push({ name: "temperature", label: "Temperature (°C)", type: "text" });
        fields.push({ name: "respiratoryRate", label: "Respiratory Rate", type: "text" });
        fields.push({ name: "weight", label: "Weight (kg)", type: "text" });
        fields.push({ name: "height", label: "Height (cm)", type: "text" });

        fields.push({ sectionTitle: "Assessment" });
        fields.push({ name: "diagnosis", label: "Diagnosis", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "treatment", label: "Treatment", type: "textarea", isFullWidth: true });
        fields.push({ name: "notes", label: "Doctor's Notes", type: "textarea", isFullWidth: true });
        fields.push({ name: "followUpDate", label: "Follow-up Date", type: "date" });
        return fields;
    }

    openConsultationForm(consultationToEdit) {
        const page = this;
        const fields = this.buildFormFields();

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

                if (consultationToEdit === null) {
                    formValues.id = "";
                } else {
                    formValues.id = consultationToEdit.id;
                }

                consultationService.saveConsultation(formValues);
                notifier.showSuccess("Consultation saved successfully.");
                page.refreshTable();
            }
        });
        dialog.open();
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
            ["Doctor's Notes", consultation.notes],
            ["Follow-up Date", consultation.followUpDate]
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
