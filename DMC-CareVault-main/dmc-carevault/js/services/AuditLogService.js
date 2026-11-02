/*
 * AuditLogService.js
 * Purpose: keeps a history of important actions (login, patient created, user deactivated, ...).
 * The lines are stored in the database (audit_logs table). The server records who did the action
 * from the login session, so the username and role cannot be faked from the browser.
 * Admin can read this list on the Activity Logs page.
 */
class AuditLogService {
    // Kept so older code that calls it still works. The server decides the username and role.
    addEntry(username, role, action, details) {
        storageService.appendAuditLog(action, details);
    }

    // Used by all other services: the user is taken from the current session.
    recordAction(action, details) {
        if (authService.getCurrentUser() === null) {
            return;
        }
        storageService.appendAuditLog(action, details);
    }

    getAllEntries() {
        permissionService.requirePermission("logs.view");
        return storageService.loadList("auditLogs");
    }
}

const auditLogService = new AuditLogService();
