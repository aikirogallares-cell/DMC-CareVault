/*
 * PageLayout.js
 * Purpose: the frame shared by every page after login: sidebar, top header and the access check.
 *
 * It also runs the live alerts:
 *   - Doctor: the "Ready to accept patient" button in the top bar.
 *   - Staff and admin: a "Doctor Ready for a Patient" pop-up and a green bar listing the ready doctors.
 *   - Doctor: a pop-up and a yellow bar when a patient is in consultation.
 *   - Staff and admin: a "Consultation Finished" pop-up when a doctor finishes a consultation.
 *   - Staff and admin: the bell lists every finished consultation that is not paid yet,
 *     with a button that opens that patient's bill directly in Billing.
 *
 * Usage inside a page:
 *   const layout = new PageLayout("patients");
 *   layout.show(function (mainElement, currentUser) { ...fill mainElement... });
 */
class PageLayout {
    constructor(pageId) {
        this.pageId = pageId;
        // True for staff and admin: the bell opens a notification list instead of a short message.
        this.hasBellPanel = false;
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
        this.hasBellPanel = permissionService.userCan("billing.view");

        // 2. Draw the sidebar and header.
        document.getElementById("app").innerHTML = this.buildLayoutHtml(currentUser, settings);
        this.connectLayoutButtons();

        const mainElement = document.getElementById("main");

        // 3. Page-level permission check.
        if (pageInfo === null || !this.userMayOpenPage(pageInfo)) {
            mainElement.innerHTML = this.buildAccessDeniedHtml(currentUser);
            auditLogService.recordAction("Access denied", "Tried to open page: " + this.pageId);
            return;
        }

        document.title = pageInfo.title + " - DMC CareVault";

        // If the page content fails, the error goes to the Console and the alerts still start.
        try {
            contentBuilder(mainElement, currentUser);
        } catch (error) {
            console.error("[page] could not draw this page:", error);
            mainElement.innerHTML = '<div class="err">This page could not be drawn. Press F12 and send the red error to the developer.</div>';
        }

        // 4. Start the live alerts. Each one starts on its own, so a problem in one cannot stop the others.
        const layout = this;
        if (currentUser.role === "Doctor") {
            this.safeStart("patient-in-consultation alert", function () {
                layout.startDoctorPatientAlert(currentUser);
            });
        } else {
            this.safeStart("finished-visit alert", function () {
                layout.startDoneAlert(currentUser);
            });
            this.safeStart("ready-doctor alert", function () {
                layout.startReadyDoctorWatch(currentUser);
            });
        }
    }

