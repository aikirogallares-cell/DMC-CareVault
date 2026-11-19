/*
 * BillingPage.js
 * Purpose: bills for completed visits (services only), payment, receipts and sales statistics.
 * Payment is cash, GCash, Maya or bank transfer. Electronic payments need the reference number
 * and the tick box after the payment is checked in the clinic's app.
 * Medicines are not sold through billing. Admin sees the sales statistics and sets the service prices.
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
        // Creates bills for finished visits.
        try {
            billingService.syncBills();
        } catch (error) {
            this.mainElement.innerHTML = '<h2>Billing</h2><div class="err">' +
                htmlHelper.escapeText(error.message) +
                " Close the other DMC tabs, then log in again as admin or staff in this browser.</div>";
            return;
        }

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
    // This opens the bill of that visit straight away.
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
        html += htmlHelper.buildStatCard(this.formatPeso(report.medicineSales), "Medicine Sales (older bills)");
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

    // Services are charged. Medicine lines only exist on bills from before medicines moved out of billing.
    buildItemsSummaryHtml(bill) {
        const parts = [];
        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            if (item.type === "service") {
                parts.push(item.name);
            } else if (item.decision === "Buy here") {
                parts.push(item.name + " (bought here)");
            } else {
                parts.push(item.name + " (not charged)");
            }
        }
        return htmlHelper.escapeText(parts.join(", "));
    }

    // ---------- Bill dialog (open bills: choose the payment method and confirm) ----------

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
        const subtotal = billingService.calculateTotal(bill.items);

        let html = '<dl class="kv">';
        html += "<dt>Bill ID</dt><dd>" + safe(bill.id) + "</dd>";
        html += "<dt>Patient</dt><dd>" + safe(patientService.getPatientNameById(bill.patientId)) + "</dd>";
        html += "<dt>Visit Date</dt><dd>" + safe(bill.visitDate) + "</dd>";
        html += "<dt>Doctor</dt><dd>" + safe(userService.getFullNameByUsername(bill.doctorUsername)) + "</dd>";
        html += "<dt>Status</dt><dd>" + htmlHelper.buildStatusBadge(bill.status) + "</dd>";
        html += "</dl>";

        html += '<div class="tw"><table><thead><tr>';
        html += "<th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th>";
        html += "</tr></thead><tbody>";
        for (let i = 0; i < bill.items.length; i++) {
            html += this.buildBillRowHtml(bill.items[i]);
        }
        html += "</tbody></table></div>";

        // The discount choice starts on what the patient's record says (Senior Citizen or PWD).
        const patient = patientService.getPatientById(bill.patientId);
        const suggested = billingService.getSuggestedDiscount(patient);
        let suggestedIdNumber = "";
        if (patient !== null && suggested === "Senior Citizen") { suggestedIdNumber = patient.seniorNumber || ""; }
        if (patient !== null && suggested === "PWD") { suggestedIdNumber = patient.pwdNumber || ""; }

        html += '<div class="bill-total">Subtotal: <b id="billSubtotalText" style="color:var(--tx)">' +
            this.formatPeso(subtotal) + "</b></div>";
        html += '<div class="bill-total" style="margin-top:2px">Discount: <b id="billDiscountText" style="color:var(--tx)">' +
            this.formatPeso(0) + "</b></div>";
        html += '<div class="bill-total" style="margin-top:2px">Total to pay: <b id="billTotalText">' +
            this.formatPeso(subtotal) + "</b></div>";

        // Discount box
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

        // Payment box
        html += '<div style="background:#f7fbf7;border:1px solid var(--bd);border-radius:10px;padding:14px 18px;margin-top:16px">';
        html += '<h4 style="color:var(--g);margin:0 0 10px">Payment</h4>';
        html += '<div style="max-width:450px"><label for="paymentMethod">Payment method *</label>';
        html += '<select id="paymentMethod"><option value="Cash">Cash</option><option value="GCash">GCash</option>';
        html += '<option value="Maya">Maya</option><option value="Bank transfer">Bank transfer</option></select></div>';

        // Cash only
        html += '<div id="cashBox" style="max-width:450px;margin-top:12px">';
        html += '<label for="cashReceivedInput">Cash received (₱) *</label>';
        html += '<input id="cashReceivedInput" type="number" min="0" step="1" inputmode="numeric" placeholder="Enter the cash given">';
        html += '<div class="cash-change">Change: <b id="cashChangeText">-</b></div>';
        html += "</div>";

        // GCash, Maya and bank transfer only
        html += '<div id="electronicBox" style="display:none;max-width:450px;margin-top:12px">';
        html += '<label for="amountPaid">Amount paid (₱), must equal the total *</label>';
        html += '<input id="amountPaid" type="number" min="0" step="1" inputmode="numeric">';
        html += '<label for="paymentReference" style="margin-top:12px">Reference number from the patient\'s receipt *</label>';
        html += '<input id="paymentReference" placeholder="e.g. GC1234567890" maxlength="30">';
        html += '<label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px;color:var(--tx)">';
        html += '<input type="checkbox" id="paymentVerified" style="width:auto"> I checked this payment in the clinic\'s app</label>';
        html += '<p style="margin:8px 0 0;font-size:12px;color:var(--tx2)">Open the clinic\'s own GCash, Maya or bank app and find the payment before ticking the box.</p>';
        html += "</div>";
        html += "</div>";

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
            page.updateDialogTotal(dialogElement, subtotal);
        });
        dialogElement.addEventListener("input", function () {
            page.updateDialogTotal(dialogElement, subtotal);
        });
        this.updateDialogTotal(dialogElement, subtotal);
    }

    // One row per item. Charged items show the full amount. Medicine lines (old bills) are marked as not charged.
    buildBillRowHtml(item) {
        const safe = htmlHelper.escapeText;
        const note = item.type === "medicine" ? "<br><small>Not charged here</small>" : "";

        return "<tr><td>" + safe(item.name) + note + "</td>" +
            "<td>" + item.quantity + "</td>" +
            "<td>" + this.formatPeso(item.unitPrice) + "</td>" +
            "<td>" + this.formatPeso(item.amount) + "</td></tr>";
    }

    // Keeps the discount, total, change and payment boxes in step with what the staff member chose.
    // subtotal: the sum of the services on the bill.
    updateDialogTotal(dialogElement, subtotal) {
        const discountType = dialogElement.querySelector("#discountType").value;
        const discount = billingService.calculateDiscount(subtotal, discountType);
        const total = subtotal - discount;

        dialogElement.querySelector("#billSubtotalText").textContent = this.formatPeso(subtotal);
        dialogElement.querySelector("#billDiscountText").textContent = discount > 0
            ? "-" + this.formatPeso(discount)
            : this.formatPeso(0);
        dialogElement.querySelector("#billTotalText").textContent = this.formatPeso(total);
        dialogElement.querySelector("#discountDetails").style.display = discountType === "None" ? "none" : "block";

        // Remembered so the amount box can be filled in for electronic payments.
        dialogElement.setAttribute("data-total", String(total));

        this.togglePaymentFields(dialogElement);

        const method = dialogElement.querySelector("#paymentMethod").value;
        if (method !== "Cash") {
            return;
        }

        const cashText = dialogElement.querySelector("#cashReceivedInput").value.trim();
        const changeElement = dialogElement.querySelector("#cashChangeText");
        if (cashText === "") {
            changeElement.textContent = "-";
            return;
        }
        const change = Number(cashText) - total;
        changeElement.textContent = change < 0
            ? "Short by " + this.formatPeso(-change)
            : this.formatPeso(change);
    }

    // Shows the cash box for Cash, and the reference box for GCash, Maya and bank transfer.
    togglePaymentFields(dialogElement) {
        const method = dialogElement.querySelector("#paymentMethod").value;
        const isCash = method === "Cash";

        dialogElement.querySelector("#cashBox").style.display = isCash ? "block" : "none";
        dialogElement.querySelector("#electronicBox").style.display = isCash ? "none" : "block";

        // Fills in the total the first time an electronic method is chosen. Staff can still change it.
        const amountBox = dialogElement.querySelector("#amountPaid");
        if (!isCash && amountBox.value === "") {
            amountBox.value = dialogElement.getAttribute("data-total") || "";
        }
    }

    readDiscount(dialogElement) {
        return {
            type: dialogElement.querySelector("#discountType").value,
            idNumber: dialogElement.querySelector("#discountIdNumber").value.trim(),
            idChecked: dialogElement.querySelector("#discountIdChecked").checked
        };
    }

    // Returns the object that billingService.markPaid expects.
    readPayment(dialogElement) {
        const method = dialogElement.querySelector("#paymentMethod").value;

        if (method === "Cash") {
            return {
                method: "Cash",
                cashReceived: dialogElement.querySelector("#cashReceivedInput").value.trim()
            };
        }
        return {
            method: method,
            reference: dialogElement.querySelector("#paymentReference").value.trim(),
            amountPaid: dialogElement.querySelector("#amountPaid").value.trim(),
            verified: dialogElement.querySelector("#paymentVerified").checked
        };
    }

    // Takes the payment, then shows the receipt.
    // If the payment is refused (short cash, duplicate reference, missing tick box), the error
    // shows in the dialog and the bill stays open.
    confirmPayment(billId, openDialog) {
        const dialogElement = openDialog.getElement();
        const paidBill = billingService.markPaid(
            billId,
            this.readPayment(dialogElement),
            this.readDiscount(dialogElement)
        );

        notifier.showSuccess("Payment recorded.");
        this.refreshStats();
        this.refreshBills();
        this.showReceipt(paidBill, true);
    }

    // ---------- Receipt ----------

    // isJustPaid is true right after a payment. The receipt then offers two choices:
    // stay on Billing, or go back to Queuing. Closing the receipt with X keeps staff on Billing.
    // An old receipt opened from the bill list has no choices and only closes.
    showReceipt(bill, isJustPaid) {
        let bodyHtml = this.buildReceiptHtml(bill);
        if (isJustPaid === true) {
            bodyHtml += '<div class="popup-actions">' +
                '<button class="btn ghost" id="receiptStayButton">Stay in Billing</button>' +
                '<button class="btn" id="receiptQueueButton">Back to Queuing</button></div>';
        }

        const dialog = new ModalDialog("Receipt - " + bill.id, bodyHtml, {});
        dialog.open();

        if (isJustPaid === true) {
            const dialogElement = dialog.getElement();
            dialogElement.querySelector("#receiptStayButton").addEventListener("click", function () {
                dialog.close();
            });
            dialogElement.querySelector("#receiptQueueButton").addEventListener("click", function () {
                window.location.href = "appointments.html";
            });
        }
    }

    // The receipt lists only what was charged: the services, and any old medicine lines bought here.
    buildReceiptHtml(bill) {
        const safe = htmlHelper.escapeText;
        const settings = settingsService.getSettings();
        const paidWhen = bill.paidAt ? dateHelper.formatDateTime(bill.paidAt) : bill.paidDate;
        const method = bill.paymentMethod || "Cash";
        const isCash = method === "Cash";

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

        const notCharged = [];
        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            const isCharged = item.type === "service" || item.decision === "Buy here";

            if (!isCharged) {
                notCharged.push(item.name);
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
        html += '<div class="receipt-line"><span>Payment method</span><span>' + safe(method) + "</span></div>";

        if (isCash) {
            html += '<div class="receipt-line"><span>Cash received</span><span>' + this.formatMoneyOrDash(bill.cashReceived) + "</span></div>";
            html += '<div class="receipt-line"><span>Change</span><span>' + this.formatMoneyOrDash(bill.change) + "</span></div>";
        } else {
            html += '<div class="receipt-line"><span>Reference No.</span><span>' + safe(bill.paymentReference || "-") + "</span></div>";
        }

        if (notCharged.length > 0) {
            html += '<hr class="receipt-rule"><small>Not charged here: ' + safe(notCharged.join(", ")) + "</small>";
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