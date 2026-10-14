/*
 * PrescriptionsPage.js
 * Purpose: list prescriptions, create new ones (Doctor only) and print them.
 * One prescription can contain many medicines.
 */
class PrescriptionsPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("prescriptions");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        const canWrite = permissionService.userCan("prescriptions.write");

        let html = "<h2>Prescriptions</h2>";
        html += '<div class="toolbar"><span class="sp"></span>';
        if (canWrite) {
            html += '<button class="btn" id="addPrescriptionButton">+ New Prescription</button>';
        }
        html += "</div>";
        html += '<div class="card" id="prescriptionTable"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        if (canWrite) {
            document.getElementById("addPrescriptionButton").addEventListener("click", function () {
                page.openPrescriptionForm();
            });
        }
        document.getElementById("prescriptionTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });

        this.refreshTable();
    }

    refreshTable() {
        const prescriptions = prescriptionService.getAllPrescriptions();
        const columns = [
            { title: "ID", getCellHtml: function (item) { return item.id; } },
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Medicines", getCellHtml: function (item) {
                const names = [];
                for (let i = 0; i < item.medicines.length; i++) {
                    names.push(item.medicines[i].name);
                }
                return htmlHelper.escapeText(names.join(", "));
            } },
            { title: "Action", getCellHtml: function (item) {
                return '<button class="btn sm ghost" data-id="' + item.id + '">Print</button>';
            } }
        ];

        document.getElementById("prescriptionTable").innerHTML =
            tableBuilder.buildTableHtml(columns, prescriptions, "No prescriptions yet.");
    }

    // ---------- New prescription form ----------

    buildMedicineRowHtml() {
        const placeholders = ["Medicine", "Dosage", "Frequency", "Duration", "Instructions"];
        let html = '<div class="medrow">';

        for (let i = 0; i < placeholders.length; i++) {
            html += '<input placeholder="' + placeholders[i] + '">';
        }
        html += '<button class="btn sm danger" type="button" data-remove-row="1">×</button></div>';
        return html;
    }

    openPrescriptionForm() {
        const page = this;
        const topFields = [
            { name: "patientId", label: "Patient", type: "select", options: patientService.getPatientSelectOptions(), isFullWidth: true },
            { name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() }
        ];

        let bodyHtml = formBuilder.buildFormHtml(topFields, {});
        bodyHtml += '<h4 style="color:var(--g)">Medicines</h4>';
        bodyHtml += '<div id="medicineRows">' + this.buildMedicineRowHtml() + "</div>";
        bodyHtml += '<button class="btn sm ghost" type="button" id="addMedicineButton">+ Add medicine</button>';

        const dialog = new ModalDialog("New Prescription", bodyHtml, {
            isWide: true,
            saveButtonText: "Save Prescription",
            onSave: function (openDialog) {
                page.savePrescription(topFields, openDialog);
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector("#addMedicineButton").addEventListener("click", function () {
            dialogElement.querySelector("#medicineRows").insertAdjacentHTML("beforeend", page.buildMedicineRowHtml());
        });
        dialogElement.addEventListener("click", function (event) {
            if (event.target.getAttribute("data-remove-row") === "1") {
                event.target.closest(".medrow").remove();
            }
        });
    }

    // Reads every medicine row and builds the list of medicines.
    readMedicineRows(dialogElement) {
        const rowElements = dialogElement.querySelectorAll(".medrow");
        const medicines = [];

        for (let i = 0; i < rowElements.length; i++) {
            const inputs = rowElements[i].querySelectorAll("input");
            medicines.push({
                name: inputs[0].value.trim(),
                dosage: inputs[1].value.trim(),
                frequency: inputs[2].value.trim(),
                duration: inputs[3].value.trim(),
                instructions: inputs[4].value.trim()
            });
        }
        return medicines;
    }

    savePrescription(topFields, openDialog) {
        const formValues = formBuilder.readFormValues(topFields);
        formValues.medicines = this.readMedicineRows(openDialog.getElement());

        prescriptionService.createPrescription(formValues);
        notifier.showSuccess("Prescription saved successfully.");
        this.refreshTable();
    }

    // ---------- Printing ----------

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-id]");
        if (button === null) {
            return;
        }

        const prescriptions = prescriptionService.getAllPrescriptions();
        for (let i = 0; i < prescriptions.length; i++) {
            if (prescriptions[i].id === button.getAttribute("data-id")) {
                this.printPrescription(prescriptions[i]);
            }
        }
    }

    buildPrintableHtml(prescription) {
        const patient = patientService.getPatientById(prescription.patientId);
        const settings = settingsService.getSettings();
        const safe = htmlHelper.escapeText;

        let html = "<html><head><title>Prescription " + safe(prescription.id) + "</title>";
        html += "<style>body{font-family:Arial;padding:40px;color:#222}h1{color:#1B5E20;margin:0}";
        html += "hr{border:0;border-top:2px solid #2E7D32}table{width:100%;border-collapse:collapse;margin-top:14px}";
        html += "td,th{border:1px solid #ccc;padding:8px;text-align:left}.signature{margin-top:70px;text-align:right}</style></head><body>";
        html += "<h1>" + safe(settings.clinicName) + "</h1><p>" + safe(settings.systemName) + " - Prescription</p><hr>";
        html += "<p><b>Patient:</b> " + safe(htmlHelper.getFullName(patient)) + " (" + safe(patient.id) + ")";
        html += " &nbsp; <b>Age:</b> " + dateHelper.calculateAge(patient.birthDate);
        html += " &nbsp; <b>Date:</b> " + safe(prescription.date) + "</p>";
        html += "<table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>";

        for (let i = 0; i < prescription.medicines.length; i++) {
            const medicine = prescription.medicines[i];
            html += "<tr><td>" + safe(medicine.name) + "</td><td>" + safe(medicine.dosage) + "</td><td>" +
                safe(medicine.frequency) + "</td><td>" + safe(medicine.duration) + "</td><td>" + safe(medicine.instructions) + "</td></tr>";
        }

        html += "</table><div class=\"signature\">______________________<br>";
        html += safe(userService.getFullNameByUsername(prescription.doctorUsername)) + "</div>";
        html += "<script>window.print();<\/script></body></html>";
        return html;
    }

    printPrescription(prescription) {
        const printWindow = window.open("", "_blank");

        if (printWindow === null) {
            notifier.showWarning("Please allow pop-ups to print.");
            return;
        }

        printWindow.document.write(this.buildPrintableHtml(prescription));
        printWindow.document.close();
    }
}

const prescriptionsPage = new PrescriptionsPage();
prescriptionsPage.start();
