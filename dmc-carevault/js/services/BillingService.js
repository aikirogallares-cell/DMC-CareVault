/*
 * BillingService.js
 * Purpose: bills for completed visits (services only), cash payment, discounts, and sales statistics.
 * Medicines are not sold through billing. The clinic keeps its medicine inventory in Medications,
 * and medicines are prescribed in Prescriptions. Older paid bills keep their medicine lines for history.
 */
class BillingService {
    constructor() {
        this.defaultServiceFees = [
            { name: "Check-up", price: 300 },
            { name: "X-ray", price: 500 },
            { name: "Urine Test", price: 150 },
            { name: "Blood Test", price: 350 },
            { name: "Getting Blood", price: 100 },
            { name: "Getting Urine", price: 80 }
        ];

        // Senior citizens and PWD get 20% off the whole bill (one discount per bill, never both).
        this.discountRate = 0.20;
        this.discountTypes = ["None", "Senior Citizen", "PWD"];
    }

    // ----- Service prices -----

    getServiceFees() {
        const savedFees = storageService.loadList("serviceFees");
        if (savedFees.length > 0) {
            return savedFees;
        }
        return this.defaultServiceFees.map(function (fee) {
            return { name: fee.name, price: fee.price };
        });
    }

    // A reason that is a service name (for example "X-ray") is priced from the service price list.
    // Any other typed reason (for example "cough and colds") is charged as a Check-up.
    findServicePrice(serviceName) {
        const fees = this.getServiceFees();
        const typedName = String(serviceName || "").trim().toLowerCase();
        let checkUpPrice = 0;

        for (let i = 0; i < fees.length; i++) {
            const feeName = String(fees[i].name).toLowerCase();
            if (feeName === typedName) {
                return Number(fees[i].price) || 0;
            }
            if (feeName === "check-up") {
                checkUpPrice = Number(fees[i].price) || 0;
            }
        }
        return checkUpPrice;
    }

    // newFees: [ { name, price } ]. Only Admin may change prices.
    saveServiceFees(newFees) {
        permissionService.requirePermission("billing.prices");

        const cleanFees = [];
        for (let i = 0; i < newFees.length; i++) {
            const error = validator.checkWholeNumber(newFees[i].name + " price", newFees[i].price);
            if (error !== "") {
                throw new Error(error);
            }
            cleanFees.push({ name: newFees[i].name, price: Number(newFees[i].price) });
        }

        storageService.saveList("serviceFees", cleanFees);
        auditLogService.recordAction("Service prices changed", cleanFees.length + " services");
    }

    // ----- Creating bills automatically -----

    // Runs every time the Billing page opens.
    syncBills() {
        permissionService.requirePermission("billing.view");

        const bills = storageService.loadList("bills");
        const appointments = storageService.loadList("appointments");

        const billedVisitIds = {};
        for (let i = 0; i < bills.length; i++) {
            billedVisitIds[bills[i].queueEntryId] = true;
        }

        const textBefore = JSON.stringify(bills);

        // 1. One bill for every finished visit.
        for (let i = 0; i < appointments.length; i++) {
            const visit = appointments[i];
            if (visit.status === "Completed" && !billedVisitIds[visit.id]) {
                bills.push(this.createBillForVisit(visit, bills));
                billedVisitIds[visit.id] = true;
            }
        }

        // 2. Open bills only carry services. Medicine lines from before this change are removed.
        for (let i = 0; i < bills.length; i++) {
            if (bills[i].status === "Open") {
                bills[i].items = bills[i].items.filter(function (item) {
                    return item.type !== "medicine";
                });
                bills[i].prescriptionIds = [];
            }
        }

        if (JSON.stringify(bills) !== textBefore) {
            storageService.saveList("bills", bills);
        }
    }

    createBillForVisit(visit, bills) {
        const servicePrice = this.findServicePrice(visit.reason);
        return {
            id: storageService.generateNextId("B", bills),
            queueEntryId: visit.id,
            patientId: visit.patientId,
            doctorUsername: visit.doctorUsername,
            visitDate: visit.date,
            createdAt: new Date().toISOString(),
            prescriptionIds: [],
            items: [
                {
                    id: "S-" + visit.id,
                    type: "service",
                    name: visit.reason,
                    quantity: 1,
                    unitPrice: servicePrice,
                    amount: servicePrice,
                    decision: "Included",
                    sellable: true,
                    note: ""
                }
            ],
            status: "Open",
            subtotal: 0,
            discountType: "None",
            discountIdNumber: "",
            discountAmount: 0,
            total: 0,
            paidDate: "",
            paidAt: "",
            paidBy: ""
        };
    }

