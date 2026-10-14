/*
 * ModalDialog.js
 * Purpose: a pop-up window. Used for forms and for viewing details.
 *
 * Example:
 *   const dialog = new ModalDialog("Add Patient", formHtml, { saveButtonText: "Save", onSave: saveFunction });
 *   dialog.open();
 *
 * If onSave is not given, the dialog only shows content (no Save/Cancel buttons).
 * If onSave throws an Error, the message is shown in the dialog and it stays open.
 */
class ModalDialog {
    constructor(title, bodyHtml, options) {
        this.title = title;
        this.bodyHtml = bodyHtml;
        this.isWide = false;
        this.saveButtonText = "Save";
        this.onSave = null;

        if (options !== undefined) {
            if (options.isWide === true) { this.isWide = true; }
            if (options.saveButtonText !== undefined) { this.saveButtonText = options.saveButtonText; }
            if (options.onSave !== undefined) { this.onSave = options.onSave; }
        }

        this.backgroundElement = null;
    }

    open() {
        this.backgroundElement = document.createElement("div");
        this.backgroundElement.className = "modal-bg";
        this.backgroundElement.innerHTML = this.buildHtml();
        document.body.appendChild(this.backgroundElement);

        this.connectButtons();
    }

    buildHtml() {
        let widthClass = "modal";
        if (this.isWide) {
            widthClass = "modal wide";
        }

        let html = '<div class="' + widthClass + '">';
        html += '<div class="modal-h"><h3>' + htmlHelper.escapeText(this.title) + '</h3>';
        html += '<button class="x" id="dialogCloseButton" aria-label="Close">×</button></div>';
        html += '<div class="modal-b">' + this.bodyHtml;
        html += '<div class="err" id="dialogError"></div></div>';

        if (this.onSave !== null) {
            html += '<div class="modal-f">';
            html += '<button class="btn ghost" id="dialogCancelButton">Cancel</button>';
            html += '<button class="btn" id="dialogSaveButton">' + htmlHelper.escapeText(this.saveButtonText) + '</button>';
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    connectButtons() {
        const dialog = this;

        this.findInside("dialogCloseButton").addEventListener("click", function () {
            dialog.close();
        });

        if (this.onSave !== null) {
            this.findInside("dialogCancelButton").addEventListener("click", function () {
                dialog.close();
            });
            this.findInside("dialogSaveButton").addEventListener("click", function () {
                dialog.handleSaveClick();
            });
        }
    }

    handleSaveClick() {
        try {
            this.onSave(this);
            this.close();
        } catch (error) {
            this.showError(error.message);
        }
    }

    findInside(elementId) {
        return this.backgroundElement.querySelector("#" + elementId);
    }

    getElement() {
        return this.backgroundElement;
    }

    showError(messageText) {
        this.findInside("dialogError").textContent = messageText;
    }

    close() {
        if (this.backgroundElement !== null) {
            this.backgroundElement.remove();
            this.backgroundElement = null;
        }
    }
}
