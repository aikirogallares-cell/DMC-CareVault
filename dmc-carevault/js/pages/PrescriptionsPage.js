/*
 * PrescriptionsPage.js
 * Purpose: list prescriptions, create new ones (Doctor only) and print them.
 * One prescription can contain many medicines.
 * The medicine name is typed. The medicine list only suggests names while typing,
 * so a medicine that is not in the list can still be prescribed.
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

        // Opened from the consultation pop-up: ?new=1&patient=P-0001 starts a prescription for that patient.
        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && canWrite) {
            this.openPrescriptionForm(urlParameters.get("patient") || "");
        }
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

    // Suggestions for the medicine name box. Each suggestion is a full label,
    // for example "Paracetamol (Biogesic) 500 mg Tablet". The doctor may type any name.
    buildSuggestionListHtml() {
        const medications = medicationService.getAllMedications();
        let html = '<datalist id="medicineSuggestions">';
        for (let i = 0; i < medications.length; i++) {
            html += '<option value="' + htmlHelper.escapeText(medicationService.getMedicationLabel(medications[i])) + '"></option>';
        }
        html += "</datalist>";
        return html;
    }

    // One row = one medicine. The name box is free text with suggestions from the medicine list.
    buildMedicineRowHtml() {
        let html = '<div class="medrow">';
        html += '<input data-field="medicine" list="medicineSuggestions" placeholder="Type medicine name" autocomplete="off">';
        html += '<input data-field="dosage" placeholder="Dosage">';
        html += '<input data-field="frequency" placeholder="Frequency">';
        html += '<input data-field="duration" placeholder="Duration">';
        html += '<input data-field="quantity" type="number" min="1" step="1" placeholder="Qty">';
        html += '<input data-field="instructions" placeholder="Instructions">';
        html += '<button class="btn sm danger" type="button" data-remove-row="1">×</button></div>';
        return html;
    }

    openPrescriptionForm(preselectedPatientId) {
        const page = this;

        const topFields = [
            { name: "patientId", label: "Patient", type: "searchselect", isRequired: true, isFullWidth: true,
                options: patientService.getPatientSelectOptions(), placeholder: "Type a name or patient ID to search..." },
            { name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() }
        ];

        let bodyHtml = formBuilder.buildFormHtml(topFields, { patientId: preselectedPatientId || "" });
        bodyHtml += '<h4 style="color:var(--g)">Medicines</h4>';
        bodyHtml += '<div id="medicineRows">' + this.buildMedicineRowHtml() + "</div>";
        bodyHtml += '<button class="btn sm ghost" type="button" id="addMedicineButton">+ Add medicine</button>';
        bodyHtml += this.buildSuggestionListHtml();

        const dialog = new ModalDialog("New Prescription", bodyHtml, {
            isWide: true,
            saveButtonText: "Save Prescription",
            onSave: function (openDialog) {
                page.savePrescription(topFields, openDialog);
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        // Starts the type-to-search patient box.
        formBuilder.connectFields(dialogElement, topFields);
        dialogElement.querySelector("#addMedicineButton").addEventListener("click", function () {
            dialogElement.querySelector("#medicineRows").insertAdjacentHTML("beforeend", page.buildMedicineRowHtml());
        });
        dialogElement.addEventListener("click", function (event) {
            if (event.target.getAttribute("data-remove-row") === "1") {
                event.target.closest(".medrow").remove();
            }
        });
        dialogElement.addEventListener("change", function (event) {
            if (event.target.getAttribute("data-field") === "medicine") {
                page.fillDosageFromListedMedicine(event.target);
            }
        });
    }

    // If the typed name is exactly a medicine in the list, fill the dosage box with its strength.
    // Only fills the dosage when that box is still empty. Anything else is left for the doctor to type.
    fillDosageFromListedMedicine(nameBox) {
        const row = nameBox.closest(".medrow");
        const dosageBox = row.querySelector('[data-field="dosage"]');
        if (dosageBox.value.trim() !== "") {
            return;
        }

        const typedName = nameBox.value.trim().toLowerCase();
        const medications = medicationService.getAllMedications();

        for (let i = 0; i < medications.length; i++) {
            if (medicationService.getMedicationLabel(medications[i]).toLowerCase() === typedName) {
                dosageBox.value = medications[i].strength;
                return;
            }
        }
    }

    // Reads every medicine row. The name is the text the doctor typed.
    readMedicineRows(dialogElement) {
        const rowElements = dialogElement.querySelectorAll(".medrow");
        const medicines = [];

        for (let i = 0; i < rowElements.length; i++) {
            const row = rowElements[i];
            medicines.push({
                name: row.querySelector('[data-field="medicine"]').value.trim(),
                dosage: row.querySelector('[data-field="dosage"]').value.trim(),
                frequency: row.querySelector('[data-field="frequency"]').value.trim(),
                duration: row.querySelector('[data-field="duration"]').value.trim(),
                quantity: row.querySelector('[data-field="quantity"]').value.trim(),
                instructions: row.querySelector('[data-field="instructions"]').value.trim()
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
        html += " &nbsp; <b>Age:</b> " + safe(dateHelper.getAgeText(patient.birthDate));
        html += " &nbsp; <b>Date:</b> " + safe(prescription.date) + "</p>";
        html += "<table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Qty</th><th>Instructions</th></tr>";

        for (let i = 0; i < prescription.medicines.length; i++) {
            const medicine = prescription.medicines[i];
            html += "<tr><td>" + safe(medicine.name) + "</td><td>" + safe(medicine.dosage) + "</td><td>" +
                safe(medicine.frequency) + "</td><td>" + safe(medicine.duration) + "</td><td>" + safe(medicine.quantity) + "</td><td>" + safe(medicine.instructions) + "</td></tr>";
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