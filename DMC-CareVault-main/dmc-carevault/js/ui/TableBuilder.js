/*
 * TableBuilder.js
 * Purpose: creates the HTML of a table.
 *
 * A column definition looks like this:
 *   { title: "Name", getCellHtml: function (row) { return htmlHelper.escapeText(row.name); } }
 * getCellHtml must return safe HTML (use htmlHelper.escapeText for typed text).
 */
class TableBuilder {
    buildTableHtml(columnList, rowList, emptyMessage) {
        if (rowList.length === 0) {
            return '<div class="empty">' + emptyMessage + "</div>";
        }

        let html = '<div class="tw"><table><thead><tr>';

        for (let i = 0; i < columnList.length; i++) {
            html += "<th>" + columnList[i].title + "</th>";
        }
        html += "</tr></thead><tbody>";

        for (let rowIndex = 0; rowIndex < rowList.length; rowIndex++) {
            html += "<tr>";
            for (let columnIndex = 0; columnIndex < columnList.length; columnIndex++) {
                html += "<td>" + columnList[columnIndex].getCellHtml(rowList[rowIndex]) + "</td>";
            }
            html += "</tr>";
        }

        html += "</tbody></table></div>";
        return html;
    }
}

const tableBuilder = new TableBuilder();
