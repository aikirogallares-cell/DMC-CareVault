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

    // The server checks the current password and saves the new one (as a bcrypt hash).
    changeOwnPassword(currentPassword, newPassword) {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            throw new Error("You must be logged in.");
        }

        const error = validator.checkPassword(newPassword);
        if (error !== "") { throw new Error(error); }

        storageService.sendRequest("POST", "auth.php?action=changePassword", {
            currentPassword: currentPassword,
            newPassword: newPassword
        });
    }
}

const settingsService = new SettingsService();
