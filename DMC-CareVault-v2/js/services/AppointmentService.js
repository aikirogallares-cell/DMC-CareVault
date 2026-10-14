/*
 * AppointmentService.js
 * Purpose: appointments and the patient queue.
 * Doctors only see their own appointments.
 */
class AppointmentService {
    constructor() {
        this.validStatuses = ["Scheduled", "Confirmed", "Waiting", "In Consultation", "Completed", "Cancelled"];
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

        // Sort by time, earliest first.
        todayList.sort(function (first, second) {
            return first.time.localeCompare(second.time);
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

    validateAppointmentData(data) {
        let error = validator.checkRequired("Patient", data.patientId);
        if (error !== "") { return error; }

        error = validator.checkRequired("Date", data.date);
        if (error !== "") { return error; }

        error = validator.checkRequired("Time", data.time);
        if (error !== "") { return error; }

        error = validator.checkRequired("Doctor", data.doctorUsername);
        if (error !== "") { return error; }

        error = validator.checkRequired("Reason", data.reason);
        if (error !== "") { return error; }

        return "";
    }

    // data.id empty -> create. data.id filled -> update.
    saveAppointment(data) {
        permissionService.requirePermission("appointments.manage");

        const validationError = this.validateAppointmentData(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        const savedAppointments = storageService.loadList("appointments");

        if (data.id === "") {
            data.id = storageService.generateNextId("A", savedAppointments);
            data.status = "Scheduled";
            data.queueNumber = null;
            savedAppointments.push(data);
            auditLogService.recordAction("Appointment created", data.id);
        } else {
            let found = false;
            for (let i = 0; i < savedAppointments.length; i++) {
                if (savedAppointments[i].id === data.id) {
                    Object.assign(savedAppointments[i], data);
                    found = true;
                }
            }
            if (!found) {
                throw new Error("Appointment not found.");
            }
            auditLogService.recordAction("Appointment updated", data.id);
        }

        storageService.saveList("appointments", savedAppointments);
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
        let appointment = null;
        for (let i = 0; i < savedAppointments.length; i++) {
            if (savedAppointments[i].id === appointmentId) {
                appointment = savedAppointments[i];
            }
        }
        if (appointment === null) {
            throw new Error("Appointment not found.");
        }

        // A patient who checks in ("Waiting") gets the next queue number of that day.
        if (newStatus === "Waiting") {
            appointment.queueNumber = this.getNextQueueNumber(savedAppointments, appointment.date);
        }

        appointment.status = newStatus;
        storageService.saveList("appointments", savedAppointments);
        auditLogService.recordAction("Appointment status", appointmentId + " changed to " + newStatus);
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
