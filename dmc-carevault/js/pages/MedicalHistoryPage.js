/*
 * MedicalHistoryPage.js
 * Purpose: shows the medical history (all consultations) of one patient, newest first.
 * The patient is chosen with a search box: type a name or ID and pick from the matches.
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
        // A patient can be opened directly from another page, for example ?patient=P-0001.
        const preselectedPatientId = new URLSearchParams(window.location.search).get("patient") || "";

        const searchFields = [
            {
                name: "patientId",
                label: "Search patient",
                type: "searchselect",
                isFullWidth: true,
                options: patientService.getPatientSelectOptions(),
                placeholder: "Type a patient name or ID to search..."
            }
        ];

        let html = "<h2>Medical History</h2>";
        html += '<div class="card">' + formBuilder.buildFormHtml(searchFields, { patientId: preselectedPatientId }) + "</div>";
        html += '<div class="card" id="historyTable"></div>';
        this.mainElement.innerHTML = html;

        // Turns on the search box. Choosing a patient fires a "change" event on the hidden box.
        formBuilder.connectFields(this.mainElement, searchFields);

        const page = this;
        this.mainElement.addEventListener("change", function (event) {
            if (event.target.id === "field_patientId") {
                page.refreshTable();
            }
        });

        this.refreshTable();
    }

    refreshTable() {
        const selectedPatientId = document.getElementById("field_patientId").value;
        const tableElement = document.getElementById("historyTable");

        if (selectedPatientId === "") {
            tableElement.innerHTML = '<div class="empty">Search for a patient above and choose them to see their medical history.</div>';
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

        const patientName = patientService.getPatientNameById(selectedPatientId);
        tableElement.innerHTML = '<h3>' + htmlHelper.escapeText(patientName) + " (" + htmlHelper.escapeText(selectedPatientId) + ")</h3>" +
            tableBuilder.buildTableHtml(columns, history, "No medical history for this patient.");
    }
}

const medicalHistoryPage = new MedicalHistoryPage();
medicalHistoryPage.start();