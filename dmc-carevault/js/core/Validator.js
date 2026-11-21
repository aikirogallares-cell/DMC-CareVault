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
    // "label" is optional: it lets the message name the box (for example "Emergency contact number").
    checkContactNumber(value, label) {
        const pattern = /^09[0-9]{9}$/;
        if (!pattern.test(value)) {
            const boxName = label === undefined ? "Contact number" : label;
            return boxName + " must be 11 digits and start with 09 (example: 09171234567).";
        }
        return "";
    }

    // Barangay: a name that has letters. Numbers are allowed only together with letters (example: "Barangay 105").
    checkBarangay(value) {
        const hasOnlyAllowedCharacters = /^[\p{L}\p{M}\p{N}\s.'\u2019-]+$/u.test(value);
        const hasLetters = /\p{L}/u.test(value);
        if (!hasOnlyAllowedCharacters || !hasLetters) {
            return "Barangay must contain letters (example: Poblacion or Barangay 105).";
        }
        return "";
    }

    // ID numbers such as the senior citizen ID or the PWD ID. The format differs by city, so only the basics are checked.
    checkIdNumber(label, value) {
        const pattern = /^[A-Za-z0-9][A-Za-z0-9\-\/ ]{2,24}$/;
        if (!pattern.test(value)) {
            return label + " must be 3 to 25 characters (letters, numbers, - or /).";
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

    // ----- Password policy (same rules for Admin, Staff and Doctor) -----
    // The server repeats these rules in api/password-rules.php. Keep the two lists the same.

    // Returns the rules in order. Each one says whether the password passes it.
    getPasswordRules(value) {
        const text = String(value || "");
        return [
            { label: "at least 8 characters", passed: text.length >= 8 },
            { label: "1 uppercase letter (A-Z)", passed: /[A-Z]/.test(text) },
            { label: "1 lowercase letter (a-z)", passed: /[a-z]/.test(text) },
            { label: "1 number (0-9)", passed: /[0-9]/.test(text) },
            { label: "1 special character (! @ # $ % & *)", passed: /[!@#$%&*]/.test(text) }
        ];
    }

    // Returns the text of the rules the password does not follow yet.
    getMissingPasswordRules(value) {
        const missing = [];
        const rules = this.getPasswordRules(value);
        for (let i = 0; i < rules.length; i++) {
            if (!rules[i].passed) {
                missing.push(rules[i].label);
            }
        }
        return missing;
    }

    checkPassword(value) {
        const missing = this.getMissingPasswordRules(value);
        if (missing.length > 0) {
            return "Password must have " + missing.join(", ") + ".";
        }
        return "";
    }

    // Returns { level, text, color, percent } for the strength bar.
    getPasswordStrength(value) {
        const text = String(value || "");
        const rules = this.getPasswordRules(text);
        let passedCount = 0;
        for (let i = 0; i < rules.length; i++) {
            if (rules[i].passed) {
                passedCount = passedCount + 1;
            }
        }

        if (passedCount === rules.length && text.length >= 12) {
            return { level: 4, text: "Strong", color: "var(--gd)", percent: 100 };
        }
        if (passedCount === rules.length) {
            return { level: 3, text: "Good", color: "var(--g)", percent: 75 };
        }
        if (passedCount >= 3) {
            return { level: 2, text: "Fair", color: "var(--amb)", percent: 50 };
        }
        return { level: 1, text: "Weak", color: "var(--red)", percent: 25 };
    }

    // Shows a strength bar under a password box. It stays hidden while the box is empty.
    // inputId is the id of the password box, for example "field_password".
    attachPasswordStrengthMeter(inputId) {
        const input = document.getElementById(inputId);
        if (input === null) {
            return;
        }

        const meter = document.createElement("div");
        meter.style.marginTop = "6px";
        meter.style.display = "none";
        meter.innerHTML =
            '<div style="height:6px;background:var(--bd);border-radius:4px;overflow:hidden">' +
            '<div data-bar style="height:100%;width:0;transition:width .2s"></div></div>' +
            '<div data-text style="font-size:12px;margin-top:4px"></div>';
        input.insertAdjacentElement("afterend", meter);

        const bar = meter.querySelector("[data-bar]");
        const label = meter.querySelector("[data-text]");
        const validatorObject = this;

        input.addEventListener("input", function () {
            if (input.value === "") {
                meter.style.display = "none";
                return;
            }

            const strength = validatorObject.getPasswordStrength(input.value);
            const missing = validatorObject.getMissingPasswordRules(input.value);

            meter.style.display = "block";
            bar.style.width = strength.percent + "%";
            bar.style.background = strength.color;
            label.style.color = strength.color;
            label.textContent = "Strength: " + strength.text +
                (missing.length > 0 ? " (needs " + missing.join(", ") + ")" : "");
        });
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