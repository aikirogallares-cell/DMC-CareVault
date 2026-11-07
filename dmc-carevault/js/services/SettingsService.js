/*
 * SettingsService.js
 * Purpose: the clinic details shown on every page and printed on prescriptions,
 * and the password change that any logged-in user can do.
 *
 * TO CHANGE THE CLINIC DETAILS, EDIT THE VALUES BELOW AND SAVE THE FILE.
 */
const appSettings = {
    systemName: "DMC CareVault",
    clinicName: "Dumaual Medical Clinic",
    clinicAddress: "2164 Primo Rivera St., Brgy. La Paz, Makati City",
    clinicPhone: "Tel. No.: 8890-1515 / 8401-2996",
    clinicHours: ["Clinic Hours: Monday – Friday, 8:00 am – 4:00 pm", "Saturday, 8:00 am – 12:00 pm"],
    // The names at the top of the prescription pad. "bold" and "large" change how a line looks.
    letterhead: [
        { text: "MA. THERESA J. DUMAUAL, M.D., CFP., C.M.A.", bold: true },
        { text: "CARL MARTIN J. DUMAUAL, M.D.", bold: true },
        { text: "FAMILY PHYSICIAN" },
        { text: "LOVELY KIM CO - DUMAUAL, M.D.", bold: true, large: true },
        { text: "DIPLOMATE, INTERNAL MEDICINE" }
    ],
    // The verse printed at the bottom of each prescription.
    prescriptionFooterVerse: [
        "“Heal me, Lord, and I will be healed,",
        "Save and I will be saved”",
        "For You are the one I praise”",
        "Jeremiah 17:14"
    ]
};

class SettingsService {
    getSettings() {
        return {
            systemName: appSettings.systemName,
            clinicName: appSettings.clinicName,
            clinicAddress: appSettings.clinicAddress,
            clinicPhone: appSettings.clinicPhone,
            clinicHours: appSettings.clinicHours,
            letterhead: appSettings.letterhead,
            prescriptionFooterVerse: appSettings.prescriptionFooterVerse
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