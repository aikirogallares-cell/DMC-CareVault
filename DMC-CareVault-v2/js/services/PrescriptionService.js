/*
 * PrescriptionService.js
 * Purpose: prescriptions. Only Doctors can create them. A prescription can have many medicines.
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

    // data: { patientId, date, medicines: [ { name, dosage, frequency, duration, instructions } ] }
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

            if (medicine.name === "" || medicine.dosage === "" || medicine.frequency === "" || medicine.duration === "") {
                throw new Error("Medicine " + rowNumber + " needs a name, dosage, frequency and duration.");
            }
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