    // ----- Totals -----

    // Only services are charged. Medicines are not part of the bill.
    calculateTotal(items) {
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type === "service") {
                total = total + (Number(items[i].amount) || 0);
            }
        }
        return total;
    }

    getBillTotal(bill) {
        if (bill.status === "Paid") {
            return bill.total;
        }
        return this.calculateTotal(bill.items);
    }

    // ----- Senior Citizen / PWD discount -----

    // The discount in whole pesos: 20% of the subtotal when a discount applies, otherwise 0.
    calculateDiscount(subtotal, discountType) {
        if (discountType !== "Senior Citizen" && discountType !== "PWD") {
            return 0;
        }
        return Math.round(subtotal * this.discountRate);
    }

    // The discount this patient's record qualifies for. Used to pre-select the choice on the bill.
    getSuggestedDiscount(patient) {
        if (patient === null || patient === undefined) {
            return "None";
        }
        if (patientService.isSenior(patient)) {
            return "Senior Citizen";
        }
        if (patient.pwd === "Yes") {
            return "PWD";
        }
        return "None";
    }

    // Checks the discount before payment. Throws an Error with the message to show.
    // discount: { type, idNumber, idChecked }
    checkDiscount(patient, discount) {
        if (!this.discountTypes.includes(discount.type)) {
            throw new Error("Choose a valid discount.");
        }
        if (discount.type === "None") {
            return;
        }
        if (patient === null || patient === undefined) {
            throw new Error("Patient record not found, so no discount can be given.");
        }

        if (discount.type === "Senior Citizen" && !patientService.isSenior(patient)) {
            throw new Error("This patient is not 60 years old or above, so the Senior Citizen discount cannot be given.");
        }
        if (discount.type === "PWD" && patient.pwd !== "Yes") {
            throw new Error("This patient is not registered as PWD, so the PWD discount cannot be given.");
        }

        const label = discount.type + " ID number";
        let error = validator.checkRequired(label, discount.idNumber);
        if (error !== "") {
            throw new Error(error);
        }
        error = validator.checkIdNumber(label, String(discount.idNumber).trim());
        if (error !== "") {
            throw new Error(error);
        }
        if (discount.idChecked !== true) {
            throw new Error("Check the patient's ID and tick the box to confirm before giving the discount.");
        }
    }

    // ----- Reading bills -----

    // statusFilter: "Open", "Paid" or "All". Newest bill first.
    getBills(statusFilter) {
        permissionService.requirePermission("billing.view");

        const bills = storageService.loadList("bills");
        const result = [];
        for (let i = 0; i < bills.length; i++) {
            if (statusFilter === "All" || bills[i].status === statusFilter) {
                result.push(bills[i]);
            }
        }
        result.sort(function (first, second) {
            return second.id.localeCompare(first.id);
        });
        return result;
    }

    getBillById(billId) {
        permissionService.requirePermission("billing.view");
        return this.findBillInList(storageService.loadList("bills"), billId);
    }

    findBillInList(bills, billId) {
        for (let i = 0; i < bills.length; i++) {
            if (bills[i].id === billId) {
                return bills[i];
            }
        }
        return null;
    }

    // ----- Payment (cash only) -----

    // Takes the cash, applies the discount, and marks the bill as paid. No stock is changed.
    markPaid(billId, cashReceived, discount) {
        permissionService.requirePermission("billing.collect");

        const bills = storageService.loadList("bills");
        const bill = this.findBillInList(bills, billId);
        if (bill === null) {
            throw new Error("Bill not found.");
        }
        if (bill.status !== "Open") {
            throw new Error("This bill is already paid.");
        }

        // Senior Citizen / PWD discount: checked against the patient's record, then taken off the subtotal.
        const discountChoice = discount || { type: "None", idNumber: "", idChecked: false };
        this.checkDiscount(patientService.getPatientById(bill.patientId), discountChoice);

        const subtotal = this.calculateTotal(bill.items);
        const discountAmount = this.calculateDiscount(subtotal, discountChoice.type);
        const total = subtotal - discountAmount;

        const cashError = validator.checkWholeNumber("Cash received", cashReceived);
        if (cashError !== "") {
            throw new Error(cashError);
        }
        const cash = Number(cashReceived);
        if (cash < total) {
            throw new Error("Cash received (₱" + cash + ") is less than the total (₱" + total + ").");
        }

        bill.subtotal = subtotal;
        bill.discountType = discountChoice.type;
        bill.discountIdNumber = discountChoice.type === "None" ? "" : String(discountChoice.idNumber).trim();
        bill.discountAmount = discountAmount;
        bill.total = total;
        bill.status = "Paid";
        bill.paymentMethod = "Cash";
        bill.cashReceived = cash;
        bill.change = cash - total;
        bill.paidDate = dateHelper.getTodayString();
        bill.paidAt = new Date().toISOString();
        bill.paidBy = authService.getCurrentUser().username;
        storageService.saveList("bills", bills);

        auditLogService.recordAction("Bill paid (cash)", bill.id + " total " + total +
            (discountAmount > 0 ? " (" + discountChoice.type + " discount " + discountAmount + ")" : ""));
        return bill;
    }

    // ----- Statistics -----

    // startDate and endDate are YYYY-MM-DD texts. Sales count on the day the bill was paid.
    // Medicine sales from older paid bills still appear, so past reports stay accurate.
    getSalesReport(startDate, endDate) {
        permissionService.requirePermission("billing.reports");

        const bills = storageService.loadList("bills");
        const patients = storageService.loadList("patients");

        const patientsById = {};
        for (let i = 0; i < patients.length; i++) {
            patientsById[patients[i].id] = patients[i];
        }

        const report = {
            totalSales: 0,
            paidBillCount: 0,
            serviceSales: 0,
            medicineSales: 0,
            patientsServed: 0,
            newPatients: 0,
            newPatientSales: 0,
            returningPatientSales: 0,
            discountTotal: 0,
            days: []
        };
        const daily = {};
        const servedPatientIds = {};

        const dayFor = function (date) {
            if (daily[date] === undefined) {
                daily[date] = { date: date, bills: 0, sales: 0, newPatients: 0, newPatientSales: 0 };
            }
            return daily[date];
        };

        // New patients are the ones registered inside the range.
        for (let i = 0; i < patients.length; i++) {
            if (dateHelper.isDateInRange(patients[i].dateRegistered, startDate, endDate)) {
                report.newPatients = report.newPatients + 1;
                dayFor(patients[i].dateRegistered).newPatients += 1;
            }
        }

        // Paid bills inside the range.
        for (let i = 0; i < bills.length; i++) {
            const bill = bills[i];
            if (bill.status !== "Paid" || !dateHelper.isDateInRange(bill.paidDate, startDate, endDate)) {
                continue;
            }

            report.paidBillCount = report.paidBillCount + 1;
            report.totalSales = report.totalSales + bill.total;
            report.discountTotal = report.discountTotal + (bill.discountAmount || 0);
            servedPatientIds[bill.patientId] = true;

            for (let j = 0; j < bill.items.length; j++) {
                const item = bill.items[j];
                if (item.type === "service") {
                    report.serviceSales = report.serviceSales + item.amount;
                } else if (item.decision === "Buy here") {
                    report.medicineSales = report.medicineSales + item.amount;
                }
            }

            const patient = patientsById[bill.patientId];
            const isNewPatient = patient !== undefined && dateHelper.isDateInRange(patient.dateRegistered, startDate, endDate);
            if (isNewPatient) {
                report.newPatientSales = report.newPatientSales + bill.total;
            }

            const day = dayFor(bill.paidDate);
            day.bills += 1;
            day.sales += bill.total;
            if (isNewPatient) {
                day.newPatientSales += bill.total;
            }
        }

        report.patientsServed = Object.keys(servedPatientIds).length;
        report.returningPatientSales = report.totalSales - report.newPatientSales;
        report.days = Object.keys(daily).sort().map(function (key) {
            return daily[key];
        });
        return report;
    }
}

const billingService = new BillingService();