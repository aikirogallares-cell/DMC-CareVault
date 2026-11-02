/*
 * UsersPage.js
 * Purpose: Admin manages Admin, Staff and Doctor accounts (add, edit, activate, deactivate).
 */
class UsersPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("users");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        let html = "<h2>User Management</h2>";
        html += '<div class="toolbar"><span class="sp"></span><button class="btn" id="addUserButton">+ Add User</button></div>';
        html += '<div class="card" id="userTable"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("addUserButton").addEventListener("click", function () {
            page.openUserForm(null);
        });
        document.getElementById("userTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
        this.refreshTable();
    }

    refreshTable() {
        const columns = [
            { title: "Name", getCellHtml: function (user) { return htmlHelper.escapeText(user.fullName); } },
            { title: "Username", getCellHtml: function (user) { return htmlHelper.escapeText(user.username); } },
            { title: "Role", getCellHtml: function (user) { return user.role; } },
            { title: "Status", getCellHtml: function (user) {
                if (user.isActive) {
                    return htmlHelper.buildStatusBadge("Active");
                }
                return htmlHelper.buildStatusBadge("Inactive");
            } },
            { title: "Action", getCellHtml: function (user) {
                let toggleText = "Activate";
                let toggleClass = "ghost";
                if (user.isActive) {
                    toggleText = "Deactivate";
                    toggleClass = "danger";
                }
                return '<button class="btn sm ghost" data-action="edit" data-id="' + user.id + '">Edit</button>' +
                    '<button class="btn sm ' + toggleClass + '" data-action="toggle" data-id="' + user.id + '">' + toggleText + "</button>";
            } }
        ];

        document.getElementById("userTable").innerHTML =
            tableBuilder.buildTableHtml(columns, userService.getAllUsers(), "No users found.");
    }

    findUserById(userId) {
        const users = userService.getAllUsers();
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === userId) {
                return users[i];
            }
        }
        return null;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const user = this.findUserById(button.getAttribute("data-id"));

        try {
            if (button.getAttribute("data-action") === "edit") {
                this.openUserForm(user);
            } else {
                userService.setUserActive(user.id, !user.isActive);
                if (user.isActive) {
                    notifier.showSuccess("User deactivated.");
                } else {
                    notifier.showSuccess("User activated.");
                }
                this.refreshTable();
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    openUserForm(userToEdit) {
        const page = this;
        const isEditing = userToEdit !== null;

        let passwordLabel = "Password (minimum 8 characters)";
        if (isEditing) {
            passwordLabel = "New Password (leave blank to keep the old one)";
        }

        const fields = [
            { name: "fullName", label: "Full Name", type: "text", isRequired: true, isFullWidth: true },
            { name: "username", label: "Username", type: "text", isRequired: true, isReadOnly: isEditing, validate: validator.checkUsername },
            { name: "role", label: "Role", type: "select", options: formBuilder.createOptionsFromTexts(userService.validRoles) },
            { name: "password", label: passwordLabel, type: "password", isRequired: !isEditing, isFullWidth: true }
        ];

        let existingValues = {};
        let dialogTitle = "Add User";
        if (isEditing) {
            existingValues = userToEdit;
            dialogTitle = "Edit User";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            onSave: function () {
                const formValues = formBuilder.readFormValues(fields);

                if (isEditing) {
                    formValues.id = userToEdit.id;
                    userService.updateUser(formValues);
                    notifier.showSuccess("User updated successfully.");
                } else {
                    userService.addUser(formValues);
                    notifier.showSuccess("User created successfully.");
                }
                page.refreshTable();
            }
        });
        dialog.open();
    }
}

const usersPage = new UsersPage();
usersPage.start();
