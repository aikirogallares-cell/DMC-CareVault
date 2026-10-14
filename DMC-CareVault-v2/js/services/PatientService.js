/*
 * PatientService.js
 * Purpose: all patient data operations (list, search, add, edit, archive).
 * Staff cannot see or change the sensitive medical fields (conditions, medications).
 */
class PatientService {
    // Returns a copy of the patient. Hides sensitive fields if the user may not see them.
    hideSensitiveFieldsIfNeeded(patient) {
        if (permissionService.userCan("patients.medical")) {
            return patient;
        }

        const limitedCopy = Object.assign({}, patient);
        delete limitedCopy.medicalConditions;
        delete limitedCopy.currentMedications;
        return limitedCopy;
    }

    getActivePatients() {
        permissionService.requirePermission("patients.view");

        const savedPatients = storageService.loadList("patients");
        const result = [];

        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].isArchived === false) {
                result.push(this.hideSensitiveFieldsIfNeeded(savedPatients[i]));
            }
        }
        return result;
    }

    getPatientById(patientId) {
        permissionService.requirePermission("patients.view");

        const savedPatients = storageService.loadList("patients");
        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].id === patientId) {
                return this.hideSensitiveFieldsIfNeeded(savedPatients[i]);
            }
        }
        return null;
    }

    // Matches the keyword against patient ID, first name, last name and contact number.
    searchPatients(keyword) {
        const allPatients = this.getActivePatients();
        const searchText = keyword.toLowerCase().trim();

        if (searchText === "") {
            return allPatients;
        }

        const matches = [];
        for (let i = 0; i < allPatients.length; i++) {
            const patient = allPatients[i];
            const idMatches = patient.id.toLowerCase().includes(searchText);
            const firstNameMatches = patient.firstName.toLowerCase().includes(searchText);
            const lastNameMatches = patient.lastName.toLowerCase().includes(searchText);
            const contactMatches = patient.contactNumber.includes(searchText);

            if (idMatches || firstNameMatches || lastNameMatches || contactMatches) {
                matches.push(patient);
            }
        }
        return matches;
    }

    // Returns the first error found, or an empty text if the data is valid.
    validatePatientData(data) {
        let error = validator.checkRequired("First name", data.firstName);
        if (error !== "") { return error; }

        error = validator.checkRequired("Last name", data.lastName);
        if (error !== "") { return error; }

        error = validator.checkRequired("Date of birth", data.birthDate);
        if (error !== "") { return error; }

        error = validator.checkBirthDate(data.birthDate);
        if (error !== "") { return error; }

        error = validator.checkRequired("Contact number", data.contactNumber);
        if (error !== "") { return error; }

        error = validator.checkContactNumber(data.contactNumber);
        if (error !== "") { return error; }

        error = validator.checkOptionalEmail(data.email);
        if (error !== "") { return error; }

        error = validator.checkRequired("Address", data.address);
        if (error !== "") { return error; }

        return "";
    }

    // data.id empty -> register a new patient. data.id filled -> update that patient.
    savePatient(data) {
        const validationError = this.validatePatientData(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        // Users without medical permission cannot send these fields.
        if (!permissionService.userCan("patients.medical")) {
            delete data.medicalConditions;
            delete data.currentMedications;
        }

        if (data.id === "") {
            return this.registerNewPatient(data);
        }
        return this.updateExistingPatient(data);
    }

    registerNewPatient(data) {
        permissionService.requirePermission("patients.create");

        const savedPatients = storageService.loadList("patients");

        data.id = storageService.generateNextId("P", savedPatients);
        data.dateRegistered = dateHelper.getTodayString();
        data.lastVisit = "";
        data.isArchived = false;

        // Sensitive fields default to "None" when the registering user cannot enter them.
        if (data.medicalConditions === undefined) { data.medicalConditions = "None"; }
        if (data.currentMedications === undefined) { data.currentMedications = "None"; }

        savedPatients.push(data);
        storageService.saveList("patients", savedPatients);
        auditLogService.recordAction("Patient registered", data.id + " " + htmlHelper.getFullName(data));
        return data;
    }

    updateExistingPatient(data) {
        permissionService.requirePermission("patients.edit");

        const savedPatients = storageService.loadList("patients");

        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].id === data.id) {
                // Object.assign copies the new values over the old ones,
                // so fields missing from "data" (like hidden medical fields) stay unchanged.
                Object.assign(savedPatients[i], data);
                storageService.saveList("patients", savedPatients);
                auditLogService.recordAction("Patient updated", data.id);
                return savedPatients[i];
            }
        }
        throw new Error("Patient not found.");
    }

    // "Archive" hides the patient but keeps the record (medical records should not be deleted).
    archivePatient(patientId) {
        permissionService.requirePermission("patients.archive");

        const savedPatients = storageService.loadList("patients");
        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].id === patientId) {
                savedPatients[i].isArchived = true;
                storageService.saveList("patients", savedPatients);
                auditLogService.recordAction("Patient archived", patientId);
                return;
            }
        }
        throw new Error("Patient not found.");
    }


    // Builds the list used by "Patient" drop-down boxes: [ { value: "P-0001", label: "P-0001 - Juan Reyes" } ]
    getPatientSelectOptions() {
        const patients = this.getActivePatients();
        const options = [];

        for (let i = 0; i < patients.length; i++) {
            options.push({
                value: patients[i].id,
                label: patients[i].id + " - " + htmlHelper.getFullName(patients[i])
            });
        }
        return options;
    }

    getPatientNameById(patientId) {
        const savedPatients = storageService.loadList("patients");
        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].id === patientId) {
                return htmlHelper.getFullName(savedPatients[i]);
            }
        }
        return patientId;
    }
}

const patientService = new PatientService();
