/*
 * MedicineStockPanel.js
 * Purpose: the "Medicine Stock Monitoring" section at the bottom of every dashboard.
 *
 * It uses the existing medicine list (medicationService), so the data comes from the
 * MySQL "medications" table through the existing api/storage.php. No new table is needed.
 *
 * Who can do what (uses the existing permissions):
 *   medications.view   -> Admin, Staff and Doctor can see the section.
 *   medications.manage -> only Admin and Staff see the Add / Edit / Update Stock buttons.
 *
 * Stock status rules (stock = quantity on hand, minimum = the medicine's reorder level):
 *   Out of Stock    stock is 0
 *   Critically Low  stock is at or below the critical level (see criticalPercent below)
 *   Low Stock       stock is at or below the minimum, but above the critical level
 *   In Stock        stock is above the minimum
 *
 * Expiration rules:
 *   Expired         the expiry date has passed (not available for dispensing)
 *   Expiring Soon   the expiry date is within expiringSoonDays days
 *   Expiring Later  the expiry date is further away
 */
class MedicineStockPanel {
    constructor() {
        // ----- Settings you can change -----
        // A medicine is "Critically Low" when stock is at or below this percent of its minimum level.
        // Example: minimum 20 and 50 percent -> critical level is 10.
        this.criticalPercent = 50;
        // A medicine is "Expiring Soon" when it expires within this many days.
        this.expiringSoonDays = 30;

        this.stockStatuses = ["In Stock", "Low Stock", "Critically Low", "Out of Stock"];
        this.expiryStatuses = ["Expired", "Expiring Soon", "Expiring Later"];

        this.searchKeyword = "";
        this.filterStockStatus = "";
        this.filterExpiryStatus = "";
    }

    // Called by DashboardPage after the dashboard is drawn. It only adds to the end of the page.
    show(mainElement) {
        if (!permissionService.userCan("medications.view")) {
            return;
        }
        if (document.getElementById("medicineStockSection") !== null) {
            return;
        }

        mainElement.insertAdjacentHTML("beforeend", this.buildSectionHtml());
        this.connectEvents();
        this.refreshAll();
    }

    // ---------- Status rules ----------

    // The stock quantity that counts as "critically low" for this medicine.
    getCriticalLevel(medication) {
        const minimum = Number(medication.reorderLevel) || 0;
        return Math.floor(minimum * this.criticalPercent / 100);
    }

    getStockStatus(medication) {
        // Stock can never be shown as negative.
        const stock = Math.max(0, Number(medication.stock) || 0);
        const minimum = Number(medication.reorderLevel) || 0;

        if (stock === 0) {
            return "Out of Stock";
        }
        if (stock <= this.getCriticalLevel(medication)) {
            return "Critically Low";
        }
        if (stock <= minimum) {
            return "Low Stock";
        }
        return "In Stock";
    }

    getExpiryStatus(medication) {
        if (!medication.expiryDate) {
            return "Not Set";
        }
        if (medication.expiryDate < dateHelper.getTodayString()) {
            return "Expired";
        }
        if (medication.expiryDate <= dateHelper.getDateWithOffset(this.expiringSoonDays)) {
            return "Expiring Soon";
        }
        return "Expiring Later";
    }

    // ---------- Page layout ----------

    buildSectionHtml() {
        let html = '<div class="card" id="medicineStockSection">';
        html += "<h3>Medicine Stock Monitoring</h3>";
        html += '<p class="stock-hint">Critically low means stock is at or below ' + this.criticalPercent +
            "% of the minimum stock level. Expiring soon means within " + this.expiringSoonDays + " days.</p>";
        html += '<div class="grid" id="stockCards"></div>';

        html += '<div class="toolbar">';
        html += '<input id="stockSearchInput" placeholder="Search medicine name...">';
        html += '<select id="stockStatusFilter"><option value="">All stock statuses</option>';
        for (let i = 0; i < this.stockStatuses.length; i++) {
            html += "<option>" + this.stockStatuses[i] + "</option>";
        }
        html += "</select>";
        html += '<select id="expiryStatusFilter"><option value="">All expiration statuses</option>';
        for (let i = 0; i < this.expiryStatuses.length; i++) {
            html += "<option>" + this.expiryStatuses[i] + "</option>";
        }
        html += "</select>";
        html += '<span class="sp"></span>';
        if (permissionService.userCan("medications.manage")) {
            html += '<button class="btn" id="addStockMedicineButton">+ Add Medicine</button>';
        }
        html += "</div>";

        html += '<div id="stockTable"></div>';
        html += "</div>";
        return html;
    }

