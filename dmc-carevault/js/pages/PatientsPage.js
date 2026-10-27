/*
 * PatientsPage.js
 * Purpose: register, view, edit and archive patients.
 * Each patient has a category: Senior Citizen (age 60 and above, automatic from the birth date),
 * PWD (set with the Yes/No option), or Regular.
 */
class PatientsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
        this.filterCategory = "";
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
        const canCreate = permissionService.userCan("patients.create");

        let html = "<h2>Patient Records</h2>";
        html += '<div class="toolbar">';
        html += '<input id="patientSearch" placeholder="Search ID, name or contact...">';
        html += '<select id="categoryFilter"><option value="">All categories</option>';
        html += '<option value="Senior Citizen">Senior Citizen</option>';
        html += '<option value="PWD">PWD</option>';
        html += '<option value="Regular">Regular</option></select>';
        html += '<span class="sp"></span>';
        if (canCreate) {
            html += '<button class="btn" id="addPatientButton">+ Add Patient</button>';
        }
        html += "</div>";
        html += '<div class="card" id="patientTable"></div>';
        this.mainElement.innerHTML = html;

        this.connectEvents(canCreate);
        this.refreshTable();

        // The dashboard's "Register Patient" link opens this page with ?new=1.
        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && canCreate) {
            this.openPatientForm(null);
        }
    }

    connectEvents(canCreate) {
        const page = this;

        document.getElementById("patientSearch").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value;
            page.refreshTable();
        });
        document.getElementById("categoryFilter").addEventListener("change", function (event) {
            page.filterCategory = event.target.value;
            page.refreshTable();
        });
        if (canCreate) {
            document.getElementById("addPatientButton").addEventListener("click", function () {
                page.openPatientForm(null);
            });
        }
        document.getElementById("patientTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
    }

    // ---------- Table ----------

    refreshTable() {
        const page = this;
        const patients = patientService.searchPatients(this.searchKeyword).filter(function (patient) {
            if (page.filterCategory === "") {
                return true;
            }
            return patientService.getPatientCategory(patient) === page.filterCategory;
        });

        const columns = [
            { title: "Patient ID", getCellHtml: function (patient) { return htmlHelper.escapeText(patient.id); } },
            { title: "Patient Name", getCellHtml: function (patient) { return htmlHelper.escapeText(htmlHelper.getFullName(patient)); } },
            { title: "Age", getCellHtml: function (patient) { return htmlHelper.escapeText(dateHelper.getAgeText(patient.birthDate)); } },
            { title: "Gender", getCellHtml: function (patient) { return htmlHelper.escapeText(patient.gender); } },
            { title: "Category", getCellHtml: function (patient) { return page.buildCategoryBadgeHtml(patient); } },
            { title: "Contact", getCellHtml: function (patient) { return htmlHelper.escapeText(patient.contactNumber || "-"); } },
            { title: "Last Visit", getCellHtml: function (patient) { return htmlHelper.escapeText(patient.lastVisit || "-"); } },
            { title: "Action", getCellHtml: function (patient) { return page.buildActionButtons(patient); } }
        ];

        document.getElementById("patientTable").innerHTML =
            tableBuilder.buildTableHtml(columns, patients, "No patients found.");
    }

    // Uses the same colours as the priority lane badges.
    buildCategoryBadgeHtml(patient) {
        const category = patientService.getPatientCategory(patient);
        const cssName = "priority-" + category.toLowerCase().replace(/ /g, "-");
        return '<span class="badge ' + cssName + '">' + htmlHelper.escapeText(category) + "</span>";
    }

    buildActionButtons(patient) {
        const id = htmlHelper.escapeText(patient.id);
        let html = '<button class="btn sm ghost" data-action="view" data-id="' + id + '">View</button> ';

        if (permissionService.userCan("patients.edit")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + id + '">Edit</button> ';
        }
        if (permissionService.userCan("patients.archive")) {
            html += '<button class="btn sm danger" data-action="archive" data-id="' + id + '">Archive</button>';
        }
        return html;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        try {
            const patient = patientService.getPatientById(button.getAttribute("data-id"));
            if (patient === null) {
                throw new Error("Patient record not found.");
            }

            const action = button.getAttribute("data-action");
            if (action === "view") {
                new PageLayout("patients").openPatientRecord(patient.id);
            } else if (action === "edit") {
                this.openPatientForm(patient);
            } else if (action === "archive") {
                this.archivePatient(patient);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    archivePatient(patient) {
        const message = "Archive " + htmlHelper.getFullName(patient) +
            "? The record is kept but hidden from the list.";
        if (confirm(message) === false) {
            return;
        }
        patientService.archivePatient(patient.id);
        notifier.showSuccess("Patient archived.");
        this.refreshTable();
    }

    // ---------- Register / Edit form ----------

    buildFormFields(canSeeMedical) {
        const relationshipOptions = [{ value: "", label: "Select relationship" }];
        const relationships = ["Spouse", "Parent", "Child", "Sibling", "Relative", "Friend", "Other"];
        for (let i = 0; i < relationships.length; i++) {
            relationshipOptions.push({ value: relationships[i], label: relationships[i] });
        }

        const bloodOptions = [{ value: "", label: "Not known" }];
        const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
        for (let i = 0; i < bloodTypes.length; i++) {
            bloodOptions.push({ value: bloodTypes[i], label: bloodTypes[i] });
        }

        const fields = [];

        fields.push({ sectionTitle: "Personal Information" });
        fields.push({ name: "firstName", label: "First Name", type: "text", isRequired: true });
        fields.push({ name: "middleName", label: "Middle Name", type: "text" });
        fields.push({ name: "lastName", label: "Last Name", type: "text", isRequired: true });
        fields.push({ name: "birthDate", label: "Date of Birth", type: "date", isRequired: true, max: dateHelper.getTodayString() });
        fields.push({ name: "gender", label: "Gender", type: "select", isRequired: true, options: [
            { value: "", label: "Select gender" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" }
        ] });
        fields.push({ name: "civilStatus", label: "Civil Status", type: "select", defaultValue: "Single",
            options: formBuilder.createOptionsFromTexts(["Single", "Married", "Widowed", "Separated"]) });
        fields.push({ name: "contactNumber", label: "Contact Number", type: "text", maxLength: 11, digitsOnly: true });
        fields.push({ name: "lotNo", label: "Lot No.", type: "text" });
        fields.push({ name: "barangay", label: "Barangay", type: "text" });
        fields.push({ name: "city", label: "City", type: "text", isFullWidth: true });

        fields.push({ sectionTitle: "Emergency Contact" });
        fields.push({ name: "emergencyName", label: "Name", type: "text" });
        fields.push({ name: "emergencyRelationship", label: "Relationship", type: "select", options: relationshipOptions });
        fields.push({ name: "emergencyContactNumber", label: "Contact Number", type: "text", maxLength: 11, digitsOnly: true });

        fields.push({ sectionTitle: "Priority Lane" });
        fields.push({ name: "isPwd", label: "Person with Disability (PWD)?", type: "select", defaultValue: "No",
            options: [{ value: "No", label: "No" }, { value: "Yes", label: "Yes" }] });
        fields.push({ name: "pwdId", label: "PWD ID Number (optional)", type: "text", maxLength: 30 });

        if (canSeeMedical) {
            fields.push({ sectionTitle: "Medical Information" });
            fields.push({ name: "bloodType", label: "Blood Type", type: "select", options: bloodOptions });
            fields.push({ name: "allergies", label: "Allergies", type: "textarea", isFullWidth: true });
            fields.push({ name: "medicalConditions", label: "Medical Conditions", type: "textarea", isFullWidth: true });
            fields.push({ name: "currentMedications", label: "Current Medications", type: "textarea", isFullWidth: true });
        }
        return fields;
    }

    // The form shows PWD as "Yes" or "No", so the saved true/false is converted first.
    buildExistingValues(patient) {
        const values = Object.assign({}, patient);
        values.isPwd = patient.isPwd === true ? "Yes" : "No";
        return values;
    }

    // patientToEdit is null when registering a new patient.
    openPatientForm(patientToEdit) {
        const page = this;
        const isEditing = patientToEdit !== null;
        const fields = this.buildFormFields(permissionService.userCan("patients.medical"));

        let existingValues = {};
        let dialogTitle = "Register Patient";
        if (isEditing) {
            existingValues = this.buildExistingValues(patientToEdit);
            dialogTitle = "Edit Patient";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: isEditing ? "Save Changes" : "Register Patient",
            onSave: function () {
                page.savePatientFromForm(fields, patientToEdit);
            }
        });
        dialog.open();
    }

    savePatientFromForm(fields, patientToEdit) {
        const values = formBuilder.readFormValues(fields);
        values.id = patientToEdit === null ? "" : patientToEdit.id;

        patientService.savePatient(values);

        if (patientToEdit === null) {
            notifier.showSuccess("Patient registered successfully.");
        } else {
            notifier.showSuccess("Patient updated successfully.");
        }
        this.refreshTable();
    }
}

const patientsPage = new PatientsPage();
patientsPage.start();