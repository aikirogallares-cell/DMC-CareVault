/*
 * SampleData.js
 * Purpose: fills localStorage with FAKE demonstration data the first time the system runs.
 * All names, numbers and passwords here are made up for the prototype.
 */
class SampleData {
    // Runs on every page. Each part only fills the storage the first time.
        // Runs on every page. Each part only fills the storage the first time.
    loadIfNeeded() {
        this.loadMainDataIfNeeded();
        this.loadMedicationsIfNeeded();
        this.addSellingPricesIfNeeded();
    }

    // One-time: gives the sample medicines selling prices, for data saved before prices existed.
    // The prices are sample values in whole pesos. Change them on the Medications page (Edit).
    addSellingPricesIfNeeded() {
        const alreadyDone = storageService.loadObject("medicinePricesAdded", false);
        if (alreadyDone === true) {
            return;
        }

        const samplePrices = {
            "Paracetamol": 5,
            "Amoxicillin": 15,
            "Losartan": 12,
            "Metformin": 8,
            "Salbutamol": 180,
            "Cetirizine": 4,
            "Mefenamic Acid": 10
        };

        const medications = storageService.loadList("medications");
        for (let i = 0; i < medications.length; i++) {
            if (medications[i].unitPrice === undefined) {
                const price = samplePrices[medications[i].genericName];
                medications[i].unitPrice = price === undefined ? 0 : price;
            }
        }
        storageService.saveList("medications", medications);
        storageService.saveObject("medicinePricesAdded", true);
    }

    loadMainDataIfNeeded() {
        const alreadyLoaded = storageService.loadObject("sampleDataLoaded", false);
        if (alreadyLoaded === true) {
            return;
        }

        storageService.saveList("users", this.createSampleUsers());
        storageService.saveList("patients", this.createSamplePatients());
        storageService.saveList("appointments", this.createSampleAppointments());
        storageService.saveList("consultations", this.createSampleConsultations());
        storageService.saveList("prescriptions", this.createSamplePrescriptions());
        storageService.saveList("auditLogs", []);
        storageService.saveObject("settings", {
            systemName: "DMC CareVault",
            clinicName: "Dumaual Medical Clinic",
            sessionTimeoutMinutes: 15
        });
        storageService.saveObject("sampleDataLoaded", true);
    }

    createUser(id, username, fullName, role, plainPassword) {
        const salt = passwordHasher.createSalt();
        return {
            id: id,
            username: username,
            fullName: fullName,
            role: role,
            salt: salt,
            passwordHash: passwordHasher.hashPassword(plainPassword, salt),
            isActive: true
        };
    }

    createSampleUsers() {
        const users = [];
        users.push(this.createUser("U-0001", "admin", "Clinic Administrator", "Admin", "admin123"));
        users.push(this.createUser("U-0002", "staff", "Clinic Staff", "Staff", "staff123"));
        users.push(this.createUser("U-0003", "doctor", "Dr. Juan Dela Cruz", "Doctor", "doctor123"));
        return users;
    }

    // Creates one patient object. Fields not listed in "details" get default values.
    createPatient(id, details) {
        return {
            id: id,
            firstName: details.firstName,
            middleName: details.middleName,
            lastName: details.lastName,
            birthDate: details.birthDate,
            gender: details.gender,
            civilStatus: "Single",
            contactNumber: details.contactNumber,
            lotNo: details.lotNo,
            barangay: details.barangay,
            city: details.city,
            address: "Lot " + details.lotNo + ", Brgy. " + details.barangay + ", " + details.city,
            emergencyName: "Family Member",
            emergencyRelationship: "Relative",
            emergencyContactNumber: "09170000000",
            bloodType: details.bloodType,
            allergies: details.allergies,
            medicalConditions: details.medicalConditions,
            currentMedications: details.currentMedications,
            lastVisit: details.lastVisit,
            isArchived: false,
            dateRegistered: dateHelper.getDateWithOffset(-30)
        };
    }

