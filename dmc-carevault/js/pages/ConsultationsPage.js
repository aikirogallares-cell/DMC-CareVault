/*
 * ConsultationsPage.js
 * Purpose: consultation records. Doctors can create and edit; Admin can only view.
 * When a doctor starts a new consultation for a patient, the vital signs staff recorded today
 * are filled in automatically. The doctor can still change them.
 */
class ConsultationsPage {
    constructor() {
        this.mainElement = null;
    }

    start() {
        const page = this;
        const layout = new PageLayout("consultations");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        const canWrite = permissionService.userCan("consultations.write");

        let html = "<h2>Consultations</h2>";
        html += '<div class="toolbar"><span class="sp"></span>';
        if (canWrite) {
            html += '<button class="btn" id="addConsultationButton">+ New Consultation</button>';
        }
        html += "</div>";
        html += '<div class="card" id="consultationTable"></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        if (canWrite) {
            document.getElementById("addConsultationButton").addEventListener("click", function () {
                page.openConsultationForm(null);
            });
        }
        document.getElementById("consultationTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });

        this.refreshTable();

        const urlParameters = new URLSearchParams(window.location.search);
        if (urlParameters.get("new") === "1" && canWrite) {
            this.openConsultationForm(null);
        }
    }

    refreshTable() {
        const page = this;
        const consultations = consultationService.getConsultationsForCurrentUser();

        consultations.sort(function (first, second) {
            return second.date.localeCompare(first.date);
        });

        const columns = [
            { title: "Date", getCellHtml: function (item) { return item.date; } },
            { title: "Patient", getCellHtml: function (item) { return htmlHelper.escapeText(patientService.getPatientNameById(item.patientId)); } },
            { title: "Chief Complaint", getCellHtml: function (item) { return htmlHelper.escapeText(item.complaint); } },
            { title: "Diagnosis", getCellHtml: function (item) { return htmlHelper.escapeText(item.diagnosis); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(item.status); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } }
        ];

        document.getElementById("consultationTable").innerHTML =
            tableBuilder.buildTableHtml(columns, consultations, "No consultations yet.");
    }

    buildActionButtons(consultation) {
        let html = '<button class="btn sm ghost" data-action="view" data-id="' + consultation.id + '">View</button>';

        if (permissionService.userCan("consultations.write")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + consultation.id + '">Edit</button>';
        }
        return html;
    }

    findConsultationById(consultationId) {
        const consultations = consultationService.getConsultationsForCurrentUser();
        for (let i = 0; i < consultations.length; i++) {
            if (consultations[i].id === consultationId) {
                return consultations[i];
            }
        }
        return null;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const consultation = this.findConsultationById(button.getAttribute("data-id"));
        if (button.getAttribute("data-action") === "edit") {
            this.openConsultationForm(consultation);
        } else {
            this.openViewDialog(consultation);
        }
    }

    // The newest vital signs staff recorded today for this patient, or null if there are none.
    findTodayVitalsForPatient(patientId) {
        if (patientId === "") {
            return null;
        }

        const today = dateHelper.getTodayString();
        const appointments = appointmentService.getAppointmentsForCurrentUser();
        let newest = null;

        for (let i = 0; i < appointments.length; i++) {
            const item = appointments[i];
            if (item.patientId === patientId && item.date === today && item.vitals) {
                if (newest === null || String(item.vitals.recordedAt).localeCompare(String(newest.recordedAt)) > 0) {
                    newest = item.vitals;
                }
            }
        }
        return newest;
    }

    // Returns the text for a vital sign box, or "" when the staff did not record it.
    valueFromVitals(vitals, name) {
        if (vitals === null || vitals[name] === undefined) {
            return "";
        }
        return String(vitals[name]);
    }

