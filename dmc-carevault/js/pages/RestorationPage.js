/*
 * RestorationPage.js
 * Purpose: type in prescriptions from the paper archive, copied exactly as they are written.
 * These entries are kept apart from the live prescriptions and cannot be changed after saving.
 */
class RestorationPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("restoration");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    showPage() {
        let html = "<h2>Archive Restoration</h2>";
        html += '<div class="card"><div class="toolbar">';
        html += '<input id="archiveSearch" placeholder="Search patient, doctor or medicine...">';
        html += '<span class="sp"></span>';
        if (permissionService.userCan("archive.restore")) {
            html += '<button class="btn" id="addArchiveButton">+ Restore a Prescription</button>';
        }
        html += "</div>";
        html += '<p style="color:var(--tx2);font-size:12px;margin:0 0 12px">Entries are copied exactly as they are written on the paper. Once saved they cannot be changed.</p>';
        html += '<div id="archiveTable"></div></div>';
        this.mainElement.innerHTML = html;

        const page = this;
        document.getElementById("archiveSearch").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value.toLowerCase().trim();
            page.refreshTable();
        });
        const addButton = document.getElementById("addArchiveButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                page.openRestoreForm();
            });
        }
        this.refreshTable();
    }

    getFilteredEntries() {
        const all = storageService.loadList("archivedPrescriptions");
        const result = [];
        for (let i = 0; i < all.length; i++) {
            const item = all[i];
            const medicineNames = item.medicines.map(function (m) { return m.name; }).join(" ");
            const searchable = (item.patientNameAsWritten + " " + item.doctorNameAsWritten + " " + medicineNames).toLowerCase();
            if (this.searchKeyword === "" || searchable.includes(this.searchKeyword)) {
                result.push(item);
            }
        }
        result.sort(function (first, second) {
            return String(second.date).localeCompare(String(first.date));
        });
        return result;
    }

    refreshTable() {
        const columns = [
            { title: "Date", getCellHtml: function (item) { return htmlHelper.escapeText(item.date); } },
            { title: "Patient (as written)", getCellHtml: function (item) {
                let html = htmlHelper.escapeText(item.patientNameAsWritten);
                if (item.patientId !== "") {
                    html += " <small>(" + htmlHelper.escapeText(item.patientId) + ")</small>";
                }
                return html;
            } },
            { title: "Doctor (as written)", getCellHtml: function (item) { return htmlHelper.escapeText(item.doctorNameAsWritten); } },
            { title: "Medicines", getCellHtml: function (item) {
                return htmlHelper.escapeText(item.medicines.map(function (m) {
                    return m.name + (m.dosage ? " " + m.dosage : "");
                }).join(", "));
            } },
            { title: "Entered by", getCellHtml: function (item) { return htmlHelper.escapeText(userService.getFullNameByUsername(item.enteredBy)); } },
            { title: "Entered on", getCellHtml: function (item) { return htmlHelper.escapeText(dateHelper.formatDateTime(item.enteredAt)); } }
        ];
        document.getElementById("archiveTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getFilteredEntries(), "No restored prescriptions yet.");
    }

    // One row = one medicine, typed exactly as written on the paper.
    buildRestoreRowHtml() {
        let html = '<div class="medrow">';
        html += '<input data-field="medicine" placeholder="Medicine name">';
        html += '<input data-field="dosage" placeholder="Dosage">';
        html += '<input data-field="frequency" placeholder="Frequency (as written)">';
        html += '<input data-field="duration" placeholder="Duration">';
        html += '<input data-field="quantity" placeholder="Qty (as written)">';
        html += '<input data-field="instructions" placeholder="Instructions">';
        html += '<button class="btn sm danger" type="button" data-remove-row="1">×</button></div>';
        return html;
    }

    openRestoreForm() {
        const page = this;
        const fields = [
            { name: "patientId", label: "Link to a patient record (optional)", type: "searchselect", isFullWidth: true,
                options: patientService.getPatientSelectOptions(), placeholder: "Type a name or patient ID to search..." },
            { name: "patientNameAsWritten", label: "Patient's name (as written)", type: "text", isRequired: true },
            { name: "date", label: "Date on the prescription", type: "date", isRequired: true },
            { name: "ageAsWritten", label: "Age (as written)", type: "text" },
            { name: "sexAsWritten", label: "Sex", type: "select",
                options: [{ value: "", label: "Not written" }].concat(formBuilder.createOptionsFromTexts(["Male", "Female"])) },
            { name: "addressAsWritten", label: "Address (as written)", type: "text", isFullWidth: true },
            { name: "doctorNameAsWritten", label: "Doctor's name (as written)", type: "text", isRequired: true, isFullWidth: true },
            { name: "note", label: "Note (optional)", type: "textarea", isFullWidth: true }
        ];

        let bodyHtml = formBuilder.buildFormHtml(fields, {});
        bodyHtml += '<h4 style="color:var(--g)">Medicines (as written)</h4>';
        bodyHtml += '<div id="archiveMedicineRows">' + this.buildRestoreRowHtml() + "</div>";
        bodyHtml += '<button class="btn sm ghost" type="button" id="archiveAddMedicine">+ Add medicine</button>';

        const dialog = new ModalDialog("Restore a Prescription", bodyHtml, {
            isWide: true,
            saveButtonText: "Save Restored Prescription",
            onSave: function (openDialog) {
                page.saveRestored(fields, openDialog);
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        formBuilder.connectFields(dialogElement, fields);
        dialogElement.querySelector("#archiveAddMedicine").addEventListener("click", function () {
            dialogElement.querySelector("#archiveMedicineRows").insertAdjacentHTML("beforeend", page.buildRestoreRowHtml());
        });
        dialogElement.addEventListener("click", function (event) {
            if (event.target.getAttribute("data-remove-row") === "1") {
                event.target.closest(".medrow").remove();
            }
        });
    }

    saveRestored(fields, openDialog) {
        permissionService.requirePermission("archive.restore");

        const values = formBuilder.readFormValues(fields);
        const rowElements = openDialog.getElement().querySelectorAll(".medrow");
        const medicines = [];

        for (let i = 0; i < rowElements.length; i++) {
            const row = rowElements[i];
            const name = row.querySelector('[data-field="medicine"]').value.trim();
            if (name === "") {
                continue;
            }
            medicines.push({
                name: name,
                dosage: row.querySelector('[data-field="dosage"]').value.trim(),
                frequency: row.querySelector('[data-field="frequency"]').value.trim(),
                duration: row.querySelector('[data-field="duration"]').value.trim(),
                quantity: row.querySelector('[data-field="quantity"]').value.trim(),
                instructions: row.querySelector('[data-field="instructions"]').value.trim()
            });
        }
        if (medicines.length === 0) {
            throw new Error("Add at least one medicine.");
        }

        const list = storageService.loadList("archivedPrescriptions");
        list.push({
            id: storageService.generateNextId("AR", list),
            patientId: values.patientId || "",
            patientNameAsWritten: values.patientNameAsWritten,
            ageAsWritten: values.ageAsWritten || "",
            sexAsWritten: values.sexAsWritten || "",
            addressAsWritten: values.addressAsWritten || "",
            date: values.date,
            doctorNameAsWritten: values.doctorNameAsWritten,
            note: values.note || "",
            enteredBy: "",
            enteredAt: "",
            medicines: medicines
        });
        storageService.saveList("archivedPrescriptions", list);
        auditLogService.recordAction("Archived prescription restored", values.date + " " + values.patientNameAsWritten);

        notifier.showSuccess("Restored prescription saved.");
        this.refreshTable();
    }
}

const restorationPage = new RestorationPage();
restorationPage.start();