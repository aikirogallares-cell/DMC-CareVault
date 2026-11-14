/*
 * SettingsPage.js
 * Purpose: every user can see their account, change their sign-in PIN, and change their password.
 * Doctors also enter the numbers printed on their prescriptions (Lic No., PTR No., S2 No., TIN, DEA No., NPI No.).
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

    // Field names are unique on the page, so they do not clash with the password card.
    buildPinFields() {
        return [
            { name: "pinCurrentPassword", label: "Current Password", type: "password", isFullWidth: true },
            { name: "newPin", label: "New PIN (4 to 6 digits)", type: "password" },
            { name: "confirmPin", label: "Type the New PIN again", type: "password" }
        ];
    }

    buildPasswordFields() {
        return [
            { name: "currentPassword", label: "Current Password", type: "password", isFullWidth: true },
            { name: "newPassword", label: "New Password (minimum 8 characters)", type: "password" },
            { name: "confirmPassword", label: "Confirm New Password", type: "password" }
        ];
    }

    buildProfileFields() {
        return [
            { name: "licenseNo", label: "Lic No.", type: "text", maxLength: 30 },
            { name: "ptrNo", label: "PTR No.", type: "text", maxLength: 30 },
            { name: "s2No", label: "S2 No.", type: "text", maxLength: 30 },
            { name: "tin", label: "TIN", type: "text", maxLength: 30 },
            { name: "deaNo", label: "DEA No.", type: "text", maxLength: 30 },
            { name: "npiNo", label: "NPI No.", type: "text", maxLength: 30 }
        ];
    }

    // The saved prescription details of the signed-in doctor, or an empty set.
    getOwnProfile(currentUser) {
        const profiles = storageService.loadList("doctorProfiles");
        for (let i = 0; i < profiles.length; i++) {
            if (profiles[i].doctorUsername === currentUser.username) {
                return profiles[i];
            }
        }
        return {};
    }

    showPage(currentUser) {
        let html = "<h2>Settings</h2>";

        html += '<div class="card"><h3>Account</h3><dl class="kv">';
        html += "<dt>Full Name</dt><dd>" + htmlHelper.escapeText(currentUser.fullName) + "</dd>";
        html += "<dt>Username</dt><dd>" + htmlHelper.escapeText(currentUser.username) + "</dd>";
        html += "<dt>Role</dt><dd>" + currentUser.role + "</dd></dl></div>";

        if (currentUser.role === "Doctor") {
            const own = this.getOwnProfile(currentUser);
            const existing = {
                licenseNo: own.licenseNo || "", ptrNo: own.ptrNo || "", s2No: own.s2No || "",
                tin: own.tin || "", deaNo: own.deaNo || "", npiNo: own.npiNo || ""
            };
            html += '<div class="card"><h3>Prescription details</h3>';
            html += '<p style="color:var(--tx2);font-size:12px;margin:0 0 12px">These numbers are printed on every prescription you write. An empty box prints a blank line to write on.</p>';
            html += formBuilder.buildFormHtml(this.buildProfileFields(), existing);
            html += '<div class="err" id="profileMessage"></div><button class="btn" id="profileButton">Save Prescription Details</button></div>';
        }

        html += '<div class="card"><h3>Change PIN</h3>';
        html += '<p style="color:var(--tx2);font-size:12px;margin:0 0 12px">Type your current password, then the new PIN twice. You will use the new PIN at every sign-in.</p>';
        html += formBuilder.buildFormHtml(this.buildPinFields(), {});
        html += '<div class="err" id="pinMessage"></div><button class="btn" id="pinButton">Change PIN</button></div>';

        html += '<div class="card"><h3>Change Password</h3>';
        html += formBuilder.buildFormHtml(this.buildPasswordFields(), {});
        html += '<div class="err" id="passwordMessage"></div><button class="btn" id="passwordButton">Update Password</button></div>';

        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("pinButton").addEventListener("click", function () {
            page.handlePinChange();
        });
        document.getElementById("passwordButton").addEventListener("click", function () {
            page.handlePasswordChange();
        });
        if (currentUser.role === "Doctor") {
            document.getElementById("profileButton").addEventListener("click", function () {
                page.handleProfileSave(currentUser);
            });
        }
    }

    handlePinChange() {
        const messageElement = document.getElementById("pinMessage");
        const fields = this.buildPinFields();

        try {
            const values = formBuilder.readFormValues(fields);

            if (values.newPin !== values.confirmPin) {
                throw new Error("The two new PINs do not match.");
            }

            storageService.sendRequest("POST", "my-pin.php?action=change", {
                currentPassword: values.pinCurrentPassword,
                newPin: values.newPin,
                confirm: values.confirmPin
            });

            for (let i = 0; i < fields.length; i++) {
                document.getElementById("field_" + fields[i].name).value = "";
            }
            messageElement.textContent = "";
            notifier.showSuccess("Your PIN was changed.");
        } catch (error) {
            messageElement.textContent = error.message;
        }
    }

    handleProfileSave(currentUser) {
        const messageElement = document.getElementById("profileMessage");
        try {
            const values = formBuilder.readFormValues(this.buildProfileFields());
            const profiles = storageService.loadList("doctorProfiles");

            let own = null;
            for (let i = 0; i < profiles.length; i++) {
                if (profiles[i].doctorUsername === currentUser.username) {
                    own = profiles[i];
                }
            }
            if (own === null) {
                own = { id: currentUser.username, doctorUsername: currentUser.username };
                profiles.push(own);
            }

            own.licenseNo = String(values.licenseNo || "").trim();
            own.ptrNo = String(values.ptrNo || "").trim();
            own.s2No = String(values.s2No || "").trim();
            own.tin = String(values.tin || "").trim();
            own.deaNo = String(values.deaNo || "").trim();
            own.npiNo = String(values.npiNo || "").trim();

            storageService.saveList("doctorProfiles", profiles);
            messageElement.textContent = "";
            notifier.showSuccess("Prescription details saved.");
        } catch (error) {
            messageElement.textContent = error.message;
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