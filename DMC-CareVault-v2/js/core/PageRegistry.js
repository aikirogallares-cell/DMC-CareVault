/*
 * PageRegistry.js
 * Purpose: one list of every page in the system (used to build the sidebar menu).
 * "permission" is the permission a user needs to open the page.
 * A permission of null means every logged-in user may open it.
 */
class PageRegistry {
    constructor() {
        this.pages = [
            { id: "dashboard-admin", fileName: "admin-dashboard.html", title: "Dashboard", permission: "dashboard.admin", icon: "▦" },
            { id: "dashboard-staff", fileName: "staff-dashboard.html", title: "Dashboard", permission: "dashboard.staff", icon: "▦" },
            { id: "dashboard-doctor", fileName: "doctor-dashboard.html", title: "Dashboard", permission: "dashboard.doctor", icon: "▦" },
            { id: "patients", fileName: "patients.html", title: "Patient Records", permission: "patients.view", icon: "☺" },
            { id: "appointments", fileName: "appointments.html", title: "Appointments", permission: "appointments.view", icon: "▣" },
            { id: "queue", fileName: "queue.html", title: "Patient Queue", permission: "queue.manage", icon: "☰" },
            { id: "consultations", fileName: "consultations.html", title: "Consultations", permission: "consultations.view", icon: "✎" },
            { id: "history", fileName: "medical-history.html", title: "Medical History", permission: "history.view", icon: "⌛" },
            { id: "prescriptions", fileName: "prescriptions.html", title: "Prescriptions", permission: "prescriptions.view", icon: "℞" },
            { id: "reports", fileName: "reports.html", title: "Reports", permission: "reports.view", icon: "▤" },
            { id: "users", fileName: "users.html", title: "User Management", permission: "users.manage", icon: "⚙" },
            { id: "logs", fileName: "activity-logs.html", title: "Activity Logs", permission: "logs.view", icon: "☷" },
            { id: "settings", fileName: "settings.html", title: "Settings", permission: null, icon: "⚑" }
        ];
    }

    findPageById(pageId) {
        for (let i = 0; i < this.pages.length; i++) {
            if (this.pages[i].id === pageId) {
                return this.pages[i];
            }
        }
        return null;
    }

    getAllPages() {
        return this.pages;
    }
}

const pageRegistry = new PageRegistry();
