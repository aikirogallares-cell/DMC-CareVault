/*
 * UserService.js
 * Purpose: Admin-only management of staff and doctor accounts.
 */
class UserService {
    constructor() {
        this.validRoles = ["Admin", "Staff", "Doctor"];
    }

    // Returns users WITHOUT password data, so passwords never reach the screen.
    getAllUsers() {
        permissionService.requirePermission("users.manage");

        const savedUsers = storageService.loadList("users");
        const safeUsers = [];

        for (let i = 0; i < savedUsers.length; i++) {
            safeUsers.push({
                id: savedUsers[i].id,
                username: savedUsers[i].username,
                fullName: savedUsers[i].fullName,
                role: savedUsers[i].role,
                isActive: savedUsers[i].isActive
            });
        }
        return safeUsers;
    }

    // Active doctors are needed to choose a doctor when booking an appointment.
    getActiveDoctors() {
        permissionService.requirePermission("appointments.view");

        const savedUsers = storageService.loadList("users");
        const doctors = [];

        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].role === "Doctor" && savedUsers[i].isActive) {
                doctors.push({ username: savedUsers[i].username, fullName: savedUsers[i].fullName });
            }
        }
        return doctors;
    }

    // Only returns a display name, nothing sensitive.
    getFullNameByUsername(username) {
        const savedUsers = storageService.loadList("users");

        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].username === username) {
                return savedUsers[i].fullName;
            }
        }
        return username;
    }

    countActiveAdmins(savedUsers) {
        let count = 0;
        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].role === "Admin" && savedUsers[i].isActive) {
                count = count + 1;
            }
        }
        return count;
    }

    // formData: { fullName, username, role, password }
    addUser(formData) {
        permissionService.requirePermission("users.manage");

        const savedUsers = storageService.loadList("users");

        let error = validator.checkRequired("Full name", formData.fullName);
        if (error !== "") { throw new Error(error); }

        error = validator.checkUsername(formData.username);
        if (error !== "") { throw new Error(error); }

        if (!this.validRoles.includes(formData.role)) {
            throw new Error("Invalid role selected.");
        }

        error = validator.checkPassword(formData.password);
        if (error !== "") { throw new Error(error); }

        if (authService.findUserByUsername(formData.username) !== null) {
            throw new Error("That username is already taken.");
        }

        const salt = passwordHasher.createSalt();
        const newUser = {
            id: storageService.generateNextId("U", savedUsers),
            username: formData.username,
            fullName: formData.fullName.trim(),
            role: formData.role,
            salt: salt,
            passwordHash: passwordHasher.hashPassword(formData.password, salt),
            isActive: true
        };

        savedUsers.push(newUser);
        storageService.saveList("users", savedUsers);
        auditLogService.recordAction("User created", newUser.username + " (" + newUser.role + ")");
    }

    // formData: { id, fullName, role, password } - password may be empty (keep old one).
    updateUser(formData) {
        permissionService.requirePermission("users.manage");

        const currentUser = authService.getCurrentUser();
        const savedUsers = storageService.loadList("users");
        let userToEdit = null;

        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].id === formData.id) {
                userToEdit = savedUsers[i];
            }
        }
        if (userToEdit === null) {
            throw new Error("User not found.");
        }

        const error = validator.checkRequired("Full name", formData.fullName);
        if (error !== "") { throw new Error(error); }

        if (!this.validRoles.includes(formData.role)) {
            throw new Error("Invalid role selected.");
        }

        // Nobody may change their own role (prevents promoting yourself).
        if (userToEdit.id === currentUser.id && formData.role !== userToEdit.role) {
            throw new Error("You cannot change your own role.");
        }

        // The clinic must always keep at least one active Admin.
        const demotingAdmin = userToEdit.role === "Admin" && formData.role !== "Admin";
        if (demotingAdmin && this.countActiveAdmins(savedUsers) < 2) {
            throw new Error("At least one active Admin account is required.");
        }

        userToEdit.fullName = formData.fullName.trim();
        userToEdit.role = formData.role;

        if (formData.password !== "") {
            const passwordError = validator.checkPassword(formData.password);
            if (passwordError !== "") { throw new Error(passwordError); }
            userToEdit.passwordHash = passwordHasher.hashPassword(formData.password, userToEdit.salt);
        }

        storageService.saveList("users", savedUsers);
        auditLogService.recordAction("User updated", userToEdit.username + " (" + userToEdit.role + ")");
    }

    setUserActive(userId, shouldBeActive) {
        permissionService.requirePermission("users.manage");

        const currentUser = authService.getCurrentUser();
        const savedUsers = storageService.loadList("users");
        let userToChange = null;

        for (let i = 0; i < savedUsers.length; i++) {
            if (savedUsers[i].id === userId) {
                userToChange = savedUsers[i];
            }
        }
        if (userToChange === null) {
            throw new Error("User not found.");
        }

        if (userToChange.id === currentUser.id) {
            throw new Error("You cannot deactivate your own account.");
        }

        if (!shouldBeActive && userToChange.role === "Admin" && this.countActiveAdmins(savedUsers) < 2) {
            throw new Error("At least one active Admin account is required.");
        }

        userToChange.isActive = shouldBeActive;
        storageService.saveList("users", savedUsers);

        if (shouldBeActive) {
            auditLogService.recordAction("User activated", userToChange.username);
        } else {
            auditLogService.recordAction("User deactivated", userToChange.username);
        }
    }
}

const userService = new UserService();
