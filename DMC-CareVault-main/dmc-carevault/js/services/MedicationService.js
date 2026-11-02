/*
 * MedicationService.js
 * Purpose: the medicine list (inventory): medicine details, stock, expiry and what can be prescribed.
 * Admin and Staff manage the list. Doctors can view it and choose from it when writing a prescription.
 *
 * What is kept for each medicine:
 *   Identity    genericName, brandName, strength, form, category, route
 *   Stock       stock (quantity on hand), unit, reorderLevel (when to restock)
 *   Tracking    batchNumber, expiryDate, supplier
 *   Clinical    indications (what it is for), warnings (contraindications), storageInstructions
 */
class MedicationService {
    constructor() {
        this.dosageForms = ["Tablet", "Capsule", "Syrup", "Suspension", "Injection", "Cream / Ointment", "Drops", "Inhaler", "Powder / Sachet", "Other"];
        this.categories = ["Analgesic / Antipyretic", "Antibiotic", "Antihypertensive", "Antidiabetic", "Antihistamine / Allergy", "Respiratory", "Gastrointestinal", "Vitamins / Supplements", "Topical / Skin", "Other"];
        this.routes = ["Oral", "Topical", "Injection", "Inhalation", "Eye / Ear / Nose", "Other"];
        this.units = ["tablets", "capsules", "bottles", "vials", "ampules", "tubes", "sachets", "inhalers", "boxes", "pieces"];
        this.stockStatuses = ["In Stock", "Low Stock", "Out of Stock", "Expiring Soon", "Expired"];
        this.expiringSoonDays = 30;
    }

    // ----- Reading -----

    // Every medicine that is not archived.
    getAllMedications() {
        permissionService.requirePermission("medications.view");

        const savedMedications = storageService.loadList("medications");
        const result = [];

        for (let i = 0; i < savedMedications.length; i++) {
            if (savedMedications[i].isArchived === false) {
                result.push(savedMedications[i]);
            }
        }
        return result;
    }

    getMedicationById(medicationId) {
        permissionService.requirePermission("medications.view");

        const savedMedications = storageService.loadList("medications");
        return this.findMedicationInList(savedMedications, medicationId);
    }

    // The medicines a doctor can choose in a prescription: they have stock and are not expired.
    getAvailableMedications() {
        const allMedications = this.getAllMedications();
        const today = dateHelper.getTodayString();
        const available = [];

        for (let i = 0; i < allMedications.length; i++) {
            const hasStock = allMedications[i].stock > 0;
            const isNotExpired = allMedications[i].expiryDate >= today;

            if (hasStock && isNotExpired) {
                available.push(allMedications[i]);
            }
        }

        available.sort(function (first, second) {
            return first.genericName.localeCompare(second.genericName);
        });
        return available;
    }

    findMedicationInList(medicationList, medicationId) {
        for (let i = 0; i < medicationList.length; i++) {
            if (medicationList[i].id === medicationId) {
                return medicationList[i];
            }
        }
        return null;
    }

    // ----- Names and status -----

    // Example: "Paracetamol (Biogesic)"
    getMedicationName(medication) {
        let name = medication.genericName;
        if (medication.brandName) {
            name = name + " (" + medication.brandName + ")";
        }
        return name;
    }

    // Example: "Paracetamol (Biogesic) 500 mg Tablet"
    getMedicationLabel(medication) {
        return this.getMedicationName(medication) + " " + medication.strength + " " + medication.form;
    }

    // One of: Expired, Out of Stock, Low Stock, Expiring Soon, In Stock.
    getStockStatus(medication) {
        const today = dateHelper.getTodayString();
        const soonLimit = dateHelper.getDateWithOffset(this.expiringSoonDays);

        if (medication.expiryDate < today) {
            return "Expired";
        }
        if (medication.stock <= 0) {
            return "Out of Stock";
        }
        if (medication.stock <= medication.reorderLevel) {
            return "Low Stock";
        }
        if (medication.expiryDate <= soonLimit) {
            return "Expiring Soon";
        }
        return "In Stock";
    }

    // ----- Saving -----

