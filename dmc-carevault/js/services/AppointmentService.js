/*
 * AppointmentService.js
 * Purpose: appointments and the patient queue.
 * Doctors only see their own appointments.
 *
 * The clinic works as a walk-in queue, so an appointment has NO scheduled time.
 * A new appointment is always for today. It joins the queue at once as "Waiting"
 * and gets the next queue number of the day. The real times are saved as the patient moves along:
 *   queuedAt    when the patient joined the queue
 *   startedAt   when the patient was sent to the doctor (In Consultation)
 *   completedAt when the patient was done (Completed)
 * Each is an ISO date-time text, or null if it has not happened yet.
 *
 * Vital signs are recorded by staff before the patient is sent to the doctor.
 * A patient cannot be sent to the doctor until their vital signs are saved.
 *   vitals  { bloodPressure, heartRate, temperature, respiratoryRate, weight, height,
 *             recordedBy, recordedAt }, or null if not recorded yet
 */
class AppointmentService {
    constructor() {
        this.validStatuses = ["Scheduled", "Confirmed", "Waiting", "In Consultation", "Completed", "Cancelled"];
        this.validReasons = ["Check-up", "X-ray", "Urine Test", "Blood Test", "Getting Blood", "Getting Urine"];
    }

    // ----- Sorting (used by the Appointments, Queue, Reports and Dashboard pages) -----

    // Queue order: smaller queue number first. Records without a queue number go last.
    // Older records that still have a "time" are ordered by that time.
    compareQueueOrder(first, second) {
        let firstNumber = first.queueNumber;
        let secondNumber = second.queueNumber;
        if (firstNumber === null || firstNumber === undefined) { firstNumber = 999999; }
        if (secondNumber === null || secondNumber === undefined) { secondNumber = 999999; }

        if (firstNumber !== secondNumber) {
            return firstNumber - secondNumber;
        }
        return String(first.time || "").localeCompare(String(second.time || ""));
    }

    // Newest day first. On the same day, the latest queue number first.
    compareNewestFirst(first, second) {
        const dateOrder = second.date.localeCompare(first.date);
        if (dateOrder !== 0) {
            return dateOrder;
        }
        return this.compareQueueOrder(second, first);
    }

    getAppointmentsForCurrentUser() {
        permissionService.requirePermission("appointments.view");

        const currentUser = authService.getCurrentUser();
        const savedAppointments = storageService.loadList("appointments");

        if (currentUser.role !== "Doctor") {
            return savedAppointments;
        }

        const ownAppointments = [];
        for (let i = 0; i < savedAppointments.length; i++) {
            if (savedAppointments[i].doctorUsername === currentUser.username) {
                ownAppointments.push(savedAppointments[i]);
            }
        }
        return ownAppointments;
    }

    getTodayAppointments() {
        const allAppointments = this.getAppointmentsForCurrentUser();
        const today = dateHelper.getTodayString();
        const todayList = [];

        for (let i = 0; i < allAppointments.length; i++) {
            if (allAppointments[i].date === today) {
                todayList.push(allAppointments[i]);
            }
        }

        // Queue order: queue number 1 first.
        const service = this;
        todayList.sort(function (first, second) {
            return service.compareQueueOrder(first, second);
        });
        return todayList;
    }

    countByStatus(appointmentList, status) {
        let count = 0;
        for (let i = 0; i < appointmentList.length; i++) {
            if (appointmentList[i].status === status) {
                count = count + 1;
            }
        }
        return count;
    }

    findInList(appointmentList, appointmentId) {
        for (let i = 0; i < appointmentList.length; i++) {
            if (appointmentList[i].id === appointmentId) {
                return appointmentList[i];
            }
        }
        return null;
    }

    // existingAppointment is the saved record when editing, or null when adding a new one.
    validateAppointmentData(data, existingAppointment) {
        let error = validator.checkRequired("Patient", data.patientId);
        if (error !== "") { return error; }

        error = validator.checkRequired("Doctor", data.doctorUsername);
        if (error !== "") { return error; }

        error = validator.checkRequired("Reason", data.reason);
        if (error !== "") { return error; }

        // The reason must come from the list. An older reason that is already saved may stay as it is.
        const isKeptOldReason = existingAppointment !== null && existingAppointment.reason === data.reason;
        if (!this.validReasons.includes(data.reason) && !isKeptOldReason) {
            return "Please choose a reason from the list.";
        }

        return "";
    }

    // data.id empty -> create. data.id filled -> update.
    // Returns the saved appointment (a new one already has its queue number).
    saveAppointment(data) {
        permissionService.requirePermission("appointments.manage");

        const savedAppointments = storageService.loadList("appointments");

        let existing = null;
        if (data.id !== "") {
            for (let i = 0; i < savedAppointments.length; i++) {
                if (savedAppointments[i].id === data.id) {
                    existing = savedAppointments[i];
                }
            }
            if (existing === null) {
                throw new Error("Appointment not found.");
            }
        }

        const validationError = this.validateAppointmentData(data, existing);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        const patient = patientService.getPatientById(data.patientId);
        if (patient === null || patient.isArchived) {
            throw new Error("Please choose a patient from the search results.");
        }

        if (existing === null) {
            // New patient in the queue: today only, and the queue number is given right away.
            if (data.date !== dateHelper.getTodayString()) {
                throw new Error("An appointment can only be made for today's date.");
            }

            data.id = storageService.generateNextId("A", savedAppointments);
            data.status = "Waiting";
            data.queueNumber = this.getNextQueueNumber(savedAppointments, data.date);
            data.queuedAt = new Date().toISOString();
            data.startedAt = null;
            data.completedAt = null;
            data.vitals = null;
            delete data.time;
            savedAppointments.push(data);
            storageService.saveList("appointments", savedAppointments);
            auditLogService.recordAction("Appointment created", data.id + " (queue " + data.queueNumber + ")");
            return data;
        }

        // Editing: the date, queue number, times and vital signs are not changed here.
        existing.patientId = data.patientId;
        existing.doctorUsername = data.doctorUsername;
        existing.reason = data.reason;
        storageService.saveList("appointments", savedAppointments);
        auditLogService.recordAction("Appointment updated", data.id);
        return existing;
    }

