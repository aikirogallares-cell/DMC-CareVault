/*
 * BillingService.js
 * Purpose: bills for patient visits, payment, medicine stock sold at the clinic, and sales statistics.
 *
 * How bills are made (automatically):
 *   - A visit marked "Completed" gets a bill with its service (the reason, e.g. "X-ray"),
 *     priced from the service price list.
 *   - Prescriptions written for that patient on the same day are added as medicine lines.
 *   - The patient decides for each medicine: "Buy here" or "Not buying".
 *   - Paying the bill takes the bought medicines out of stock.
 *
 * Money is in whole pesos. Only medicines that have a selling price, are not expired,
 * and are in stock can be bought here.
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
    }

    // Two decimals with thousands commas, without the peso sign: 300.00, 1,250.50
    formatMoney(value) {
        return Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
        const prescriptions = storageService.loadList("prescriptions");
        const medications = storageService.loadList("medications");

        const billedVisitIds = {};
        const billedPrescriptionIds = {};
        for (let i = 0; i < bills.length; i++) {
            billedVisitIds[bills[i].queueEntryId] = true;
            for (let j = 0; j < bills[i].prescriptionIds.length; j++) {
                billedPrescriptionIds[bills[i].prescriptionIds[j]] = true;
            }
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

        // 2. Open bills get the prescriptions for that day, and medicine prices are kept up to date.
        for (let i = 0; i < bills.length; i++) {
            const bill = bills[i];
            if (bill.status !== "Open") {
                continue;
            }
            this.addUnbilledPrescriptions(bill, prescriptions, billedPrescriptionIds, medications);
            for (let j = 0; j < bill.items.length; j++) {
                if (bill.items[j].type === "medicine") {
                    this.refreshMedicineItem(bill.items[j], medications);
                }
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
            total: 0,
            paidDate: "",
            paidAt: "",
            paidBy: ""
        };
    }

    // Adds the medicines of prescriptions written for this patient on the visit date (once only).
    addUnbilledPrescriptions(bill, prescriptions, billedPrescriptionIds, medications) {
        for (let i = 0; i < prescriptions.length; i++) {
            const prescription = prescriptions[i];
            const isForThisVisit = prescription.patientId === bill.patientId && prescription.date === bill.visitDate;
            if (!isForThisVisit || billedPrescriptionIds[prescription.id] === true) {
                continue;
            }

            billedPrescriptionIds[prescription.id] = true;
            bill.prescriptionIds.push(prescription.id);

            for (let j = 0; j < prescription.medicines.length; j++) {
                const medicine = prescription.medicines[j];
                const item = {
                    id: prescription.id + "-" + (j + 1),
                    type: "medicine",
                    name: medicine.name,
                    prescriptionId: prescription.id,
                    medicationId: null,
                    quantity: Number(medicine.quantity) || 1,
                    unitPrice: 0,
                    amount: 0,
                    sellable: false,
                    note: ""
                };
                this.refreshMedicineItem(item, medications);
                bill.items.push(item);
            }
        }
    }

    // Works out the price and whether the medicine can be bought here right now.
    refreshMedicineItem(item, medications) {
        const resolved = this.resolveMedicine(item.name, item.quantity, medications);
        item.medicationId = resolved.medicationId;
        item.unitPrice = resolved.unitPrice;
        item.amount = resolved.unitPrice * item.quantity;
        item.sellable = resolved.sellable;
        item.note = resolved.note;

        if (item.decision === undefined) {
            item.decision = "Buy here";
        }
        if (!resolved.sellable) {
            item.decision = "Not buying";
        }
    }

    // Matches the typed medicine name against the medicine list.
    resolveMedicine(typedName, quantity, medications) {
        const typed = String(typedName || "").trim().toLowerCase();
        const today = dateHelper.getTodayString();
        let match = null;

        for (let i = 0; i < medications.length; i++) {
            const medication = medications[i];
            if (medication.isArchived) {
                continue;
            }
            const namesForThisMedicine = [
                medicationService.getMedicationName(medication).toLowerCase(),
                medicationService.getMedicationLabel(medication).toLowerCase(),
                String(medication.genericName).toLowerCase()
            ];
            if (namesForThisMedicine.includes(typed)) {
                match = medication;
                break;
            }
        }

        if (match === null) {
            return { medicationId: null, unitPrice: 0, sellable: false, note: "Not in the clinic medicine list" };
        }

        const unitPrice = Number(match.unitPrice) || 0;
        const result = { medicationId: match.id, unitPrice: unitPrice };

        if (match.expiryDate < today) {
            return Object.assign(result, { sellable: false, note: "Expired" });
        }
        if (unitPrice <= 0) {
            return Object.assign(result, { sellable: false, note: "No selling price set" });
        }
        if (Number(match.stock) < quantity) {
            return Object.assign(result, { sellable: false, note: "Only " + match.stock + " " + match.unit + " in stock" });
        }
        return Object.assign(result, { sellable: true, note: "" });
    }

        // ----- Totals and discount -----

    // 20% for Senior Citizens (RA 9994) and persons with disability (RA 7277, as amended).
    getDiscountRate() {
        return 0.2;
    }

    getDiscountTypes() {
        return ["None", "Senior Citizen", "PWD"];
    }

    // Services plus medicines bought here, before any discount.
    calculateSubtotal(items) {
        let subtotal = 0;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type === "service" || items[i].decision === "Buy here") {
                subtotal = subtotal + (Number(items[i].amount) || 0);
            }
        }
        return subtotal;
    }

    // The discount in whole pesos, rounded to the nearest peso.
    calculateDiscountAmount(subtotal, discountType) {
        if (discountType !== "Senior Citizen" && discountType !== "PWD") {
            return 0;
        }
        return Math.round(subtotal * this.getDiscountRate());
    }

    // The total the patient pays: the subtotal minus the discount.
    calculateTotal(items, discountType) {
        const subtotal = this.calculateSubtotal(items);
        return subtotal - this.calculateDiscountAmount(subtotal, discountType);
    }

    getBillTotal(bill) {
        if (bill.status === "Paid") {
            return bill.total;
        }
        return this.calculateTotal(bill.items, bill.discountType);
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

    findMedicationById(medications, medicationId) {
        for (let i = 0; i < medications.length; i++) {
            if (medications[i].id === medicationId) {
                return medications[i];
            }
        }
        return null;
    }

    // ----- Payment -----

    // decisions: { itemId: "Buy here" or "Not buying" }
    saveDecisions(billId, decisions) {
        permissionService.requirePermission("billing.collect");

        const bills = storageService.loadList("bills");
        const bill = this.findBillInList(bills, billId);
        if (bill === null) {
            throw new Error("Bill not found.");
        }
        if (bill.status !== "Open") {
            throw new Error("This bill is already paid.");
        }

        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            if (item.type !== "medicine" || decisions[item.id] === undefined) {
                continue;
            }
            if (decisions[item.id] === "Buy here" && !item.sellable) {
                throw new Error(item.name + " cannot be bought here: " + item.note + ".");
            }
            item.decision = decisions[item.id];
        }

        storageService.saveList("bills", bills);
        auditLogService.recordAction("Bill choices saved", bill.id);
    }
    // Records the Senior Citizen or PWD discount on an open bill.
    // The patient must show an ID, staff must type its number and tick the box to confirm it,
    // and the patient's record must match the discount.
    saveDiscount(billId, discountType, idNumber, idWasChecked) {
        permissionService.requirePermission("billing.collect");

        const bills = storageService.loadList("bills");
        const bill = this.findBillInList(bills, billId);
        if (bill === null) {
            throw new Error("Bill not found.");
        }
        if (bill.status !== "Open") {
            throw new Error("This bill is already paid.");
        }
        if (this.getDiscountTypes().includes(discountType) === false) {
            throw new Error("Choose a discount type from the list.");
        }

        if (discountType === "None") {
            bill.discountType = "None";
            bill.discountIdNumber = "";
            bill.discountAmount = 0;
            storageService.saveList("bills", bills);
            return;
        }

        const cleanIdNumber = String(idNumber || "").trim();
        if (cleanIdNumber === "") {
            throw new Error("Enter the ID number the patient showed.");
        }
        if (idWasChecked !== true) {
            throw new Error("Check the patient's ID first, then tick the box to confirm it.");
        }

        // The patient's record must match the discount.
        const patient = patientService.getPatientById(bill.patientId);
        if (patient === null) {
            throw new Error("Patient record not found.");
        }
        if (discountType === "Senior Citizen" && patientService.isSeniorCitizen(patient) === false) {
            throw new Error("This patient is not 60 years old or above, so the Senior Citizen discount cannot be given.");
        }
        if (discountType === "PWD" && patientService.isPwd(patient) === false) {
            throw new Error("This patient is not marked as PWD on their record. Edit the patient record first.");
        }

        const subtotal = this.calculateSubtotal(bill.items);
        bill.discountType = discountType;
        bill.discountIdNumber = cleanIdNumber;
        bill.discountAmount = this.calculateDiscountAmount(subtotal, discountType);
        storageService.saveList("bills", bills);
        auditLogService.recordAction("Discount set", bill.id + " " + discountType + " (ID " + cleanIdNumber + ")");
    }


    // Cash only. Takes the bought medicines out of stock and marks the bill as paid.
    // The discount must already be saved with saveDiscount().
    // Returns the paid bill so the receipt can be shown.
    markPaid(billId, cashReceived) {
        permissionService.requirePermission("billing.collect");

        const bills = storageService.loadList("bills");
        const bill = this.findBillInList(bills, billId);
        if (bill === null) {
            throw new Error("Bill not found.");
        }
        if (bill.status !== "Open") {
            throw new Error("This bill is already paid.");
        }

        const discountType = bill.discountType || "None";
        if (discountType !== "None" && !bill.discountIdNumber) {
            throw new Error("Record the ID number for the " + discountType + " discount first.");
        }

        const medications = storageService.loadList("medications");
        const quantityNeeded = {};

        // Check every medicine the patient is buying here.
        for (let i = 0; i < bill.items.length; i++) {
            const item = bill.items[i];
            if (item.type !== "medicine" || item.decision !== "Buy here") {
                continue;
            }

            const resolved = this.resolveMedicine(item.name, item.quantity, medications);
            if (!resolved.sellable) {
                throw new Error(item.name + " cannot be bought here: " + resolved.note + ".");
            }

            item.medicationId = resolved.medicationId;
            item.unitPrice = resolved.unitPrice;
            item.amount = resolved.unitPrice * item.quantity;
            item.sellable = true;
            item.note = "";

            quantityNeeded[resolved.medicationId] = (quantityNeeded[resolved.medicationId] || 0) + item.quantity;
        }

        // Subtotal, discount and total.
        const subtotal = this.calculateSubtotal(bill.items);
        const discountAmount = this.calculateDiscountAmount(subtotal, discountType);
        const total = subtotal - discountAmount;

        // Cash check: the cash must cover the total before anything is changed.
        const cashError = validator.checkWholeNumber("Cash received", cashReceived);
        if (cashError !== "") {
            throw new Error(cashError);
        }
        const cash = Number(cashReceived);
        if (cash < total) {
            throw new Error("Cash received (₱" + cash + ") is less than the total (₱" + total + ").");
        }

        // The same medicine can be on two lines, so check the total needed for each one.
        const medicationIds = Object.keys(quantityNeeded);
        for (let i = 0; i < medicationIds.length; i++) {
            const medication = this.findMedicationById(medications, medicationIds[i]);
            if (medication.stock < quantityNeeded[medicationIds[i]]) {
                throw new Error("Not enough stock for " + medicationService.getMedicationLabel(medication) +
                    ". Available: " + medication.stock + " " + medication.unit + ".");
            }
        }

        // Everything is valid: take the stock out, then mark the bill as paid.
        for (let i = 0; i < medicationIds.length; i++) {
            const medication = this.findMedicationById(medications, medicationIds[i]);
            medication.stock = medication.stock - quantityNeeded[medicationIds[i]];
        }
        storageService.saveList("medications", medications);

        bill.subtotal = subtotal;
        bill.discountType = discountType;
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
            (discountAmount > 0 ? " (discount " + discountAmount + ")" : ""));
        return bill;
    }

    // ----- Statistics -----

    // startDate and endDate are YYYY-MM-DD texts. Sales count on the day the bill was paid.
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