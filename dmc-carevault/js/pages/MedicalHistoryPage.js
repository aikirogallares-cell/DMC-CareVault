/*
 * MedicalHistoryPage.js
 * Purpose: shows the medical history (all consultations) of one selected patient, newest first.
 */
class MedicalHistoryPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("history");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    // The patient is found by typing a name or patient ID (no long drop-down list).
    buildPatientField() {
        return {
            name: "patientId", label: "Patient", type: "searchselect", isFullWidth: true,
            options: patientService.getPatientSelectOptions(), placeholder: "Type a name or patient ID to search..."
        };
    }

    showPage() {
        const page = this;
        const field = this.buildPatientField();
        // Other pages can link here with ?patient=P-0001 to show that patient straight away.
        const preselectedPatientId = new URLSearchParams(window.location.search).get("patient") || "";

        let html = "<h2>Medical History</h2>";
        html += '<div style="max-width:520px;margin-bottom:14px">' +
            formBuilder.buildFormHtml([field], { patientId: preselectedPatientId }) + "</div>";
        html += '<div class="card" id="historyTable"></div>';
        this.mainElement.innerHTML = html;

        formBuilder.connectFields(this.mainElement, [field]);
        document.getElementById("field_patientId").addEventListener("change", function () {
            page.refreshTable();
        });
        this.refreshTable();
    }

    refreshTable() {
        const selectedPatientId = document.getElementById("field_patientId").value;

        if (selectedPatientId === "") {
            document.getElementById("historyTable").innerHTML =
                '<div class="empty">Search and choose a patient to see the medical history.</div>';
            return;
        }

        const history = consultationService.getHistoryForPatient(selectedPatientId);
        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Chief Complaint", getCellHtml: function (item) { return htmlHelper.escapeText(item.complaint); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Treatment", getCellHtml: function (item) { return htmlHelper.escapeText(item.treatment); } },
            { title: "Notes", getCellHtml: function (item) { return htmlHelper.escapeText(item.notes); } }
        ];

        document.getElementById("historyTable").innerHTML =
            tableBuilder.buildTableHtml(columns, history, "No medical history for this patient.");
    }
}

const medicalHistoryPage = new MedicalHistoryPage();
medicalHistoryPage.start();