    connectEvents() {
        const panel = this;

        document.getElementById("stockSearchInput").addEventListener("input", function (event) {
            panel.searchKeyword = event.target.value.toLowerCase().trim();
            panel.refreshTable();
        });
        document.getElementById("stockStatusFilter").addEventListener("change", function (event) {
            panel.filterStockStatus = event.target.value;
            panel.refreshTable();
        });
        document.getElementById("expiryStatusFilter").addEventListener("change", function (event) {
            panel.filterExpiryStatus = event.target.value;
            panel.refreshTable();
        });

        const addButton = document.getElementById("addStockMedicineButton");
        if (addButton !== null) {
            addButton.addEventListener("click", function () {
                panel.openMedicineForm(null);
            });
        }

        document.getElementById("stockTable").addEventListener("click", function (event) {
            panel.handleTableButtonClick(event);
        });
    }

    // Reads the medicines again and redraws the cards and the table.
    refreshAll() {
        const tableElement = document.getElementById("stockTable");
        try {
            const medications = medicationService.getAllMedications();
            this.refreshCards(medications);
            this.refreshTable(medications);
        } catch (error) {
            document.getElementById("stockCards").innerHTML = "";
            tableElement.innerHTML = '<div class="err">The medicine inventory could not be loaded. ' +
                htmlHelper.escapeText(error.message) + "</div>";
        }
    }

    // ---------- Summary cards ----------

    refreshCards(medications) {
        let lowCount = 0;
        let criticalCount = 0;
        let outCount = 0;
        let soonCount = 0;
        let expiredCount = 0;

        for (let i = 0; i < medications.length; i++) {
            const stockStatus = this.getStockStatus(medications[i]);
            const expiryStatus = this.getExpiryStatus(medications[i]);

            if (stockStatus === "Low Stock") { lowCount = lowCount + 1; }
            if (stockStatus === "Critically Low") { criticalCount = criticalCount + 1; }
            if (stockStatus === "Out of Stock") { outCount = outCount + 1; }
            if (expiryStatus === "Expiring Soon") { soonCount = soonCount + 1; }
            if (expiryStatus === "Expired") { expiredCount = expiredCount + 1; }
        }

        let html = "";
        html += htmlHelper.buildStatCard(medications.length, "Total Medicines");
        html += htmlHelper.buildStatCard(lowCount, "Low-Stock Medicines");
        html += htmlHelper.buildStatCard(criticalCount, "Critically Low Medicines");
        html += htmlHelper.buildStatCard(outCount, "Out-of-Stock Medicines");
        html += htmlHelper.buildStatCard(soonCount, "Nearing Expiration");
        html += htmlHelper.buildStatCard(expiredCount, "Expired Medicines");
        document.getElementById("stockCards").innerHTML = html;
    }

    // ---------- Table ----------