    // Used by the queue buttons and the Cancel button.
    changeStatus(appointmentId, newStatus) {
        const canManage = permissionService.userCan("appointments.manage");
        const canUseQueue = permissionService.userCan("queue.manage");
        if (!canManage && !canUseQueue) {
            throw new Error("You do not have permission to perform this action.");
        }

        if (!this.validStatuses.includes(newStatus)) {
            throw new Error("Invalid appointment status.");
        }

        const savedAppointments = storageService.loadList("appointments");
        const appointment = this.findInList(savedAppointments, appointmentId);
        if (appointment === null) {
            throw new Error("Appointment not found.");
        }

        // The vital signs must be recorded before the patient goes to the doctor.
        if (newStatus === "In Consultation" && !appointment.vitals) {
            throw new Error("Record the vital signs before sending the patient to the doctor.");
        }

        // The clock time of each step is saved so the pages can show it.
        const now = new Date().toISOString();

        if (newStatus === "Waiting") {
            // A patient who checks in ("Waiting") gets the next queue number of that day.
            appointment.queueNumber = this.getNextQueueNumber(savedAppointments, appointment.date);
            appointment.queuedAt = now;
            appointment.startedAt = null;
            appointment.completedAt = null;
        } else if (newStatus === "In Consultation") {
            appointment.startedAt = now;
            appointment.completedAt = null;
        } else if (newStatus === "Completed") {
            appointment.completedAt = now;
        }

        appointment.status = newStatus;
        storageService.saveList("appointments", savedAppointments);
        auditLogService.recordAction("Appointment status", appointmentId + " changed to " + newStatus);
    }

    // Staff records the vital signs. Allowed only before the patient is sent to the doctor.
    saveVitals(appointmentId, data) {
        permissionService.requirePermission("vitals.record");

        const savedAppointments = storageService.loadList("appointments");
        const appointment = this.findInList(savedAppointments, appointmentId);
        if (appointment === null) {
            throw new Error("Appointment not found.");
        }

        const canStillRecord = appointment.status === "Scheduled" ||
            appointment.status === "Confirmed" ||
            appointment.status === "Waiting";
        if (!canStillRecord) {
            throw new Error("Vital signs can only be recorded before the patient is sent to the doctor.");
        }

        const validationError = this.validateVitals(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        const currentUser = authService.getCurrentUser();
        appointment.vitals = {
            bloodPressure: String(data.bloodPressure).trim(),
            heartRate: Number(data.heartRate),
            temperature: Number(data.temperature),
            respiratoryRate: Number(data.respiratoryRate),
            weight: Number(data.weight),
            height: String(data.height).trim() === "" ? "" : Number(data.height),
            recordedBy: currentUser.username,
            recordedAt: new Date().toISOString()
        };

        storageService.saveList("appointments", savedAppointments);
        auditLogService.recordAction("Vital signs recorded", appointmentId + " (" + appointment.patientId + ")");
    }

    // Returns the first error found, or an empty text if the vital signs are valid.
    validateVitals(data) {
        const bloodPressure = String(data.bloodPressure || "").trim();
        if (!/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
            return "Blood pressure must look like 120/80.";
        }

        let error = this.checkNumberRange("Heart rate", data.heartRate, 30, 220, true);
        if (error !== "") { return error; }

        error = this.checkNumberRange("Temperature", data.temperature, 34, 43, false);
        if (error !== "") { return error; }

        error = this.checkNumberRange("Respiratory rate", data.respiratoryRate, 5, 60, true);
        if (error !== "") { return error; }

        error = this.checkNumberRange("Weight", data.weight, 1, 300, false);
        if (error !== "") { return error; }

        // Height is optional, but if it is typed it must be reasonable.
        if (String(data.height || "").trim() !== "") {
            error = this.checkNumberRange("Height", data.height, 30, 250, false);
            if (error !== "") { return error; }
        }
        return "";
    }

    // Returns an error text, or "" if the value is a number inside the allowed range.
    checkNumberRange(label, value, lowest, highest, mustBeWhole) {
        const text = String(value === undefined || value === null ? "" : value).trim();
        if (text === "") {
            return label + " is required.";
        }

        const number = Number(text);
        if (!Number.isFinite(number)) {
            return label + " must be a number.";
        }
        if (mustBeWhole && !Number.isInteger(number)) {
            return label + " must be a whole number.";
        }
        if (number < lowest || number > highest) {
            return label + " must be between " + lowest + " and " + highest + ".";
        }
        return "";
    }

    getNextQueueNumber(appointmentList, date) {
        let highestNumber = 0;
        for (let i = 0; i < appointmentList.length; i++) {
            const isSameDay = appointmentList[i].date === date;
            const hasNumber = appointmentList[i].queueNumber !== null;
            if (isSameDay && hasNumber && appointmentList[i].queueNumber > highestNumber) {
                highestNumber = appointmentList[i].queueNumber;
            }
        }
        return highestNumber + 1;
    }
}

const appointmentService = new AppointmentService();