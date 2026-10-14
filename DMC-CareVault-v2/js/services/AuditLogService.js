/*
 * AuditLogService.js
 * Purpose: keeps a history of important actions (login, patient created, user deactivated, ...).
 * Admin can read this list on the Activity Logs page (Part 2).
 */
class AuditLogService {
    constructor() {
        this.maximumEntries = 500;
    }

    // Used when we already know who did the action (for example during login).
    addEntry(username, role, action, details) {
        const logs = storageService.loadList("auditLogs");

        const newEntry = {
            time: new Date().toISOString(),
            username: username,
            role: role,
            action: action,
            details: details
        };

        // Newest entry goes first.
        logs.unshift(newEntry);

        // Remove the oldest entries so the list does not grow forever.
        while (logs.length > this.maximumEntries) {
            logs.pop();
        }

        storageService.saveList("auditLogs", logs);
    }

    // Used by all other services: the user is taken from the current session.
    recordAction(action, details) {
        const currentUser = authService.getCurrentUser();

        if (currentUser === null) {
            this.addEntry("unknown", "unknown", action, details);
        } else {
            this.addEntry(currentUser.username, currentUser.role, action, details);
        }
    }

    getAllEntries() {
        permissionService.requirePermission("logs.view");
        return storageService.loadList("auditLogs");
    }
}

const auditLogService = new AuditLogService();