    // Starts one alert and writes any error to the Console instead of stopping the page.
    safeStart(alertName, startFunction) {
        try {
            startFunction();
        } catch (error) {
            console.error("[alerts] could not start the " + alertName + ":", error);
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
        html += this.buildAvailabilityButtonHtml(currentUser);
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

    // Staff and admin: the bell also counts the finished consultations that are not paid yet.
    getBellCount() {
        if (this.hasBellPanel) {
            const data = this.getBellData();
            return data.waitingCount + data.awaitingPayment.length;
        }
        return this.getWaitingCount();
    }

    // Reads the saved data directly (not through the services), so the background refresh
    // does not reset the idle-logout timer.
    // awaitingPayment: today's visits the doctor finished and that have no paid bill yet, oldest first.
    getBellData() {
        const today = dateHelper.getTodayString();
        const appointments = storageService.loadList("appointments");
        const bills = storageService.loadList("bills");

        const paidVisitIds = {};
        for (let i = 0; i < bills.length; i++) {
            if (bills[i].status === "Paid") {
                paidVisitIds[bills[i].queueEntryId] = true;
            }
        }

        let waitingCount = 0;
        const awaitingPayment = [];
        for (let i = 0; i < appointments.length; i++) {
            const entry = appointments[i];
            if (entry.date !== today) {
                continue;
            }
            if (entry.status === "Waiting") {
                waitingCount = waitingCount + 1;
            }
            if (entry.doctorFinishedAt && paidVisitIds[entry.id] !== true) {
                awaitingPayment.push(entry);
            }
        }

        awaitingPayment.sort(function (first, second) {
            return String(first.doctorFinishedAt).localeCompare(String(second.doctorFinishedAt));
        });
        return { waitingCount: waitingCount, awaitingPayment: awaitingPayment };
    }

    buildBellHtml() {
        const count = this.getBellCount();
        let badgeHtml = "";
        if (count > 0) {
            badgeHtml = "<em>" + count + "</em>";
        }

        let html = '<div class="bell-wrap" id="bellWrap">';
        html += '<button class="bell" id="bellButton" title="Notifications">🔔' + badgeHtml + "</button>";
        html += '<div class="bell-panel" id="bellPanel" hidden></div></div>';
        return html;
    }

    // The list under the bell: a finished consultation per row (with a Go to Billing button),
    // then the number of patients waiting in the queue.
    buildBellPanelHtml(data) {
        const safe = htmlHelper.escapeText;
        let html = '<div class="bell-title">Notifications</div>';
        let hasItems = false;

        for (let i = 0; i < data.awaitingPayment.length; i++) {
            const entry = data.awaitingPayment[i];
            const patientName = patientService.getPatientNameById(entry.patientId);
            const doctorName = userService.getFullNameByUsername(entry.doctorUsername);

            html += '<div class="bell-item"><div><b>' + safe(patientName) + "</b> is done consulting";
            html += "<small>" + safe(doctorName) + " finished at " + safe(dateHelper.formatTime(entry.doctorFinishedAt));
            html += " (" + safe(entry.reason) + ")</small></div>";
            html += '<a class="btn sm" href="billing.html?visit=' + encodeURIComponent(entry.id) + '">Go to Billing</a></div>';
            hasItems = true;
        }

        if (data.waitingCount > 0) {
            html += '<div class="bell-item"><div><b>' + data.waitingCount + "</b> patient(s) waiting in the queue</div>";
            html += '<a class="btn sm ghost" href="appointments.html">Queuing</a></div>';
            hasItems = true;
        }

        if (hasItems === false) {
            html += '<div class="empty">No new notifications.</div>';
        }
        return html;
    }

    toggleBellPanel() {
        const panel = document.getElementById("bellPanel");
        if (panel === null) {
            return;
        }

        if (panel.hidden) {
            const html = this.buildBellPanelHtml(this.getBellData());
            panel.innerHTML = html;
            panel.lastHtml = html;
            panel.hidden = false;
        } else {
            panel.hidden = true;
        }
    }

    // Keeps the number on the bell (and the list, when it is open) up to date while the page stays open.
    refreshBell() {
        const button = document.getElementById("bellButton");
        if (button === null || this.hasBellPanel === false) {
            return;
        }

        const data = this.getBellData();
        const count = data.waitingCount + data.awaitingPayment.length;
        let badge = button.querySelector("em");

        if (count === 0) {
            if (badge !== null) {
                badge.remove();
            }
        } else {
            if (badge === null) {
                badge = document.createElement("em");
                button.appendChild(badge);
            }
            badge.textContent = String(count);
        }

        const panel = document.getElementById("bellPanel");
        if (panel !== null && panel.hidden === false) {
            const newHtml = this.buildBellPanelHtml(data);
            if (panel.lastHtml !== newHtml) {
                panel.innerHTML = newHtml;
                panel.lastHtml = newHtml;
            }
        }
    }

    buildAccessDeniedHtml(currentUser) {
        let html = '<div class="denied"><h2>Access Denied</h2>';
        html += "<p>You do not have permission to access this page.</p>";
        html += '<a class="btn" href="' + authService.getDashboardFileName(currentUser.role) + '">Back to my dashboard</a></div>';
        return html;
    }

    connectLayoutButtons() {
        const waitingCount = this.getWaitingCount();
        const layout = this;

        document.getElementById("menuButton").addEventListener("click", function () {
            document.getElementById("sidebar").classList.toggle("open");
        });

        document.getElementById("bellButton").addEventListener("click", function () {
            if (layout.hasBellPanel) {
                layout.toggleBellPanel();
            } else if (waitingCount > 0) {
                notifier.showWarning(waitingCount + " patient(s) waiting in the queue.");
            } else {
                notifier.showSuccess("No new notifications.");
            }
        });

        // Clicking anywhere outside the bell closes the notification list.
        document.addEventListener("click", function (event) {
            const wrap = document.getElementById("bellWrap");
            const panel = document.getElementById("bellPanel");
            if (wrap !== null && panel !== null && !wrap.contains(event.target)) {
                panel.hidden = true;
            }
        });

        this.connectAvailabilityButton();

        document.getElementById("logoutLink").addEventListener("click", function (event) {
            event.preventDefault();
            layout.stopDoctorReadyOnLogout();
            authService.logout();
            window.location.href = "../index.html";
        });
    }

    // ============ Doctor: patient in consultation (pop-up and yellow bar) ============

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
                const viewButton = event.target.closest("button[data-view-patient]");
                if (viewButton !== null) {
                    layout.openPatientRecord(viewButton.getAttribute("data-view-patient"));
                    return;
                }
                const doneButton = event.target.closest("button[data-done-patient]");
                if (doneButton !== null) {
                    layout.doctorFinishesPatient(doneButton.getAttribute("data-done-patient"));
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
            html += ' <button class="btn sm ghost" data-done-patient="' + safe(appointment.patientId) + '">Done consulting</button>';
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

        const rows = [
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
        ];
        rows.push(...this.buildVitalsRows(appointment.vitals));

        return this.buildKeyValueHtml(rows);
    }

    // Vital signs that staff recorded before the patient was sent to the doctor.
    buildVitalsRows(vitals) {
        if (!vitals) {
            return [["Vital Signs", "Not recorded by staff"]];
        }
        return [
            ["Blood Pressure (mmHg)", vitals.bloodPressure],
            ["Heart Rate (bpm)", vitals.heartRate],
            ["Temperature (°C)", vitals.temperature],
            ["Respiratory Rate", vitals.respiratoryRate],
            ["Weight (kg)", vitals.weight],
            ["Height (cm)", vitals.height]
        ];
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

    // Full record of one patient, with a button to start a consultation with this patient.
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

    // ============ Staff and Admin: a doctor finished a consultation ============

        startDoneAlert(currentUser) {
        const layout = this;
        this.checkDoneAlertSafely(currentUser);

        // Checks every 2 seconds, and at once when another tab saves the queue (storage event).
        window.setInterval(function () {
            layout.checkDoneAlertSafely(currentUser);
        }, 2000);

        // "bills" is watched too, so the bell clears when a payment is made in another tab.
        window.addEventListener("storage", function (event) {
            const isWatched = event.key === storageService.keyPrefix + "appointments" ||
                event.key === storageService.keyPrefix + "bills";
            if (isWatched) {
                layout.checkDoneAlertSafely(currentUser);
            }
        });
    }

    checkDoneAlertSafely(currentUser) {
        try {
            this.checkDoneAlert(currentUser);
        } catch (error) {
            console.error("[done-alert] check failed:", error);
        }
    }

    checkDoneAlert(currentUser) {
        this.refreshBell();

        const seenStorageName = "dmcv2_seenDoctorDone_" + currentUser.username;
        const readyFlagName = "dmcv2_doneAlertReady_" + currentUser.username;
        const finishedList = this.getFinishedVisitsToday();

        // The first time this tab opens, visits that already finished are marked as seen.
        // So the pop-up only appears for consultations that finish while this page is open.
        if (sessionStorage.getItem(readyFlagName) === null) {
            const existingKeys = [];
            for (let i = 0; i < finishedList.length; i++) {
                existingKeys.push(this.buildDoneKey(finishedList[i]));
            }
            sessionStorage.setItem(seenStorageName, JSON.stringify(existingKeys));
            sessionStorage.setItem(readyFlagName, "1");
            return;
        }

        // Do not cover a dialog the user is already using.
        if (document.querySelector(".modal-bg") !== null) {
            return;
        }

        const seenKeys = this.loadSeenKeys(seenStorageName);
        for (let i = 0; i < finishedList.length; i++) {
            const key = this.buildDoneKey(finishedList[i]);
            if (seenKeys.includes(key) === false) {
                this.markKeySeen(seenStorageName, key);
                this.showDoneVisitPopup(finishedList[i]);
                return;
            }
        }
    }

    // Today's queue entries that the doctor has finished, oldest first.
    getFinishedVisitsToday() {
        const today = dateHelper.getTodayString();
        const appointments = storageService.loadList("appointments");
        const result = [];

        for (let i = 0; i < appointments.length; i++) {
            if (appointments[i].date === today && appointments[i].doctorFinishedAt) {
                result.push(appointments[i]);
            }
        }

        result.sort(function (first, second) {
            return String(first.doctorFinishedAt).localeCompare(String(second.doctorFinishedAt));
        });
        return result;
    }

    buildDoneKey(entry) {
        return entry.id + "|" + entry.doctorFinishedAt;
    }

    countPrescriptionsToday(patientId) {
        const today = dateHelper.getTodayString();
        const prescriptions = storageService.loadList("prescriptions");
        let count = 0;

        for (let i = 0; i < prescriptions.length; i++) {
            if (prescriptions[i].patientId === patientId && prescriptions[i].date === today) {
                count = count + 1;
            }
        }
        return count;
    }

    showDoneVisitPopup(entry) {
        const doctorName = userService.getFullNameByUsername(entry.doctorUsername);
        const patientName = patientService.getPatientNameById(entry.patientId);

        let bodyHtml = '<p class="popup-lead"><b>' + htmlHelper.escapeText(doctorName) +
            "</b> is done consulting the patient. The bill is ready in Billing.</p>";
        bodyHtml += this.buildKeyValueHtml([
            ["Patient", patientName + " (" + entry.patientId + ")"],
            ["Service Done", entry.reason],
            ["Queue Number", entry.queueNumber],
            ["Doctor", doctorName],
            ["Finished At", dateHelper.formatTime(entry.doctorFinishedAt)],
            ["Prescriptions Today", this.countPrescriptionsToday(entry.patientId)]
        ]);
        bodyHtml += '<div class="popup-actions">' +
            '<button class="btn ghost" id="doneOkButton">OK</button>' +
            '<button class="btn" id="doneBillingButton">Go to Billing</button></div>';

        const dialog = new ModalDialog("Consultation Finished", bodyHtml, { isWide: true });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector("#doneOkButton").addEventListener("click", function () {
            dialog.close();
        });
        dialogElement.querySelector("#doneBillingButton").addEventListener("click", function () {
            // Opens the bill of this visit directly.
            window.location.href = "billing.html?visit=" + encodeURIComponent(entry.id);
        });
    }

    // Keys already shown in this tab, stored in sessionStorage under the given name.
    loadSeenKeys(storageName) {
        const savedText = sessionStorage.getItem(storageName);
        if (savedText === null) {
            return [];
        }
        try {
            return JSON.parse(savedText);
        } catch (error) {
            return [];
        }
    }
        // The doctor presses "Done consulting" on the yellow bar.
    // The visit is marked finished, the bar clears at once, and staff and admin get the pop-up.
    doctorFinishesPatient(patientId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            return;
        }

        const patientName = patientService.getPatientNameById(patientId);
        const isConfirmed = confirm("Mark " + patientName + " as done consulting?\n\n" +
            "Staff and admin will be notified, and the bill will be ready in Billing.");
        if (isConfirmed === false) {
            return;
        }

        try {
            const finishedEntry = appointmentService.finishConsultationFromDoctor(patientId);
            if (finishedEntry === null) {
                notifier.showWarning("This patient is no longer in consultation.");
            } else {
                notifier.showSuccess("Done consulting. Staff and admin have been notified.");
            }
        } catch (error) {
            notifier.showError(error.message);
        }

        // Refresh the bar now, so the patient's name disappears at once.
        this.checkDoctorPatientAlert(currentUser);
    }
    markKeySeen(storageName, key) {
        const keys = this.loadSeenKeys(storageName);
        keys.push(key);
        sessionStorage.setItem(storageName, JSON.stringify(keys));
    }

    // ============ Doctor: "Ready to accept patient" button (top bar) ============

    buildAvailabilityButtonHtml(currentUser) {
        if (currentUser.role !== "Doctor") {
            return "";
        }
        return '<div class="availability" id="availabilityBox">' + this.buildAvailabilityInnerHtml(currentUser) + "</div>";
    }

    buildAvailabilityInnerHtml(currentUser) {
        if (this.isDoctorReadyNow(currentUser.username)) {
            const since = this.getDoctorReadySince(currentUser.username);
            return '<button class="btn ghost" id="availabilityButton">● Accepting patients (click to stop)</button>' +
                "<small>since " + htmlHelper.escapeText(dateHelper.formatTime(since)) + "</small>";
        }
        return '<button class="btn" id="availabilityButton">Ready to accept patient</button>';
    }

    connectAvailabilityButton() {
        const button = document.getElementById("availabilityButton");
        if (button === null) {
            return;
        }
        const layout = this;
        button.addEventListener("click", function () {
            layout.toggleDoctorAvailability();
        });
    }

    toggleDoctorAvailability() {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null) {
            return;
        }

        try {
            const wasReady = this.isDoctorReadyNow(currentUser.username);
            this.saveDoctorReady(!wasReady);

            if (wasReady) {
                notifier.showSuccess("You are no longer accepting patients.");
            } else {
                notifier.showSuccess("Staff and admin have been told you are ready to accept a patient.");
            }
            this.refreshAvailabilityButton(currentUser);
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    refreshAvailabilityButton(currentUser) {
        const box = document.getElementById("availabilityBox");
        if (box === null) {
            return;
        }
        box.innerHTML = this.buildAvailabilityInnerHtml(currentUser);
        this.connectAvailabilityButton();
    }

    // Logging out stops "ready", so staff do not keep seeing a doctor who has left.
    stopDoctorReadyOnLogout() {
        const currentUser = authService.getCurrentUser();
        if (currentUser === null || currentUser.role !== "Doctor") {
            return;
        }
        if (this.isDoctorReadyNow(currentUser.username)) {
            try {
                this.saveDoctorReady(false);
            } catch (error) {
                console.error("Could not stop ready status on logout:", error);
            }
        }
    }

    // ---- Saved availability (stored in the browser under "doctorAvailability") ----

    findEntryInList(entries, username) {
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].doctorUsername === username) {
                return entries[i];
            }
        }
        return null;
    }

