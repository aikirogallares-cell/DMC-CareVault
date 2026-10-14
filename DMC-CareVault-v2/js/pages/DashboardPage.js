/*
 * DashboardPage.js
 * Purpose: shows the Admin, Staff or Doctor dashboard.
 * The three dashboard HTML files use this same class; each file has a different data-page value.
 */
class DashboardPage {
    constructor() {
        this.pageId = document.body.getAttribute("data-page");
    }

    start() {
        const page = this;
        const layout = new PageLayout(this.pageId);

        layout.show(function (mainElement, currentUser) {
            page.showDashboard(mainElement, currentUser);
        });
    }

    showDashboard(mainElement, currentUser) {
        if (this.pageId === "dashboard-admin") {
            this.showAdminDashboard(mainElement);
        } else if (this.pageId === "dashboard-staff") {
            this.showStaffDashboard(mainElement);
        } else {
            this.showDoctorDashboard(mainElement);
        }
    }

    // ---------- Admin ----------

    showAdminDashboard(mainElement) {
        const patients = patientService.getActivePatients();
        const users = userService.getAllUsers();
        const todayAppointments = appointmentService.getTodayAppointments();
        const consultations = consultationService.getConsultationsForCurrentUser();

        let activeUserCount = 0;
        for (let i = 0; i < users.length; i++) {
            if (users[i].isActive) {
                activeUserCount = activeUserCount + 1;
            }
        }

        let completedConsultations = 0;
        for (let i = 0; i < consultations.length; i++) {
            if (consultations[i].status === "Completed") {
                completedConsultations = completedConsultations + 1;
            }
        }

        let html = "<h2>Admin Dashboard</h2>";
        html += '<div class="grid">';
        html += htmlHelper.buildStatCard(patients.length, "Total Patients");
        html += htmlHelper.buildStatCard(activeUserCount, "Active Users");
        html += htmlHelper.buildStatCard(todayAppointments.length, "Today's Appointments");
        html += htmlHelper.buildStatCard(completedConsultations, "Completed Consultations");
        html += "</div>";

        html += '<div class="card"><h3>Quick Actions</h3>';
        html += '<a class="btn" href="users.html">Manage Users</a> ';
        html += '<a class="btn ghost" href="patients.html">Patients</a> ';
        html += '<a class="btn ghost" href="reports.html">Reports</a> ';
        html += '<a class="btn ghost" href="settings.html">Settings</a></div>';

        html += '<div class="card"><h3>Users by Role</h3>' + this.buildUsersByRoleHtml(users) + "</div>";
        html += '<div class="card"><h3>Recent System Activity</h3>' + this.buildRecentActivityHtml() + "</div>";

        mainElement.innerHTML = html;
    }

    buildUsersByRoleHtml(users) {
        const roles = ["Admin", "Staff", "Doctor"];
        let html = "";

        for (let i = 0; i < roles.length; i++) {
            let count = 0;
            for (let j = 0; j < users.length; j++) {
                if (users[j].role === roles[i]) {
                    count = count + 1;
                }
            }
            html += htmlHelper.buildStatusBadge(roles[i]) + " " + count + "&nbsp;&nbsp;&nbsp;";
        }
        return html;
    }

    buildRecentActivityHtml() {
        const allEntries = auditLogService.getAllEntries();
        const latestSix = allEntries.slice(0, 6);

        const columns = [
            { title: "Time", getCellHtml: function (entry) { return dateHelper.formatDateTime(entry.time); } },
            { title: "User", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.username); } },
            { title: "Action", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.action); } },
            { title: "Details", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.details); } }
        ];
        return tableBuilder.buildTableHtml(columns, latestSix, "No activity yet.");
    }

    // ---------- Staff ----------

    showStaffDashboard(mainElement) {
        const patients = patientService.getActivePatients();
        const todayAppointments = appointmentService.getTodayAppointments();
        const waitingCount = appointmentService.countByStatus(todayAppointments, "Waiting");
        const scheduledCount = appointmentService.countByStatus(todayAppointments, "Scheduled");
        const confirmedCount = appointmentService.countByStatus(todayAppointments, "Confirmed");

        let html = "<h2>Staff Dashboard</h2>";
        html += '<div class="grid">';
        html += htmlHelper.buildStatCard(patients.length, "Registered Patients");
        html += htmlHelper.buildStatCard(todayAppointments.length, "Today's Appointments");
        html += htmlHelper.buildStatCard(waitingCount, "Waiting in Queue");
        html += htmlHelper.buildStatCard(scheduledCount + confirmedCount, "Not Yet Arrived");
        html += "</div>";

        html += '<div class="card"><h3>Quick Actions</h3>';
        html += '<a class="btn" href="patients.html?new=1">Register Patient</a> ';
        html += '<a class="btn ghost" href="appointments.html">Appointments</a> ';
        html += '<a class="btn ghost" href="queue.html">Manage Queue</a></div>';

        html += '<div class="card"><h3>Today\'s Appointments</h3>' + this.buildAppointmentTableHtml(todayAppointments) + "</div>";

        mainElement.innerHTML = html;
    }

    // ---------- Doctor ----------

    showDoctorDashboard(mainElement) {
        const todayAppointments = appointmentService.getTodayAppointments();
        const consultations = consultationService.getConsultationsForCurrentUser();

        let inProgressCount = 0;
        let completedCount = 0;
        for (let i = 0; i < consultations.length; i++) {
            if (consultations[i].status === "In Progress") { inProgressCount = inProgressCount + 1; }
            if (consultations[i].status === "Completed") { completedCount = completedCount + 1; }
        }

        let html = "<h2>Doctor Dashboard</h2>";
        html += '<div class="grid">';
        html += htmlHelper.buildStatCard(todayAppointments.length, "Today's Appointments");
        html += htmlHelper.buildStatCard(appointmentService.countByStatus(todayAppointments, "Waiting"), "Patients Waiting");
        html += htmlHelper.buildStatCard(inProgressCount, "Consultations In Progress");
        html += htmlHelper.buildStatCard(completedCount, "Completed Consultations");
        html += "</div>";

        html += '<div class="card"><h3>Quick Actions</h3>';
        html += '<a class="btn" href="consultations.html?new=1">New Consultation</a> ';
        html += '<a class="btn ghost" href="prescriptions.html">Prescriptions</a> ';
        html += '<a class="btn ghost" href="medical-history.html">Medical History</a></div>';

        html += '<div class="card"><h3>My Appointments Today</h3>' + this.buildAppointmentTableHtml(todayAppointments) + "</div>";
        html += '<div class="card"><h3>Recent Consultations</h3>' + this.buildRecentConsultationsHtml(consultations) + "</div>";

        mainElement.innerHTML = html;
    }

    // ---------- Shared pieces ----------

    buildAppointmentTableHtml(appointments) {
        const columns = [
            { title: "Time", getCellHtml: function (item) { return item.time; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Doctor", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Reason", getCellHtml: function (item) { return htmlHelper.escapeText(item.reason); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } }
        ];
        return tableBuilder.buildTableHtml(columns, appointments, "No appointments today.");
    }

    buildRecentConsultationsHtml(consultations) {
        // Newest first, then keep only the first five.
        consultations.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });
        const latestFive = consultations.slice(0, 5);

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } }
        ];
        return tableBuilder.buildTableHtml(columns, latestFive, "No consultations yet.");
    }
}

const dashboardPage = new DashboardPage();
dashboardPage.start();
