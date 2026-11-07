/*
 * TestResultService.js
 * Purpose: text results of tests (X-ray, urine test, blood test...) for a queue entry.
 * Admin and Staff record and correct results. Everyone who can see the queue can read them.
 * A result can be corrected only on the day it was recorded.
 */
class TestResultService {
    getResultsForEntry(queueEntryId) {
        const allResults = storageService.loadList("testResults");
        const result = [];
        for (let i = 0; i < allResults.length; i++) {
            if (allResults[i].queueEntryId === queueEntryId) {
                result.push(allResults[i]);
            }
        }
        result.sort(function (first, second) {
            return String(first.recordedAt).localeCompare(String(second.recordedAt));
        });
        return result;
    }

    canRecord() {
        return permissionService.userCan("results.record");
    }

    // A result can only be corrected on the day it was recorded.
    isEditableToday(result) {
        return dateHelper.formatLocalDate(new Date(result.recordedAt)) === dateHelper.getTodayString();
    }

    checkText(label, value, maxLength) {
        const cleanText = String(value || "").trim();
        if (cleanText === "") {
            throw new Error("Type the " + label + ".");
        }
        if (cleanText.length > maxLength) {
            throw new Error("The " + label + " is too long (" + maxLength + " characters at most).");
        }
        return cleanText;
    }

    saveResult(entry, testName, resultText) {
        permissionService.requirePermission("results.record");
        const cleanName = this.checkText("test name", testName, 100);
        const cleanText = this.checkText("result", resultText, 2000);

        const allResults = storageService.loadList("testResults");
        allResults.push({
            id: storageService.generateNextId("T", allResults),
            queueEntryId: entry.id,
            patientId: entry.patientId,
            testName: cleanName,
            resultText: cleanText,
            recordedBy: "",
            recordedAt: "",
            updatedBy: "",
            updatedAt: ""
        });
        storageService.saveList("testResults", allResults);
        auditLogService.recordAction("Test result saved", entry.id + " " + cleanName);
    }

    updateResult(result, newText) {
        permissionService.requirePermission("results.record");
        if (!this.isEditableToday(result)) {
            throw new Error("This result was recorded on an earlier day, so it can no longer be changed.");
        }
        const cleanText = this.checkText("result", newText, 2000);

        const allResults = storageService.loadList("testResults");
        for (let i = 0; i < allResults.length; i++) {
            if (allResults[i].id === result.id) {
                allResults[i].resultText = cleanText;
                storageService.saveList("testResults", allResults);
                return;
            }
        }
        throw new Error("Result not found.");
    }
    
    // Every test result of one patient, from all visits, newest first.
    getResultsForPatient(patientId) {
        const allResults = storageService.loadList("testResults");
        const result = [];
        for (let i = 0; i < allResults.length; i++) {
            if (allResults[i].patientId === patientId) {
                result.push(allResults[i]);
            }
        }
        result.sort(function (first, second) {
            return String(second.recordedAt).localeCompare(String(first.recordedAt));
        });
        return result;
    }
    
    // The main window: every result of the visit, with Record and Edit buttons for staff and admin.
    openDialog(entry, onChanged) {
        const service = this;
        const results = this.getResultsForEntry(entry.id);
        const canRecord = this.canRecord();
        const patientName = patientService.getPatientNameById(entry.patientId);
        const safe = htmlHelper.escapeText;

        let html = '<p class="popup-lead"><b>' + safe(patientName) + "</b> &middot; " + safe(entry.reason) +
            " (queue " + safe(entry.queueNumber) + ")</p>";

        if (results.length === 0) {
            html += '<div class="empty">No result recorded yet.</div>';
        }
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            html += '<div class="card"><b>' + safe(result.testName) + "</b> <small>recorded " +
                safe(dateHelper.formatDateTime(result.recordedAt)) + " by " +
                safe(userService.getFullNameByUsername(result.recordedBy)) + "</small>";
            if (result.updatedAt) {
                html += "<br><small>changed " + safe(dateHelper.formatDateTime(result.updatedAt)) + " by " +
                    safe(userService.getFullNameByUsername(result.updatedBy)) + "</small>";
            }
            html += '<p style="white-space:pre-wrap;margin:8px 0 0">' + safe(result.resultText) + "</p>";
            if (canRecord && this.isEditableToday(result)) {
                html += '<div style="margin-top:8px"><button class="btn sm ghost" data-edit-result="' + safe(result.id) + '">Edit</button></div>';
            }
            html += "</div>";
        }

        if (canRecord) {
            html += '<div class="popup-actions"><button class="btn" id="recordResultButton">+ Record result</button></div>';
        }

        const dialog = new ModalDialog("Test Results - " + patientName, html, { isWide: true });
        dialog.open();

        const dialogElement = dialog.getElement();
        const recordButton = dialogElement.querySelector("#recordResultButton");
        if (recordButton !== null) {
            recordButton.addEventListener("click", function () {
                dialog.close();
                service.openRecordDialog(entry, onChanged);
            });
        }

        const editButtons = dialogElement.querySelectorAll("button[data-edit-result]");
        for (let i = 0; i < editButtons.length; i++) {
            editButtons[i].addEventListener("click", function (event) {
                const resultId = event.target.getAttribute("data-edit-result");
                let target = null;
                for (let j = 0; j < results.length; j++) {
                    if (results[j].id === resultId) {
                        target = results[j];
                    }
                }
                dialog.close();
                service.openEditDialog(target, onChanged);
            });
        }
    }

    // A new result. The test name starts as the visit reason, so the user only types the result.
    openRecordDialog(entry, onChanged) {
        const service = this;
        const fields = [
            { name: "testName", label: "Test name", type: "text", isRequired: true, isFullWidth: true, defaultValue: entry.reason },
            { name: "resultText", label: "Result (text)", type: "textarea", isRequired: true, isFullWidth: true }
        ];

        const dialog = new ModalDialog("Record Result", formBuilder.buildFormHtml(fields, {}), {
            isWide: true,
            saveButtonText: "Save Result",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                service.saveResult(entry, values.testName, values.resultText);
                notifier.showSuccess("Result saved.");
                if (onChanged) {
                    onChanged();
                }
            }
        });
        dialog.open();
    }

    // Correcting a result from the same day.
    openEditDialog(result, onChanged) {
        const service = this;
        const fields = [
            { name: "resultText", label: "Result (text)", type: "textarea", isRequired: true, isFullWidth: true }
        ];

        const dialog = new ModalDialog("Correct Result - " + result.testName,
            formBuilder.buildFormHtml(fields, { resultText: result.resultText }), {
            isWide: true,
            saveButtonText: "Save Correction",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                service.updateResult(result, values.resultText);
                notifier.showSuccess("Result corrected.");
                if (onChanged) {
                    onChanged();
                }
            }
        });
        dialog.open();
    }
}

const testResultService = new TestResultService();