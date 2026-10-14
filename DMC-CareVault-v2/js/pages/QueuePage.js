/*
 * QueuePage.js
 * Purpose: today's patient queue. Staff moves each patient through the steps:
 *   Scheduled/Confirmed -> Waiting (check in) -> In Consultation -> Completed
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

    getQueueList() {
        const todayAppointments = appointmentService.getTodayAppointments();
        const queueList = [];

        for (let i = 0; i < todayAppointments.length; i++) {
            if (todayAppointments[i].status !== "Cancelled") {
                queueList.push(todayAppointments[i]);
            }
        }

        // Patients with a queue number come first, in number order. Others follow by time.
        queueList.sort(function (first, second) {
            const firstNumber = first.queueNumber === null ? 999 : first.queueNumber;
            const secondNumber = second.queueNumber === null ? 999 : second.queueNumber;
            if (firstNumber !== secondNumber) {
                return firstNumber - secondNumber;
            }
            return first.time.localeCompare(second.time);
        });
        return queueList;
    }

    refreshTable() {
        const page = this;
        const columns = [
            { title: "Queue #", getCellHtml: function (item) {
                if (item.queueNumber === null) {
                    return "-";
                }
                return item.queueNumber;
            } },
            { title: "Time", getCellHtml: function (item) { return item.time; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Action", getCellHtml: function (item) {
                const nextStep = page.getNextStep(item.status);
                if (nextStep === null) {
                    return "";
                }
                return '<button class="btn sm" data-id="' + item.id + '" data-status="' + nextStep.nextStatus + '">' + nextStep.buttonText + "</button>";
            } }
        ];

        document.getElementById("queueTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getQueueList(), "No patients in the queue today.");
    }

    handleButtonClick(event) {
        const button = event.target.closest("button[data-status]");
        if (button === null) {
            return;
        }

        try {
            appointmentService.changeStatus(button.getAttribute("data-id"), button.getAttribute("data-status"));
            notifier.showSuccess("Queue updated.");
            this.refreshTable();
        } catch (error) {
            notifier.showError(error.message);
        }
    }
}

const queuePage = new QueuePage();
queuePage.start();
