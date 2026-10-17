/*
 * SettingsService.js
 * Purpose: the system name and clinic name shown on every page,
 * and the password change that any logged-in user can do.
 *
 * TO CHANGE THE CLINIC NAME OR SYSTEM NAME, EDIT THE TWO LINES BELOW AND SAVE THE FILE.
 * The names come from this file every time a page loads, so older saved values are ignored.
 */
const appSettings = {
    systemName: "DMC CareVault",
    clinicName: "Dumaual Medical Clinic"
};

class SettingsService {
    getSettings() {
        return {
            systemName: appSettings.systemName,
            clinicName: appSettings.clinicName
        };
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