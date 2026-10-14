/*
 * SampleData.js
 * Purpose: fills localStorage with FAKE demonstration data the first time the system runs.
 * All names, numbers and passwords here are made up for the prototype.
 */
class SampleData {
    loadIfNeeded() {
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
            email: "",
            address: details.address,
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
            address: "Makati City", bloodType: "O+", allergies: "None",
            medicalConditions: "None", currentMedications: "None",
            lastVisit: dateHelper.getDateWithOffset(-3)
        }));
        patients.push(this.createPatient("P-0002", {
            firstName: "Maria", middleName: "Lopez", lastName: "Garcia",
            birthDate: "1985-11-02", gender: "Female", contactNumber: "09181234567",
            address: "Quezon City", bloodType: "A+", allergies: "Penicillin",
            medicalConditions: "Hypertension", currentMedications: "Losartan 50 mg",
            lastVisit: dateHelper.getDateWithOffset(-10)
        }));
        patients.push(this.createPatient("P-0003", {
            firstName: "Pedro", middleName: "Cruz", lastName: "Santiago",
            birthDate: "1972-03-21", gender: "Male", contactNumber: "09191234567",
            address: "Pasig City", bloodType: "B+", allergies: "None",
            medicalConditions: "Type 2 Diabetes", currentMedications: "Metformin 500 mg",
            lastVisit: dateHelper.getDateWithOffset(-1)
        }));
        patients.push(this.createPatient("P-0004", {
            firstName: "Ana", middleName: "Mae", lastName: "Villanueva",
            birthDate: "2010-08-30", gender: "Female", contactNumber: "09201234567",
            address: "Taguig City", bloodType: "AB+", allergies: "Peanuts",
            medicalConditions: "Asthma", currentMedications: "Salbutamol inhaler",
            lastVisit: dateHelper.getDateWithOffset(-20)
        }));
        patients.push(this.createPatient("P-0005", {
            firstName: "Carlos", middleName: "", lastName: "Mendoza",
            birthDate: "1960-01-15", gender: "Male", contactNumber: "09211234567",
            address: "Mandaluyong City", bloodType: "O-", allergies: "None",
            medicalConditions: "None", currentMedications: "None",
            lastVisit: ""
        }));

        return patients;
    }

    createAppointment(id, patientId, date, time, status, reason, queueNumber) {
        return {
            id: id,
            patientId: patientId,
            date: date,
            time: time,
            doctorUsername: "doctor",
            reason: reason,
            status: status,
            queueNumber: queueNumber
        };
    }

    createSampleAppointments() {
        const today = dateHelper.getTodayString();
        const appointments = [];

        appointments.push(this.createAppointment("A-0001", "P-0001", today, "09:00", "Completed", "Follow-up check", null));
        appointments.push(this.createAppointment("A-0002", "P-0002", today, "10:00", "Waiting", "Blood pressure monitoring", 1));
        appointments.push(this.createAppointment("A-0003", "P-0003", today, "11:00", "Confirmed", "Diabetes review", null));
        appointments.push(this.createAppointment("A-0004", "P-0004", today, "13:30", "Scheduled", "Asthma consultation", null));
        appointments.push(this.createAppointment("A-0005", "P-0005", dateHelper.getDateWithOffset(1), "09:30", "Scheduled", "General check-up", null));
        appointments.push(this.createAppointment("A-0006", "P-0002", dateHelper.getDateWithOffset(-10), "10:00", "Cancelled", "Medication refill", null));

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
            followUpDate: "",
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
}

const sampleData = new SampleData();
sampleData.loadIfNeeded();
