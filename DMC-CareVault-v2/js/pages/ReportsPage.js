/*
 * ReportsPage.js
 * Purpose: statistics for a chosen time range (Admin only).
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
        html += '<span id="customRange" style="display:none">';
        html += '<input type="date" id="startDate"> <input type="date" id="endDate"></span>';
        html += "</div>";
        html += '<div class="grid" id="reportCards"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        const controls = [document.getElementById("rangeSelect"), document.getElementById("startDate"), document.getElementById("endDate")];
        for (let i = 0; i < controls.length; i++) {
            controls[i].addEventListener("change", function () {
                page.refreshReport();
            });
        }
        this.refreshReport();
    }

    // Returns { start, end } as YYYY-MM-DD texts for the chosen range.
    getSelectedRange() {
        const choice = document.getElementById("rangeSelect").value;
        const today = dateHelper.getTodayString();

        if (choice === "today") {
            return { start: today, end: today };
        }
        if (choice === "week") {
            return { start: dateHelper.getStartOfWeekString(), end: today };
        }
        if (choice === "month") {
            return { start: dateHelper.getStartOfMonthString(), end: today };
        }

        // Custom range: an empty box means "no limit" on that side.
        let start = document.getElementById("startDate").value;
        let end = document.getElementById("endDate").value;
        if (start === "") { start = "0000-01-01"; }
        if (end === "") { end = "9999-12-31"; }
        return { start: start, end: end };
    }

    refreshReport() {
        const choice = document.getElementById("rangeSelect").value;
        if (choice === "custom") {
            document.getElementById("customRange").style.display = "";
        } else {
            document.getElementById("customRange").style.display = "none";
        }

        const range = this.getSelectedRange();
        const patients = patientService.getActivePatients();
        const appointments = appointmentService.getAppointmentsForCurrentUser();
        const consultations = consultationService.getConsultationsForCurrentUser();

        let newPatients = 0;
        for (let i = 0; i < patients.length; i++) {
            if (dateHelper.isDateInRange(patients[i].dateRegistered, range.start, range.end)) {
                newPatients = newPatients + 1;
            }
        }

        let appointmentsInRange = 0;
        let cancelledAppointments = 0;
        for (let i = 0; i < appointments.length; i++) {
            if (dateHelper.isDateInRange(appointments[i].date, range.start, range.end)) {
                appointmentsInRange = appointmentsInRange + 1;
                if (appointments[i].status === "Cancelled") {
                    cancelledAppointments = cancelledAppointments + 1;
                }
            }
        }

        let visits = 0;
        let completedConsultations = 0;
        for (let i = 0; i < consultations.length; i++) {
            if (dateHelper.isDateInRange(consultations[i].date, range.start, range.end)) {
                visits = visits + 1;
                if (consultations[i].status === "Completed") {
                    completedConsultations = completedConsultations + 1;
                }
            }
        }

        let html = "";
        html += htmlHelper.buildStatCard(patients.length, "Total Patients");
        html += htmlHelper.buildStatCard(newPatients, "New Patients");
        html += htmlHelper.buildStatCard(visits, "Visits (consultations)");
        html += htmlHelper.buildStatCard(appointmentsInRange, "Total Appointments");
        html += htmlHelper.buildStatCard(completedConsultations, "Completed Consultations");
        html += htmlHelper.buildStatCard(cancelledAppointments, "Cancelled Appointments");
        document.getElementById("reportCards").innerHTML = html;
    }
}

const reportsPage = new ReportsPage();
reportsPage.start();
