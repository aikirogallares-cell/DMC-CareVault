/*
 * FormBuilder.js
 * Purpose: creates form inputs from a list of field definitions and reads the values back.
 *
 * A field definition looks like this:
 *   { name: "firstName", label: "First Name", type: "text", isRequired: true }
 *   { name: "gender", label: "Gender", type: "select", options: [ {value: "Male", label: "Male"} ] }
 *   { sectionTitle: "Emergency Contact" }          <- a heading, not an input
 * Optional keys: defaultValue, isFullWidth, isReadOnly, validate (a function that returns an error text)
 * Types: text, date, time, email, number, password, textarea, select
 */
class FormBuilder {
    buildFormHtml(fieldList, existingValues) {
        let html = '<div class="fgrid">';

        for (let i = 0; i < fieldList.length; i++) {
            const field = fieldList[i];

            if (field.sectionTitle !== undefined) {
                html += "<h4>" + htmlHelper.escapeText(field.sectionTitle) + "</h4>";
            } else {
                html += this.buildOneField(field, existingValues);
            }
        }

        html += "</div>";
        return html;
    }

    buildOneField(field, existingValues) {
        const inputId = "field_" + field.name;
        const currentValue = this.getFieldValue(field, existingValues);

        let wrapperClass = "fg";
        if (field.isFullWidth === true) {
            wrapperClass = "fg full";
        }

        let labelText = htmlHelper.escapeText(field.label);
        if (field.isRequired === true) {
            labelText = labelText + " *";
        }

        let html = '<div class="' + wrapperClass + '">';
        html += '<label for="' + inputId + '">' + labelText + "</label>";

        if (field.type === "select") {
            html += this.buildSelectHtml(inputId, field, currentValue);
        } else if (field.type === "textarea") {
            html += '<textarea id="' + inputId + '" rows="2">' + htmlHelper.escapeText(currentValue) + "</textarea>";
        } else {
            let readOnlyText = "";
            if (field.isReadOnly === true) {
                readOnlyText = " readonly";
            }
            html += '<input id="' + inputId + '" type="' + field.type + '" value="' + htmlHelper.escapeText(currentValue) + '"' + readOnlyText + ' autocomplete="off">';
        }

        html += "</div>";
        return html;
    }

    // Uses the saved value if there is one, otherwise the default value, otherwise empty text.
    getFieldValue(field, existingValues) {
        if (existingValues !== undefined && existingValues[field.name] !== undefined) {
            return existingValues[field.name];
        }
        if (field.defaultValue !== undefined) {
            return field.defaultValue;
        }
        return "";
    }

    buildSelectHtml(inputId, field, currentValue) {
        let html = '<select id="' + inputId + '">';

        for (let i = 0; i < field.options.length; i++) {
            const option = field.options[i];
            let selectedText = "";
            if (option.value === currentValue) {
                selectedText = " selected";
            }
            html += '<option value="' + htmlHelper.escapeText(option.value) + '"' + selectedText + ">" + htmlHelper.escapeText(option.label) + "</option>";
        }

        html += "</select>";
        return html;
    }

    // Reads every input. Throws an Error with a clear message if a rule is broken.
    readFormValues(fieldList) {
        const values = {};

        for (let i = 0; i < fieldList.length; i++) {
            const field = fieldList[i];

            if (field.sectionTitle !== undefined) {
                continue;
            }

            const inputElement = document.getElementById("field_" + field.name);
            const enteredValue = inputElement.value.trim();

            if (field.isRequired === true) {
                const requiredError = validator.checkRequired(field.label, enteredValue);
                if (requiredError !== "") {
                    throw new Error(requiredError);
                }
            }

            if (field.validate !== undefined && enteredValue !== "") {
                const customError = field.validate(enteredValue);
                if (customError !== "") {
                    throw new Error(customError);
                }
            }

            values[field.name] = enteredValue;
        }

        return values;
    }

    // Helper to turn a simple list like ["Male","Female"] into option objects.
    createOptionsFromTexts(textList) {
        const options = [];
        for (let i = 0; i < textList.length; i++) {
            options.push({ value: textList[i], label: textList[i] });
        }
        return options;
    }
}

const formBuilder = new FormBuilder();
