/*
 * MedicalRecordService.js
 * Purpose: the patient's medical picture, shown in Patient Records and Medical History.
 *   - Medicines being taken now. Day 1 is the prescription date. A medicine leaves the list
 *     after its last day.
 *   - The full history: consultations, visits and check-ups, test results (blood, urine, X-ray...),
 *     and every prescription.
 * A duration must be written like "7 days", "2 weeks" or "1 month" to be counted.
 */
class MedicalRecordService {
    constructor() {
        this.daysPerUnit = { day: 1, days: 1, week: 7, weeks: 7, month: 30, months: 30 };
    }

    // "7 days" -> 7, "2 weeks" -> 14, "1 month" -> 30. Returns null when the text cannot be read.
    getDurationInDays(durationText) {
        const text = String(durationText || "").trim().toLowerCase();
        const match = text.match(/^(\d+)\s*(day|days|week|weeks|month|months)$/);
        if (match === null) {
            return null;
        }
        return parseInt(match[1], 10) * this.daysPerUnit[match[2]];
    }

    // Converts "YYYY-MM-DD" into a date at midnight.
    toDate(dateString) {
        const parts = String(dateString).split("-");
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }

    // Whole days from one date to another.
    daysBetween(fromString, toString) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return Math.round((this.toDate(toString) - this.toDate(fromString)) / millisecondsPerDay);
    }

    // The last day the medicine is taken. Day 1 is the prescription date.
    getLastDay(startDate, days) {
        const date = this.toDate(startDate);
        date.setDate(date.getDate() + days - 1);
        return dateHelper.formatLocalDate(date);
    }

    // Says when the medicine was given and whether the course is still running.
    describeCourse(startDate, durationText) {
        const today = dateHelper.getTodayString();
        const days = this.getDurationInDays(durationText);

        if (days === null) {
            return { active: true, text: "Given " + startDate + ", duration \"" + durationText + "\" (please check)" };
        }

        const lastDay = this.getLastDay(startDate, days);
        if (lastDay < today) {
            return { active: false, text: "Given " + startDate + ", course ended " + lastDay };
        }

        const daysLeft = this.daysBetween(today, lastDay) + 1;
        return {
            active: true,
            text: "Given " + startDate + ", take until " + lastDay + " (" + daysLeft + (daysLeft === 1 ? " day" : " days") + " left)"
        };
    }

    // Medicines the patient is still taking today. Each entry is { medicine, course, startDate }.
    getActiveMedicines(patientId) {
        if (permissionService.userCan("prescriptions.view") === false) {
            return [];
        }

        const prescriptions = prescriptionService.getPrescriptionsForPatient(patientId);
        const active = [];
        for (let i = 0; i < prescriptions.length; i++) {
            for (let j = 0; j < prescriptions[i].medicines.length; j++) {
                const medicine = prescriptions[i].medicines[j];
                const course = this.describeCourse(prescriptions[i].date, medicine.duration);
                if (course.active) {
                    active.push({ medicine: medicine, course: course, startDate: prescriptions[i].date });
                }
            }
        }

        active.sort(function (first, second) {
            return String(second.startDate).localeCompare(String(first.startDate));
        });
        return active;
    }

    // Text with line breaks kept, and safe to show.
    textHtml(value) {
        if (value === undefined || value === null || String(value).trim() === "") {
            return "-";
        }
        return htmlHelper.escapeText(value).replace(/\n/g, "<br>");
    }

    // ---------- Sections ----------

    buildSection(title, bodyHtml) {
        return '<div class="record-section"><h4>' + htmlHelper.escapeText(title) + "</h4>" + bodyHtml + "</div>";
    }

    buildActiveMedicinesHtml(patientId) {
        if (permissionService.userCan("prescriptions.view") === false) {
            return "Not available for your role.";
        }

        const safe = htmlHelper.escapeText;
        const active = this.getActiveMedicines(patientId);
        if (active.length === 0) {
            return "None right now.";
        }

        let html = "";
        for (let i = 0; i < active.length; i++) {
            const item = active[i];
            html += '<div style="margin-bottom:8px"><b>' + safe(item.medicine.name) + "</b> " +
                safe(item.medicine.dosage) + " &middot; " + safe(item.medicine.frequency) +
                "<br><small>" + safe(item.course.text) + "</small></div>";
        }
        return html;
    }

    describeVitals(consultation) {
        const safe = htmlHelper.escapeText;
        const parts = [];
        if (consultation.bloodPressure) { parts.push("BP " + safe(consultation.bloodPressure)); }
        if (consultation.heartRate) { parts.push("HR " + safe(consultation.heartRate)); }
        if (consultation.temperature) { parts.push("Temp " + safe(consultation.temperature) + " °C"); }
        if (consultation.respiratoryRate) { parts.push("RR " + safe(consultation.respiratoryRate)); }
        if (consultation.weight) { parts.push(safe(consultation.weight) + " kg"); }
        if (consultation.height) { parts.push(safe(consultation.height) + " cm"); }
        if (parts.length === 0) {
            return "Not recorded";
        }
        return parts.join(" &middot; ");
    }

    buildConsultationsHtml(patientId) {
        const safe = htmlHelper.escapeText;
        const history = consultationService.getHistoryForPatient(patientId);
        if (history.length === 0) {
            return '<div class="empty">No consultations yet.</div>';
        }

        let html = "";
        for (let i = 0; i < history.length; i++) {
            const c = history[i];
            html += '<div class="rx-result"><b>' + safe(c.date) + "</b> &middot; " +
                safe(userService.getFullNameByUsername(c.doctorUsername)) + " &middot; " +
                htmlHelper.buildStatusBadge(c.status);
            html += "<br><b>Chief complaint:</b> " + safe(c.complaint);
            html += "<br><b>Vital signs:</b> " + this.describeVitals(c);
            if (c.symptoms) { html += "<br><b>Symptoms:</b> " + this.textHtml(c.symptoms); }
            html += "<br><b>Diagnosis:</b> " + safe(c.diagnosis);
            if (c.treatment) { html += "<br><b>Treatment:</b> " + this.textHtml(c.treatment); }
            if (c.notes) { html += "<br><b>Doctor's notes:</b> " + this.textHtml(c.notes); }
            if (c.followUpDate) { html += "<br><b>Follow-up:</b> " + safe(c.followUpDate); }
            html += "</div>";
        }
        return html;
    }

    buildVisitsHtml(patientId) {
        const safe = htmlHelper.escapeText;
        const allVisits = appointmentService.getAppointmentsForCurrentUser();
        const visits = [];
        for (let i = 0; i < allVisits.length; i++) {
            if (allVisits[i].patientId === patientId) {
                visits.push(allVisits[i]);
            }
        }
        visits.sort(function (first, second) {
            return appointmentService.compareNewestFirst(first, second);
        });

        if (visits.length === 0) {
            return '<div class="empty">No visits yet.</div>';
        }

        let html = "";
        for (let i = 0; i < visits.length; i++) {
            const visit = visits[i];
            const queueText = (visit.queueNumber === null || visit.queueNumber === undefined)
                ? "-" : "Queue #" + visit.queueNumber;
            const resultCount = testResultService.getResultsForEntry(visit.id).length;
            const resultsText = resultCount === 1 ? "1 test result" : resultCount + " test results";

            html += '<div class="rx-result"><b>' + safe(visit.date) + "</b> &middot; " + safe(queueText) +
                " &middot; " + safe(visit.reason) + " &middot; " + htmlHelper.buildStatusBadge(visit.status);
            html += "<br><small>Doctor: " + safe(userService.getFullNameByUsername(visit.doctorUsername)) +
                " &middot; Priority: " + safe(visit.priority || "Regular") + "</small>";
            html += "<br><small>In: " + safe(dateHelper.formatTime(visit.queuedAt)) +
                " &middot; Started: " + safe(dateHelper.formatTime(visit.startedAt)) +
                " &middot; Done: " + safe(dateHelper.formatTime(visit.completedAt)) + "</small>";
            html += "<br><small>" + (visit.vitals ? "Vital signs recorded" : "Vital signs not recorded") +
                " &middot; " + resultsText + "</small></div>";
        }
        return html;
    }

    buildTestResultsHtml(patientId) {
        const safe = htmlHelper.escapeText;
        const results = testResultService.getResultsForPatient(patientId);
        if (results.length === 0) {
            return '<div class="empty">No test results yet.</div>';
        }

        let html = "";
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            html += '<div class="rx-result"><b>' + safe(result.testName) + "</b> &middot; " +
                safe(dateHelper.formatDateTime(result.recordedAt)) +
                "<br><small>Recorded by " + safe(userService.getFullNameByUsername(result.recordedBy)) + "</small>";
            if (result.updatedAt) {
                html += "<br><small>Changed " + safe(dateHelper.formatDateTime(result.updatedAt)) + " by " +
                    safe(userService.getFullNameByUsername(result.updatedBy)) + "</small>";
            }
            html += "<p>" + this.textHtml(result.resultText) + "</p></div>";
        }
        return html;
    }

    buildPrescriptionsHtml(patientId) {
        if (permissionService.userCan("prescriptions.view") === false) {
            return "Not available for your role.";
        }

        const safe = htmlHelper.escapeText;
        const prescriptions = prescriptionService.getPrescriptionsForPatient(patientId);
        if (prescriptions.length === 0) {
            return '<div class="empty">No prescriptions yet.</div>';
        }

        let html = "";
        for (let i = 0; i < prescriptions.length; i++) {
            const prescription = prescriptions[i];
            html += '<div class="rx-result"><b>' + safe(prescription.date) + "</b> &middot; " +
                safe(userService.getFullNameByUsername(prescription.doctorUsername));

            for (let j = 0; j < prescription.medicines.length; j++) {
                const m = prescription.medicines[j];
                const course = this.describeCourse(prescription.date, m.duration);
                html += '<div style="margin-top:6px"><b>' + safe(m.name) + "</b> " + safe(m.dosage) +
                    " &middot; " + safe(m.frequency) + " &middot; for " + safe(m.duration) +
                    " &middot; qty " + safe(m.quantity);
                if (m.instructions) {
                    html += "<br><small>" + safe(m.instructions) + "</small>";
                }
                html += "<br><small>" + safe(course.text) + "</small></div>";
            }
            html += "</div>";
        }
        return html;
    }

    // Prescriptions restored from the paper archive, shown exactly as they were written.
    buildArchivedHtml(patientId) {
        const safe = htmlHelper.escapeText;
        const all = storageService.loadList("archivedPrescriptions");
        const mine = [];
        for (let i = 0; i < all.length; i++) {
            if (all[i].patientId === patientId) {
                mine.push(all[i]);
            }
        }
        mine.sort(function (first, second) {
            return String(second.date).localeCompare(String(first.date));
        });
        if (mine.length === 0) {
            return '<div class="empty">No archived prescriptions for this patient.</div>';
        }

        let html = "";
        for (let i = 0; i < mine.length; i++) {
            const item = mine[i];
            html += '<div class="rx-result"><b>' + safe(item.date) + "</b> &middot; " +
                safe(item.doctorNameAsWritten) + " <small>(as written)</small>";
            for (let j = 0; j < item.medicines.length; j++) {
                const m = item.medicines[j];
                html += '<div style="margin-top:4px"><b>' + safe(m.name) + "</b> " + safe(m.dosage) + " &middot; " +
                    safe(m.frequency) + " &middot; " + safe(m.duration) + " &middot; qty " + safe(m.quantity);
                if (m.instructions) {
                    html += "<br><small>" + safe(m.instructions) + "</small>";
                }
                html += "</div>";
            }
            if (item.note) {
                html += "<br><small>Note: " + safe(item.note) + "</small>";
            }
            html += "<br><small>Restored by " + safe(userService.getFullNameByUsername(item.enteredBy)) + "</small></div>";
        }
        return html;
    }

    // The full record. Each section shows "Not available for your role." when the user may not see it.
    buildDetailedHistoryHtml(patientId) {
        return this.buildSection("Medicines being taken now", this.buildActiveMedicinesHtml(patientId)) +
            this.buildSection("Consultations", this.buildConsultationsHtml(patientId)) +
            this.buildSection("Visits and check-ups", this.buildVisitsHtml(patientId)) +
            this.buildSection("Test results (blood, urine, X-ray and others)", this.buildTestResultsHtml(patientId)) +
            this.buildSection("All prescriptions", this.buildPrescriptionsHtml(patientId)) +
            this.buildSection("Archived prescriptions (restored from paper)", this.buildArchivedHtml(patientId));
    }
}

const medicalRecordService = new MedicalRecordService();