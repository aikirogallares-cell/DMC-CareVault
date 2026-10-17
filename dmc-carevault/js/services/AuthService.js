/*
 * AuthService.js
 * Purpose: login, logout and session handling. This is the ONLY file with login logic,
 * so all dashboards share it (no duplicated login code).
 *
 * PROTOTYPE NOTE: The password check happens in the browser.
 * In a real system, login() would send the username and password to a server,
 * and the server would check them against the database and return a secure session.
 */
class AuthService {
    constructor() {
        this.sessionKey = "dmcv2_session";
        this.maximumFailedAttempts = 5;
        this.lockoutSeconds = 30;
    }

    // ----- Login -----

    // Returns an object: { success: true, user: ... } or { success: false, message: "..." }
    login(username, password) {
        if (this.isLockedOut()) {
            const secondsLeft = this.getLockoutSecondsLeft();
            return { success: false, message: "Too many failed attempts. Try again in " + secondsLeft + " seconds." };
        }

        if (username === "" || password === "") {
            return { success: false, message: "Please enter your username and password." };
        }

        const user = this.findUserByUsername(username);

        // The same message is used for "no such user" and "wrong password"
        // so a stranger cannot find out which usernames exist.
        if (user === null || !passwordHasher.isPasswordCorrect(password, user.salt, user.passwordHash)) {
            this.registerFailedAttempt();
            auditLogService.addEntry(username, "unknown", "Login failed", "Wrong username or password");
            return { success: false, message: "Invalid username or password." };
        }

        if (user.isActive === false) {
            return { success: false, message: "This account is deactivated. Please contact the administrator." };
        }

        this.resetFailedAttempts();
        this.startSession(user);
        auditLogService.addEntry(user.username, user.role, "Login", "Signed in");

        return { success: true, user: user };
    }

    findUserByUsername(username) {
        const users = storageService.loadList("users");

        for (let i = 0; i < users.length; i++) {
            if (users[i].username.toLowerCase() === username.toLowerCase()) {
                return users[i];
            }
        }
        return null;
    }

    // ----- Failed-attempt lockout -----

    isLockedOut() {
        const lockInfo = storageService.loadObject("loginLock", { failedAttempts: 0, lockedUntil: 0 });
        return Date.now() < lockInfo.lockedUntil;
    }

    getLockoutSecondsLeft() {
        const lockInfo = storageService.loadObject("loginLock", { failedAttempts: 0, lockedUntil: 0 });
        return Math.ceil((lockInfo.lockedUntil - Date.now()) / 1000);
    }

    registerFailedAttempt() {
        const lockInfo = storageService.loadObject("loginLock", { failedAttempts: 0, lockedUntil: 0 });
        lockInfo.failedAttempts = lockInfo.failedAttempts + 1;

        if (lockInfo.failedAttempts >= this.maximumFailedAttempts) {
            lockInfo.lockedUntil = Date.now() + this.lockoutSeconds * 1000;
            lockInfo.failedAttempts = 0;
        }

        storageService.saveObject("loginLock", lockInfo);
    }

    resetFailedAttempts() {
        storageService.saveObject("loginLock", { failedAttempts: 0, lockedUntil: 0 });
    }

    // ----- Session -----

    // Only the username and last activity time are stored in the session.
    // The role is always read again from the saved users, so a changed role
    // or a deactivated account takes effect immediately.
    startSession(user) {
        const session = { username: user.username, lastActivity: Date.now() };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    // Returns { id, username, fullName, role } or null if nobody is logged in.
    getCurrentUser() {
        const sessionText = sessionStorage.getItem(this.sessionKey);
        if (sessionText === null) {
            return null;
        }

        const session = JSON.parse(sessionText);

        // Automatic logout after being idle too long.
        const settings = storageService.loadObject("settings", { sessionTimeoutMinutes: 15 });
        const idleLimit = settings.sessionTimeoutMinutes * 60 * 1000;
        if (Date.now() - session.lastActivity > idleLimit) {
            this.clearSession();
            return null;
        }

        const user = this.findUserByUsername(session.username);
        if (user === null || user.isActive === false) {
            this.clearSession();
            return null;
        }

        // Activity happened, so restart the idle timer.
        session.lastActivity = Date.now();
        sessionStorage.setItem(this.sessionKey, JSON.stringify(session));

        return { id: user.id, username: user.username, fullName: user.fullName, role: user.role };
    }

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    clearSession() {
        sessionStorage.removeItem(this.sessionKey);
    }

    logout() {
        const currentUser = this.getCurrentUser();

        if (currentUser !== null) {
            auditLogService.addEntry(currentUser.username, currentUser.role, "Logout", "Signed out");
        }

        this.clearSession();
        // The login page shows this message once.
        sessionStorage.setItem("dmcv2_flashMessage", "Logged out successfully.");
    }

    // Which dashboard file belongs to each role.
    getDashboardFileName(role) {
        if (role === "Admin") {
            return "admin-dashboard.html";
        }
        if (role === "Staff") {
            return "staff-dashboard.html";
        }
        return "doctor-dashboard.html";
    }
}

const authService = new AuthService();
