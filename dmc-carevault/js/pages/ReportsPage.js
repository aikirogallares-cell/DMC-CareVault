/*
 * ReportsPage.js
 * Purpose: statistics and records for a chosen time range (Admin only).
 * Pick Today / This Week / This Month, or type any From and To date.
 * Every number is calculated from the saved data, not typed in.
 */
class ReportsPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("reports");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        let html = "<h2>Reports</h2>";
        html += '<div class="toolbar">';
        html += '<select id="rangeSelect">';
        html += '<option value="today">Today</option><option value="week">This Week</option>';
        html += '<option value="month">This Month</option><option value="custom">Custom Date Range</option></select>';
        html += '<span>From</span><input type="date" id="startDate">';
        html += '<span>To</span><input type="date" id="endDate">';
        html += "</div>";
        html += '<div class="err" id="rangeMessage"></div>';
        html += '<div class="grid" id="reportCards"></div>';
        html += '<div class="card"><h3>Appointments</h3><div id="appointmentList"></div></div>';
        html += '<div class="card"><h3>Consultations</h3><div id="consultationList"></div></div>';
        this.mainElement.innerHTML = html;

        const page = this;

        document.getElementById("rangeSelect").addEventListener("change", function () {
            page.applyQuickRange();
            page.refreshReport();
        });

        // Picking a date by hand switches the range to "Custom Date Range".
        const dateBoxes = [document.getElementById("startDate"), document.getElementById("endDate")];
        for (let i = 0; i < dateBoxes.length; i++) {
            dateBoxes[i].addEventListener("change", function () {
                document.getElementById("rangeSelect").value = "custom";
                page.refreshReport();
            });
        }

        this.applyQuickRange();
        this.refreshReport();
    }

    // Fills the From and To boxes for Today / This Week / This Month. "Custom" keeps the typed dates.
    applyQuickRange() {
        const choice = document.getElementById("rangeSelect").value;
        const today = dateHelper.getTodayString();
        const startBox = document.getElementById("startDate");
        const endBox = document.getElementById("endDate");

        if (choice === "today") {
            startBox.value = today;
            endBox.value = today;
        } else if (choice === "week") {
            startBox.value = dateHelper.getStartOfWeekString();
            endBox.value = today;
        } else if (choice === "month") {
            startBox.value = dateHelper.getStartOfMonthString();
            endBox.value = today;
        }
    }

    // Returns { start, end } as YYYY-MM-DD texts. An empty box means "no limit" on that side.
    getSelectedRange() {
        let start = document.getElementById("startDate").value;
        let end = document.getElementById("endDate").value;

        if (start === "") { start = "0000-01-01"; }
        if (end === "") { end = "9999-12-31"; }
        return { start: start, end: end };
    }

    // Keeps only the records whose "date" is inside the range.
    filterByDate(recordList, range) {
        const result = [];
        for (let i = 0; i < recordList.length; i++) {
            if (dateHelper.isDateInRange(recordList[i].date, range.start, range.end)) {
                result.push(recordList[i]);
            }
        }
        return result;
    }

    refreshReport() {
        const range = this.getSelectedRange();
        const messageElement = document.getElementById("rangeMessage");

        if (range.start > range.end) {
            messageElement.textContent = "The start date cannot be after the end date.";
            document.getElementById("reportCards").innerHTML = "";
            document.getElementById("appointmentList").innerHTML = "";
            document.getElementById("consultationList").innerHTML = "";
            return;
        }
        messageElement.textContent = "";

        const patients = patientService.getActivePatients();
        const appointments = this.filterByDate(appointmentService.getAppointmentsForCurrentUser(), range);
        const consultations = this.filterByDate(consultationService.getConsultationsForCurrentUser(), range);

        let newPatients = 0;
        for (let i = 0; i < patients.length; i++) {
            if (dateHelper.isDateInRange(patients[i].dateRegistered, range.start, range.end)) {
                newPatients = newPatients + 1;
            }
        }

        const cancelledAppointments = appointmentService.countByStatus(appointments, "Cancelled");

        let completedConsultations = 0;
        for (let i = 0; i < consultations.length; i++) {
            if (consultations[i].status === "Completed") {
                completedConsultations = completedConsultations + 1;
            }
        }

        let html = "";
        html += htmlHelper.buildStatCard(patients.length, "Total Patients");
        html += htmlHelper.buildStatCard(newPatients, "New Patients");
        html += htmlHelper.buildStatCard(consultations.length, "Visits (consultations)");
        html += htmlHelper.buildStatCard(appointments.length, "Total Appointments");
        html += htmlHelper.buildStatCard(completedConsultations, "Completed Consultations");
        html += htmlHelper.buildStatCard(cancelledAppointments, "Cancelled Appointments");
        document.getElementById("reportCards").innerHTML = html;

        this.showAppointmentList(appointments);
        this.showConsultationList(consultations);
    }

    showAppointmentList(appointments) {
        appointments.sort(function (first, second) {
            return appointmentService.compareNewestFirst(first, second);
        });

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Queue #", getCellHtml: function (item) {
                if (item.queueNumber === null || item.queueNumber === undefined) {
                    return "-";
                }
                return item.queueNumber;
            } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Time In", getCellHtml: function (item) { return dateHelper.formatTime(item.queuedAt); } },
            { title: "Time Done", getCellHtml: function (item) { return dateHelper.formatTime(item.completedAt); } }
        ];
        document.getElementById("appointmentList").innerHTML =
            tableBuilder.buildTableHtml(columns, appointments, "No appointments in this date range.");
    }

    showConsultationList(consultations) {
        consultations.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } }
        ];
        document.getElementById("consultationList").innerHTML =
            tableBuilder.buildTableHtml(columns, consultations, "No consultations in this date range.");
    }
}

const reportsPage = new ReportsPage();
reportsPage.start();