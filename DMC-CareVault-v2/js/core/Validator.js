/*
 * Validator.js
 * Purpose: reusable input checks.
 * Every method returns an error message (text). An EMPTY text means the value is valid.
 */
class Validator {
    checkRequired(label, value) {
        if (value === null || value === undefined || String(value).trim() === "") {
            return label + " is required.";
        }
        return "";
    }

    checkContactNumber(value) {
        const pattern = /^[0-9+\- ]{7,15}$/;
        if (!pattern.test(value)) {
            return "Contact number must be 7 to 15 digits (numbers, +, - and spaces only).";
        }
        return "";
    }

    // Email is optional, so an empty value is accepted.
    checkOptionalEmail(value) {
        if (value === "") {
            return "";
        }
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(value)) {
            return "Email address is not valid.";
        }
        return "";
    }

    checkUsername(value) {
        const pattern = /^[a-zA-Z0-9_.]{3,20}$/;
        if (!pattern.test(value)) {
            return "Username must be 3 to 20 characters (letters, numbers, _ or .).";
        }
        return "";
    }

    checkPassword(value) {
        if (value.length < 8) {
            return "Password must be at least 8 characters.";
        }
        return "";
    }

    checkBirthDate(value) {
        if (value > new Date().toISOString().substring(0, 10)) {
            return "Date of birth cannot be in the future.";
        }
        return "";
    }
}

const validator = new Validator();
