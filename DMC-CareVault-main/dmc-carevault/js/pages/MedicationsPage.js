/*
 * MedicationsPage.js
 * Purpose: the medicine list. Everyone with access can search and view the details and stock.
 * Admin and Staff can add, edit and archive medicines.
 * Doctors pick from this list (only medicines with stock) when writing a prescription.
 */
class MedicationsPage {
    constructor() {
        this.mainElement = null;
        this.searchKeyword = "";
        this.filterStatus = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("medications");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    // ---------- Page layout ----------

    showPage() {
        let html = "<h2>Medications</h2>";
        html += '<div class="grid" id="medicationStats"></div>';
        html += '<div class="toolbar">';
        html += '<input id="searchInput" placeholder="Search name, brand or category...">';
        html += '<select id="statusFilter"><option value="">All statuses</option>';
        for (let i = 0; i < medicationService.stockStatuses.length; i++) {
            html += "<option>" + medicationService.stockStatuses[i] + "</option>";
        }
        html += "</select>";
        html += '<span class="sp"></span>';
        if (permissionService.userCan("medications.manage")) {
            html += '<button class="btn" id="addMedicationButton">+ Add Medication</button>';
        }
        html += "</div>";
        html += '<div class="card" id="medicationTable"></div>';

        this.mainElement.innerHTML = html;
        this.connectEvents();
        this.refreshAll();
    }

    connectEvents() {
        const page = this;

        document.getElementById("searchInput").addEventListener("input", function (event) {
            page.searchKeyword = event.target.value.toLowerCase().trim();
            page.refreshTable();
        });
        document.getElementById("statusFilter").addEventListener("change", function (event) {
            page.filterStatus = event.target.value;
            page.refreshTable();
        });

        const addButton = document.getElementById("addMedicationButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                page.openMedicationForm(null);
            });
        }