    isDoctorReadyNow(username) {
        const entry = this.findEntryInList(storageService.loadList("doctorAvailability"), username);
        return entry !== null && entry.isReady === true;
    }

    getDoctorReadySince(username) {
        const entry = this.findEntryInList(storageService.loadList("doctorAvailability"), username);
        if (entry === null) {
            return null;
        }
        return entry.readyAt;
    }

    // Saves "ready" (true) or "not ready" (false) for the logged-in doctor only.
        // Saves "ready" (true) or "not ready" (false) for the logged-in doctor only.
    saveDoctorReady(isReady) {
        permissionService.requirePermission("consultations.write");

        const currentUser = authService.getCurrentUser();
        const entries = storageService.loadList("doctorAvailability");
        const now = new Date().toISOString();

        let entry = this.findEntryInList(entries, currentUser.username);
        if (entry === null) {
            entry = { doctorUsername: currentUser.username, isReady: false, readyAt: null, updatedAt: null };
            entries.push(entry);
        }

        entry.isReady = isReady === true;
        entry.updatedAt = now;
        if (isReady === true) {
            entry.readyAt = now;
        }
        storageService.saveList("doctorAvailability", entries);
        console.log("[ready] saved for " + currentUser.username + ": isReady = " + entry.isReady);

        if (isReady === true) {
            auditLogService.recordAction("Doctor ready for patients", currentUser.username);
        } else {
            auditLogService.recordAction("Doctor stopped accepting patients", currentUser.username);
        }
    }

