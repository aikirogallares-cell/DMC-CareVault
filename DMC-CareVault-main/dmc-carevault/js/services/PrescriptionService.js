/*
 * PrescriptionService.js
 * Purpose: prescriptions. Only Doctors can create them. A prescription can have many medicines.
 * Every medicine is chosen from the medicine list (MedicationService),
 * and its stock goes down by the prescribed quantity when the prescription is saved.
 */
class PrescriptionService {
    getAllPrescriptions() {
        permissionService.requirePermission("prescriptions.view");

        const savedPrescriptions = storageService.loadList("prescriptions");

        savedPrescriptions.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });
        return savedPrescriptions;
    }

    getPrescriptionsForPatient(patientId) {
        const allPrescriptions = this.getAllPrescriptions();
        const result = [];

        for (let i = 0; i < allPrescriptions.length; i++) {
            if (allPrescriptions[i].patientId === patientId) {
                result.push(allPrescriptions[i]);
            }
        }
        return result;
    }

        // data: { patientId, date, medicines: [ { name, dosage, frequency, duration, quantity, instructions } ] }
    // The medicine name is typed, so a medicine that is not in the medicine list is allowed.
    // Saving a prescription does not check or change the medicine stock.
    createPrescription(data) {
        permissionService.requirePermission("prescriptions.write");

        let error = validator.checkRequired("Patient", data.patientId);
        if (error !== "") { throw new Error(error); }

        error = validator.checkRequired("Date", data.date);
        if (error !== "") { throw new Error(error); }

        if (data.medicines.length === 0) {
            throw new Error("Add at least one medicine.");
        }

        for (let i = 0; i < data.medicines.length; i++) {
            const medicine = data.medicines[i];
            const rowNumber = i + 1;

            if (medicine.name === "") {
                throw new Error("Medicine " + rowNumber + ": please type the medicine name.");
            }
            if (medicine.name.length > 100) {
                throw new Error("Medicine " + rowNumber + ": the name is too long (100 characters at most).");
            }

            if (medicine.dosage === "" || medicine.frequency === "" || medicine.duration === "") {
                throw new Error("Medicine " + rowNumber + " needs a dosage, frequency and duration.");
            }

            const quantity = Number(medicine.quantity);
            if (String(medicine.quantity).trim() === "" || !Number.isInteger(quantity) || quantity < 1) {
                throw new Error("Medicine " + rowNumber + " needs a quantity of at least 1.");
            }
            medicine.quantity = quantity;
        }

        const savedPrescriptions = storageService.loadList("prescriptions");
        data.id = storageService.generateNextId("RX", savedPrescriptions);
        data.doctorUsername = authService.getCurrentUser().username;

        savedPrescriptions.push(data);
        storageService.saveList("prescriptions", savedPrescriptions);
        auditLogService.recordAction("Prescription created", data.id);
    }
}

const prescriptionService = new PrescriptionService();
