/*
 * PageLayout.js
 * Purpose: the frame shared by every page after login: sidebar, top header and the access check.
 * For DOCTORS it also:
 *   - shows a pop-up when a patient is sent to the doctor (status "In Consultation"),
 *   - keeps a bar at the top of the page naming the patient(s) in consultation,
 *   - opens the full patient record (from the pop-up, the bar, or a record button).
 *
 * Usage inside a page:
 *   const layout = new PageLayout("patients");
 *   layout.show(function (mainElement, currentUser) { ...fill mainElement... });
 */
class PageLayout {
    constructor(pageId) {
        this.pageId = pageId;
    }

    show(contentBuilder) {
        // 1. Nobody logged in -> go to the login page.
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            window.location.replace("../index.html");
            return;
        }

        const settings = settingsService.getSettings();
        const pageInfo = pageRegistry.findPageById(this.pageId);

        // 2. Draw the sidebar and header.
        document.getElementById("app").innerHTML = this.buildLayoutHtml(currentUser, settings);
        this.connectLayoutButtons();

        const mainElement = document.getElementById("main");

        // 3. Page-level permission check (stops people who type a page address manually).
        if (pageInfo === null || !this.userMayOpenPage(pageInfo)) {
            mainElement.innerHTML = this.buildAccessDeniedHtml(currentUser);
            auditLogService.recordAction("Access denied", "Tried to open page: " + this.pageId);
            return;
        }

        document.title = pageInfo.title + " - DMC CareVault";
        contentBuilder(mainElement, currentUser);