    // ============ Staff and Admin: a doctor is ready to accept a patient ============

        startReadyDoctorWatch(currentUser) {
        const layout = this;
        console.log("[ready-alert] watching for ready doctors (user: " + currentUser.username + ")");
        this.checkReadyDoctorsSafely(currentUser);

        // Checks every 2 seconds. The storage listener below reacts at once when the doctor's tab saves.
        window.setInterval(function () {
            layout.checkReadyDoctorsSafely(currentUser);
        }, 2000);

        window.addEventListener("storage", function (event) {
            if (event.key === storageService.keyPrefix + "doctorAvailability") {
                console.log("[ready-alert] doctor availability changed in another tab");
                layout.checkReadyDoctorsSafely(currentUser);
            }
        });
    }

    checkReadyDoctorsSafely(currentUser) {
        try {
            this.checkReadyDoctors(currentUser);
        } catch (error) {
            console.error("[ready-alert] check failed:", error);
        }
    }

    checkReadyDoctors(currentUser) {
        const readyList = this.getReadyDoctorList();
        this.updateReadyDoctorBar(readyList);

        // Log only when the number of ready doctors changes, so the Console is not flooded.
        if (this.lastReadyCount !== readyList.length) {
            this.lastReadyCount = readyList.length;
            console.log("[ready-alert] ready doctors now: " + readyList.length);
        }

        const seenName = "dmcv2_seenReady_" + currentUser.username;
        const seenKeys = this.loadSeenKeys(seenName);

        // Find a ready doctor whose "ready" moment this tab has not shown yet.
        let pending = null;
        for (let i = 0; i < readyList.length; i++) {
            if (seenKeys.includes(this.buildReadyKey(readyList[i])) === false) {
                pending = readyList[i];
                break;
            }
        }
        if (pending === null) {
            return;
        }

        // Wait until any open dialog is closed. This check runs again every 2 seconds.
        if (document.querySelector(".modal-bg") !== null) {
            return;
        }

        console.log("[ready-alert] showing the pop-up for " + pending.doctorUsername);
        this.markKeySeen(seenName, this.buildReadyKey(pending));
        this.showDoctorReadyPopup(pending);
    }
    // Doctors who are ready right now. The one who became ready first comes first.
    getReadyDoctorList() {
        const entries = storageService.loadList("doctorAvailability");
        const readyList = [];
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].isReady === true) {
                readyList.push(entries[i]);
            }
        }
        readyList.sort(function (first, second) {
            return String(first.readyAt).localeCompare(String(second.readyAt));
        });
        return readyList;
    }

    buildReadyKey(entry) {
        return entry.doctorUsername + "|" + entry.readyAt;
    }

    // Green bar at the top of the page, listing every doctor who is ready right now.
    updateReadyDoctorBar(readyList) {
        let bar = document.getElementById("readyDoctorBar");

        if (readyList.length === 0) {
            if (bar !== null) {
                bar.remove();
            }
            return;
        }

        if (bar === null) {
            document.getElementById("main").insertAdjacentHTML("afterbegin", '<div id="readyDoctorBar" class="ready-bar"></div>');
            bar = document.getElementById("readyDoctorBar");
        }

        // Rewrite the bar only when something changed.
        const newHtml = this.buildReadyBarHtml(readyList);
        if (bar.lastHtml !== newHtml) {
            bar.innerHTML = newHtml;
            bar.lastHtml = newHtml;
        }
    }

    buildReadyBarHtml(readyList) {
        let html = "";
        for (let i = 0; i < readyList.length; i++) {
            const doctorName = userService.getFullNameByUsername(readyList[i].doctorUsername);
            html += '<div class="ready-bar-row"><span>✔ Ready to accept a patient:</span> <b>' +
                htmlHelper.escapeText(doctorName) + "</b> <small>since " +
                htmlHelper.escapeText(dateHelper.formatTime(readyList[i].readyAt)) + "</small></div>";
        }
        return html;
    }

    showDoctorReadyPopup(entry) {
        const doctorName = userService.getFullNameByUsername(entry.doctorUsername);

        let bodyHtml = '<p class="popup-lead"><b>' + htmlHelper.escapeText(doctorName) +
            "</b> is now accepting a patient.</p>";
        bodyHtml += this.buildKeyValueHtml([
            ["Doctor", doctorName],
            ["Ready Since", dateHelper.formatTime(entry.readyAt)]
        ]);
        bodyHtml += '<div class="popup-actions">' +
            '<button class="btn ghost" id="readyOkButton">OK</button>' +
            '<button class="btn" id="readyQueueButton">Go to Queuing</button></div>';

        const dialog = new ModalDialog("Doctor Ready for a Patient", bodyHtml, { isWide: true });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector("#readyOkButton").addEventListener("click", function () {
            dialog.close();
        });
        dialogElement.querySelector("#readyQueueButton").addEventListener("click", function () {
            window.location.href = "appointments.html";
        });
    }
}