    createSamplePatients() {
        const patients = [];

        patients.push(this.createPatient("P-0001", {
            firstName: "Juan", middleName: "Santos", lastName: "Reyes",
            birthDate: "1998-05-12", gender: "Male", contactNumber: "09171234567",
            lotNo: "12", barangay: "Poblacion", city: "Makati City", bloodType: "O+", allergies: "None",
            medicalConditions: "None", currentMedications: "None",
            lastVisit: dateHelper.getDateWithOffset(-3)
        }));
        patients.push(this.createPatient("P-0002", {
            firstName: "Maria", middleName: "Lopez", lastName: "Garcia",
            birthDate: "1985-11-02", gender: "Female", contactNumber: "09181234567",
            lotNo: "5", barangay: "Commonwealth", city: "Quezon City", bloodType: "A+", allergies: "Penicillin",
            medicalConditions: "Hypertension", currentMedications: "Losartan 50 mg",
            lastVisit: dateHelper.getDateWithOffset(-10)
        }));
        patients.push(this.createPatient("P-0003", {
            firstName: "Pedro", middleName: "Cruz", lastName: "Santiago",
            birthDate: "1972-03-21", gender: "Male", contactNumber: "09191234567",
            lotNo: "8", barangay: "Kapitolyo", city: "Pasig City", bloodType: "B+", allergies: "None",
            medicalConditions: "Type 2 Diabetes", currentMedications: "Metformin 500 mg",
            lastVisit: dateHelper.getDateWithOffset(-1)
        }));
        patients.push(this.createPatient("P-0004", {
            firstName: "Ana", middleName: "Mae", lastName: "Villanueva",
            birthDate: "2010-08-30", gender: "Female", contactNumber: "09201234567",
            lotNo: "21", barangay: "Fort Bonifacio", city: "Taguig City", bloodType: "AB+", allergies: "Peanuts",
            medicalConditions: "Asthma", currentMedications: "Salbutamol inhaler",
            lastVisit: dateHelper.getDateWithOffset(-20)
        }));
        patients.push(this.createPatient("P-0005", {
            firstName: "Carlos", middleName: "", lastName: "Mendoza",
            birthDate: "1960-01-15", gender: "Male", contactNumber: "09211234567",
            lotNo: "3", barangay: "Addition Hills", city: "Mandaluyong City", bloodType: "O-", allergies: "None",
            medicalConditions: "None", currentMedications: "None",
            lastVisit: ""
        }));

        return patients;
    }