        // 4. Doctors: watch for the patient in consultation.
        if (currentUser.role === "Doctor") {
            this.startDoctorPatientAlert(currentUser);
        }
    }

    userMayOpenPage(pageInfo) {
        if (pageInfo.permission === null) {
            return true;
        }
        return permissionService.userCan(pageInfo.permission);
    }

    buildLayoutHtml(currentUser, settings) {
        let html = '<div class="layout">';
        html += '<aside class="sidebar" id="sidebar">';
        html += '<div class="brand">✚ ' + htmlHelper.escapeText(settings.systemName) + "</div>";
        html += this.buildMenuHtml();
        html += '<hr><a href="#" id="logoutLink"><i>⎋</i>Logout</a>';
        html += "</aside>";

        html += '<div class="main-wrap">';
        html += '<header class="topbar">';
        html += '<button class="burger" id="menuButton">☰</button>';
        html += '<div class="t"><b>' + htmlHelper.escapeText(settings.systemName) + "</b>";
        html += "<small>" + htmlHelper.escapeText(settings.clinicName) + "</small></div>";
        html += '<div class="sp"></div>';
        html += this.buildBellHtml();
        html += '<div class="user">' + htmlHelper.escapeText(currentUser.fullName);
        html += "<br><small>" + currentUser.role + "</small></div>";
        html += "</header>";
        html += '<main id="main"></main>';
        html += "</div></div>";
        html += '<div id="toasts"></div>';
        return html;
    }

    // Shows only the menu items the current user is allowed to open.
    buildMenuHtml() {
        const allPages = pageRegistry.getAllPages();
        let html = "";

        for (let i = 0; i < allPages.length; i++) {
            const page = allPages[i];

            if (!this.userMayOpenPage(page)) {
                continue;
            }

            let activeClass = "";
            if (page.id === this.pageId) {
                activeClass = "on";
            }

            html += '<a href="' + page.fileName + '" class="' + activeClass + '">';
            html += "<i>" + page.icon + "</i>" + page.title + "</a>";
        }
        return html;
    }

    // The bell shows how many patients are waiting in the queue today.
    getWaitingCount() {
        if (!permissionService.userCan("appointments.view")) {
            return 0;
        }
        const todayAppointments = appointmentService.getTodayAppointments();
        return appointmentService.countByStatus(todayAppointments, "Waiting");
    }

    buildBellHtml() {
        const waitingCount = this.getWaitingCount();
        let badgeHtml = "";
        if (waitingCount > 0) {
            badgeHtml = "<em>" + waitingCount + "</em>";
        }
        return '<button class="bell" id="bellButton" title="Notifications">🔔' + badgeHtml + "</button>";
    }

    buildAccessDeniedHtml(currentUser) {
        let html = '<div class="denied"><h2>Access Denied</h2>';
        html += "<p>You do not have permission to access this page.</p>";
        html += '<a class="btn" href="' + authService.getDashboardFileName(currentUser.role) + '">Back to my dashboard</a></div>';
        return html;
    }

    connectLayoutButtons() {
        const waitingCount = this.getWaitingCount();

        document.getElementById("menuButton").addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("open");
        });

        document.getElementById("bellButton").addEventListener("click", function () {
            if (waitingCount > 0) {
                notifier.showWarning(waitingCount + " patient(s) waiting in the queue.");
            } else {
                notifier.showSuccess("No new notifications.");
            }
        });

        document.getElementById("logoutLink").addEventListener("click", function (event) {
            event.preventDefault();
            authService.logout();
            window.location.href = "../index.html";
        });
    }

    // ============ Doctor: patient in consultation ============

    startDoctorPatientAlert(currentUser) {
        const layout = this;
        this.checkDoctorPatientAlert(currentUser);

        // Checks every 4 seconds. It reads the saved data directly (not through the services),
        // so this background check does not reset the idle-logout timer.
        window.setInterval(function () {
            layout.checkDoctorPatientAlert(currentUser);
        }, 4000);
    }

    checkDoctorPatientAlert(currentUser) {
        const inConsultation = this.getDoctorPatientsInConsultation(currentUser.username);
        this.updateCurrentPatientBar(inConsultation);

        // Do not cover a dialog the doctor is already using. The pop-up appears after it is closed.
        if (inConsultation.length === 0 || document.querySelector(".modal-bg") !== null) {
            return;
        }

        const seenKeys = this.loadSeenConsultationKeys(currentUser.username);
        for (let i = 0; i < inConsultation.length; i++) {
            const key = this.buildConsultationKey(inConsultation[i]);
            if (seenKeys.includes(key) === false) {
                this.markConsultationKeySeen(currentUser.username, key);
                this.showNewPatientPopup(inConsultation[i]);
                return;
            }
        }
    }

    // Returns today's appointments of this doctor with status "In Consultation", each with its patient.
    getDoctorPatientsInConsultation(doctorUsername) {
        const today = dateHelper.getTodayString();
        const appointments = storageService.loadList("appointments");
        const patients = storageService.loadList("patients");
        const result = [];

        for (let i = 0; i < appointments.length; i++) {
            const appointment = appointments[i];
            const isMatch = appointment.doctorUsername === doctorUsername &&
                appointment.date === today &&
                appointment.status === "In Consultation";

            if (isMatch) {
                result.push({
                    appointment: appointment,
                    patient: this.findPatientInList(patients, appointment.patientId)
                });
            }
        }

        // The patient who started earliest comes first.
        result.sort(function (first, second) {
            return String(first.appointment.startedAt || "").localeCompare(String(second.appointment.startedAt || ""));
        });
        return result;
    }

    findPatientInList(patientList, patientId) {
        for (let i = 0; i < patientList.length; i++) {
            if (patientList[i].id === patientId) {
                return patientList[i];
            }
        }
        return null;
    }

    // Each time a patient starts a consultation gets its own key, so the pop-up shows again
    // if the same patient is sent to the doctor later.
    buildConsultationKey(item) {
        return item.appointment.id + "|" + item.appointment.startedAt;
    }

    // Keys are kept per doctor and per browser tab (sessionStorage).
    loadSeenConsultationKeys(username) {
        const savedText = sessionStorage.getItem("dmcv2_seenConsultations_" + username);
        if (savedText === null) {
            return [];
        }
        try {
            return JSON.parse(savedText);
        } catch (error) {
            return [];
        }
    }

    markConsultationKeySeen(username, key) {
        const keys = this.loadSeenConsultationKeys(username);
        keys.push(key);
        sessionStorage.setItem("dmcv2_seenConsultations_" + username, JSON.stringify(keys));
    }

    // The bar at the top of the page lists every patient in consultation today.
    updateCurrentPatientBar(inConsultation) {
        let bar = document.getElementById("currentPatientBar");

        if (inConsultation.length === 0) {
            if (bar !== null) {
                bar.remove();
            }
            return;
        }

        if (bar === null) {
            const main = document.getElementById("main");
            main.insertAdjacentHTML("afterbegin", '<div id="currentPatientBar" class="current-bar"></div>');
            bar = document.getElementById("currentPatientBar");

            const layout = this;
            bar.addEventListener("click", function (event) {
                const button = event.target.closest("button[data-view-patient]");
                if (button !== null) {
                    layout.openPatientRecord(button.getAttribute("data-view-patient"));
                }
            });
        }

        // Rewrite the bar only when something changed, so its buttons are not redrawn every few seconds.
        const newHtml = this.buildCurrentPatientBarHtml(inConsultation);
        if (bar.lastHtml !== newHtml) {
            bar.innerHTML = newHtml;
            bar.lastHtml = newHtml;
        }
    }

    buildCurrentPatientBarHtml(inConsultation) {
        const safe = htmlHelper.escapeText;
        let html = "";

        for (let i = 0; i < inConsultation.length; i++) {
            const appointment = inConsultation[i].appointment;
            const patient = inConsultation[i].patient;
            const name = patient === null ? "Unknown patient" : htmlHelper.getFullName(patient);
            const allergyText = this.getAllergyText(patient);

            html += '<div class="current-bar-row">';
            html += "<span>In consultation:</span> <b>" + safe(name) + "</b>";
            html += " <small>(" + safe(appointment.patientId) + ")</small>";
            html += " <span>" + safe(appointment.reason) + "</span>";
            if (allergyText !== "") {
                html += ' <span class="warn-text">Allergy: ' + safe(allergyText) + "</span>";
            }
            html += ' <button class="btn sm" data-view-patient="' + safe(appointment.patientId) + '">View record</button>';
            html += "</div>";
        }
        return html;
    }

    // Returns the allergy text, or an empty text when there is no real allergy.
    getAllergyText(patient) {
        if (patient === null || !patient.allergies) {
            return "";
        }
        const text = String(patient.allergies).trim();
        if (text === "" || text.toLowerCase() === "none") {
            return "";
        }
        return text;
    }

    // Pop-up for a patient who has just been sent to the doctor.
    showNewPatientPopup(item) {
        const layout = this;
        const appointment = item.appointment;
        const patientId = appointment.patientId;

        let bodyHtml = '<p class="popup-lead">This patient was just sent to you for consultation.</p>';
        bodyHtml += this.buildPatientSummaryHtml(item.patient, appointment);
        bodyHtml += '<div class="popup-actions">';
        bodyHtml += '<button class="btn ghost" id="popupRecordButton">View Full Record</button>';
        bodyHtml += '<button class="btn" id="popupConsultButton">Start Consultation</button>';
        bodyHtml += "</div>";

        const dialog = new ModalDialog("Patient in Consultation", bodyHtml, { isWide: true });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector("#popupRecordButton").addEventListener("click", function () {
            dialog.close();
            layout.openPatientRecord(patientId);
        });
        dialogElement.querySelector("#popupConsultButton").addEventListener("click", function () {
            window.location.href = "consultations.html?new=1&patient=" + encodeURIComponent(patientId);
        });
    }

    buildPatientSummaryHtml(patient, appointment) {
        if (patient === null) {
            return '<div class="empty">Patient record not found (' + htmlHelper.escapeText(appointment.patientId) + ").</div>";
        }

        return this.buildKeyValueHtml([
            ["Patient ID", patient.id],
            ["Full Name", htmlHelper.getFullName(patient)],
            ["Age / Sex", dateHelper.getAgeText(patient.birthDate) + " / " + patient.gender],
            ["Blood Type", patient.bloodType],
            ["Allergies", patient.allergies, true],
            ["Medical Conditions", patient.medicalConditions],
            ["Current Medications", patient.currentMedications],
            ["Reason", appointment.reason],
            ["Queue Number", appointment.queueNumber],
            ["In Consultation Since", dateHelper.formatTime(appointment.startedAt)]
        ]);
    }

    // rows: [ [label, value] ] or [ [label, value, true] ] to highlight a real allergy in red.
    buildKeyValueHtml(rows) {
        let html = '<dl class="kv">';

        for (let i = 0; i < rows.length; i++) {
            const label = rows[i][0];
            let value = rows[i][1];
            const isWarningRow = rows[i][2] === true;

            if (value === undefined || value === null || String(value).trim() === "") {
                value = "-";
            }

            let warningClass = "";
            if (isWarningRow && this.isRealAllergy(value)) {
                warningClass = ' class="warn"';
            }
            html += "<dt>" + htmlHelper.escapeText(label) + "</dt><dd" + warningClass + ">" + htmlHelper.escapeText(value) + "</dd>";
        }

        html += "</dl>";
        return html;
    }

    isRealAllergy(value) {
        const text = String(value).trim().toLowerCase();
        return text !== "" && text !== "-" && text !== "none";
    }

    
    openPatientRecord(patientId) {
        const patient = patientService.getPatientById(patientId);
        if (patient === null) {
            notifier.showError("Patient record not found.");
            return;
        }

        const title = "Patient Record - " + htmlHelper.getFullName(patient);
        let bodyHtml = this.buildPatientRecordHtml(patient);

        // Only users who may write consultations (doctors) see the button.
        if (permissionService.userCan("consultations.write")) {
            bodyHtml += '<div class="record-footer"><button class="btn" id="recordStartConsultationButton">Start Consultation</button></div>';
        }

        const dialog = new ModalDialog(title, bodyHtml, { isWide: true });
        dialog.open();

        const startButton = dialog.getElement().querySelector("#recordStartConsultationButton");
        if (startButton !== null) {
            startButton.addEventListener("click", function () {
                window.location.href = "consultations.html?new=1&patient=" + encodeURIComponent(patient.id);
            });
        }
    }

    buildPatientRecordHtml(patient) {
        const safe = htmlHelper.escapeText;
        const consultations = consultationService.getHistoryForPatient(patient.id).slice(0, 5);
        const prescriptions = prescriptionService.getPrescriptionsForPatient(patient.id).slice(0, 5);

        let html = '<div class="record-section"><h4>Personal Information</h4>';
        html += this.buildKeyValueHtml([
            ["Patient ID", patient.id],
            ["Full Name", htmlHelper.getFullName(patient)],
            ["Date of Birth", patient.birthDate],
            ["Age", dateHelper.getAgeText(patient.birthDate)],
            ["Gender", patient.gender],
            ["Civil Status", patient.civilStatus],
            ["Blood Type", patient.bloodType],
            ["Registered", patient.dateRegistered],
            ["Last Visit", patient.lastVisit]
        ]);
        html += "</div>";

        html += '<div class="record-section"><h4>Contact and Address</h4>';
        html += this.buildKeyValueHtml([
            ["Contact Number", patient.contactNumber],
            ["Address", patient.address]
        ]);
        html += "</div>";

        html += '<div class="record-section"><h4>Emergency Contact</h4>';
        html += this.buildKeyValueHtml([
            ["Name", patient.emergencyName],
            ["Relationship", patient.emergencyRelationship],
            ["Contact Number", patient.emergencyContactNumber]
        ]);
        html += "</div>";

        html += '<div class="record-section"><h4>Medical Information</h4>';
        html += this.buildKeyValueHtml([
            ["Allergies", patient.allergies, true],
            ["Medical Conditions", patient.medicalConditions],
            ["Current Medications", patient.currentMedications]
        ]);
        html += "</div>";

        html += '<div class="record-section"><h4>Recent Consultations</h4>';
        html += tableBuilder.buildTableHtml([
            { title: "Date", getCellHtml: function (item) { return safe(item.date); } },
            { title: "Doctor", getCellHtml: function (item) { return safe(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Diagnosis", getCellHtml: function (item) { return safe(item.diagnosis); } },
            { title: "Treatment", getCellHtml: function (item) { return safe(item.treatment); } }
        ], consultations, "No consultations yet.");
        html += "</div>";

        html += '<div class="record-section"><h4>Recent Prescriptions</h4>';
        html += tableBuilder.buildTableHtml([
            { title: "Date", getCellHtml: function (item) { return safe(item.date); } },
            { title: "Doctor", getCellHtml: function (item) { return safe(userService.getFullNameByUsername(item.doctorUsername)); } },
            { title: "Medicines", getCellHtml: function (item) {
                const names = [];
                for (let i = 0; i < item.medicines.length; i++) {
                    names.push(item.medicines[i].name);
                }
                return safe(names.join(", "));
            } }
        ], prescriptions, "No prescriptions yet.");
        html += "</div>";

        return html;
    }
}