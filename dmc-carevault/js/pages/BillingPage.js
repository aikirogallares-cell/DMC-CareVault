/*
 * BillingPage.js
 * Purpose: bills, cash payment, receipts and sales statistics.
 * Bills are made automatically when a visit is completed, and the patient's prescriptions for that day
 * are added as medicine lines. The patient decides which medicines to buy here. The only payment
 * method is cash. After a successful payment a receipt is shown.
 * Admin sees the sales statistics and sets the service prices.
 */
class BillingPage {
    constructor() {
        this.mainElement = null;
        this.billStatusFilter = "Open";
        this.billSearchKeyword = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("billing");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.showPage();
        });
    }

    formatPeso(value) {
        return "₱" + Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Shows "-" for a value that was not recorded (for example, bills paid before cash was tracked).
    formatMoneyOrDash(value) {
        if (value === undefined || value === null) {
            return "-";
        }
        return this.formatPeso(value);
    }

    // ---------- Layout ----------

    showPage() {
        // Creates bills for finished visits and adds prescriptions that are not on a bill yet.
        billingService.syncBills();

        let html = "<h2>Billing</h2>";

        if (permissionService.userCan("billing.reports")) {
            html += '<div class="card"><h3>Sales Statistics</h3>';
            html += '<div class="toolbar"><select id="rangeSelect">';
            html += '<option value="today">Today</option><option value="week">This Week</option>';
            html += '<option value="month">This Month</option><option value="custom">Custom Date Range</option></select>';
            html += '<span>From</span><input type="date" id="startDate">';
            html += '<span>To</span><input type="date" id="endDate">';
            html += "</div>";
            html += '<div class="err" id="rangeMessage"></div>';
            html += '<div class="grid" id="salesCards"></div>';
            html += '<h4 style="color:var(--g)">Day by Day</h4>';
            html += '<div id="dailyTable"></div>';
            html += "</div>";
        }

        html += '<div class="card"><h3>Bills</h3>';
        html += '<div class="toolbar">';
        html += '<select id="billStatusFilter"><option value="Open">Open (waiting for payment)</option>';
        html += '<option value="Paid">Paid</option><option value="All">All</option></select>';
        html += '<input id="billSearch" placeholder="Search patient name...">';
        html += '<span class="sp"></span>';
        if (permissionService.userCan("billing.prices")) {
            html += '<button class="btn ghost" id="servicePricesButton">Service Prices</button>';
        }
        html += "</div>";
        html += '<div id="billTable"></div></div>';

        this.mainElement.innerHTML = html;
        this.connectEvents();
        this.refreshStats();
        this.refreshBills();
        this.openBillFromLink();
    }

    // The "Go to Billing" button of the notification opens billing.html?visit=A-0004.
    // This opens the bill of that visit straight away, so staff do not have to look for it.
    openBillFromLink() {
        const visitId = new URLSearchParams(window.location.search).get("visit");
        if (visitId === null) {
            return;
        }

        // Remove ?visit=... from the address, so refreshing the page does not open the bill again.
        try {
            window.history.replaceState(null, "", window.location.pathname);
        } catch (error) {
            // Some browsers do not allow this when the page is opened as a file. The bill still opens.
        }

        const bills = billingService.getBills("All");
        for (let i = 0; i < bills.length; i++) {
            if (bills[i].queueEntryId === visitId) {
                this.openBillDialog(bills[i].id);
                return;
            }
        }
        notifier.showWarning("The bill for this visit was not found.");
    }

    connectEvents() {
        const page = this;

        document.getElementById("billStatusFilter").addEventListener("change", function (event) {
            page.billStatusFilter = event.target.value;
            page.refreshBills();
        });
        document.getElementById("billSearch").addEventListener("input", function (event) {
            page.billSearchKeyword = event.target.value.toLowerCase().trim();
            page.refreshBills();
        });
        document.getElementById("billTable").addEventListener("click", function (event) {
            const button = event.target.closest("button[data-bill]");
            if (button !== null) {
                page.openBillDialog(button.getAttribute("data-bill"));
            }
        });

        const pricesButton = document.getElementById("servicePricesButton");
        if (pricesButton !== null) {
            pricesButton.addEventListener("click", function () {
                page.openServicePricesDialog();
            });
        }

        const rangeSelect = document.getElementById("rangeSelect");
        if (rangeSelect !== null) {
            rangeSelect.addEventListener("change", function () {
                page.applyQuickRange();
                page.refreshStats();
            });
            const dateBoxes = [document.getElementById("startDate"), document.getElementById("endDate")];
            for (let i = 0; i < dateBoxes.length; i++) {
                dateBoxes[i].addEventListener("change", function () {
                    document.getElementById("rangeSelect").value = "custom";
                    page.refreshStats();
                });
            }
            this.applyQuickRange();
        }
    }

    // ---------- Date range ----------

    // Fills the From and To boxes for Today / This Week / This Month. "Custom" keeps the typed dates.
    applyQuickRange() {
        const choice = document.getElementById("rangeSelect").value;
        const today = dateHelper.getTodayString();
        const startBox = document.getElementById("startDate");
        const endBox = document.getElementById("endDate");

        if (choice === "today") {
            startBox.value = today;
            endBox.value = today;
        } else if (choice === "week") {
            startBox.value = dateHelper.getStartOfWeekString();
            endBox.value = today;
        } else if (choice === "month") {
            startBox.value = dateHelper.getStartOfMonthString();
            endBox.value = today;
        }
    }

    getSelectedRange() {
        let start = document.getElementById("startDate").value;
        let end = document.getElementById("endDate").value;
        if (start === "") { start = "0000-01-01"; }
        if (end === "") { end = "9999-12-31"; }
        return { start: start, end: end };
    }

    // ---------- Statistics ----------

    refreshStats() {
        const cardsElement = document.getElementById("salesCards");
        if (cardsElement === null) {
            return;
        }

        const range = this.getSelectedRange();
        const messageElement = document.getElementById("rangeMessage");
        if (range.start > range.end) {
            messageElement.textContent = "The start date cannot be after the end date.";
            cardsElement.innerHTML = "";
            document.getElementById("dailyTable").innerHTML = "";
            return;
        }
        messageElement.textContent = "";

        const report = billingService.getSalesReport(range.start, range.end);

        let html = "";
        html += htmlHelper.buildStatCard(this.formatPeso(report.totalSales), "Total Sales");
        html += htmlHelper.buildStatCard(report.paidBillCount, "Paid Bills");
        html += htmlHelper.buildStatCard(report.patientsServed, "Patients Served");
        html += htmlHelper.buildStatCard(report.newPatients, "New Patients");
        html += htmlHelper.buildStatCard(this.formatPeso(report.newPatientSales), "Earned from New Patients");
        html += htmlHelper.buildStatCard(this.formatPeso(report.returningPatientSales), "Earned from Returning Patients");
        html += htmlHelper.buildStatCard(this.formatPeso(report.serviceSales), "Services Sold");
        html += htmlHelper.buildStatCard(this.formatPeso(report.medicineSales), "Medicines Sold");
        html += htmlHelper.buildStatCard(this.formatPeso(report.discountTotal), "Senior / PWD Discounts Given");
        cardsElement.innerHTML = html;

        const page = this;
        const columns = [
            { title: "Date", getCellHtml: function (day) { return day.date; } },
            { title: "Paid Bills", getCellHtml: function (day) { return day.bills; } },
            { title: "Sales", getCellHtml: function (day) { return page.formatPeso(day.sales); } },
            { title: "New Patients", getCellHtml: function (day) { return day.newPatients; } },
            { title: "Earned from New Patients", getCellHtml: function (day) { return page.formatPeso(day.newPatientSales); } }
        ];
        document.getElementById("dailyTable").innerHTML =
            tableBuilder.buildTableHtml(columns, report.days, "No sales or new patients in this range.");
    }

    // ---------- Bill list ----------

    refreshBills() {
        const page = this;
        const billList = billingService.getBills(this.billStatusFilter).filter(function (bill) {
            if (page.billSearchKeyword === "") {
                return true;
            }
            return patientService.getPatientNameById(bill.patientId).toLowerCase().includes(page.billSearchKeyword);
        });

        const columns = [
            { title: "Bill", getCellHtml: function (bill) { return htmlHelper.escapeText(bill.id); } },
            { title: "Visit Date", getCellHtml: function (bill) { return bill.visitDate; } },
            { title: "Patient", getCellHtml: function (bill) { return htmlHelper.escapeText(patientService.getPatientNameById(bill.patientId)); } },
            { title: "Doctor", getCellHtml: function (bill) { return htmlHelper.escapeText(userService.getFullNameByUsername(bill.doctorUsername)); } },
            { title: "Items", getCellHtml: function (bill) { return page.buildItemsSummaryHtml(bill); } },
            { title: "Total", getCellHtml: function (bill) { return page.formatPeso(billingService.getBillTotal(bill)); } },
            { title: "Status", getCellHtml: function (bill) { return htmlHelper.buildStatusBadge(bill.status); } },
            { title: "Action", getCellHtml: function (bill) {
                const buttonText = bill.status === "Open" ? "Open" : "View";
                return '<button class="btn sm ghost" data-bill="' + htmlHelper.escapeText(bill.id) + '">' + buttonText + "</button>";
            } }
        ];

        document.getElementById("billTable").innerHTML =
            tableBuilder.buildTableHtml(columns, billList, "No bills found.");
    }

    buildItemsSummaryHtml(bill) {
        const parts = [];
        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            if (item.type === "service") {
                parts.push(item.name);
            } else if (item.decision === "Buy here") {
                parts.push(item.name + " (bought here)");
            } else {
                parts.push(item.name + " (not bought)");
            }
        }
        return htmlHelper.escapeText(parts.join(", "));
    }

    // ---------- Bill dialog (open bills: choose and pay in cash) ----------

    // Open bills show the payment form. Paid bills show their receipt.
    openBillDialog(billId) {
        const page = this;
        const bill = billingService.getBillById(billId);
        if (bill === null) {
            notifier.showError("Bill not found.");
            return;
        }

        if (bill.status === "Paid") {
            this.showReceipt(bill);
            return;
        }

        const safe = htmlHelper.escapeText;

        let html = '<dl class="kv">';
        html += "<dt>Bill ID</dt><dd>" + safe(bill.id) + "</dd>";
        html += "<dt>Patient</dt><dd>" + safe(patientService.getPatientNameById(bill.patientId)) + "</dd>";
        html += "<dt>Visit Date</dt><dd>" + safe(bill.visitDate) + "</dd>";
        html += "<dt>Doctor</dt><dd>" + safe(userService.getFullNameByUsername(bill.doctorUsername)) + "</dd>";
        html += "<dt>Status</dt><dd>" + htmlHelper.buildStatusBadge(bill.status) + "</dd>";
        html += "</dl>";

        html += '<div class="tw"><table><thead><tr>';
        html += "<th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th><th>Decision</th>";
        html += "</tr></thead><tbody>";
        for (let i = 0; i < bill.items.length; i++) {
            html += this.buildBillRowHtml(bill.items[i], true);
        }
        html += "</tbody></table></div>";

        // The discount choice starts on what the patient's record says (Senior Citizen or PWD).
        const patient = patientService.getPatientById(bill.patientId);
        const suggested = billingService.getSuggestedDiscount(patient);
        let suggestedIdNumber = "";
        if (patient !== null && suggested === "Senior Citizen") { suggestedIdNumber = patient.seniorNumber || ""; }
        if (patient !== null && suggested === "PWD") { suggestedIdNumber = patient.pwdNumber || ""; }

        html += '<div class="bill-total">Subtotal: <b id="billSubtotalText" style="color:var(--tx)">' +
            this.formatPeso(billingService.getBillTotal(bill)) + "</b></div>";
        html += '<div class="bill-total" style="margin-top:2px">Discount: <b id="billDiscountText" style="color:var(--tx)">' +
            this.formatPeso(0) + "</b></div>";
        html += '<div class="bill-total" style="margin-top:2px">Total to pay: <b id="billTotalText">' +
            this.formatPeso(billingService.getBillTotal(bill)) + "</b></div>";

        html += '<div style="background:#f7fbf7;border:1px solid var(--bd);border-radius:10px;padding:14px 18px;margin-top:16px">';
        html += '<h4 style="color:var(--g);margin:0 0 10px">Senior Citizen / PWD discount</h4>';
        html += '<div style="max-width:450px"><label for="discountType">Discount</label>';
        html += '<select id="discountType"><option value="None">No discount</option>';
        html += '<option value="Senior Citizen">Senior Citizen (20%)</option><option value="PWD">PWD (20%)</option></select></div>';
        html += '<div id="discountDetails">';
        html += '<div style="max-width:450px;margin-top:12px"><label for="discountIdNumber">ID number shown by the patient</label>';
        html += '<input id="discountIdNumber" value="' + safe(suggestedIdNumber) + '"></div>';
        html += '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px;color:var(--tx)">';
        html += '<input type="checkbox" id="discountIdChecked" style="width:auto"> I checked the patient\'s ID and it matches</label>';
        html += '<p style="margin:8px 0 0;font-size:12px;color:var(--tx2)">Ask for a valid Senior Citizen or PWD ID before giving the discount.</p>';
        html += "</div></div>";

        html += '<div class="cash-box">';
        html += '<label for="cashReceivedInput">Cash received (₱) *</label>';
        html += '<input id="cashReceivedInput" type="number" min="0" step="1" inputmode="numeric" placeholder="Enter the cash given">';
        html += "</div>";
        html += '<div class="cash-change">Change: <b id="cashChangeText">-</b></div>';

        const title = "Bill " + bill.id + " - " + patientService.getPatientNameById(bill.patientId);
        const dialog = new ModalDialog(title, html, {
            isWide: true,
            saveButtonText: "Confirm Payment",
            onSave: function (openDialog) {
                page.confirmPayment(billId, openDialog);
            }
        });
        dialog.open();

        const dialogElement = dialog.getElement();
        dialogElement.querySelector("#discountType").value = suggested;
        dialogElement.addEventListener("change", function () {
            page.updateDialogTotal(dialogElement);
        });
        dialogElement.addEventListener("input", function () {
            page.updateDialogTotal(dialogElement);
        });
        this.updateDialogTotal(dialogElement);
    }

    buildBillRowHtml(item, isOpen) {
        const safe = htmlHelper.escapeText;
        let decisionHtml = "";

        if (item.type === "service") {
            decisionHtml = "Included";
        } else if (isOpen && item.sellable) {
            decisionHtml = '<select data-decision-id="' + safe(item.id) + '">';
            decisionHtml += '<option value="Buy here"' + (item.decision === "Buy here" ? " selected" : "") + ">Buy here</option>";
            decisionHtml += '<option value="Not buying"' + (item.decision !== "Buy here" ? " selected" : "") + ">Not buying</option>";
            decisionHtml += "</select>";
        } else {
            decisionHtml = safe(item.decision);
            if (isOpen && item.note) {
                decisionHtml += " <small>(" + safe(item.note) + ")</small>";
            }
        }

        let nameHtml = safe(item.name);
        if (isOpen && item.note) {
            nameHtml += "<br><small>" + safe(item.note) + "</small>";
        }

        return '<tr data-item="' + safe(item.id) + '" data-type="' + item.type + '" data-amount="' + (Number(item.amount) || 0) + '">' +
            "<td>" + nameHtml + "</td>" +
            "<td>" + item.quantity + "</td>" +
            "<td>" + this.formatPeso(item.unitPrice) + "</td>" +
            "<td>" + this.formatPeso(item.amount) + "</td>" +
            "<td>" + decisionHtml + "</td></tr>";
    }

    // Reads the Buy here / Not buying choices from the open dialog.
    readDecisions(dialogElement) {
        const decisions = {};
        const selects = dialogElement.querySelectorAll("select[data-decision-id]");
        for (let i = 0; i < selects.length; i++) {
            decisions[selects[i].getAttribute("data-decision-id")] = selects[i].value;
        }
        return decisions;
    }

    // Keeps the total and the change on screen in step with the choices and the cash.
    updateDialogTotal(dialogElement) {
        const rows = dialogElement.querySelectorAll("tr[data-item]");
        let total = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const decisionBox = row.querySelector("select[data-decision-id]");
            const isService = row.getAttribute("data-type") === "service";
            const isBoughtHere = decisionBox !== null && decisionBox.value === "Buy here";
            if (isService || isBoughtHere) {
                total = total + Number(row.getAttribute("data-amount"));
            }
        }
        // Senior Citizen / PWD discount comes off the subtotal.
        const discountType = dialogElement.querySelector("#discountType").value;
        const subtotal = total;
        const discount = billingService.calculateDiscount(subtotal, discountType);
        total = subtotal - discount;

        dialogElement.querySelector("#billSubtotalText").textContent = this.formatPeso(subtotal);
        if (discount > 0) {
            dialogElement.querySelector("#billDiscountText").textContent = "-" + this.formatPeso(discount);
        } else {
            dialogElement.querySelector("#billDiscountText").textContent = this.formatPeso(0);
        }
        dialogElement.querySelector("#billTotalText").textContent = this.formatPeso(total);
        dialogElement.querySelector("#discountDetails").style.display = discountType === "None" ? "none" : "block";

        const cashText = dialogElement.querySelector("#cashReceivedInput").value.trim();
        const changeElement = dialogElement.querySelector("#cashChangeText");
        if (cashText === "") {
            changeElement.textContent = "-";
            return;
        }

        const change = Number(cashText) - total;
        if (change < 0) {
            changeElement.textContent = "Short by " + this.formatPeso(-change);
        } else {
            changeElement.textContent = this.formatPeso(change);
        }
    }

    // Saves the choices, takes the cash payment, then shows the receipt.
    // If the cash is short or stock is not enough, the error shows in the dialog and the bill stays open.
    confirmPayment(billId, openDialog) {
        const dialogElement = openDialog.getElement();
        billingService.saveDecisions(billId, this.readDecisions(dialogElement));

        const cashText = dialogElement.querySelector("#cashReceivedInput").value.trim();
        const discount = {
            type: dialogElement.querySelector("#discountType").value,
            idNumber: dialogElement.querySelector("#discountIdNumber").value.trim(),
            idChecked: dialogElement.querySelector("#discountIdChecked").checked
        };
        const paidBill = billingService.markPaid(billId, cashText, discount);

        notifier.showSuccess("Payment recorded. Medicine stock updated.");
        this.refreshStats();
        this.refreshBills();
        this.showReceipt(paidBill, true);
    }

    // ---------- Receipt ----------

    // isJustPaid is true right after a payment. Closing that receipt takes staff to the Queuing page,
    // so they can see which patient is next. An old receipt opened from the bill list only closes.
    showReceipt(bill, isJustPaid) {
        let bodyHtml = this.buildReceiptHtml(bill);
        if (isJustPaid === true) {
            bodyHtml += '<div class="popup-actions"><button class="btn" id="receiptQueueButton">Back to Queuing</button></div>';
        }

        const dialog = new ModalDialog("Receipt - " + bill.id, bodyHtml, {});
        dialog.open();

        if (isJustPaid === true) {
            const dialogElement = dialog.getElement();
            const goToQueue = function () {
                window.location.href = "appointments.html";
            };
            dialogElement.querySelector("#receiptQueueButton").addEventListener("click", goToQueue);
            // The X button does the same, so every payment ends on the Queuing page.
            dialogElement.querySelector("#dialogCloseButton").addEventListener("click", goToQueue);
        }
    }

    // The receipt lists only what was charged: the service and the medicines bought here.
    buildReceiptHtml(bill) {
        const safe = htmlHelper.escapeText;
        const settings = settingsService.getSettings();
        const paidWhen = bill.paidAt ? dateHelper.formatDateTime(bill.paidAt) : bill.paidDate;

        let html = '<div class="receipt">';
        html += '<div class="receipt-center"><b>' + safe(settings.clinicName) + "</b><br>" +
            safe(settings.systemName) + "<br><small>Receipt</small></div>";
        html += '<hr class="receipt-rule">';
        html += '<div class="receipt-line"><span>Receipt No.</span><span>' + safe(bill.id) + "</span></div>";
        html += '<div class="receipt-line"><span>Date</span><span>' + safe(paidWhen) + "</span></div>";
        html += '<div class="receipt-line"><span>Patient</span><span>' + safe(patientService.getPatientNameById(bill.patientId)) + "</span></div>";
        html += '<div class="receipt-line"><span>Doctor</span><span>' + safe(userService.getFullNameByUsername(bill.doctorUsername)) + "</span></div>";
        html += '<div class="receipt-line"><span>Cashier</span><span>' + safe(userService.getFullNameByUsername(bill.paidBy)) + "</span></div>";
        html += '<hr class="receipt-rule">';

        const notBought = [];
        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            const isCharged = item.type === "service" || item.decision === "Buy here";

            if (!isCharged) {
                notBought.push(item.name);
                continue;
            }

            html += '<div class="receipt-item"><div class="receipt-line"><span>' + safe(item.name) +
                "</span><span>" + this.formatPeso(item.amount) + "</span></div>";
            if (item.type === "medicine") {
                html += "<small>" + item.quantity + " x " + this.formatPeso(item.unitPrice) + "</small>";
            }
            html += "</div>";
        }

        html += '<hr class="receipt-rule">';
        if (bill.discountAmount > 0) {
            html += '<div class="receipt-line"><span>Subtotal</span><span>' + this.formatPeso(bill.subtotal) + "</span></div>";
            html += '<div class="receipt-line"><span>' + safe(bill.discountType) + " discount (" +
                Math.round(billingService.discountRate * 100) + '%)</span><span>-' + this.formatPeso(bill.discountAmount) + "</span></div>";
            html += "<small>ID No.: " + safe(bill.discountIdNumber) + "</small>";
        }
        html += '<div class="receipt-line receipt-total"><span>Total</span><span>' + this.formatPeso(bill.total) + "</span></div>";
        html += '<div class="receipt-line"><span>Payment method</span><span>' + safe(bill.paymentMethod || "Cash") + "</span></div>";
        html += '<div class="receipt-line"><span>Cash received</span><span>' + this.formatMoneyOrDash(bill.cashReceived) + "</span></div>";
        html += '<div class="receipt-line"><span>Change</span><span>' + this.formatMoneyOrDash(bill.change) + "</span></div>";

        if (notBought.length > 0) {
            html += '<hr class="receipt-rule"><small>Not bought here: ' + safe(notBought.join(", ")) + "</small>";
        }

        html += '<hr class="receipt-rule"><div class="receipt-center"><small>Thank you.</small></div>';
        html += "</div>";
        return html;
    }

    // ---------- Service prices (Admin) ----------

    openServicePricesDialog() {
        const page = this;
        const fees = billingService.getServiceFees();

        const fields = [];
        for (let i = 0; i < fees.length; i++) {
            fields.push({
                name: "fee" + i,
                label: fees[i].name + " (₱)",
                type: "number",
                isRequired: true,
                min: 0,
                defaultValue: fees[i].price
            });
        }

        const dialog = new ModalDialog("Service Prices", formBuilder.buildFormHtml(fields, {}), {
            saveButtonText: "Save Prices",
            onSave: function () {
                const values = formBuilder.readFormValues(fields);
                const newFees = [];
                for (let i = 0; i < fees.length; i++) {
                    newFees.push({ name: fees[i].name, price: values["fee" + i] });
                }
                billingService.saveServiceFees(newFees);
                notifier.showSuccess("Service prices saved.");
                page.refreshBills();
            }
        });
        dialog.open();
    }
}

const billingPage = new BillingPage();
billingPage.start();