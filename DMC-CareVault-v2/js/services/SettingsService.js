/*
 * SettingsService.js
 * Purpose: system settings (Admin) and password change (any logged-in user).
 */
class SettingsService {
    getSettings() {
        return storageService.loadObject("settings", {
            systemName: "DMC CareVault",
            clinicName: "Dumaual Medical Clinic",
            sessionTimeoutMinutes: 15
        });
    }

    saveSystemSettings(newSettings) {
        permissionService.requirePermission("settings.manage");

        let error = validator.checkRequired("System name", newSettings.systemName);
        if (error !== "") { throw new Error(error); }

        error = validator.checkRequired("Clinic name", newSettings.clinicName);
        if (error !== "") { throw new Error(error); }

        const timeout = parseInt(newSettings.sessionTimeoutMinutes);
        if (isNaN(timeout) || timeout < 1 || timeout > 240) {
            throw new Error("Session timeout must be between 1 and 240 minutes.");
        }

        storageService.saveObject("settings", {
            systemName: newSettings.systemName.trim(),
            clinicName: newSettings.clinicName.trim(),
            sessionTimeoutMinutes: timeout
        });
        auditLogService.recordAction("Settings updated", "System settings were changed");
    }

    changeOwnPassword(currentPassword, newPassword) {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            throw new Error("You must be logged in.");
        }

        const users = storageService.loadList("users");
        let savedUser = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === currentUser.id) {
                savedUser = users[i];
            }
        }

        if (!passwordHasher.isPasswordCorrect(currentPassword, savedUser.salt, savedUser.passwordHash)) {
            throw new Error("Current password is incorrect.");
        }

        const error = validator.checkPassword(newPassword);
        if (error !== "") { throw new Error(error); }

        savedUser.passwordHash = passwordHasher.hashPassword(newPassword, savedUser.salt);
        storageService.saveList("users", users);
        auditLogService.recordAction("Password changed", "User changed their own password");
    }
}

const settingsService = new SettingsService();