        document.getElementById("medicationTable").addEventListener("click", function (event) {
            page.handleTableButtonClick(event);
        });
    }

    refreshAll() {
        this.refreshStats();
        this.refreshTable();
    }

    // ---------- Summary cards ----------

    refreshStats() {
        const medications = medicationService.getAllMedications();
        let lowCount = 0;
        let outCount = 0;
        let expiryCount = 0;

        for (let i = 0; i < medications.length; i++) {
            const status = medicationService.getStockStatus(medications[i]);
            if (status === "Low Stock") { lowCount = lowCount + 1; }
            if (status === "Out of Stock") { outCount = outCount + 1; }
            if (status === "Expired" || status === "Expiring Soon") { expiryCount = expiryCount + 1; }
        }

        let html = "";
        html += htmlHelper.buildStatCard(medications.length, "Total Medicines");
        html += htmlHelper.buildStatCard(lowCount, "Low Stock");
        html += htmlHelper.buildStatCard(outCount, "Out of Stock");
        html += htmlHelper.buildStatCard(expiryCount, "Expired / Expiring Soon");
        document.getElementById("medicationStats").innerHTML = html;
    }

    // ---------- Table ----------

    getFilteredMedications() {
        const allMedications = medicationService.getAllMedications();
        const result = [];

        for (let i = 0; i < allMedications.length; i++) {
            const medication = allMedications[i];

            if (this.filterStatus !== "" && medicationService.getStockStatus(medication) !== this.filterStatus) {
                continue;
            }

            const searchableText = (medication.id + " " + medication.genericName + " " +
                medication.brandName + " " + medication.category).toLowerCase();
            if (this.searchKeyword !== "" && !searchableText.includes(this.searchKeyword)) {
                continue;
            }

            result.push(medication);
        }

        result.sort(function (first, second) {
            return first.genericName.localeCompare(second.genericName);
        });
        return result;
    }

    refreshTable() {
        const page = this;
        const columns = [
            { title: "ID", getCellHtml: function (item) { return item.id; } },
            { title: "Medicine", getCellHtml: function (item) { return htmlHelper.escapeText(medicationService.getMedicationName(item)); } },
            { title: "Strength", getCellHtml: function (item) { return htmlHelper.escapeText(item.strength); } },
            { title: "Form", getCellHtml: function (item) { return htmlHelper.escapeText(item.form); } },
            { title: "Category", getCellHtml: function (item) { return htmlHelper.escapeText(item.category); } },
            { title: "Stock", getCellHtml: function (item) { return htmlHelper.escapeText(item.stock + " " + item.unit); } },
            { title: "Expiry", getCellHtml: function (item) { return htmlHelper.escapeText(item.expiryDate); } },
            { title: "Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(medicationService.getStockStatus(item)); } },
            { title: "Action", getCellHtml: function (item) { return page.buildActionButtons(item); } }
        ];

        document.getElementById("medicationTable").innerHTML =
            tableBuilder.buildTableHtml(columns, this.getFilteredMedications(), "No medicines found.");
    }

    // Only the buttons the current user may use are created.
    buildActionButtons(medication) {
        let html = '<button class="btn sm ghost" data-action="view" data-id="' + medication.id + '">View</button>';

        if (permissionService.userCan("medications.manage")) {
            html += '<button class="btn sm ghost" data-action="edit" data-id="' + medication.id + '">Edit</button>';
            html += '<button class="btn sm danger" data-action="archive" data-id="' + medication.id + '">Archive</button>';
        }
        return html;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-action]");
        if (button === null) {
            return;
        }

        const action = button.getAttribute("data-action");

        try {
            const medication = medicationService.getMedicationById(button.getAttribute("data-id"));
            if (medication === null) {
                throw new Error("Medication not found.");
            }

            if (action === "view") {
                this.openViewDialog(medication);
            } else if (action === "edit") {
                this.openMedicationForm(medication);
            } else if (action === "archive") {
                this.archiveMedication(medication);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    archiveMedication(medication) {
        const confirmed = confirm("Archive this medicine? It will be hidden from the list and from prescriptions.");
        if (confirmed === false) {
            return;
        }

        medicationService.archiveMedication(medication.id);
        notifier.showSuccess("Medication archived.");
        this.refreshAll();
    }

    // ---------- Add / Edit form ----------

    buildFormFields() {
        const fields = [];

        fields.push({ sectionTitle: "Medicine Information" });
        fields.push({ name: "genericName", label: "Generic Name", type: "text", isRequired: true });
        fields.push({ name: "brandName", label: "Brand Name", type: "text" });
        fields.push({ name: "strength", label: "Strength (example: 500 mg)", type: "text", isRequired: true });
        fields.push({ name: "form", label: "Dosage Form", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.dosageForms) });
        fields.push({ name: "category", label: "Category", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.categories) });
        fields.push({ name: "route", label: "Route of Administration", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.routes) });

        fields.push({ sectionTitle: "Stock & Tracking" });
        fields.push({ name: "stock", label: "Quantity in Stock", type: "number", isRequired: true, min: 0 });
        fields.push({ name: "unit", label: "Unit", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.units) });
        fields.push({ name: "reorderLevel", label: "Reorder Level (low-stock warning)", type: "number", isRequired: true, min: 0, defaultValue: 10 });
        fields.push({ name: "unitPrice", label: "Selling Price per unit (₱, 0 = not for sale)", type: "number", isRequired: true, min: 0, defaultValue: 0 });
        fields.push({ name: "expiryDate", label: "Expiry Date", type: "date", isRequired: true });
        fields.push({ name: "batchNumber", label: "Batch / Lot Number", type: "text" });
        fields.push({ name: "supplier", label: "Supplier", type: "text" });

        fields.push({ sectionTitle: "Clinical Information" });
        fields.push({ name: "indications", label: "Used For (indications)", type: "textarea", isFullWidth: true });
        fields.push({ name: "warnings", label: "Warnings / Contraindications", type: "textarea", isFullWidth: true });
        fields.push({ name: "storageInstructions", label: "Storage Instructions", type: "text", isFullWidth: true });
        return fields;
    }

    openMedicationForm(medicationToEdit) {
        const page = this;
        const isEditing = medicationToEdit !== null;
        const fields = this.buildFormFields();

        let existingValues = {};
        let dialogTitle = "Add Medication";
        if (isEditing) {
            existingValues = medicationToEdit;
            dialogTitle = "Edit Medication";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Medication",
            onSave: function () {
                const formValues = formBuilder.readFormValues(fields);

                if (isEditing) {
                    formValues.id = medicationToEdit.id;
                } else {
                    formValues.id = "";
                }

                medicationService.saveMedication(formValues);
                if (isEditing) {
                    notifier.showSuccess("Medication updated successfully.");
                } else {
                    notifier.showSuccess("Medication added successfully.");
                }
                page.refreshAll();
            }
        });
        dialog.open();
    }

    // ---------- View dialog ----------

    openViewDialog(medication) {
        const rows = [
            ["Medicine ID", medication.id],
            ["Generic Name", medication.genericName],
            ["Brand Name", medication.brandName],
            ["Strength", medication.strength],
            ["Dosage Form", medication.form],
            ["Category", medication.category],
            ["Route", medication.route],
            ["Quantity in Stock", medication.stock + " " + medication.unit],
            ["Reorder Level", medication.reorderLevel],
             ["Selling Price (₱)", medication.unitPrice],
            ["Status", medicationService.getStockStatus(medication)],
            ["Batch / Lot Number", medication.batchNumber],
            ["Expiry Date", medication.expiryDate],
            ["Supplier", medication.supplier],
            ["Used For", medication.indications],
            ["Warnings", medication.warnings],
            ["Storage", medication.storageInstructions]
        ];

        let html = '<dl class="kv">';
        for (let i = 0; i < rows.length; i++) {
            let shownValue = rows[i][1];
            if (shownValue === "" || shownValue === undefined || shownValue === null) {
                shownValue = "-";
            }
            html += "<dt>" + rows[i][0] + "</dt><dd>" + htmlHelper.escapeText(shownValue) + "</dd>";
        }
        html += "</dl>";

        new ModalDialog(medicationService.getMedicationName(medication), html, { isWide: true }).open();
    }
}

const medicationsPage = new MedicationsPage();
medicationsPage.start();
