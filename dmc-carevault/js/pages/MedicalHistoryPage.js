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

    showPage() {
        const options = patientService.getPatientSelectOptions();
        const preselectedPatientId = new URLSearchParams(window.location.search).get("patient");

        let html = "<h2>Medical History</h2>";
        html += '<div class="toolbar"><select id="patientSelect">';
        for (let i = 0; i < options.length; i++) {
            let selectedText = "";
            if (options[i].value === preselectedPatientId) {
                selectedText = " selected";
            }
            html += '<option value="' + options[i].value + '"' + selectedText + ">" + htmlHelper.escapeText(options[i].label) + "</option>";
        }
        html += "</select></div>";
        html += '<div class="card" id="historyTable"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("patientSelect").addEventListener("change", function () {
            page.refreshTable();
        });
        this.refreshTable();
    }

    refreshTable() {
        const selectedPatientId = document.getElementById("patientSelect").value;

        if (selectedPatientId === "") {
            document.getElementById("historyTable").innerHTML = '<div class="empty">No patients available.</div>';
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