        validateMedicationData(data) {
        let error = validator.checkRequired("Generic name", data.genericName);
        if (error !== "") { return error; }

        error = validator.checkRequired("Strength", data.strength);
        if (error !== "") { return error; }

        if (!this.dosageForms.includes(data.form)) {
            return "Choose a valid dosage form.";
        }

        error = validator.checkWholeNumber("Stock quantity", data.stock);
        if (error !== "") { return error; }

        if (!this.units.includes(data.unit)) {
            return "Choose a valid unit.";
        }

        error = validator.checkWholeNumber("Reorder level", data.reorderLevel);
        if (error !== "") { return error; }

        error = validator.checkWholeNumber("Selling price", data.unitPrice);
        if (error !== "") { return error; }

        error = validator.checkRequired("Expiry date", data.expiryDate);
        if (error !== "") { return error; }

        return "";
    }

    // data.id empty -> add a new medicine. data.id filled -> update that medicine.
    saveMedication(data) {
        permissionService.requirePermission("medications.manage");

        const validationError = this.validateMedicationData(data);
        if (validationError !== "") {
            throw new Error(validationError);
        }

        data.stock = Number(data.stock);
        data.reorderLevel = Number(data.reorderLevel);
        data.unitPrice = Number(data.unitPrice);

        const savedMedications = storageService.loadList("medications");

        if (data.id === "") {
            data.id = storageService.generateNextId("M", savedMedications);
            data.isArchived = false;
            savedMedications.push(data);
            auditLogService.recordAction("Medication added", data.id + " " + this.getMedicationName(data));
        } else {
            const existing = this.findMedicationInList(savedMedications, data.id);
            if (existing === null) {
                throw new Error("Medication not found.");
            }
            Object.assign(existing, data);
            auditLogService.recordAction("Medication updated", data.id + " " + this.getMedicationName(existing));
        }

        storageService.saveList("medications", savedMedications);
    }

    // "Archive" hides the medicine from the list and from prescriptions but keeps the record.
    archiveMedication(medicationId) {
        permissionService.requirePermission("medications.manage");

        const savedMedications = storageService.loadList("medications");
        const medication = this.findMedicationInList(savedMedications, medicationId);
        if (medication === null) {
            throw new Error("Medication not found.");
        }

        medication.isArchived = true;
        storageService.saveList("medications", savedMedications);
        auditLogService.recordAction("Medication archived", medicationId);
    }

    // ----- Used when a prescription is saved -----

    // Adds up the quantity per medicine, so the same medicine in two rows is counted together.
    // Returns an object like { "M-0001": 12, "M-0003": 30 }.
    addUpQuantities(medicines) {
        const totals = {};

        for (let i = 0; i < medicines.length; i++) {
            const medicationId = medicines[i].medicationId;
            if (totals[medicationId] === undefined) {
                totals[medicationId] = 0;
            }
            totals[medicationId] = totals[medicationId] + medicines[i].quantity;
        }
        return totals;
    }

    // Throws an Error if a medicine is missing, expired or does not have enough stock.
    checkStockForPrescription(medicines) {
        permissionService.requirePermission("prescriptions.write");

        const savedMedications = storageService.loadList("medications");
        const today = dateHelper.getTodayString();
        const totals = this.addUpQuantities(medicines);

        for (const medicationId in totals) {
            const medication = this.findMedicationInList(savedMedications, medicationId);

            if (medication === null || medication.isArchived) {
                throw new Error("A selected medicine is no longer in the medicine list.");
            }

            const label = this.getMedicationLabel(medication);
            if (medication.expiryDate < today) {
                throw new Error(label + " is expired and cannot be prescribed.");
            }
            if (totals[medicationId] > medication.stock) {
                throw new Error("Not enough stock for " + label + ". Available: " + medication.stock + " " + medication.unit + ".");
            }
        }
    }

    reduceStockForPrescription(medicines, prescriptionId) {
        permissionService.requirePermission("prescriptions.write");

        const savedMedications = storageService.loadList("medications");
        const totals = this.addUpQuantities(medicines);

        for (const medicationId in totals) {
            const medication = this.findMedicationInList(savedMedications, medicationId);
            medication.stock = medication.stock - totals[medicationId];
            auditLogService.recordAction("Stock reduced", medicationId + " -" + totals[medicationId] + " (" + prescriptionId + ")");
        }

        storageService.saveList("medications", savedMedications);
    }
}

const medicationService = new MedicationService();
