/*
 * app.js - the patient portal screen. It only talks to api/account.php.
 */
const accountApi = "api/account.php?action=";

// Sends one request and returns the reply. Throws an Error with the server's message on failure.
async function callAccountApi(action, body) {
    const options = { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json" } };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(accountApi + action, options);
    let reply = {};
    try {
        reply = await response.json();
    } catch (error) {
        throw new Error("The server did not answer. Check that Apache and MySQL are running in XAMPP.");
    }
    if (!response.ok || reply.success === false) {
        throw new Error(reply.message || "Something went wrong. Please try again.");
    }
    return reply;
}

function showGuestOrMember(account) {
    const guestArea = document.getElementById("guestArea");
    const memberArea = document.getElementById("memberArea");

    if (account === null) {
        guestArea.classList.remove("hidden");
        memberArea.classList.add("hidden");
        return;
    }
    guestArea.classList.add("hidden");
    memberArea.classList.remove("hidden");
    // textContent, not innerHTML, so a name can never run as code.
    document.getElementById("welcomeText").textContent = "Welcome, " + account.fullName;
}

function showMessage(elementId, text) {
    document.getElementById(elementId).textContent = text;
}

async function handleRegister() {
    showMessage("registerError", "");
    const body = {
        fullName: document.getElementById("regFullName").value.trim(),
        birthDate: document.getElementById("regBirthDate").value,
        contactNumber: document.getElementById("regContact").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        username: document.getElementById("regUsername").value.trim(),
        password: document.getElementById("regPassword").value
    };
    try {
        const reply = await callAccountApi("register", body);
        showGuestOrMember(reply.account);
    } catch (error) {
        showMessage("registerError", error.message);
    }
}

async function handleLogin() {
    showMessage("loginError", "");
    const body = {
        username: document.getElementById("loginUsername").value.trim(),
        password: document.getElementById("loginPassword").value
    };
    if (body.username === "" || body.password === "") {
        showMessage("loginError", "Please enter your username and password.");
        return;
    }
    try {
        const reply = await callAccountApi("login", body);
        document.getElementById("loginPassword").value = "";
        showGuestOrMember(reply.account);
    } catch (error) {
        document.getElementById("loginPassword").value = "";
        showMessage("loginError", error.message);
    }
}

async function handleLogout() {
    await callAccountApi("logout", {});
    showGuestOrMember(null);
}

// Runs when the page opens: shows the member area if the patient is already logged in.
async function checkExistingLogin() {
    try {
        const reply = await callAccountApi("me");
        showGuestOrMember(reply.loggedIn ? reply.account : null);
    } catch (error) {
        showMessage("toast", error.message);
        showGuestOrMember(null);
    }
}

document.getElementById("registerButton").addEventListener("click", handleRegister);
document.getElementById("loginButton").addEventListener("click", handleLogin);
document.getElementById("logoutButton").addEventListener("click", handleLogout);
document.getElementById("loginPassword").addEventListener("keydown", function (event) {
    if (event.key === "Enter") { handleLogin(); }
});

checkExistingLogin();