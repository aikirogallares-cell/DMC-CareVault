/*
 * MedicalHistoryPage.js
 * Purpose: shows the full medical history of one patient.
 * A filter box narrows the patient list, then the dropdown picks the patient.
 * If the history cannot be built, the error is shown on the page.
 */
class MedicalHistoryPage {
    constructor() {
        this.mainElement = null;
        this.allOptions = [];
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
        // A patient can be opened from another page, for example ?patient=P-0001.
        const preselectedPatientId = new URLSearchParams(window.location.search).get("patient") || "";
        this.allOptions = patientService.getPatientSelectOptions();

        let html = "<h2>Medical History</h2>";
        html += '<div class="card">';
        html += '<div class="fg"><label for="historySearch">Search patient (name, ID or contact number)</label>';
        html += '<input id="historySearch" placeholder="Type to filter the list..."></div>';
        html += '<div class="fg"><label for="historyPatient">Patient</label>';
        html += '<select id="historyPatient" size="6"></select></div>';
        html += "</div>";
        html += '<div class="card" id="historyTable"></div>';
        this.mainElement.innerHTML = html;

        this.renderOptions("", preselectedPatientId);

        const page = this;
        document.getElementById("historySearch").addEventListener("input", function (event) {
            const selected = document.getElementById("historyPatient").value;
            page.renderOptions(event.target.value, selected);
            page.refreshTable();
        });
        document.getElementById("historyPatient").addEventListener("change", function () {
            page.refreshTable();
        });

        this.refreshTable();
    }

    // Fills the dropdown with the patients that match the filter text.
    renderOptions(keyword, selectedId) {
        const select = document.getElementById("historyPatient");
        const text = String(keyword || "").toLowerCase().trim();
        const escape = htmlHelper.escapeText;

        let html = '<option value="">Choose a patient...</option>';
        this.allOptions.forEach(function (option) {
            if (text === "" || option.searchText.toLowerCase().includes(text)) {
                html += '<option value="' + escape(option.value) + '">' + escape(option.label) + "</option>";
            }
        });
        select.innerHTML = html;

        if (selectedId) {
            select.value = selectedId;
        }
    }

    refreshTable() {
        const selectedPatientId = document.getElementById("historyPatient").value;
        const tableElement = document.getElementById("historyTable");

        if (selectedPatientId === "") {
            tableElement.innerHTML = '<div class="empty">Choose a patient to see their medical history.</div>';
            return;
        }

        const escape = htmlHelper.escapeText;
        const patientName = patientService.getPatientNameById(selectedPatientId);
        try {
            tableElement.innerHTML =
                "<h3>" + escape(patientName) + " (" + escape(selectedPatientId) + ")</h3>" +
                medicalRecordService.buildDetailedHistoryHtml(selectedPatientId);
        } catch (error) {
            console.error("Medical history failed to load.", error);
            tableElement.innerHTML = '<div class="empty">This history could not be loaded: ' +
                escape(error.message) + "</div>";
        }
    }
}

const medicalHistoryPage = new MedicalHistoryPage();
medicalHistoryPage.start();