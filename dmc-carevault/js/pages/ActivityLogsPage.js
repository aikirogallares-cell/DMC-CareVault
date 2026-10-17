/*
 * ActivityLogsPage.js
 * Purpose: Admin can read the history of important actions in the system.
 */
class ActivityLogsPage {
    constructor() {
        this.mainElement = null;
        this.filterText = "";
    }

    start() {
        const page = this;
        const layout = new PageLayout("logs");

        layout.show(function (mainElement, currentUser) {
            page.mainElement = mainElement;
            page.mainElement.innerHTML = '<h2>Activity Logs</h2><div class="toolbar"><input id="filterInput" placeholder="Filter by user or action..."></div><div class="card" id="logTable"></div>';

            document.getElementById("filterInput").addEventListener("input", function (event) {
                page.filterText = event.target.value.toLowerCase();
                page.refreshTable();
            });
            page.refreshTable();
        });
    }

    refreshTable() {
        const allEntries = auditLogService.getAllEntries();
        const shownEntries = [];

        for (let i = 0; i < allEntries.length; i++) {
            const searchableText = (allEntries[i].username + " " + allEntries[i].action + " " + allEntries[i].details).toLowerCase();
            if (this.filterText === "" || searchableText.includes(this.filterText)) {
                shownEntries.push(allEntries[i]);
            }
            if (shownEntries.length >= 200) {
                break;
            }
        }

        const columns = [
            { title: "Time", getCellHtml: function (entry) { return dateHelper.formatDateTime(entry.time); } },
            { title: "User", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.username); } },
            { title: "Role", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.role); } },
            { title: "Action", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.action); } },
            { title: "Details", getCellHtml: function (entry) { return htmlHelper.escapeText(entry.details); } }
        ];

        document.getElementById("logTable").innerHTML =
            tableBuilder.buildTableHtml(columns, shownEntries, "No log entries.");
    }
}

const activityLogsPage = new ActivityLogsPage();
activityLogsPage.start();
