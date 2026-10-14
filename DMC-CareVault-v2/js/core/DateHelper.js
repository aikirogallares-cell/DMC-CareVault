/*
 * DateHelper.js
 * Purpose: small date functions used by many pages.
 * Dates are stored as text in the format YYYY-MM-DD (example: 2026-10-13).
 */
class DateHelper {
    getTodayString() {
        return new Date().toISOString().substring(0, 10);
    }

    // Example: getDateWithOffset(-3) = three days ago, getDateWithOffset(1) = tomorrow.
    getDateWithOffset(numberOfDays) {
        const date = new Date();
        date.setDate(date.getDate() + numberOfDays);
        return date.toISOString().substring(0, 10);
    }

    calculateAge(birthDateString) {
        if (!birthDateString) {
            return "";
        }

        const birthDate = new Date(birthDateString);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        // Subtract one year if the birthday has not happened yet this year.
        const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        if (today < birthdayThisYear) {
            age = age - 1;
        }

        return age;
    }

    formatDateTime(isoString) {
        return new Date(isoString).toLocaleString();
    }

    // Returns the first day (Sunday) of the current week as YYYY-MM-DD.
    getStartOfWeekString() {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return date.toISOString().substring(0, 10);
    }

    getStartOfMonthString() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        // Add 12 hours so time-zone shifting cannot move us to the previous day.
        firstDay.setHours(12);
        return firstDay.toISOString().substring(0, 10);
    }

    isDateInRange(dateString, startString, endString) {
        return dateString >= startString && dateString <= endString;
    }
}

const dateHelper = new DateHelper();
