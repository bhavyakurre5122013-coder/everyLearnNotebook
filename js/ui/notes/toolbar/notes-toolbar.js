(function(ns){
    "use strict";

    const api = () => ns.notesEditorAPI;

    const escapeHTML = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    function option(value, label) {
        return `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`;
    }

    const icons = {
        copy: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="1.8"/><path d="M5 16V5.8C5 4.8 5.8 4 6.8 4H15"/><path d="M10 12h7M10 15h7M10 18h5"/></svg>`,
        cut: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="m8 7 10 10M8 17 18 7"/></svg>`,
        paste: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M8 4h8v3H8z"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 11h6M9 14h6M9 17h4"/></svg>`,
        clear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h10M8 5v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5"/><path d="m9 5 1-2h4l1 2M6 21h12"/><path d="m5 9 14 8"/></svg>`,
        bold: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h5.2a4 4 0 0 1 0 8H8zm0 8h6a4 4 0 0 1 0 8H8z"/></svg>`,
        italic: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5h9M5 19h9M14 5 10 19"/></svg>`,
        underline: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v6a5 5 0 0 0 10 0V5M5 21h14"/></svg>`,
        overline: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12M8 7v4a4 4 0 0 0 8 0V7"/></svg>`,
        strike: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M8 8.5c0-2 1.8-3.5 4-3.5 2.4 0 4 1.2 4 3.2M9 15.5c.4 1.5 1.8 2.5 3.8 2.5 2.2 0 3.7-1.1 3.7-3"/></svg>`,
        bulletList: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="7" r="1.2"/><circle cx="5" cy="12" r="1.2"/><circle cx="5" cy="17" r="1.2"/><path d="M9 7h10M9 12h10M9 17h10"/></svg>`,
        numberList: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h2v3M4 9h2M4 11h2M4 14h-1l2-3 1 2"/><path d="M9 7h10M9 12h10M9 17h10"/></svg>`,
        descriptionList: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h4M4 12h4M4 18h4M10 6h10M10 12h10M10 18h10"/></svg>`,
        link: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a4 4 0 0 0 5.7.2l2-2A4 4 0 0 0 12 5.5l-1.1 1.1"/><path d="M14 11a4 4 0 0 0-5.7-.2l-2 2A4 4 0 0 0 12 18.5l1.1-1.1"/></svg>`,
        textColor: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 10.5 6h3L18 18M8 14h8"/><path d="M6 21h12"/></svg>`,
        highlight: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 9-9 4 4-9 9H5z"/><path d="M12 19h8"/></svg>`,
        case: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17 9 7l4 10M6.5 13h5M14 7h4M16 7v10M14 17h4"/></svg>`,
        subscript: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6l7 7M11 6 4 13"/><path d="M15 16c0-2 4-2 4 0 0 1-4 2-4 3h4"/></svg>`,
        superscript: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l7 7M11 12 4 19"/><path d="M15 5c0-2 4-2 4 0 0 1-4 2-4 3h4"/></svg>`,
        alignLeft: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 10h10M5 14h14M5 18h10"/></svg>`,
        alignCenter: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M7 10h10M5 14h14M7 18h10"/></svg>`,
        alignRight: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M9 10h10M5 14h14M9 18h10"/></svg>`,
        justify: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 10h14M5 14h14M5 18h14"/></svg>`
    };

    function button(command, iconName, title, extra = "") {
        return `
            <button
                class="editor-tool editor-icon-tool"
                type="button"
                data-note-command="${escapeHTML(command)}"
                title="${escapeHTML(title)}"
                aria-label="${escapeHTML(title)}"
                ${extra}
            >${icons[iconName] || ""}</button>`;
    }

    function group(content, label, extraClass = "") {
        return `
            <div class="notes-ribbon-group ${extraClass}" aria-label="${escapeHTML(label)}">
                <div class="notes-ribbon-group-content">${content}</div>
                <div class="notes-ribbon-group-label">${escapeHTML(label)}</div>
            </div>`;
    }

    function selectControl(selectName, ariaLabel, label, options, className = "") {
        return `
            <div class="editor-ribbon-select ${className}">
                ${label ? `<span class="editor-ribbon-mini-label">${escapeHTML(label)}</span>` : ""}
                <select class="editor-select" data-note-select="${escapeHTML(selectName)}" aria-label="${escapeHTML(ariaLabel)}">
                    ${options}
                </select>
            </div>`;
    }

    function renderNotesToolbar() {
        const toolbar = document.getElementById("notesToolbar");
        if (!toolbar) return;

        toolbar.innerHTML = `
            ${group(
                button("paste", "paste", "Paste") +
                button("cut", "cut", "Cut") +
                button("copy", "copy", "Copy"),
                "Clipboard"
            )}

            ${group(
                button("clear", "clear", "Clear formatting") +
                button("bold", "bold", "Bold") +
                button("italic", "italic", "Italic") +
                button("underline", "underline", "Underline") +
                button("overline", "overline", "Overline") +
                button("strikeThrough", "strike", "Strikethrough"),
                "Font formatting"
            )}

            ${group(
                selectControl("heading", "Text style", "", 
                    option("p", "Text") + option("h1", "Heading 1") + option("h2", "Heading 2") +
                    option("h3", "Heading 3") + option("h4", "Heading 4") + option("h5", "Heading 5") + option("h6", "Heading 6")
                ),
                "Styles"
            )}

            ${group(
                button("insertUnorderedList", "bulletList", "Bulleted list") +
                button("insertOrderedList", "numberList", "Numbered list") +
                button("descriptionList", "descriptionList", "Description list"),
                "Lists"
            )}

            ${group(
                button("link", "link", "Insert link"),
                "Insert"
            )}

            ${group(
                selectControl("font", "Font family", "", 
                    option("Arial, Helvetica, sans-serif", "Arial") +
                    option("Georgia, serif", "Georgia") +
                    option("'Times New Roman', serif", "Times New Roman") +
                    option("Verdana, Geneva, sans-serif", "Verdana") +
                    option("Tahoma, sans-serif", "Tahoma") +
                    option("'Courier New', monospace", "Courier New") +
                    option("'Trebuchet MS', sans-serif", "Trebuchet MS")
                ) +
                selectControl("font-size", "Font size", "", 
                    option("12", "12") + option("14", "14") + option("16", "16") + option("18", "18") +
                    option("20", "20") + option("24", "24") + option("28", "28") + option("32", "32") +
                    option("40", "40") + option("48", "48")
                ),
                "Font"
            )}

            ${group(
                `<label class="editor-color-tool" title="Text color">
                    ${icons.textColor}
                    <input type="color" data-note-color="text" value="#172033" aria-label="Text color">
                </label>
                <label class="editor-color-tool" title="Highlight color">
                    ${icons.highlight}
                    <input type="color" data-note-color="highlight" value="#FFF2A8" aria-label="Highlight color">
                </label>`,
                "Colors"
            )}

            ${group(
                selectControl("case", "Text case", "", 
                    option("", "Case") + option("upper", "UPPERCASE") + option("lower", "lowercase") +
                    option("capitalize", "Capitalize Each Word") + option("toggle", "tOGGLE cASE") +
                    option("sentence", "Sentence case")
                ),
                "Case"
            )}

            ${group(
                button("subscript", "subscript", "Subscript") +
                button("superscript", "superscript", "Superscript"),
                "Script"
            )}

            ${group(
                selectControl("line-space", "Line spacing", "", 
                    option("1", "1.0") + option("1.15", "1.15") + option("1.5", "1.5") +
                    option("2", "2.0") + option("2.5", "2.5")
                ) +
                selectControl("paragraph-space", "Paragraph spacing", "", 
                    option("0", "0") + option("8", "8") + option("16", "16") +
                    option("24", "24") + option("32", "32")
                ),
                "Spacing"
            )}

            ${group(
                button("justifyLeft", "alignLeft", "Align left") +
                button("justifyCenter", "alignCenter", "Align center") +
                button("justifyRight", "alignRight", "Align right") +
                button("justifyFull", "justify", "Justify"),
                "Paragraph"
            )}
        `;

        attachToolbarEvents(toolbar);
        api().attachSelectionTracking();
    }

    function attachToolbarEvents(toolbar) {
        toolbar.onmousedown = event => {
            if (event.target.closest("button, select, input")) {
                api().saveSelection();
            }
        };

        toolbar.onchange = event => {
            const target = event.target;
            if (target.matches("[data-note-select='heading']")) {
                api().applyHeading(target.value);
                return;
            }
            if (target.matches("[data-note-select='font']")) {
                api().applyFont(target.value);
                return;
            }
            if (target.matches("[data-note-select='font-size']")) {
                api().applyFontSize(target.value);
                return;
            }
            if (target.matches("[data-note-select='case']")) {
                api().applyCase(target.value);
                target.value = "";
                return;
            }
            if (target.matches("[data-note-select='line-space']")) {
                api().applyLineSpacing(target.value);
                return;
            }
            if (target.matches("[data-note-select='paragraph-space']")) {
                api().applyParagraphSpacing(target.value);
                return;
            }
            if (target.matches("[data-note-color='text']")) {
                api().applyColor("text", target.value);
                return;
            }
            if (target.matches("[data-note-color='highlight']")) {
                api().applyColor("highlight", target.value);
            }
        };

        toolbar.onclick = event => {
            const buttonElement = event.target.closest("[data-note-command]");
            if (!buttonElement) return;

            switch (buttonElement.dataset.noteCommand) {
                case "clear": api().clearFormatting(); break;
                case "copy": api().copySelection(); break;
                case "cut": api().cutSelection(); break;
                case "paste": api().pasteClipboard(); break;
                case "overline": api().wrapSelection({ textDecorationLine: "overline" }); break;
                case "descriptionList": api().insertDescriptionList(); break;
                case "link": api().insertLink(); break;
                default: api().exec(buttonElement.dataset.noteCommand); break;
            }
        };
    }

    ns.renderNotesToolbar = renderNotesToolbar;
})(window.everyLearn);
