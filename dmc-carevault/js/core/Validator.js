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

    // Philippine mobile number: exactly 11 digits and it must start with 09 (example: 09171234567).
    checkContactNumber(value) {
        const pattern = /^09[0-9]{9}$/;
        if (!pattern.test(value)) {
            return "Contact number must be 11 digits and start with 09 (example: 09171234567).";
        }
        return "";
    }

    // Names may contain letters, spaces, and the symbols . ' - (for names like "Ma. Cruz", "O'Brien" or "Dela-Rosa").
    // Numbers and other symbols are not allowed. Letters with accents (such as n with a tilde) are accepted.
    checkPersonName(label, value) {
        const pattern = /^\p{L}[\p{L}\p{M}\s.'\u2019-]*$/u;
        if (!pattern.test(value)) {
            return label + " must contain letters only (no numbers or special characters).";
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

    // Uses the local date, so a baby born today (even early in the morning) is accepted.
    checkBirthDate(value) {
        if (value > dateHelper.getTodayString()) {
            return "Date of birth cannot be in the future.";
        }
        return "";
    }

    // For quantities and stock: 0, 1, 2, ... (no decimals, no negatives).
    checkWholeNumber(label, value) {
        const number = Number(value);
        if (String(value).trim() === "" || !Number.isInteger(number) || number < 0) {
            return label + " must be a whole number (0 or more).";
        }
        return "";
    }
}

const validator = new Validator();