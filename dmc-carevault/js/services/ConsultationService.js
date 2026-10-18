/*
 * ConsultationService.js
 * Purpose: consultation (visit) records and medical history. Only Doctors can write.
 */
class ConsultationService {
    // Doctors see their own consultations; Admin sees all (view only).
    getConsultationsForCurrentUser() {
        permissionService.requirePermission("consultations.view");

        const currentUser = authService.getCurrentUser();
        const savedConsultations = storageService.loadList("consultations");

        if (currentUser.role !== "Doctor") {
            return savedConsultations;
        }

        const ownConsultations = [];
        for (let i = 0; i < savedConsultations.length; i++) {
            if (savedConsultations[i].doctorUsername === currentUser.username) {
                ownConsultations.push(savedConsultations[i]);
            }
        }
        return ownConsultations;
    }

    // Medical history = all consultations of one patient, newest first.
    getHistoryForPatient(patientId) {
        permissionService.requirePermission("history.view");

        const savedConsultations = storageService.loadList("consultations");
        const history = [];

        for (let i = 0; i < savedConsultations.length; i++) {
            if (savedConsultations[i].patientId === patientId) {
                history.push(savedConsultations[i]);
            }
        }

        history.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });
        return history;
    }

    validateConsultationData(data) {
        let error = validator.checkRequired("Patient", data.patientId);
        if (error !== "") { return error; }

        error = validator.checkRequired("Date", data.date);
        if (error !== "") { return error; }

        error = validator.checkRequired("Chief complaint", data.complaint);
        if (error !== "") { return error; }

        error = validator.checkRequired("Diagnosis", data.diagnosis);
        if (error !== "") { return error; }

        return "";
    }
    
    saveConsultation(data) {
        permissionService.requirePermission("consultations.write");

        const validationError = this.validateConsultationData(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        const currentUser = authService.getCurrentUser();
        const savedConsultations = storageService.loadList("consultations");
        const isNewConsultation = data.id === "";

        if (isNewConsultation) {
            data.id = storageService.generateNextId("C", savedConsultations);
            data.doctorUsername = currentUser.username;
            savedConsultations.push(data);
            auditLogService.recordAction("Consultation created", data.id);
        } else {
            let found = false;
            for (let i = 0; i < savedConsultations.length; i++) {
                if (savedConsultations[i].id === data.id) {
                    if (savedConsultations[i].doctorUsername !== currentUser.username) {
                        throw new Error("You can only edit your own consultations.");
                    }
                    Object.assign(savedConsultations[i], data);
                    found = true;
                }
            }
            if (!found) {
                throw new Error("Consultation not found.");
            }
            auditLogService.recordAction("Consultation updated", data.id);
        }

        storageService.saveList("consultations", savedConsultations);
        this.updatePatientLastVisit(data.patientId, data.date);

        // A completed consultation finishes the patient's visit in the queue.
        let finishedEntry = null;
        if (data.status === "Completed") {
            finishedEntry = appointmentService.finishConsultationFromDoctor(data.patientId);
        }

        return { finishedEntry: finishedEntry, isNewConsultation: isNewConsultation };
    }

    // Keeps the patient's "Last Visit" column up to date.
    updatePatientLastVisit(patientId, visitDate) {
        const savedPatients = storageService.loadList("patients");

        for (let i = 0; i < savedPatients.length; i++) {
            if (savedPatients[i].id === patientId && visitDate > savedPatients[i].lastVisit) {
                savedPatients[i].lastVisit = visitDate;
            }
        }
        storageService.saveList("patients", savedPatients);
    }
}

const consultationService = new ConsultationService();
