/*
 * LoginPage.js
 * Purpose: controls index.html (the login screen).
 * It only handles the screen. The real login checking is done by AuthService.
 */
class LoginPage {
    start() {
        // If the user is already logged in, skip the login screen.
        const currentUser = authService.getCurrentUser();
        if (currentUser !== null) {
            window.location.replace("pages/" + authService.getDashboardFileName(currentUser.role));
            return;
        }

        this.showFlashMessageIfAny();
        this.connectButtons();
    }

    // After logout, the system leaves a one-time message such as "Logged out successfully."
    showFlashMessageIfAny() {
        const flashMessage = sessionStorage.getItem("dmcv2_flashMessage");

        if (flashMessage !== null) {
            sessionStorage.removeItem("dmcv2_flashMessage");
            notifier.showSuccess(flashMessage);
        }
    }

    connectButtons() {
        const page = this;

        document.getElementById("loginButton").addEventListener("click", function () {
            page.handleLoginClick();
        });

        document.getElementById("togglePasswordButton").addEventListener("click", function () {
            page.togglePasswordVisibility();
        });

        // Pressing Enter inside a text box also logs in.
        const usernameBox = document.getElementById("usernameInput");
        const passwordBox = document.getElementById("passwordInput");
        usernameBox.addEventListener("keydown", function (event) {
            if (event.key === "Enter") { page.handleLoginClick(); }
        });
        passwordBox.addEventListener("keydown", function (event) {
            if (event.key === "Enter") { page.handleLoginClick(); }
        });
    }

    togglePasswordVisibility() {
        const passwordBox = document.getElementById("passwordInput");
        const toggleButton = document.getElementById("togglePasswordButton");

        if (passwordBox.type === "password") {
            passwordBox.type = "text";
            toggleButton.textContent = "Hide";
        } else {
            passwordBox.type = "password";
            toggleButton.textContent = "Show";
        }
    }

    handleLoginClick() {
        const username = document.getElementById("usernameInput").value.trim();
        const password = document.getElementById("passwordInput").value;
        const errorElement = document.getElementById("loginError");

        const result = authService.login(username, password);

        if (result.success === false) {
            errorElement.textContent = result.message;
            document.getElementById("passwordInput").value = "";
            return;
        }

        // Login worked: send the user to the dashboard that matches their role.
        window.location.href = "pages/" + authService.getDashboardFileName(result.user.role);
    }
}

const loginPage = new LoginPage();
loginPage.start();
