/*
 * DateHelper.js
 * Purpose: small date functions used by many pages.
 * Dates are stored as text in the format YYYY-MM-DD (example: 2026-10-13).
 * "Today" always uses the computer's LOCAL date (not UTC), so it is correct in the
 * Philippines even in the early morning.
 */
class DateHelper {
    // Turns a Date object into YYYY-MM-DD using the local date.
    formatLocalDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    getTodayString() {
        return this.formatLocalDate(new Date());
    }

    // Example: getDateWithOffset(-3) = three days ago, getDateWithOffset(1) = tomorrow.
    getDateWithOffset(numberOfDays) {
        const date = new Date();
        date.setDate(date.getDate() + numberOfDays);
        return this.formatLocalDate(date);
    }

    // Returns the age as text. Babies are shown in days or months instead of "0":
    // "Born today", "5 days", "3 months", "1 yr", "12 yrs".
    getAgeText(birthDateString) {
        if (!birthDateString) {
            return "";
        }

        const parts = birthDateString.split("-");
        const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (birthDate > today) {
            return "";
        }

        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();

        // Borrow the days of the previous month when the day number has not been reached yet.
        if (days < 0) {
            months = months - 1;
            days = days + new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years = years - 1;
            months = months + 12;
        }

        if (years >= 1) {
            return years + (years === 1 ? " yr" : " yrs");
        }
        if (months >= 1) {
            return months + (months === 1 ? " month" : " months");
        }
        if (days >= 1) {
            return days + (days === 1 ? " day" : " days");
        }
        return "Born today";
    }

    formatDateTime(isoString) {
        return new Date(isoString).toLocaleString();
    }

    // Shows only the clock time of a saved moment, for example "2:35 PM".
    // Returns "-" when there is no time yet (for example a patient who is not done).
    formatTime(isoString) {
        if (!isoString) {
            return "-";
        }
        return new Date(isoString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }

    // Returns the first day (Sunday) of the current week as YYYY-MM-DD.
    getStartOfWeekString() {
        const date = new Date();
        date.setDate(date.getDate() - date.getDay());
        return this.formatLocalDate(date);
    }

    getStartOfMonthString() {
        const today = new Date();
        return this.formatLocalDate(new Date(today.getFullYear(), today.getMonth(), 1));
    }

    isDateInRange(dateString, startString, endString) {
        return dateString >= startString && dateString <= endString;
    }
}

const dateHelper = new DateHelper();