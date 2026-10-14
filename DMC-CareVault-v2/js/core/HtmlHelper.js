/*
 * HtmlHelper.js
 * Purpose: safely put user-typed text into HTML.
 * Without this, a name such as <script>... could run code in the page (XSS).
 */
class HtmlHelper {
    escapeText(value) {
        if (value === null || value === undefined) {
            return "";
        }

        let text = String(value);
        text = text.replace(/&/g, "&amp;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        text = text.replace(/"/g, "&quot;");
        text = text.replace(/'/g, "&#39;");
        return text;
    }

    // Builds the colored status label, e.g. "In Consultation" -> class "in-consultation".
    buildStatusBadge(statusText) {
        const cssName = String(statusText).toLowerCase().replace(/ /g, "-");
        return '<span class="badge ' + cssName + '">' + this.escapeText(statusText) + "</span>";
    }

    buildStatCard(number, label) {
        return '<div class="stat"><b>' + number + "</b><span>" + this.escapeText(label) + "</span></div>";
    }

    getFullName(patient) {
        const nameParts = [];

        nameParts.push(patient.firstName);
        if (patient.middleName) {
            nameParts.push(patient.middleName);
        }
        nameParts.push(patient.lastName);

        return nameParts.join(" ");
    }
}

const htmlHelper = new HtmlHelper();