    getFilteredMedications(medications) {
        const result = [];

        for (let i = 0; i < medications.length; i++) {
            const medication = medications[i];

            if (this.filterStockStatus !== "" && this.getStockStatus(medication) !== this.filterStockStatus) {
                continue;
            }
            if (this.filterExpiryStatus !== "" && this.getExpiryStatus(medication) !== this.filterExpiryStatus) {
                continue;
            }

            const searchableText = (medication.id + " " + medication.genericName + " " + (medication.brandName || "")).toLowerCase();
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

    // "medications" is optional: when it is not given, the list is read again.
    refreshTable(medications) {
        const tableElement = document.getElementById("stockTable");
        const panel = this;

        let allMedications = medications;
        if (allMedications === undefined) {
            try {
                allMedications = medicationService.getAllMedications();
            } catch (error) {
                tableElement.innerHTML = '<div class="err">The medicine inventory could not be loaded. ' +
                    htmlHelper.escapeText(error.message) + "</div>";
                return;
            }
        }

        const columns = [
            { title: "Medicine ID", getCellHtml: function (item) { return htmlHelper.escapeText(item.id); } },
            { title: "Medicine Name", getCellHtml: function (item) { return htmlHelper.escapeText(medicationService.getMedicationName(item)); } },
            { title: "Category", getCellHtml: function (item) { return htmlHelper.escapeText(item.category || "-"); } },
            { title: "Available Stock", getCellHtml: function (item) { return htmlHelper.escapeText(Math.max(0, Number(item.stock) || 0)); } },
            { title: "Unit", getCellHtml: function (item) { return htmlHelper.escapeText(item.unit || "-"); } },
            { title: "Minimum Stock", getCellHtml: function (item) { return htmlHelper.escapeText(item.reorderLevel); } },
            { title: "Expiration Date", getCellHtml: function (item) { return htmlHelper.escapeText(item.expiryDate || "-"); } },
            { title: "Stock Status", getCellHtml: function (item) { return htmlHelper.buildStatusBadge(panel.getStockStatus(item)); } },
            { title: "Expiration Status", getCellHtml: function (item) { return panel.buildExpiryCellHtml(item); } },
            { title: "Action", getCellHtml: function (item) { return panel.buildActionButtons(item); } }
        ];

        let emptyMessage = "No medicine records found.";
        if (allMedications.length === 0) {
            emptyMessage = "No medicine records are available yet.";
        }
        tableElement.innerHTML = tableBuilder.buildTableHtml(columns, this.getFilteredMedications(allMedications), emptyMessage);
    }

    // The expiration badge. An expired medicine also gets a note, because it cannot be dispensed.
    buildExpiryCellHtml(medication) {
        const status = this.getExpiryStatus(medication);
        let html = htmlHelper.buildStatusBadge(status);
        if (status === "Expired") {
            html += '<span class="stock-note">Not available for dispensing</span>';
        }
        return html;
    }

    // Only users who may manage medicines (Admin and Staff) get buttons. Doctors see "-".
    buildActionButtons(medication) {
        if (!permissionService.userCan("medications.manage")) {
            return "-";
        }
        const id = htmlHelper.escapeText(medication.id);
        let html = '<button class="btn sm ghost" data-stock-action="update" data-id="' + id + '">Update Stock</button>';
        html += '<button class="btn sm ghost" data-stock-action="edit" data-id="' + id + '">Edit</button>';
        return html;
    }

    handleTableButtonClick(event) {
        const button = event.target.closest("button[data-stock-action]");
        if (button === null) {
            return;
        }

        try {
            const medication = medicationService.getMedicationById(button.getAttribute("data-id"));
            if (medication === null) {
                throw new Error("Medication not found.");
            }
            if (button.getAttribute("data-stock-action") === "update") {
                this.openUpdateStockForm(medication);
            } else {
                this.openMedicineForm(medication);
            }
        } catch (error) {
            notifier.showError(error.message);
        }
    }

    // ---------- Update stock ----------

    openUpdateStockForm(medication) {
        const panel = this;
        const fields = [
            { name: "stock", label: "New quantity in stock (" + (medication.unit || "units") + ")", type: "number",
                isRequired: true, min: 0, isFullWidth: true }
        ];

        let bodyHtml = '<p class="popup-lead">' + htmlHelper.escapeText(medicationService.getMedicationLabel(medication)) +
            " - current stock: <b>" + htmlHelper.escapeText(medication.stock) + "</b></p>";
        bodyHtml += formBuilder.buildFormHtml(fields, { stock: medication.stock });

        const dialog = new ModalDialog("Update Stock", bodyHtml, {
            saveButtonText: "Save Stock",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);

                // Keep every other field as it is, and change only the stock.
                const data = Object.assign({}, medication);
                data.stock = values.stock;

                // The service checks the permission and that stock is a whole number of 0 or more.
                medicationService.saveMedication(data);
                notifier.showSuccess("Stock updated.");
                panel.refreshAll();
            }
        });
        dialog.open();
    }

    // ---------- Add / Edit medicine ----------

    buildFormFields() {
        return [
            { name: "genericName", label: "Generic Name", type: "text", isRequired: true },
            { name: "brandName", label: "Brand Name", type: "text" },
            { name: "strength", label: "Strength (example: 500 mg)", type: "text", isRequired: true },
            { name: "form", label: "Dosage Form", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.dosageForms) },
            { name: "category", label: "Category", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.categories) },
            { name: "route", label: "Route of Administration", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.routes) },
            { name: "stock", label: "Quantity in Stock", type: "number", isRequired: true, min: 0 },
            { name: "unit", label: "Unit", type: "select", options: formBuilder.createOptionsFromTexts(medicationService.units) },
            { name: "reorderLevel", label: "Minimum Stock Level", type: "number", isRequired: true, min: 0, defaultValue: 10 },
            { name: "unitPrice", label: "Selling Price per unit (₱, 0 = not for sale)", type: "number", isRequired: true, min: 0, defaultValue: 0 },
            { name: "expiryDate", label: "Expiration Date", type: "date", isRequired: true }
        ];
    }

    // medicationToEdit is null when adding a new medicine.
    openMedicineForm(medicationToEdit) {
        const panel = this;
        const isEditing = medicationToEdit !== null;
        const fields = this.buildFormFields();

        let existingValues = {};
        let dialogTitle = "Add Medicine";
        if (isEditing) {
            existingValues = medicationToEdit;
            dialogTitle = "Edit Medicine";
        }

        const dialog = new ModalDialog(dialogTitle, formBuilder.buildFormHtml(fields, existingValues), {
            isWide: true,
            saveButtonText: "Save Medicine",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                let data = null;

                if (isEditing) {
                    // Fields that are not in this form (indications, warnings...) stay unchanged.
                    data = Object.assign({}, medicationToEdit, values);
                    data.id = medicationToEdit.id;
                } else {
                    data = values;
                    data.id = "";
                }

                medicationService.saveMedication(data);
                if (isEditing) {
                    notifier.showSuccess("Medicine updated successfully.");
                } else {
                    notifier.showSuccess("Medicine added successfully.");
                }
                panel.refreshAll();
            }
        });
        dialog.open();
    }
}

const medicineStockPanel = new MedicineStockPanel();
