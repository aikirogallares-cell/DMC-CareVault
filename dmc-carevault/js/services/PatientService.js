/*
 * PatientService.js
 * Purpose: all patient data operations (list, search, add, edit, archive).
 * Staff cannot see or change the sensitive medical fields (conditions, medications).
 */
class PatientService {
    constructor() {
        this.validGenders = ["Male", "Female"];
    }

    // The address is typed in three boxes (lot no., barangay, city).
    // This joins them into one line, for example "Lot 12, Brgy. Poblacion, Makati City".
    // "Lot" and "Brgy." are only added when the user did not already type them.
    buildAddressText(data) {
        const parts = [];

        if (data.lotNo) {
            if (/^lot\b/i.test(data.lotNo)) {
                parts.push(data.lotNo);
            } else {
                parts.push("Lot " + data.lotNo);
            }
        }
        if (data.barangay) {
            if (/^(brgy|barangay)\b/i.test(data.barangay)) {
                parts.push(data.barangay);
            } else {
                parts.push("Brgy. " + data.barangay);
            }
        }
        if (data.city) {
            parts.push(data.city);
        }
        return parts.join(", ");
    }

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
            const contactMatches = String(patient.contactNumber || "").includes(searchText);

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

        error = validator.checkPersonName("First name", data.firstName);
        if (error !== "") { return error; }

        // Middle name is optional, but when it is typed it must also be letters only.
        if (data.middleName !== undefined && data.middleName !== "") {
            error = validator.checkPersonName("Middle name", data.middleName);
            if (error !== "") { return error; }
        }

        error = validator.checkRequired("Last name", data.lastName);
        if (error !== "") { return error; }

        error = validator.checkPersonName("Last name", data.lastName);
        if (error !== "") { return error; }

        error = validator.checkRequired("Date of birth", data.birthDate);
        if (error !== "") { return error; }

        error = validator.checkBirthDate(data.birthDate);
        if (error !== "") { return error; }

        if (!this.validGenders.includes(data.gender)) {
            return "Gender must be Male or Female.";
        }

        // Contact number and address are optional (not every patient has them),
        // but a contact number that is typed must still be a valid number (11 digits, starts with 09).
        if (data.contactNumber !== undefined && data.contactNumber !== "") {
            error = validator.checkContactNumber(data.contactNumber);
            if (error !== "") { return error; }
        }

        return "";
    }

    // data.id empty -> register a new patient. data.id filled -> update that patient.
    savePatient(data) {
        const validationError = this.validatePatientData(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        // Keep one readable "address" line, built from the three address boxes.
        if (data.lotNo !== undefined || data.barangay !== undefined || data.city !== undefined) {
            data.address = this.buildAddressText(data);
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

        // Patient numbers are random (for example P-483920), not 1, 2, 3...
        data.id = storageService.generateRandomId("P", savedPatients, 6);
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


   
    getPatientSelectOptions() {
        const patients = this.getActivePatients();
        const options = [];

        for (let i = 0; i < patients.length; i++) {
            const patient = patients[i];
            const fullName = htmlHelper.getFullName(patient);
            const contact = patient.contactNumber || "";

            const detailParts = [];
            if (patient.birthDate) {
                detailParts.push("Born " + patient.birthDate);
            }
            if (contact !== "") {
                detailParts.push("Contact " + contact);
            }

            options.push({
                value: patient.id,
                label: patient.id + " - " + fullName,
                detail: detailParts.join("  |  "),
                searchText: fullName + " " + patient.id + " " + contact
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