/*
 * PermissionService.js
 * Purpose: role-based access control (RBAC). It answers: "May this user do this?"
 *
 * IMPORTANT: Checks in the browser can be bypassed by a technical user.
 * In a real system the SERVER must repeat these same checks.
 */
class PermissionService {
    constructor() {
        // Each role has a list of permission names.
        this.permissionsByRole = {
            Admin: [
                "dashboard.admin",
                "patients.view", "patients.create", "patients.edit", "patients.archive", "patients.medical",
                "appointments.view", "appointments.manage", "queue.manage",
                "consultations.view", "history.view", "prescriptions.view",
                "reports.view", "users.manage", "logs.view", "settings.manage"
            ],
            Staff: [
                "dashboard.staff",
                "patients.view", "patients.create", "patients.edit",
                "appointments.view", "appointments.manage", "queue.manage"
            ],
            Doctor: [
                "dashboard.doctor",
                "patients.view", "patients.medical",
                "appointments.view",
                "consultations.view", "consultations.write",
                "history.view",
                "prescriptions.view", "prescriptions.write"
            ]
        };
    }

    // Returns true or false.
    userCan(permissionName) {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            return false;
        }

        const allowedList = this.permissionsByRole[currentUser.role];
        if (allowedList === undefined) {
            return false;
        }

        return allowedList.includes(permissionName);
    }

    // Used inside services before a sensitive action. Stops the action with an error.
    requirePermission(permissionName) {
        if (!this.userCan(permissionName)) {
            throw new Error("You do not have permission to perform this action.");
        }
    }
}

const permissionService = new PermissionService();
