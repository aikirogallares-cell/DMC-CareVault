
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
    constructor() {
        // One listener for the whole page. It keeps "digits only" boxes limited to numbers.
        document.addEventListener("input", function (event) {
            if (event.target.getAttribute("data-digits-only") === "1") {
                event.target.value = event.target.value.replace(/[^0-9]/g, "");
            }
        });
    }
        buildOneField(field, existingValues) {
        const inputId = "field_" + field.name;
        const currentValue = this.getFieldValue(field, existingValues);

        let wrapperClass = "fg";
        if (field.isFullWidth === true) {
            wrapperClass = "fg full";
        }

        // For a search box, the label points at the visible search box, not the hidden value box.
        let labelTargetId = inputId;
        if (field.type === "searchselect") {
            labelTargetId = inputId + "_search";
        }

        let labelText = htmlHelper.escapeText(field.label);
        if (field.isRequired === true) {
            labelText = labelText + " *";
        }

        let html = '<div class="' + wrapperClass + '">';
        html += '<label for="' + labelTargetId + '">' + labelText + "</label>";

        if (field.type === "select") {
            html += this.buildSelectHtml(inputId, field, currentValue);
        } else if (field.type === "searchselect") {
            html += this.buildSearchSelectHtml(inputId, field, currentValue);
        } else if (field.type === "textarea") {
            html += '<textarea id="' + inputId + '" rows="2">' + htmlHelper.escapeText(currentValue) + "</textarea>";
        } else {
            let extraAttributes = "";
            if (field.isReadOnly === true) {
                extraAttributes += " readonly";
            }
            if (field.min !== undefined) {
                extraAttributes += ' min="' + htmlHelper.escapeText(field.min) + '"';
            }
            if (field.max !== undefined) {
                extraAttributes += ' max="' + htmlHelper.escapeText(field.max) + '"';
            }
            // maxLength stops typing past that many characters (pasted text is cut to fit).
            if (field.maxLength !== undefined) {
                extraAttributes += ' maxlength="' + Number(field.maxLength) + '"';
            }
            // digitsOnly removes any letters or symbols as the user types or pastes.
            if (field.digitsOnly === true) {
                extraAttributes += ' data-digits-only="1" inputmode="numeric"';
            }
            html += '<input id="' + inputId + '" type="' + field.type + '" value="' + htmlHelper.escapeText(currentValue) + '"' + extraAttributes + ' autocomplete="off">';
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

    // ----- Searchable picker -----

    buildSearchSelectHtml(inputId, field, currentValue) {
        const shownText = this.findOptionLabel(field.options || [], currentValue);
        const placeholderText = field.placeholder || "Type a name to search...";

        let html = '<div class="picker" data-picker="' + inputId + '">';
        html += '<input type="hidden" id="' + inputId + '" value="' + htmlHelper.escapeText(currentValue) + '">';
        html += '<input type="text" id="' + inputId + '_search" value="' + htmlHelper.escapeText(shownText) + '"';
        html += ' placeholder="' + htmlHelper.escapeText(placeholderText) + '" autocomplete="off">';
        html += '<div class="picker-list" id="' + inputId + '_list"></div>';
        html += "</div>";
        return html;
    }

    // Shows the label of the option whose value matches, so an existing choice appears by name.
    findOptionLabel(optionList, value) {
        if (value === "" || value === undefined) {
            return "";
        }
        for (let i = 0; i < optionList.length; i++) {
            if (optionList[i].value === value) {
                return optionList[i].label;
            }
        }
        return value;
    }

    // Call this after the form is on the screen, so the search boxes start working.
    connectFields(containerElement, fieldList) {
        for (let i = 0; i < fieldList.length; i++) {
            if (fieldList[i].type === "searchselect") {
                this.connectSearchSelect(containerElement, fieldList[i]);
            }
        }
    }

    connectSearchSelect(containerElement, field) {
        const inputId = "field_" + field.name;
        const picker = containerElement.querySelector('[data-picker="' + inputId + '"]');
        if (picker === null) {
            return;
        }

        const hiddenBox = picker.querySelector("#" + inputId);
        const searchBox = picker.querySelector("#" + inputId + "_search");
        const listBox = picker.querySelector("#" + inputId + "_list");
        const optionList = field.options || [];
        const maximumShown = 8;
        const page = this;

        let shownMatches = [];
        let highlightIndex = -1;

        const isOpen = function () {
            return picker.classList.contains("open");
        };

        const closeList = function () {
            picker.classList.remove("open");
            highlightIndex = -1;
        };

        const updateHighlight = function () {
            const items = listBox.querySelectorAll(".picker-item");
            for (let i = 0; i < items.length; i++) {
                items[i].classList.toggle("active", i === highlightIndex);
            }
            if (highlightIndex >= 0 && items[highlightIndex] !== undefined) {
                items[highlightIndex].scrollIntoView({ block: "nearest" });
            }
        };

        const renderList = function () {
            shownMatches = page.findBestMatches(optionList, searchBox.value, maximumShown);

            if (shownMatches.length === 0) {
                listBox.innerHTML = '<div class="picker-empty">No match found. Check the spelling, or register the patient first.</div>';
                highlightIndex = -1;
            } else {
                let html = "";
                for (let i = 0; i < shownMatches.length; i++) {
                    const option = shownMatches[i].option;
                    html += '<div class="picker-item" data-index="' + i + '">' + htmlHelper.escapeText(option.label);
                    if (option.detail) {
                        html += "<small>" + htmlHelper.escapeText(option.detail) + "</small>";
                    }
                    html += "</div>";
                }
                listBox.innerHTML = html;
                highlightIndex = 0;
            }

            picker.classList.add("open");
            updateHighlight();
        };

            const chooseOption = function (option) {
            hiddenBox.value = option.value;
            hiddenBox.dispatchEvent(new Event("change", { bubbles: true }));
            searchBox.value = option.label;
            closeList();
        };

        const moveHighlight = function (step) {
            if (shownMatches.length === 0) {
                return;
            }
            highlightIndex = (highlightIndex + step + shownMatches.length) % shownMatches.length;
            updateHighlight();
        };

        searchBox.addEventListener("focus", function () {
            if (hiddenBox.value === "") {
                renderList();
            }
        });

        searchBox.addEventListener("input", function () {
        // Typing again means the earlier choice no longer applies, so the user must choose again.
        hiddenBox.value = "";
            hiddenBox.dispatchEvent(new Event("change", { bubbles: true }));
            renderList();
        });

        searchBox.addEventListener("keydown", function (event) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                if (!isOpen()) {
                    renderList();
                    return;
                }
                moveHighlight(event.key === "ArrowDown" ? 1 : -1);
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (isOpen() && highlightIndex >= 0) {
                    chooseOption(shownMatches[highlightIndex].option);
                }
            } else if (event.key === "Escape") {
                closeList();
            }
        });

        searchBox.addEventListener("blur", function () {
            closeList();
        });

        // mousedown with preventDefault keeps the search box focused until the choice is made.
        listBox.addEventListener("mousedown", function (event) {
            event.preventDefault();
            const item = event.target.closest(".picker-item");
            if (item === null) {
                return;
            }
            const match = shownMatches[Number(item.getAttribute("data-index"))];
            if (match !== undefined) {
                chooseOption(match.option);
            }
        });
    }

    // Returns the best matches, best first, as [ { option: ..., score: ... } ].
    // Every word typed must match something in the option.
    // A word that starts a name part scores most, then a word inside a name part,
    // then a word with one or two spelling mistakes.
    findBestMatches(optionList, typedText, limit) {
        const typedWords = this.splitIntoWords(typedText);
        const scoredMatches = [];

        for (let i = 0; i < optionList.length; i++) {
            const option = optionList[i];

            if (typedWords.length === 0) {
                scoredMatches.push({ option: option, score: 0 });
                continue;
            }

            const searchableText = this.normalizeForSearch(option.searchText || option.label);
            const score = this.scoreWords(typedWords, searchableText);
            if (score >= 0) {
                scoredMatches.push({ option: option, score: score });
            }
        }

        scoredMatches.sort(function (first, second) {
            if (second.score !== first.score) {
                return second.score - first.score;
            }
            return String(first.option.label).localeCompare(String(second.option.label));
        });

        return scoredMatches.slice(0, limit);
    }

    // Returns -1 if any typed word does not match at all.
    scoreWords(typedWords, searchableText) {
        const searchableWords = searchableText.split(" ");
        let total = 0;

        for (let i = 0; i < typedWords.length; i++) {
            const typedWord = typedWords[i];

            if (this.anyWordStartsWith(searchableWords, typedWord)) {
                total = total + 4;
            } else if (searchableText.indexOf(typedWord) >= 0) {
                total = total + 2;
            } else if (this.isCloseWordMatch(typedWord, searchableWords)) {
                total = total + 1;
            } else {
                return -1;
            }
        }
        return total;
    }

    anyWordStartsWith(wordList, prefix) {
        for (let i = 0; i < wordList.length; i++) {
            if (wordList[i].indexOf(prefix) === 0) {
                return true;
            }
        }
        return false;
    }

    // Allows one spelling mistake in words of 4 to 6 letters, and two in longer words.
    isCloseWordMatch(typedWord, wordList) {
        let allowedMistakes = 0;
        if (typedWord.length >= 7) {
            allowedMistakes = 2;
        } else if (typedWord.length >= 4) {
            allowedMistakes = 1;
        }
        if (allowedMistakes === 0) {
            return false;
        }

        for (let i = 0; i < wordList.length; i++) {
            const startOfWord = wordList[i].slice(0, typedWord.length);
            if (this.countEditSteps(typedWord, startOfWord) <= allowedMistakes) {
                return true;
            }
        }
        return false;
    }

    // Counts the changes needed to turn one text into another.
    // Swapping two neighboring letters counts as one change.
    countEditSteps(firstText, secondText) {
        const rowCount = firstText.length + 1;
        const columnCount = secondText.length + 1;
        const table = [];

        for (let row = 0; row < rowCount; row++) {
            table.push([]);
            for (let column = 0; column < columnCount; column++) {
                table[row].push(0);
            }
        }
        for (let row = 0; row < rowCount; row++) {
            table[row][0] = row;
        }
        for (let column = 0; column < columnCount; column++) {
            table[0][column] = column;
        }

        for (let row = 1; row < rowCount; row++) {
            for (let column = 1; column < columnCount; column++) {
                const letterCost = firstText[row - 1] === secondText[column - 1] ? 0 : 1;
                table[row][column] = Math.min(
                    table[row - 1][column] + 1,
                    table[row][column - 1] + 1,
                    table[row - 1][column - 1] + letterCost
                );

                const isSwap = row > 1 && column > 1 &&
                    firstText[row - 1] === secondText[column - 2] &&
                    firstText[row - 2] === secondText[column - 1];
                if (isSwap) {
                    table[row][column] = Math.min(table[row][column], table[row - 2][column - 2] + 1);
                }
            }
        }
        return table[rowCount - 1][columnCount - 1];
    }

    splitIntoWords(text) {
        const words = this.normalizeForSearch(text).split(" ");
        return words.filter(function (word) {
            return word !== "";
        });
    }

    // Lowercase, no accents, and only letters and digits separated by single spaces.
    // Example: "Muñoz, Ma. Cruz" becomes "munoz ma cruz".
    normalizeForSearch(text) {
        return String(text || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim();
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
                let requiredError = validator.checkRequired(field.label, enteredValue);
                if (field.type === "searchselect" && enteredValue === "") {
                    requiredError = "Please choose a " + field.label.toLowerCase() + " from the list.";
                }
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