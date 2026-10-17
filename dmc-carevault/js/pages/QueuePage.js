/*
 * QueuePage.js
 * Purpose: today's patient queue. Staff moves each patient through the steps:
 *   1. Check in              (Scheduled / Confirmed -> Waiting)
 *   2. Record vital signs    (before the patient is sent to the doctor)
 *   3. Send to doctor        (Waiting -> In Consultation, needs vital signs first)
 *   4. Mark completed        (In Consultation -> Completed)
 * The clock time of each step is shown: Time In, Time Started and Time Done.
 */
class QueuePage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("queue");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.mainElement.innerHTML = '<h2>Patient Queue - Today</h2><div class="card" id="queueTable"></div>';

            document.getElementById("queueTable").addEventListener("click", function (event) {
                page.handleButtonClick(event);
            });
            page.refreshTable();
        });
    }

    // Returns { nextStatus, buttonText } for the current status, or null when there is no next step.
    getNextStep(currentStatus) {
        if (currentStatus === "Scheduled" || currentStatus === "Confirmed") {
            return { nextStatus: "Waiting", buttonText: "Check in" };
        }
        if (currentStatus === "Waiting") {
            return { nextStatus: "In Consultation", buttonText: "Send to doctor" };
        }
        if (currentStatus === "In Consultation") {
            return { nextStatus: "Completed", buttonText: "Mark completed" };
        }
        return null;
    }

    // Vital signs can be recorded (or changed) only before the patient is sent to the doctor.
    canRecordVitals(appointment) {
        const isBeforeDoctor = appointment.status === "Scheduled" ||
            appointment.status === "Confirmed" ||
            appointment.status === "Waiting";
        return isBeforeDoctor && permissionService.userCan("vitals.record");
    }

    getQueueList() {
        const todayAppointments = appointmentService.getTodayAppointments();
        const queueList = [];

        for (let i = 0; i < todayAppointments.length; i++) {
            if (todayAppointments[i].status !== "Cancelled") {
                queueList.push(todayAppointments[i]);
            }
        }

        // Patients are listed in queue-number order.
        queueList.sort(function (first, second) {
            return appointmentService.compareQueueOrder(first, second);
        });
        return queueList;
    }

    refreshTable() {
        const page = this;
        const columns = [
            { title: "Queue #", getCellHtml: function (item) {
                if (item.queueNumber === null || item.queueNumber === undefined) {
                    return "-";
                }
                return item.queueNumber;
            } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Vitals", getCellHtml: function (item) {
                if (!item.vitals) {
                    return '<span class="badge pending">Not recorded</span>';
                }
                return '<span class="badge">Recorded</span> <small>BP ' + htmlHelper.escapeText(item.vitals.bloodPressure) + "</small>";
            } },
            { title: "Time In", getCellHtml: function (item) { return dateHelper.formatTime(item.queuedAt); } },
            { title: "Time Started", getCellHtml: function (item) { return dateHelper.formatTime(item.startedAt); } },
            { title: "Time Done", getCellHtml: function (item) { return dateHelper.formatTime(item.completedAt); } },
            { title: "Action", getCellHtml: function (item) {
                let html = "";

                if (page.canRecordVitals(item)) {
                    let vitalsButtonText = "Record vitals";
                    if (item.vitals) {
                        vitalsButtonText = "Edit vitals";
                    }
                    html += '<button class="btn sm ghost" data-vitals="' + item.id + '">' + vitalsButtonText + "</button> ";
                }

                const nextStep = page.getNextStep(item.status);
                if (nextStep !== null) {
                    html += '<button class="btn sm" data-id="' + item.id + '" data-status="' + nextStep.nextStatus + '">' + nextStep.buttonText + "</button>";
                }
                return html;
            } }
        ];

        document.getElementById("queueTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getQueueList(), "No patients in the queue today.");
    }

    handleButtonClick(event) {
        const vitalsButton = event.target.closest("button[data-vitals]");
        if (vitalsButton !== null) {
            this.openVitalsForm(vitalsButton.getAttribute("data-vitals"));
            return;
        }

        const statusButton = event.target.closest("button[data-status]");
        if (statusButton === null) {
            return;
        }

        try {
            appointmentService.changeStatus(statusButton.getAttribute("data-id"), statusButton.getAttribute("data-status"));
            notifier.showSuccess("Queue updated.");
            this.refreshTable();
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    // ----- Vital signs form -----

    findQueueItem(appointmentId) {
        const todayAppointments = appointmentService.getTodayAppointments();
        for (let i = 0; i < todayAppointments.length; i++) {
            if (todayAppointments[i].id === appointmentId) {
                return todayAppointments[i];
            }
        }
        return null;
    }

    buildVitalsFields() {
        return [
            { name: "bloodPressure", label: "Blood Pressure (mmHg, e.g. 120/80)", type: "text", isRequired: true, isFullWidth: true },
            { name: "heartRate", label: "Heart Rate (beats per minute)", type: "number", isRequired: true, min: 30, max: 220 },
            { name: "temperature", label: "Temperature (°C)", type: "number", isRequired: true, min: 34, max: 43 },
            { name: "respiratoryRate", label: "Respiratory Rate (breaths per minute)", type: "number", isRequired: true, min: 5, max: 60 },
            { name: "weight", label: "Weight (kg)", type: "number", isRequired: true, min: 1, max: 300 },
            { name: "height", label: "Height (cm), optional", type: "number", min: 30, max: 250 }
        ];
    }

    openVitalsForm(appointmentId) {
        const page = this;
        const appointment = this.findQueueItem(appointmentId);
        if (appointment === null) {
            notifier.showError("Queue entry not found.");
            return;
        }

        const fields = this.buildVitalsFields();
        const existingValues = appointment.vitals ? appointment.vitals : {};
        const patientName = patientService.getPatientNameById(appointment.patientId);

        const dialog = new ModalDialog("Vital Signs - " + patientName, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Vital Signs",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                appointmentService.saveVitals(appointmentId, values);
                notifier.showSuccess("Vital signs saved.");
                page.refreshTable();
            }
        });
        dialog.open();
    }
}

const queuePage = new QueuePage();
queuePage.start();