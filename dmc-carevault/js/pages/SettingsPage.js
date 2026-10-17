/*
 * SettingsPage.js
 * Purpose: every user can see their account and change their own password.
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

    showPage(currentUser) {
        let html = "<h2>Settings</h2>";

        html += '<div class="card"><h3>Account</h3><dl class="kv">';
        html += "<dt>Full Name</dt><dd>" + htmlHelper.escapeText(currentUser.fullName) + "</dd>";
        html += "<dt>Username</dt><dd>" + htmlHelper.escapeText(currentUser.username) + "</dd>";
        html += "<dt>Role</dt><dd>" + currentUser.role + "</dd></dl></div>";

        html += '<div class="card"><h3>Change Password</h3>';
        html += formBuilder.buildFormHtml(this.buildPasswordFields(), {});
        html += '<div class="err" id="passwordMessage"></div><button class="btn" id="passwordButton">Update Password</button></div>';

        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("passwordButton").addEventListener("click", function () {
            page.handlePasswordChange();
        });
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
}

const settingsPage = new SettingsPage();
settingsPage.start();
