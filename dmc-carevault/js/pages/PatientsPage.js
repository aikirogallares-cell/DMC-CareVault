/*
 * PatientsPage.js
 * Purpose: Patient Records page - list, search, register, view, edit and archive patients.
 * The buttons shown depend on the user's permissions (Staff cannot archive, Doctors cannot edit).
 */
class PatientsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("patients");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    // ---------- Page layout ----------

    showPage() {
        let html = "<h2>Patient Records</h2>";
        html += '<div class="toolbar">';
        html += '<input id="searchInput" placeholder="Search ID, name or contact number...">';

        if (permissionService.userCan("patients.create")) {
            html += '<button class="btn" id="addPatientButton">+ Add Patient</button>';
        }
        html += "</div>";
        html += '<div class="card" id="patientTable"></div>';

        this.mainElement.innerHTML = html;

        this.connectEvents();
        this.refreshTable();

        // The staff dashboard links here with ?new=1 to open the registration form directly.
        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && permissionService.userCan("patients.create")) {
            this.openPatientForm(null);
        }
    }

    connectEvents() {
        const page = this;

        document.getElementById("searchInput").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value;
            page.refreshTable();
        });

        const addButton = document.getElementById("addPatientButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                page.openPatientForm(null);
            });
        }

        // One listener on the table handles every View / Edit / Archive button.
        document.getElementById("patientTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
    }

    // ---------- Table ----------

    refreshTable() {
        const page = this;
        const patients = patientService.searchPatients(this.searchKeyword);

        const columns = [
            { title: "Patient ID", getCellHtml: function (patient) { return patient.id; } },
            { title: "Patient Name", getCellHtml: function (patient) { return htmlHelper.escapeText(htmlHelper.getFullName(patient)); } },
            { title: "Age", getCellHtml: function (patient) { return dateHelper.getAgeText(patient.birthDate); } },
            { title: "Gender", getCellHtml: function (patient) { return patient.gender; } },
            { title: "Contact", getCellHtml: function (patient) {
                if (!patient.contactNumber) {
                    return "-";
                }
                return htmlHelper.escapeText(patient.contactNumber);
            } },
            { title: "Last Visit", getCellHtml: function (patient) {
                if (patient.lastVisit === "") {
                    return "-";
                }
                return patient.lastVisit;
            } },
            { title: "Action", getCellHtml: function (patient) { return page.buildActionButtons(patient); } }
        ];

        document.getElementById("patientTable").innerHTML =
            tableBuilder.buildTableHtml(columns, patients, "No patient records found.");
    }

    // Only the buttons the current user may use are created.
    buildActionButtons(patient) {
        let html = '<button class="btn sm ghost" data-action="view" data-id="' + patient.id + '">View</button>';

        if (permissionService.userCan("patients.edit")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + patient.id + '">Edit</button>';
        }
        if (permissionService.userCan("patients.archive")) {
            html += '<button class="btn sm danger" data-action="archive" data-id="' + patient.id + '">Archive</button>';
        }
        return html;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const action = button.getAttribute("data-action");
        const patientId = button.getAttribute("data-id");

        try {
            if (action === "view") {
                this.openViewDialog(patientId);
            } else if (action === "edit") {
                this.openPatientForm(patientService.getPatientById(patientId));
            } else if (action === "archive") {
                this.archivePatient(patientId);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    archivePatient(patientId) {
        const confirmed = confirm("Archive this patient record? It will be hidden from the list.");
        if (confirmed === false) {
            return;
        }

        patientService.archivePatient(patientId);
        notifier.showSuccess("Patient record archived.");
        this.refreshTable();
    }

    // ---------- Add / Edit form ----------

    // Pass null to register a new patient, or a patient object to edit that patient.
    buildFormFields(isEditing) {
        const fields = [];
        // Only Male or Female. The empty first choice makes the user pick one on purpose.
        const genderOptions = [{ value: "", label: "Select gender" }].concat(
            formBuilder.createOptionsFromTexts(patientService.validGenders));
        const civilStatusOptions = formBuilder.createOptionsFromTexts(["Single", "Married", "Widowed", "Separated"]);
        const bloodTypeOptions = formBuilder.createOptionsFromTexts(["Unknown", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
        const relationshipOptions = [{ value: "", label: "Select relationship" }].concat(
            formBuilder.createOptionsFromTexts(["Parent", "Spouse", "Child", "Sibling", "Grandparent", "Relative", "Guardian", "Friend", "Other"]));

        // Characters that are removed while typing: anything that is not a letter, space, . ' or -
        const blockedInNames = /[^\p{L}\p{M}\s.'\u2019-]/gu;
        // Contact number: only digits can be typed.
        const blockedInNumbers = /\D/g;

        fields.push({ sectionTitle: "Personal Information" });
        if (isEditing) {
            fields.push({ name: "id", label: "Patient ID", type: "text", isReadOnly: true, isFullWidth: true });
        }
        fields.push({ name: "firstName", label: "First Name", type: "text", isRequired: true, blockCharacters: blockedInNames,
            validate: function (value) { return validator.checkPersonName("First name", value); } });
        fields.push({ name: "middleName", label: "Middle Name", type: "text", blockCharacters: blockedInNames,
            validate: function (value) { return validator.checkPersonName("Middle name", value); } });
        fields.push({ name: "lastName", label: "Last Name", type: "text", isRequired: true, blockCharacters: blockedInNames,
            validate: function (value) { return validator.checkPersonName("Last name", value); } });
        // "max" stops the date picker from selecting a future date.
        fields.push({ name: "birthDate", label: "Date of Birth", type: "date", isRequired: true, max: dateHelper.getTodayString(), validate: validator.checkBirthDate });
        fields.push({ name: "gender", label: "Gender", type: "select", isRequired: true, options: genderOptions });
        fields.push({ name: "civilStatus", label: "Civil Status", type: "select", options: civilStatusOptions });
        fields.push({ name: "contactNumber", label: "Contact Number", type: "text", maxLength: 11, digitsOnly: true });
        // The address is typed in three boxes. PatientService joins them into one address line.
        fields.push({ name: "lotNo", label: "Lot No.", type: "text", placeholder: "Example: 12 or Lot 12 Blk 3" });
        fields.push({ name: "barangay", label: "Barangay", type: "text", placeholder: "Example: Poblacion" });
        fields.push({ name: "city", label: "City", type: "text", isFullWidth: true, placeholder: "Example: Makati City" });

        fields.push({ sectionTitle: "Emergency Contact" });
        fields.push({ name: "emergencyName", label: "Name", type: "text" });
        fields.push({ name: "emergencyRelationship", label: "Relationship", type: "select", options: relationshipOptions });
        fields.push({ name: "emergencyContactNumber", label: "Contact Number", type: "text" });

        fields.push({ sectionTitle: "Medical Information" });
        fields.push({ name: "bloodType", label: "Blood Type", type: "select", options: bloodTypeOptions });
        fields.push({ name: "allergies", label: "Allergies", type: "text", defaultValue: "None" });

        // Conditions and medications are only for roles with the "patients.medical" permission.
        if (permissionService.userCan("patients.medical")) {
            fields.push({ name: "medicalConditions", label: "Existing Medical Conditions", type: "text", isFullWidth: true, defaultValue: "None" });
            fields.push({ name: "currentMedications", label: "Current Medications", type: "text", isFullWidth: true, defaultValue: "None" });
        }

        return fields;
    }

    openPatientForm(patientToEdit) {
        const page = this;
        const isEditing = patientToEdit !== null;
        const fields = this.buildFormFields(isEditing);

        let existingValues = {};
        if (isEditing) {
            existingValues = Object.assign({}, patientToEdit);

            // Older records only have one "address" line. Show it in the City box so nothing is lost.
            const hasAddressParts = existingValues.lotNo || existingValues.barangay || existingValues.city;
            if (!hasAddressParts && existingValues.address) {
                existingValues.city = existingValues.address;
            }
        }

        let dialogTitle = "Register Patient";
        if (isEditing) {
            dialogTitle = "Edit Patient";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Patient",
            onSave: function () {
                page.savePatientFromForm(fields, patientToEdit);
            }
        });
        dialog.open();
        formBuilder.connectFields(dialog.getElement(), fields);
    }

    savePatientFromForm(fields, patientToEdit) {
        const formValues = formBuilder.readFormValues(fields);

        if (patientToEdit === null) {
            formValues.id = "";
        } else {
            formValues.id = patientToEdit.id;
        }

        // If something is wrong, the service throws an Error and the dialog shows the message.
        patientService.savePatient(formValues);

        if (patientToEdit === null) {
            notifier.showSuccess("Patient successfully registered.");
        } else {
            notifier.showSuccess("Patient record updated successfully.");
        }
        this.refreshTable();
    }

    // ---------- View dialog with tabs ----------

    // Returns only the tab names this user is allowed to see.
    getAvailableTabNames() {
        const tabNames = ["Overview"];

        if (permissionService.userCan("history.view")) {
            tabNames.push("Medical History");
        }
        if (permissionService.userCan("prescriptions.view")) {
            tabNames.push("Prescriptions");
        }
        tabNames.push("Appointments");
        return tabNames;
    }

    openViewDialog(patientId) {
        const page = this;
        const patient = patientService.getPatientById(patientId);
        const tabNames = this.getAvailableTabNames();

        let bodyHtml = '<div class="tabs">';
        for (let i = 0; i < tabNames.length; i++) {
            bodyHtml += '<button class="tab" data-tab="' + tabNames[i] + '">' + tabNames[i] + "</button>";
        }
        bodyHtml += '</div><div id="tabContent"></div>';

        const dialog = new ModalDialog(htmlHelper.getFullName(patient), bodyHtml, { isWide: true });
        dialog.open();

        const tabButtons = dialog.getElement().querySelectorAll(".tab");
        for (let i = 0; i < tabButtons.length; i++) {
            tabButtons[i].addEventListener("click", function (event) {
                page.showTab(dialog, patient, event.target.getAttribute("data-tab"));
            });
        }

        this.showTab(dialog, patient, "Overview");
    }

    showTab(dialog, patient, tabName) {
        // Highlight the selected tab button.
        const tabButtons = dialog.getElement().querySelectorAll(".tab");
        for (let i = 0; i < tabButtons.length; i++) {
            if (tabButtons[i].getAttribute("data-tab") === tabName) {
                tabButtons[i].classList.add("on");
            } else {
                tabButtons[i].classList.remove("on");
            }
        }

        let contentHtml = "";
        if (tabName === "Overview") {
            contentHtml = this.buildOverviewTab(patient);
        } else if (tabName === "Medical History") {
            contentHtml = this.buildMedicalHistoryTab(patient);
        } else if (tabName === "Prescriptions") {
            contentHtml = this.buildPrescriptionsTab(patient);
        } else if (tabName === "Appointments") {
            contentHtml = this.buildAppointmentsTab(patient);
        }

        dialog.getElement().querySelector("#tabContent").innerHTML = contentHtml;
    }

    buildDetailRow(label, value) {
        let shownValue = value;
        if (value === undefined || value === null || value === "") {
            shownValue = "-";
        }
        return "<dt>" + label + "</dt><dd>" + htmlHelper.escapeText(shownValue) + "</dd>";
    }

    buildOverviewTab(patient) {
        let html = '<dl class="kv">';
        html += this.buildDetailRow("Patient ID", patient.id);
        html += this.buildDetailRow("Full Name", htmlHelper.getFullName(patient));
        html += this.buildDetailRow("Date of Birth", patient.birthDate);
        html += this.buildDetailRow("Age", dateHelper.getAgeText(patient.birthDate));
        html += this.buildDetailRow("Gender", patient.gender);
        html += this.buildDetailRow("Civil Status", patient.civilStatus);
        html += this.buildDetailRow("Address", patient.address);
        html += this.buildDetailRow("Contact Number", patient.contactNumber);
        html += this.buildDetailRow("Emergency Contact", patient.emergencyName + " (" + patient.emergencyRelationship + ") " + patient.emergencyContactNumber);
        html += this.buildDetailRow("Blood Type", patient.bloodType);
        html += this.buildDetailRow("Allergies", patient.allergies);

        if (permissionService.userCan("patients.medical")) {
            html += this.buildDetailRow("Medical Conditions", patient.medicalConditions);
            html += this.buildDetailRow("Current Medications", patient.currentMedications);
        }

        html += "</dl>";
        return html;
    }

    buildMedicalHistoryTab(patient) {
        const history = consultationService.getHistoryForPatient(patient.id);

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Chief Complaint", getCellHtml: function (item) { return htmlHelper.escapeText(item.complaint); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Treatment", getCellHtml: function (item) { return htmlHelper.escapeText(item.treatment); } }
        ];
        return tableBuilder.buildTableHtml(columns, history, "No medical history yet.");
    }

    buildPrescriptionsTab(patient) {
        const prescriptions = prescriptionService.getPrescriptionsForPatient(patient.id);

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Medicines", getCellHtml: function (item) {
                const names = [];
                for (let i = 0; i < item.medicines.length; i++) {
                    names.push(item.medicines[i].name + " " + item.medicines[i].dosage);
                }
                return htmlHelper.escapeText(names.join(", "));
            } }
        ];
        return tableBuilder.buildTableHtml(columns, prescriptions, "No prescriptions yet.");
    }

    buildAppointmentsTab(patient) {
        const allAppointments = appointmentService.getAppointmentsForCurrentUser();
        const patientAppointments = [];

        for (let i = 0; i < allAppointments.length; i++) {
            if (allAppointments[i].patientId === patient.id) {
                patientAppointments.push(allAppointments[i]);
            }
        }

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Queue #", getCellHtml: function (item) {
                if (item.queueNumber === null || item.queueNumber === undefined) {
                    return "-";
                }
                return item.queueNumber;
            } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Time In", getCellHtml: function (item) { return dateHelper.formatTime(item.queuedAt); } },
            { title: "Time Done", getCellHtml: function (item) { return dateHelper.formatTime(item.completedAt); } }
        ];
        return tableBuilder.buildTableHtml(columns, patientAppointments, "No appointments found.");
    }
}

const patientsPage = new PatientsPage();
patientsPage.start();