    buildFormFields(isEditing) {
        const chosenPatientId = new URLSearchParams(window.location.search).get("patient") || "";

        // Vital signs are filled in only for a new consultation.
        let staffVitals = null;
        if (isEditing === false) {
            staffVitals = this.findTodayVitalsForPatient(chosenPatientId);
        }

        const fields = [];
        fields.push({ name: "patientId", label: "Patient", type: "select", options: patientService.getPatientSelectOptions(), isFullWidth: true, defaultValue: chosenPatientId });
        fields.push({ name: "date", label: "Date", type: "date", isRequired: true, defaultValue: dateHelper.getTodayString() });
        fields.push({ name: "complaint", label: "Chief Complaint", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "symptoms", label: "Symptoms", type: "textarea", isFullWidth: true });

        fields.push({ sectionTitle: "Vital Signs" });
        fields.push({ name: "bloodPressure", label: "Blood Pressure", type: "text", defaultValue: this.valueFromVitals(staffVitals, "bloodPressure") });
        fields.push({ name: "heartRate", label: "Heart Rate", type: "text", defaultValue: this.valueFromVitals(staffVitals, "heartRate") });
        fields.push({ name: "temperature", label: "Temperature (°C)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "temperature") });
        fields.push({ name: "respiratoryRate", label: "Respiratory Rate", type: "text", defaultValue: this.valueFromVitals(staffVitals, "respiratoryRate") });
        fields.push({ name: "weight", label: "Weight (kg)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "weight") });
        fields.push({ name: "height", label: "Height (cm)", type: "text", defaultValue: this.valueFromVitals(staffVitals, "height") });

        fields.push({ sectionTitle: "Assessment" });
        fields.push({ name: "diagnosis", label: "Diagnosis", type: "text", isRequired: true, isFullWidth: true });
        fields.push({ name: "treatment", label: "Treatment", type: "textarea", isFullWidth: true });
        fields.push({ name: "notes", label: "Doctor's Notes", type: "textarea", isFullWidth: true });
        return fields;
    }

    openConsultationForm(consultationToEdit) {
        const page = this;
        const fields = this.buildFormFields(consultationToEdit !== null);

        let existingValues = {};
        let dialogTitle = "New Consultation";
        if (consultationToEdit !== null) {
            existingValues = consultationToEdit;
            dialogTitle = "Edit Consultation";
        }

        // The status comes from the button the doctor presses, not from a drop-down.
        const saveWithStatus = function (status) {
            const formValues = formBuilder.readFormValues(fields);
            formValues.id = consultationToEdit === null ? "" : consultationToEdit.id;
            formValues.status = status;

            const wasAlreadyCompleted = consultationToEdit !== null && consultationToEdit.status === "Completed";
            const result = consultationService.saveConsultation(formValues);
            page.showSaveMessage(status, result);
            page.refreshTable();

            if (status === "Completed" && wasAlreadyCompleted === false) {
                page.askAboutPrescription(formValues.patientId);
            }
        };

        let bodyHtml = '<div class="rx-layout" id="rxLayout"><div class="rx-main">';
        bodyHtml += '<div class="toolbar"><span class="sp"></span>' +
            '<button class="btn sm ghost" type="button" id="historyToggleButton">Hide patient history</button></div>';
        bodyHtml += formBuilder.buildFormHtml(fields, existingValues);
        bodyHtml += '<div class="popup-actions"><button class="btn ghost" type="button" id="saveInProgressButton">Save as In Progress</button></div>';
        bodyHtml += "</div>";
        bodyHtml += '<aside class="rx-side"><h4 style="color:var(--g);margin:0 0 8px">Patient history</h4>' +
            '<div id="historyList"></div></aside>';
        bodyHtml += "</div>";

        const dialog = new ModalDialog(dialogTitle, bodyHtml, {
            isWide: true,
            saveButtonText: "Finish & Send to Billing",
            onSave: function () {
                saveWithStatus("Completed");
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector(".modal").classList.add("rx-wide");

        dialogElement.querySelector("#saveInProgressButton").addEventListener("click", function () {
            try {
                saveWithStatus("In Progress");
                dialog.close();
            } catch (error) {
                dialog.showError(error.message);
            }
        });

        dialogElement.querySelector("#field_patientId").addEventListener("change", function () {
            page.refreshHistoryPanel(dialogElement);
        });
        page.connectHistoryToggle(dialogElement);
        page.refreshHistoryPanel(dialogElement);
        page.startHistoryAutoRefresh(dialogElement);
    } 
        
        
        showSaveMessage(status, result) {
        if (status !== "Completed") {
            notifier.showSuccess("Consultation saved successfully.");
            return;
        }
        if (result.finishedEntry !== null) {
            notifier.showSuccess("Consultation finished. Staff and admin have been notified, and the bill is ready in Billing.");
            return;
        }
        if (result.isNewConsultation) {
            notifier.showWarning("Consultation saved, but this patient is not in consultation with you today, so no bill was created.");
            return;
        }
        notifier.showSuccess("Consultation saved.");
    }
    
    // Pop-up shown after a consultation is finished: prescription Yes or No.
    askAboutPrescription(patientId) {
        const patientName = patientService.getPatientNameById(patientId);

        let html = '<p class="popup-lead">Will <b>' + htmlHelper.escapeText(patientName) + '</b> be given a prescription?</p>';
        html += '<div class="popup-actions">';
        html += '<button class="btn ghost" id="noPrescriptionButton">No prescription</button>';
        html += '<button class="btn" id="yesPrescriptionButton">Yes, write prescription</button>';
        html += "</div>";

        const dialog = new ModalDialog("Prescription", html);
        dialog.open();

        dialog.findInside("noPrescriptionButton").addEventListener("click", function () {
            dialog.close();
        });
        dialog.findInside("yesPrescriptionButton").addEventListener("click", function () {
            window.location.href = "prescriptions.html?new=1&patient=" + encodeURIComponent(patientId);
        });
    }

        // Hide or show the history panel. The choice is remembered for this browser tab.
    connectHistoryToggle(dialogElement) {
        const layout = dialogElement.querySelector("#rxLayout");
        const toggleButton = dialogElement.querySelector("#historyToggleButton");
        const applyState = function (hidden) {
            layout.classList.toggle("rx-hidden", hidden);
            toggleButton.textContent = hidden ? "Show patient history" : "Hide patient history";
            sessionStorage.setItem("dmcv2_consultPanelHidden", hidden ? "1" : "0");
        };
        applyState(sessionStorage.getItem("dmcv2_consultPanelHidden") === "1");
        toggleButton.addEventListener("click", function () {
            applyState(!layout.classList.contains("rx-hidden"));
        });
    }

    // Fills the history panel for the patient chosen in the form.
    refreshHistoryPanel(dialogElement) {
        const list = dialogElement.querySelector("#historyList");
        const patientId = dialogElement.querySelector("#field_patientId").value;

        if (patientId === "") {
            list.innerHTML = '<div class="empty">Choose a patient to see their previous records.</div>';
            return;
        }
        list.innerHTML = this.buildHistoryHtml(patientId);
    }

        // Refreshes only the history panel every 2 seconds while the form is open.
    // The form fields are not touched, so nothing the doctor has typed is lost.
    startHistoryAutoRefresh(dialogElement) {
        const page = this;
        const timer = window.setInterval(function () {
            // The form was closed: stop refreshing.
            if (dialogElement.isConnected === false) {
                window.clearInterval(timer);
                return;
            }
            try {
                page.refreshHistoryPanelIfChanged(dialogElement);
            } catch (error) {
                console.error("[history] could not refresh the patient history:", error);
            }
        }, 2000);
    }

    // Rebuilds the panel only when something changed, and keeps its scroll position.
    refreshHistoryPanelIfChanged(dialogElement) {
        const list = dialogElement.querySelector("#historyList");
        const scrollBox = dialogElement.querySelector("#rxLayout .rx-side");
        if (list === null || scrollBox === null) {
            return;
        }

        const patientId = dialogElement.querySelector("#field_patientId").value;
        let newHtml = '<div class="empty">Choose a patient to see their previous records.</div>';
        if (patientId !== "") {
            newHtml = this.buildHistoryHtml(patientId);
        }

        if (list.lastHtml === newHtml) {
            return;
        }
        const scrollPosition = scrollBox.scrollTop;
        list.innerHTML = newHtml;
        list.lastHtml = newHtml;
        scrollBox.scrollTop = scrollPosition;
    }

    buildHistoryHtml(patientId) {
        return this.buildHistorySection("Previous vital signs", this.buildVitalSignItems(patientId)) +
            this.buildHistorySection("Check-ups and visits", this.buildVisitItems(patientId)) +
            this.buildHistorySection("Complaints and diagnoses", this.buildComplaintItems(patientId)) +
            this.buildHistorySection("Blood tests, X-rays and other tests", this.buildTestItems(patientId)) +
            this.buildHistorySection("Medication", this.buildMedicationItems(patientId));
    }

    // One titled block. Shows "None yet." when there are no items.
    buildHistorySection(title, itemHtmlList) {
        let html = '<div class="rx-result"><h4 style="color:var(--g);margin:0 0 6px">' + htmlHelper.escapeText(title) + "</h4>";
        if (itemHtmlList.length === 0) {
            html += '<small style="color:var(--tx2)">None yet.</small>';
        }
        for (let i = 0; i < itemHtmlList.length; i++) {
            html += '<div style="margin-bottom:6px">' + itemHtmlList[i] + "</div>";
        }
        html += "</div>";
        return html;
    }

    // Newest 10 vital signs of this patient.
    buildVitalSignItems(patientId) {
        const safe = htmlHelper.escapeText;
        const visits = appointmentService.getAppointmentsForCurrentUser();
        const withVitals = [];
        for (let i = 0; i < visits.length; i++) {
            if (visits[i].patientId === patientId && visits[i].vitals) {
                withVitals.push(visits[i]);
            }
        }
        withVitals.sort(function (first, second) {
            return String(second.vitals.recordedAt).localeCompare(String(first.vitals.recordedAt));
        });

        const items = [];
        for (let i = 0; i < withVitals.length && i < 10; i++) {
            const v = withVitals[i].vitals;
            let line = "<small>" + safe(dateHelper.formatDateTime(v.recordedAt)) + "</small><br>" +
                "BP " + safe(v.bloodPressure) + " &middot; HR " + safe(v.heartRate) +
                " &middot; Temp " + safe(v.temperature) + " &middot; RR " + safe(v.respiratoryRate) +
                " &middot; " + safe(v.weight) + " kg";
            if (v.height !== "" && v.height !== undefined && v.height !== null) {
                line += " &middot; " + safe(v.height) + " cm";
            }
            items.push(line);
        }
        return items;
    }

    // Newest 10 visits. Each visit shows its queue number, doctor, priority, status,
    // the time of each step, and whether vital signs and test results were recorded.
    buildVisitItems(patientId) {
        const safe = htmlHelper.escapeText;
        const visits = appointmentService.getAppointmentsForCurrentUser();
        const mine = [];
        for (let i = 0; i < visits.length; i++) {
            if (visits[i].patientId === patientId) {
                mine.push(visits[i]);
            }
        }
        mine.sort(function (first, second) {
            return appointmentService.compareNewestFirst(first, second);
        });

        const items = [];
        for (let i = 0; i < mine.length && i < 10; i++) {
            const visit = mine[i];

            const queueText = (visit.queueNumber === null || visit.queueNumber === undefined)
                ? "-" : "Queue #" + visit.queueNumber;
            const priorityText = visit.priority || "Regular";
            const doctorText = userService.getFullNameByUsername(visit.doctorUsername);
            const vitalsText = visit.vitals ? "Vital signs recorded" : "Vital signs not recorded";
            const resultCount = testResultService.getResultsForEntry(visit.id).length;
            const resultsText = resultCount === 1 ? "1 test result" : resultCount + " test results";

            let line = "<b>" + safe(visit.date) + "</b> &middot; " + safe(queueText) +
                " &middot; " + safe(visit.reason) + " &middot; " + htmlHelper.buildStatusBadge(visit.status);
            line += "<br><small>Doctor: " + safe(doctorText) + " &middot; Priority: " + safe(priorityText) + "</small>";
            line += "<br><small>In: " + safe(dateHelper.formatTime(visit.queuedAt)) +
                " &middot; Started: " + safe(dateHelper.formatTime(visit.startedAt)) +
                " &middot; Done: " + safe(dateHelper.formatTime(visit.completedAt)) + "</small>";
            line += "<br><small>" + safe(vitalsText) + " &middot; " + safe(resultsText) + "</small>";

            items.push(line);
        }
        return items;
    }

    // Newest 10 consultations: the chief complaint and the diagnosis.
    buildComplaintItems(patientId) {
        const safe = htmlHelper.escapeText;
        const history = consultationService.getHistoryForPatient(patientId);

        const items = [];
        for (let i = 0; i < history.length && i < 10; i++) {
            const c = history[i];
            items.push("<b>" + safe(c.date) + "</b> &middot; " + safe(c.complaint) +
                "<br><small>Diagnosis: " + safe(c.diagnosis) + "</small>");
        }
        return items;
    }

    // Newest 10 test results of any name (blood test, X-ray, urine test...).
    buildTestItems(patientId) {
        const safe = htmlHelper.escapeText;
        const results = testResultService.getResultsForPatient(patientId);

        const items = [];
        for (let i = 0; i < results.length && i < 10; i++) {
            const r = results[i];
            items.push("<b>" + safe(r.testName) + "</b> &middot; " + safe(dateHelper.formatDateTime(r.recordedAt)) +
                "<br>" + safe(r.resultText).replace(/\n/g, "<br>"));
        }
        return items;
    }

    // Newest 10 prescriptions: each medicine with its dosage, frequency and duration.
    buildMedicationItems(patientId) {
        const safe = htmlHelper.escapeText;
        const prescriptions = prescriptionService.getPrescriptionsForPatient(patientId);

        const items = [];
        for (let i = 0; i < prescriptions.length && i < 10; i++) {
            const p = prescriptions[i];
            const lines = [];
            for (let j = 0; j < p.medicines.length; j++) {
                const m = p.medicines[j];
                lines.push(safe(m.name) + " " + safe(m.dosage) + " " + safe(m.frequency) + " for " + safe(m.duration));
            }
            items.push("<b>" + safe(p.date) + "</b><br>" + lines.join("<br>"));
        }
        return items;
    }

    openViewDialog(consultation) {
        const vitalsText = "BP " + consultation.bloodPressure + " | HR " + consultation.heartRate +
            " | Temp " + consultation.temperature + " °C | RR " + consultation.respiratoryRate +
            " | " + consultation.weight + " kg | " + consultation.height + " cm";

        const rows = [
            ["Date", consultation.date],
            ["Status", consultation.status],
            ["Chief Complaint", consultation.complaint],
            ["Symptoms", consultation.symptoms],
            ["Vital Signs", vitalsText],
            ["Diagnosis", consultation.diagnosis],
            ["Treatment", consultation.treatment],
            ["Doctor's Notes", consultation.notes]
        ];

        let html = '<dl class="kv">';
        for (let i = 0; i < rows.length; i++) {
            let shownValue = rows[i][1];
            if (shownValue === "" || shownValue === undefined) {
                shownValue = "-";
            }
            html += "<dt>" + rows[i][0] + "</dt><dd>" + htmlHelper.escapeText(shownValue) + "</dd>";
        }
        html += "</dl>";

        const title = "Consultation - " + patientService.getPatientNameById(consultation.patientId);
        new ModalDialog(title, html, { isWide: true }).open();
    }
}

const consultationsPage = new ConsultationsPage();
consultationsPage.start();