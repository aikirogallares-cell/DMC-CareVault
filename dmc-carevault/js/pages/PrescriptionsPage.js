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

    // Builds the options of a drop-down. The first option is an empty "Choose" line.
    buildOptionsHtml(options) {
        let html = '<option value="">Choose...</option>';
        for (let i = 0; i < options.length; i++) {
            html += '<option value="' + htmlHelper.escapeText(options[i]) + '">' + htmlHelper.escapeText(options[i]) + "</option>";
        }
        return html;
    }

    // One row = one medicine. Frequency and instructions are chosen from lists,
    // so the printed prescription reads the same way every time.
    buildMedicineRowHtml() {
        const frequencyOptions = [
            "Once a day - morning",
            "Once a day - noon",
            "Once a day - night",
            "Twice a day - morning and night",
            "Three times a day - morning, noon and night",
            "Every 4 hours",
            "Every 6 hours",
            "Every 8 hours",
            "Only when needed"
        ];
        const instructionOptions = [
            "Take with food",
            "Take after food",
            "Take before food",
            "Take on an empty stomach",
            "Take at bedtime",
            "Take as directed"
        ];

        let html = '<div class="medrow">';
        html += '<input data-field="medicine" list="medicineSuggestions" placeholder="Type medicine name" autocomplete="off">';
        html += '<input data-field="dosage" placeholder="e.g. 500 mg">';
        html += '<select data-field="frequency">' + this.buildOptionsHtml(frequencyOptions) + "</select>";
        html += '<input data-field="duration" placeholder="e.g. 7 days">';
        html += '<input data-field="quantity" type="number" min="1" step="1" placeholder="Qty">';
        html += '<select data-field="instructions">' + this.buildOptionsHtml(instructionOptions) + "</select>";
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

        // Two columns: the prescription form on the left, the previous test results on the right.
        let bodyHtml = '<div class="rx-layout" id="rxLayout"><div class="rx-main">';
        bodyHtml += '<div class="toolbar"><span class="sp"></span>';
        bodyHtml += '<button class="btn sm ghost" type="button" id="rxToggleButton">Hide previous results</button></div>';
        bodyHtml += formBuilder.buildFormHtml(topFields, { patientId: preselectedPatientId || "" });
        bodyHtml += '<h4 style="color:var(--g)">Medicines</h4>';
        bodyHtml += '<div id="medicineRows">' + this.buildMedicineRowHtml() + "</div>";
        bodyHtml += '<button class="btn sm ghost" type="button" id="addMedicineButton">+ Add medicine</button>';
        bodyHtml += this.buildSuggestionListHtml();
        bodyHtml += "</div>";
        bodyHtml += '<aside class="rx-side"><h4 style="color:var(--g);margin:0 0 8px">Previous test results</h4>' +
            '<div id="rxResultsList"></div></aside>';
        bodyHtml += "</div>";

        const dialog = new ModalDialog("New Prescription", bodyHtml, {
            isWide: true,
            saveButtonText: "Save Prescription",
            onSave: function (openDialog) {
                page.savePrescription(topFields, openDialog);
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector(".modal").classList.add("rx-wide");

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
            // The patient changed: show that patient's results.
            if (event.target.id === "field_patientId") {
                page.refreshResultsPanel(dialogElement);
            }
        });

        // Hide or show the results panel. The choice is remembered for this browser tab.
        const layout = dialogElement.querySelector("#rxLayout");
        const toggleButton = dialogElement.querySelector("#rxToggleButton");
        const applyPanelState = function (hidden) {
            layout.classList.toggle("rx-hidden", hidden);
            toggleButton.textContent = hidden ? "Show previous results" : "Hide previous results";
            sessionStorage.setItem("dmcv2_rxPanelHidden", hidden ? "1" : "0");
        };
        applyPanelState(sessionStorage.getItem("dmcv2_rxPanelHidden") === "1");
        toggleButton.addEventListener("click", function () {
            applyPanelState(!layout.classList.contains("rx-hidden"));
        });

        page.refreshResultsPanel(dialogElement);
    }

    // Fills the results panel for the patient chosen in the form.
    refreshResultsPanel(dialogElement) {
        const list = dialogElement.querySelector("#rxResultsList");
        const patientId = dialogElement.querySelector("#field_patientId").value;

        if (patientId === "") {
            list.innerHTML = '<div class="empty">Choose a patient to see their test results.</div>';
            return;
        }
        list.innerHTML = this.buildResultsListHtml(patientId);
    }

    // One block per result: test name, when and by whom it was recorded, and the result text.
    buildResultsListHtml(patientId) {
        const safe = htmlHelper.escapeText;
        const results = testResultService.getResultsForPatient(patientId);

        if (results.length === 0) {
            return '<div class="empty">No test results for this patient yet.</div>';
        }

        let html = "";
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            html += '<div class="rx-result"><b>' + safe(result.testName) + "</b><br>" +
                "<small>" + safe(dateHelper.formatDateTime(result.recordedAt)) + " by " +
                safe(userService.getFullNameByUsername(result.recordedBy)) + "</small>" +
                "<p>" + safe(result.resultText) + "</p></div>";
        }
        return html;
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

    // Looks up the prescription details (Lic, PTR, S2, TIN, DEA, NPI) of the doctor who wrote the prescription.
    getDoctorProfile(doctorUsername) {
        const profiles = storageService.loadList("doctorProfiles");
        for (let i = 0; i < profiles.length; i++) {
            if (profiles[i].doctorUsername === doctorUsername) {
                return profiles[i];
            }
        }
        return {};
    }

    // The printed prescription, laid out like the clinic's paper pad.
    buildPrintableHtml(prescription) {
        const patient = patientService.getPatientById(prescription.patientId);
        const settings = settingsService.getSettings();
        const profile = this.getDoctorProfile(prescription.doctorUsername);
        const doctorName = userService.getFullNameByUsername(prescription.doctorUsername);
        const safe = htmlHelper.escapeText;

        // Shows a value underlined. An empty value leaves a blank line to write on.
        const fill = function (value, extraClass) {
            const isEmpty = value === undefined || value === null || String(value).trim() === "";
            const shown = isEmpty ? "&nbsp;" : safe(value);
            return '<span class="fill ' + (extraClass || "") + '">' + shown + "</span>";
        };

        let letterhead = "";
        for (let i = 0; i < settings.letterhead.length; i++) {
            const line = settings.letterhead[i];
            letterhead += '<div class="' + (line.bold ? "bold " : "") + (line.large ? "large" : "") + '">' +
                safe(line.text) + "</div>";
        }

        let hours = "";
        for (let i = 0; i < settings.clinicHours.length; i++) {
            hours += "<div>" + safe(settings.clinicHours[i]) + "</div>";
        }

        let medicines = "";
        for (let i = 0; i < prescription.medicines.length; i++) {
            const m = prescription.medicines[i];
            medicines += '<div class="med"><div class="med-name">' + (i + 1) + ". " + safe(m.name) + "</div>" +
                '<div class="med-line">Dosage: ' + safe(m.dosage || "-") + " &nbsp;&nbsp; Qty: " + safe(m.quantity || "-") + "</div>" +
                '<div class="med-line">Take: ' + safe(m.frequency || "-") + " &nbsp;&nbsp; For: " + safe(m.duration || "-") + "</div>" +
                (m.instructions ? '<div class="med-line">' + safe(m.instructions) + "</div>" : "") + "</div>";
        }

        let verse = "";
        for (let i = 0; i < settings.prescriptionFooterVerse.length; i++) {
            verse += safe(settings.prescriptionFooterVerse[i]) + "<br>";
        }

        const patientName = patient === null ? "" : htmlHelper.getFullName(patient);
        const patientAge = patient === null ? "" : dateHelper.getAgeText(patient.birthDate);
        const patientSex = patient === null ? "" : patient.gender;
        const patientAddress = patient === null ? "" : patient.address;

        let html = "<html><head><title>Prescription " + safe(prescription.id) + "</title>";
        html += "<style>" + this.printStyles() + "</style></head><body>";
        html += '<div class="sheet">';

        html += '<div class="clinic">' + letterhead;
        html += '<div class="clinic-name">' + safe(settings.clinicName.toUpperCase()) + "</div>";
        html += "<div>" + safe(settings.clinicAddress) + "</div>";
        html += "<div>" + safe(settings.clinicPhone) + "</div>" + hours + "</div>";
        html += '<div class="rule"></div>';

        html += '<div class="row"><span class="lbl">Patient\'s Name:</span> ' + fill(patientName, "wide") +
            ' <span class="lbl">Age:</span> ' + fill(patientAge, "narrow") +
            ' <span class="lbl">Sex:</span> ' + fill(patientSex, "narrow") + "</div>";
        html += '<div class="row"><span class="lbl">Address:</span> ' + fill(patientAddress, "wide") +
            ' <span class="lbl">Date:</span> ' + fill(prescription.date, "narrow") + "</div>";

        html += '<div class="rx">Rx</div>';
        html += medicines;
        html += '<div class="next">Your next visit is on: ' + fill("", "wide") + "</div>";

        html += '<div class="sign"><div class="sign-line"></div>';
        html += '<div class="sign-name">' + safe(doctorName) + "</div>";
        html += '<div class="ids">';
        html += "<div>Lic No.: " + fill(profile.licenseNo, "narrow") + "</div>";
        html += "<div>PTR No.: " + fill(profile.ptrNo, "narrow") + "</div>";
        html += "<div>S2 No.: " + fill(profile.s2No, "narrow") + "</div>";
        html += "<div>TIN: " + fill(profile.tin, "narrow") + "</div>";
        html += "<div>DEA No.: " + fill(profile.deaNo, "narrow") + "</div>";
        html += "<div>NPI No.: " + fill(profile.npiNo, "narrow") + "</div>";
        html += "</div></div>";

        html += '<div class="verse">' + verse + "</div>";
        html += "</div>";
        html += "<script>window.print();<\/script></body></html>";
        return html;
    }

    // The printed page: A4, margins, letterhead, underlined fields and the signature block.
    printStyles() {
        return "@page{size:A4;margin:14mm}" +
            "body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0}" +
            ".sheet{position:relative;min-height:265mm}" +
            ".clinic{text-align:center;font-size:12px;line-height:1.4}" +
            ".bold{font-weight:bold}.large{font-size:15px}" +
            ".clinic-name{font-weight:bold;font-size:14px;margin-top:6px}" +
            ".rule{border-top:3px solid #333;margin:12px 0 14px}" +
            ".row{margin:8px 0;font-size:13px}" +
            ".lbl{color:#333}" +
            ".fill{display:inline-block;border-bottom:1px solid #333;padding:0 4px;margin:0 12px 0 4px}" +
            ".fill.wide{min-width:260px}.fill.narrow{min-width:110px}" +
            ".rx{font-family:Georgia,'Times New Roman',serif;font-size:60px;font-weight:bold;font-style:italic;margin:18px 0 8px}" +
            ".med{margin:0 0 12px;font-size:13px}" +
            ".med-name{font-weight:bold;font-size:14px}" +
            ".med-line{margin-left:18px;margin-top:2px}" +
            ".next{margin-top:26px;font-size:13px}" +
            ".sign{position:absolute;right:0;bottom:70px;width:300px;font-size:12px;text-align:center}" +
            ".sign-line{border-top:1px solid #333;margin-top:40px}" +
            ".sign-name{font-weight:bold;margin-top:2px}" +
            ".ids{text-align:left;margin-top:8px}.ids div{margin-top:3px}.ids .fill{min-width:150px}" +
            ".verse{position:absolute;left:0;right:0;bottom:0;text-align:center;font-size:11px;font-style:italic}";
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