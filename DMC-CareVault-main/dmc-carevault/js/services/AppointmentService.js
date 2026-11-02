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
        // "Missing" = the patient is not around when called. They are skipped so the line keeps moving,
        // and they keep their queue number, so when they come back they go ahead of bigger numbers.
        this.validStatuses = ["Scheduled", "Confirmed", "Waiting", "Missing", "In Consultation", "Completed", "Cancelled"];
        // The reason can be typed freely. These services are only the suggestions shown while typing.
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

        // Any reason may be typed (for example "cough and colds"). It only has to fit on the screen.
        if (String(data.reason).trim().length > 100) {
            return "Reason is too long (100 characters at most).";
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

        // The same patient cannot be in the queue twice for the same reason on the same day.
        const duplicateEntry = this.findDuplicateEntry(savedAppointments, data, existing);
        if (duplicateEntry !== null) {
            throw new Error(patientService.getPatientNameById(data.patientId) + ' is already in the queue for "' +
                duplicateEntry.reason + '" (queue number ' + duplicateEntry.queueNumber + ", " + duplicateEntry.status + ").");
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
            // Vital signs taken in the last 30 minutes for this patient are reused, so staff are not asked again.
            data.vitals = this.getRecentVitalsForPatient(data.patientId);
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

    // Reasons are compared without capital letters and extra spaces: "X-ray" and " x-ray " are the same.
    normalizeReason(reason) {
        return String(reason || "").trim().toLowerCase().replace(/\s+/g, " ");
    }

    // Looks for another queue entry of the same patient, on the same day, with the same reason.
    // A cancelled entry does not count, so a cancelled patient can be added again.
    // existingAppointment is the entry being edited (it is not compared with itself), or null for a new one.
    findDuplicateEntry(appointmentList, data, existingAppointment) {
        let date = dateHelper.getTodayString();
        if (existingAppointment !== null) {
            date = existingAppointment.date;
        }
        const wantedReason = this.normalizeReason(data.reason);

        for (let i = 0; i < appointmentList.length; i++) {
            const entry = appointmentList[i];
            if (existingAppointment !== null && entry.id === existingAppointment.id) {
                continue;
            }

            const isSamePatient = entry.patientId === data.patientId;
            const isSameDay = entry.date === date;
            const isActive = entry.status !== "Cancelled";
            if (isSamePatient && isSameDay && isActive && this.normalizeReason(entry.reason) === wantedReason) {
                return entry;
            }
        }
        return null;
    }

    // First come, first served. Waiting patients are in one line per doctor and per day, in queue number order.
    // For every waiting patient who is NOT first in that line, this gives the patient who is first.
    // Result: { appointmentId: firstEntryOfTheLine }. A patient who is not in the result is next in line.
    getServeFirstMap(appointmentList) {
        const service = this;
        const waitingList = [];
        for (let i = 0; i < appointmentList.length; i++) {
            if (appointmentList[i].status === "Waiting") {
                waitingList.push(appointmentList[i]);
            }
        }
        waitingList.sort(function (first, second) {
            return service.compareQueueOrder(first, second);
        });

        const firstInLine = {};
        const serveFirstMap = {};
        for (let i = 0; i < waitingList.length; i++) {
            const entry = waitingList[i];
            const lineKey = entry.date + "|" + entry.doctorUsername;
            if (firstInLine[lineKey] === undefined) {
                firstInLine[lineKey] = entry;
            } else {
                serveFirstMap[entry.id] = firstInLine[lineKey];
            }
        }
        return serveFirstMap;
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

        // Missing patients: only a waiting patient can be skipped. A missing patient must come back
        // into the line ("Waiting") before they can be sent to the doctor (or the entry is cancelled).
        if (newStatus === "Missing" && appointment.status !== "Waiting") {
            throw new Error("Only a waiting patient can be marked as missing.");
        }
        if (appointment.status === "Missing" && newStatus !== "Waiting" && newStatus !== "Cancelled") {
            throw new Error('This patient is marked as missing. Press "Back in line" when the patient arrives.');
        }

        // First come, first served: a patient cannot be sent to the doctor while someone who came earlier is still waiting.
        if (newStatus === "In Consultation") {
            const mustGoFirst = this.getServeFirstMap(savedAppointments)[appointment.id];
            if (mustGoFirst !== undefined) {
                throw new Error("First come, first served: queue number " + mustGoFirst.queueNumber + " (" +
                    patientService.getPatientNameById(mustGoFirst.patientId) + ") arrived first and must be sent to the doctor first.");
            }
        }

        // The vital signs must be fresh (taken in the last 30 minutes) before the patient goes to the doctor.
        // They are saved on this visit, so the doctor and the consultation form can see them.
        if (newStatus === "In Consultation") {
            const freshVitals = this.getFreshVitalsForEntry(appointment);
            if (freshVitals === null) {
                throw new Error("Record the vital signs before sending the patient to the doctor. Vital signs are only reused for 30 minutes.");
            }
            appointment.vitals = Object.assign({}, freshVitals);
        }

        // The clock time of each step is saved so the pages can show it.
        const now = new Date().toISOString();

        if (newStatus === "Waiting" && appointment.status === "Missing") {
            // Back in line: the patient KEEPS the old queue number (for example #3),
            // so they are served before everyone with a bigger number (for example #5).
            appointment.returnedAt = now;
        } else if (newStatus === "Missing") {
            appointment.missingAt = now;
        } else if (newStatus === "Waiting") {
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

        // Temperature has no upper limit: any number above 0 is accepted.
        error = this.checkPositiveNumber("Temperature", data.temperature);
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

    // Returns an error text, or "" if the value is a number above 0 (no upper limit).
    checkPositiveNumber(label, value) {
        const text = String(value === undefined || value === null ? "" : value).trim();
        if (text === "") {
            return label + " is required.";
        }

        const number = Number(text);
        if (!Number.isFinite(number)) {
            return label + " must be a number.";
        }
        if (number <= 0) {
            return label + " must be more than 0.";
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
    
    finishConsultationFromDoctor(patientId) {
        permissionService.requirePermission("consultations.write");

        const currentUser = authService.getCurrentUser();
        const today = dateHelper.getTodayString();
        const savedAppointments = storageService.loadList("appointments");

        for (let i = 0; i < savedAppointments.length; i++) {
            const entry = savedAppointments[i];
            const isThisVisit = entry.patientId === patientId &&
                entry.doctorUsername === currentUser.username &&
                entry.date === today &&
                entry.status === "In Consultation";

            if (isThisVisit) {
                const now = new Date().toISOString();
                entry.status = "Completed";
                entry.completedAt = now;
                entry.doctorFinishedAt = now;
                entry.doctorFinishedBy = currentUser.username;
                storageService.saveList("appointments", savedAppointments);
                auditLogService.recordAction("Consultation finished", entry.id + " (" + patientId + ")");
                return entry;
            }
        }
        return null;
    }
        // ----- Vital signs reuse: vital signs taken in the last 30 minutes are used, not measured again -----

    getVitalsWindowMinutes() {
        return 30;
    }

    // True when the vital signs were taken within the last 30 minutes.
    isVitalsFresh(vitals) {
        if (!vitals || !vitals.recordedAt) {
            return false;
        }
        const recordedTime = new Date(vitals.recordedAt).getTime();
        if (isNaN(recordedTime)) {
            return false;
        }
        const minutesAgo = (Date.now() - recordedTime) / 60000;
        return minutesAgo <= this.getVitalsWindowMinutes();
    }

    // The newest fresh vital signs of this patient from today's queue entries.
    // Returns a copy, or null when there are none.
    getRecentVitalsForPatient(patientId) {
        const today = dateHelper.getTodayString();
        const savedAppointments = storageService.loadList("appointments");
        let newest = null;
        let newestTime = 0;

        for (let i = 0; i < savedAppointments.length; i++) {
            const visit = savedAppointments[i];
            if (visit.patientId !== patientId || visit.date !== today || !this.isVitalsFresh(visit.vitals)) {
                continue;
            }
            const visitTime = new Date(visit.vitals.recordedAt).getTime();
            if (newest === null || visitTime > newestTime) {
                newest = visit.vitals;
                newestTime = visitTime;
            }
        }
        return newest === null ? null : Object.assign({}, newest);
    }

    // The vital signs that apply to this queue entry right now: its own if they are fresh,
    // otherwise fresh vital signs of the same patient from an earlier visit today.
    // Returns null when staff must record the vital signs.
    getFreshVitalsForEntry(entry) {
        if (this.isVitalsFresh(entry.vitals)) {
            return entry.vitals;
        }
        return this.getRecentVitalsForPatient(entry.patientId);
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

/*
 * DoctorAvailabilityService
 * Lets a doctor tell staff and admin "I am ready to accept a patient".
 * Each doctor has one entry: { doctorUsername, isReady, readyAt, updatedAt }.
 *   isReady  true while the doctor is accepting patients
 *   readyAt  when the doctor last pressed "Ready to accept patient"
 */
class DoctorAvailabilityService {
    getAllEntries() {
        return storageService.loadList("doctorAvailability");
    }

    findEntry(entries, username) {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].doctorUsername === username) {
                return entries[i];
            }
        }
        return null;
    }

    getStatusFor(username) {
        return this.findEntry(this.getAllEntries(), username);
    }

    isReadyNow(username) {
        const entry = this.getStatusFor(username);
        return entry !== null && entry.isReady === true;
    }

    // Doctor only. Always uses the logged-in doctor, so one doctor cannot change another doctor's status.
    setReady(isReady) {
        permissionService.requirePermission("consultations.write");

        const currentUser = authService.getCurrentUser();
        const entries = storageService.loadList("doctorAvailability");
        const now = new Date().toISOString();

        let entry = this.findEntry(entries, currentUser.username);
        if (entry === null) {
            entry = { doctorUsername: currentUser.username, isReady: false, readyAt: null, updatedAt: null };
            entries.push(entry);
        }

        entry.isReady = isReady === true;
        entry.updatedAt = now;
        if (isReady === true) {
            entry.readyAt = now;
        }

        storageService.saveList("doctorAvailability", entries);

        if (isReady === true) {
            auditLogService.recordAction("Doctor ready for patients", currentUser.username);
        } else {
            auditLogService.recordAction("Doctor stopped accepting patients", currentUser.username);
        }
    }

    getReadyDoctors() {
        const readyList = [];
        const entries = this.getAllEntries();
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].isReady === true) {
                readyList.push(entries[i]);
            }
        }
        readyList.sort(function (first, second) {
            return String(first.readyAt).localeCompare(String(second.readyAt));
        });
        return readyList;
    }
}

const doctorAvailabilityService = new DoctorAvailabilityService();