    // A moment earlier today, "minutesAgo" minutes before now (never before midnight).
    // Used so the sample queue shows believable "Time In / Done" values.
    createTimeToday(minutesAgo) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const moment = Math.max(startOfToday.getTime(), Date.now() - minutesAgo * 60000);
        return new Date(moment).toISOString();
    }

    // Appointments have no scheduled time. They are walk-in queue entries with a queue number,
    // and the real times are saved as queuedAt / startedAt / completedAt.
    createAppointment(id, patientId, date, details) {
        return {
            id: id,
            patientId: patientId,
            date: date,
            doctorUsername: "doctor",
            reason: details.reason,
            status: details.status,
            queueNumber: details.queueNumber,
            queuedAt: details.queuedAt,
            startedAt: details.startedAt,
            completedAt: details.completedAt
        };
    }

    createSampleAppointments() {
        const today = dateHelper.getTodayString();
        const appointments = [];

        appointments.push(this.createAppointment("A-0001", "P-0001", today, {
            reason: "Check-up", status: "Completed", queueNumber: 1,
            queuedAt: this.createTimeToday(60), startedAt: this.createTimeToday(45), completedAt: this.createTimeToday(30)
        }));
        appointments.push(this.createAppointment("A-0002", "P-0003", today, {
            reason: "Blood Test", status: "In Consultation", queueNumber: 2,
            queuedAt: this.createTimeToday(35), startedAt: this.createTimeToday(10), completedAt: null
        }));
        appointments.push(this.createAppointment("A-0003", "P-0002", today, {
            reason: "Check-up", status: "Waiting", queueNumber: 3,
            queuedAt: this.createTimeToday(15), startedAt: null, completedAt: null
        }));
        appointments.push(this.createAppointment("A-0004", "P-0004", today, {
            reason: "X-ray", status: "Waiting", queueNumber: 4,
            queuedAt: this.createTimeToday(5), startedAt: null, completedAt: null
        }));
        appointments.push(this.createAppointment("A-0005", "P-0002", dateHelper.getDateWithOffset(-10), {
            reason: "Getting Blood", status: "Cancelled", queueNumber: null,
            queuedAt: null, startedAt: null, completedAt: null
        }));

        return appointments;
    }

    createConsultation(id, patientId, date, complaint, diagnosis, treatment) {
        return {
            id: id,
            patientId: patientId,
            doctorUsername: "doctor",
            date: date,
            complaint: complaint,
            symptoms: complaint,
            bloodPressure: "120/80",
            heartRate: "76",
            temperature: "36.8",
            respiratoryRate: "18",
            weight: "65",
            height: "168",
            diagnosis: diagnosis,
            treatment: treatment,
            notes: "",
            status: "Completed"
        };
    }

    createSampleConsultations() {
        const consultations = [];

        consultations.push(this.createConsultation("C-0001", "P-0001", dateHelper.getDateWithOffset(-3),
            "Cough and colds", "Acute upper respiratory infection", "Rest, fluids, paracetamol"));
        consultations.push(this.createConsultation("C-0002", "P-0002", dateHelper.getDateWithOffset(-10),
            "Headache", "Hypertension, controlled", "Continue Losartan"));
        consultations.push(this.createConsultation("C-0003", "P-0003", dateHelper.getDateWithOffset(-1),
            "Fatigue", "Type 2 diabetes - monitoring", "Diet control and Metformin"));

        return consultations;
    }

    createSamplePrescriptions() {
        const prescriptions = [];

        prescriptions.push({
            id: "RX-0001",
            patientId: "P-0001",
            doctorUsername: "doctor",
            date: dateHelper.getDateWithOffset(-3),
            medicines: [
                {
                    name: "Paracetamol",
                    dosage: "500 mg",
                    frequency: "Every 6 hours",
                    duration: "3 days",
                    instructions: "Take after meals"
                }
            ]
        });

        return prescriptions;
    }

    // ---------- Medicines (fake stock) ----------

    // Loaded on its own, so browsers that already have the other sample data also get the medicine list.
    loadMedicationsIfNeeded() {
        const alreadyLoaded = storageService.loadObject("medicationsLoaded", false);
        if (alreadyLoaded === true) {
            return;
        }

        storageService.saveList("medications", this.createSampleMedications());
        storageService.saveObject("medicationsLoaded", true);
    }

    // "expiresInDays" is counted from today (a negative number means already expired).
    createMedication(id, details) {
        return {
            id: id,
            genericName: details.genericName,
            brandName: details.brandName,
            strength: details.strength,
            form: details.form,
            category: details.category,
            route: details.route,
            stock: details.stock,
            unit: details.unit,
            reorderLevel: details.reorderLevel,
            batchNumber: details.batchNumber,
            expiryDate: dateHelper.getDateWithOffset(details.expiresInDays),
            supplier: "Sample Pharma Supply",
            indications: details.indications,
            warnings: details.warnings,
            storageInstructions: details.storageInstructions,
            isArchived: false
        };
    }

    createSampleMedications() {
        const medications = [];

        medications.push(this.createMedication("M-0001", {
            genericName: "Paracetamol", brandName: "Biogesic", strength: "500 mg", form: "Tablet",
            category: "Analgesic / Antipyretic", route: "Oral", stock: 200, unit: "tablets", reorderLevel: 30,
            batchNumber: "PCM-2026-01", expiresInDays: 540,
            indications: "Fever and mild to moderate pain",
            warnings: "Do not exceed 4 g a day. Use with caution in liver disease.",
            storageInstructions: "Store below 30°C, away from moisture"
        }));
        medications.push(this.createMedication("M-0002", {
            genericName: "Amoxicillin", brandName: "", strength: "500 mg", form: "Capsule",
            category: "Antibiotic", route: "Oral", stock: 100, unit: "capsules", reorderLevel: 20,
            batchNumber: "AMX-2026-03", expiresInDays: 400,
            indications: "Bacterial infections",
            warnings: "Do not give to patients who are allergic to penicillin.",
            storageInstructions: "Store below 25°C in a dry place"
        }));
        medications.push(this.createMedication("M-0003", {
            genericName: "Losartan", brandName: "", strength: "50 mg", form: "Tablet",
            category: "Antihypertensive", route: "Oral", stock: 60, unit: "tablets", reorderLevel: 15,
            batchNumber: "LOS-2026-02", expiresInDays: 600,
            indications: "High blood pressure",
            warnings: "Not for use in pregnancy. Monitor blood pressure and kidney function.",
            storageInstructions: "Store below 30°C"
        }));
        medications.push(this.createMedication("M-0004", {
            genericName: "Metformin", brandName: "", strength: "500 mg", form: "Tablet",
            category: "Antidiabetic", route: "Oral", stock: 8, unit: "tablets", reorderLevel: 20,
            batchNumber: "MET-2026-05", expiresInDays: 300,
            indications: "Type 2 diabetes",
            warnings: "Take with meals. Avoid in severe kidney disease.",
            storageInstructions: "Store below 30°C"
        }));
        medications.push(this.createMedication("M-0005", {
            genericName: "Salbutamol", brandName: "Ventolin", strength: "100 mcg/dose", form: "Inhaler",
            category: "Respiratory", route: "Inhalation", stock: 0, unit: "inhalers", reorderLevel: 5,
            batchNumber: "SAL-2026-01", expiresInDays: 250,
            indications: "Asthma and wheezing",
            warnings: "May cause tremors and a fast heartbeat.",
            storageInstructions: "Store below 30°C. Do not puncture or burn the canister."
        }));
        medications.push(this.createMedication("M-0006", {
            genericName: "Cetirizine", brandName: "", strength: "10 mg", form: "Tablet",
            category: "Antihistamine / Allergy", route: "Oral", stock: 90, unit: "tablets", reorderLevel: 20,
            batchNumber: "CET-2025-11", expiresInDays: 20,
            indications: "Allergies and itching",
            warnings: "May cause drowsiness.",
            storageInstructions: "Store below 30°C"
        }));
        medications.push(this.createMedication("M-0007", {
            genericName: "Mefenamic Acid", brandName: "", strength: "500 mg", form: "Capsule",
            category: "Analgesic / Antipyretic", route: "Oral", stock: 40, unit: "capsules", reorderLevel: 10,
            batchNumber: "MEF-2025-04", expiresInDays: -15,
            indications: "Pain and menstrual cramps",
            warnings: "Take with food. Not for people with stomach ulcers.",
            storageInstructions: "Store below 30°C"
        }));

        return medications;
    }
}

const sampleData = new SampleData();
sampleData.loadIfNeeded();