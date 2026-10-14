/*
 * SettingsPage.js
 * Purpose: every user can see their account and change their own password.
 * Only Admin can change the system settings (others see them read-only).
 */
class SettingsPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("settings");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage(currentUser);
        });
    }

    buildPasswordFields() {
        return [
            { name: "currentPassword", label: "Current Password", type: "password", isFullWidth: true },
            { name: "newPassword", label: "New Password (minimum 8 characters)", type: "password" },
            { name: "confirmPassword", label: "Confirm New Password", type: "password" }
        ];
    }

    buildSystemFields(isAdmin) {
        return [
            { name: "systemName", label: "System Name", type: "text", isReadOnly: !isAdmin },
            { name: "clinicName", label: "Clinic Name", type: "text", isReadOnly: !isAdmin },
            { name: "sessionTimeoutMinutes", label: "Session Timeout (minutes)", type: "number", isReadOnly: !isAdmin }
        ];
    }

    showPage(currentUser) {
        const isAdmin = permissionService.userCan("settings.manage");
        const settings = settingsService.getSettings();

        let html = "<h2>Settings</h2>";

        html += '<div class="card"><h3>Account</h3><dl class="kv">';
        html += "<dt>Full Name</dt><dd>" + htmlHelper.escapeText(currentUser.fullName) + "</dd>";
        html += "<dt>Username</dt><dd>" + htmlHelper.escapeText(currentUser.username) + "</dd>";
        html += "<dt>Role</dt><dd>" + currentUser.role + "</dd></dl></div>";

        html += '<div class="card"><h3>Change Password</h3>';
        html += formBuilder.buildFormHtml(this.buildPasswordFields(), {});
        html += '<div class="err" id="passwordMessage"></div><button class="btn" id="passwordButton">Update Password</button></div>';

        let systemTitle = "System (read only)";
        if (isAdmin) {
            systemTitle = "System";
        }
        html += '<div class="card"><h3>' + systemTitle + "</h3>";
        html += formBuilder.buildFormHtml(this.buildSystemFields(isAdmin), settings);
        html += '<div class="err" id="systemMessage"></div>';
        if (isAdmin) {
            html += '<button class="btn" id="systemButton">Save Settings</button>';
        }
        html += "</div>";

        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("passwordButton").addEventListener("click", function () {
            page.handlePasswordChange();
        });
        if (isAdmin) {
            document.getElementById("systemButton").addEventListener("click", function () {
                page.handleSystemSave();
            });
        }
    }

    handlePasswordChange() {
        const messageElement = document.getElementById("passwordMessage");
        const fields = this.buildPasswordFields();

        try {
            const values = formBuilder.readFormValues(fields);

            if (values.newPassword !== values.confirmPassword) {
                throw new Error("New passwords do not match.");
            }

            settingsService.changeOwnPassword(values.currentPassword, values.newPassword);

            // Clear the three boxes after success.
            for (let i = 0; i < fields.length; i++) {
                document.getElementById("field_" + fields[i].name).value = "";
            }
            messageElement.textContent = "";
            notifier.showSuccess("Password updated successfully.");
        } catch (error) {
            messageElement.textContent = error.message;
        }
    }

    handleSystemSave() {
        const messageElement = document.getElementById("systemMessage");

        try {
            const values = formBuilder.readFormValues(this.buildSystemFields(true));
            settingsService.saveSystemSettings(values);
            notifier.showSuccess("Settings saved successfully.");

            // Reload so the new names appear in the header and sidebar.
            setTimeout(function () {
                window.location.reload();
            }, 700);
        } catch (error) {
            messageElement.textContent = error.message;
        }
    }
}

const settingsPage = new SettingsPage();
settingsPage.start();
