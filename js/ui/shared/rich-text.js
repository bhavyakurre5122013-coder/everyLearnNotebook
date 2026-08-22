(function(ns){
    "use strict";

    const SVG = {
        copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="1.8"/><path d="M5 16V5.8C5 4.8 5.8 4 6.8 4H15"/><path d="M10 12h7M10 15h7M10 18h5"/></svg>',
        cut: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><path d="m8 7 10 10M8 17 18 7"/></svg>',
        format: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h9a3 3 0 0 1 2.12 5.12A3 3 0 0 1 14 15H8v5H5V4Zm3 3v5h5a1.5 1.5 0 0 0 0-3H8V7Zm7.5 9.5 2-2 2 2-2 2-2-2Z" fill="currentColor"/></svg>',
        paste: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M8 4h8v3H8z"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M9 11h6M9 14h6M9 17h4"/></svg>',
        clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h10M8 5v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5"/><path d="m9 5 1-2h4l1 2M6 21h12"/><path d="m5 9 14 8"/></svg>',
        bold: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h5.2a4 4 0 0 1 0 8H8zm0 8h6a4 4 0 0 1 0 8H8z"/></svg>',
        italic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5h9M5 19h9M14 5 10 19"/></svg>',
        underline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5v6a5 5 0 0 0 10 0V5M5 21h14"/></svg>',
        overline: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12M8 7v4a4 4 0 0 0 8 0V7"/></svg>',
        strike: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M8 8.5c0-2 1.8-3.5 4-3.5 2.4 0 4 1.2 4 3.2M9 15.5c.4 1.5 1.8 2.5 3.8 2.5 2.2 0 3.7-1.1 3.7-3"/></svg>',
        text: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14M12 5v14M8 19h8"/></svg>',
        textColor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 10.5 6h3L18 18M8 14h8"/><path d="M6 21h12"/></svg>',
        highlight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 15 9-9 4 4-9 9H5z"/><path d="M12 19h8"/></svg>',
        case: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17 9 7l4 10M6.5 13h5M14 7h4M16 7v10M14 17h4"/></svg>',
        sub: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6l7 7M11 6 4 13"/><path d="M15 16c0-2 4-2 4 0 0 1-4 2-4 3h4"/></svg>',
        super: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l7 7M11 12 4 19"/><path d="M15 5c0-2 4-2 4 0 0 1-4 2-4 3h4"/></svg>',
        left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 10h10M5 14h14M5 18h10"/></svg>',
        center: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M7 10h10M5 14h14M7 18h10"/></svg>',
        right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M9 10h10M5 14h14M9 18h10"/></svg>',
        justify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 10h14M5 14h14M5 18h14"/></svg>'
    };

    const groups = [
        {
            label: "Clipboard",
            items: [
                button("paste", "Paste", SVG.paste, "paste"),
                button("cut", "Cut", SVG.cut, "exec", "cut"),
                button("copy", "Copy", SVG.copy, "exec", "copy")
            ]
        },
        {
            label: "Font",
            items: [
                button("bold", "Bold", SVG.bold, "exec", "bold"),
                button("italic", "Italic", SVG.italic, "exec", "italic"),
                button("underline", "Underline", SVG.underline, "exec", "underline"),
                button("overline", "Overline", SVG.overline, "style", "overline"),
                button("strikeThrough", "Strikethrough", SVG.strike, "exec", "strikeThrough"),
                select("fontName", "Font", ["Arial","Calibri","Aptos","Georgia","Times New Roman","Verdana","Courier New"]),
                select("fontSize", "Size", ["1","2","3","4","5","6","7"])
            ]
        },
        {
            label: "Styles",
            items: [
                select("formatBlock", "Style", ["p","h1","h2","h3","h4","h5","h6"])
            ]
        },
        {
            label: "Colors",
            items: [
                button("foreColor", "Text color", SVG.textColor, "color", "text"),
                button("hiliteColor", "Highlight", SVG.highlight, "color", "highlight")
            ]
        },
        {
            label: "Case & Script",
            items: [
                select("case", "Case", ["Uppercase","lowercase","Capitalize Each Word","tOGGLE cASE","Sentence case"]),
                button("subscript", "Subscript", SVG.sub, "exec", "subscript"),
                button("superscript", "Superscript", SVG.super, "exec", "superscript")
            ]
        },
        {
            label: "Spacing",
            items: [
                select("lineHeight", "Line spacing", ["1","1.15","1.5","2"]),
                select("paragraphSpacing", "Paragraph spacing", ["0","4","8","12","16"])
            ]
        },
        {
            label: "Paragraph",
            items: [
                button("justifyLeft", "Align left", SVG.left, "exec", "justifyLeft"),
                button("justifyCenter", "Align center", SVG.center, "exec", "justifyCenter"),
                button("justifyRight", "Align right", SVG.right, "exec", "justifyRight"),
                button("justifyFull", "Justify", SVG.justify, "exec", "justifyFull")
            ]
        }
    ];

    function button(id, title, icon, action, value) {
        return `<button type="button" class="rich-tool-button" data-rich-action="${action}" data-rich-value="${value || id}" title="${title}" aria-label="${title}">${icon}</button>`;
    }

    function select(id, title, values) {
        return `<select class="rich-tool-select" data-rich-action="select" data-rich-value="${id}" title="${title}" aria-label="${title}">${values.map(value => `<option value="${escapeAttr(value)}">${escapeHTML(displayValue(id, value))}</option>`).join("")}</select>`;
    }

    function displayValue(id, value) {
        if (id === "formatBlock") return value === "p" ? "Text" : value.toUpperCase();
        if (id === "fontSize") return ({1:"8",2:"10",3:"12",4:"14",5:"18",6:"24",7:"36"})[value] || value;
        return value;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttr(value) {
        return escapeHTML(value).replaceAll("`", "&#096;");
    }

    let savedEditorSelection = null;

    function preserveSelection(editor) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return null;
        return selection.getRangeAt(0).cloneRange();
    }

    function restoreSelection(range) {
        if (!range) return;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function preserveEditorSelection(editor) {
        savedEditorSelection = preserveSelection(editor);
    }

    function restoreEditorSelection(editor) {
        if (!savedEditorSelection) {
            editor.focus();
            return;
        }
        restoreSelection(savedEditorSelection);
    }

    function exec(editor, command, value = null) {
        restoreEditorSelection(editor);
        document.execCommand(command, false, value);
        sync(editor);
        editor.focus();
    }

    function selectedText(editor) {
        const selection = window.getSelection();
        return selection && selection.rangeCount && editor.contains(selection.anchorNode)
            ? selection.toString()
            : "";
    }

    function applyCase(editor, mode) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return;
        const range = selection.getRangeAt(0);
        const text = selection.toString();
        if (!text) return;
        const converted = caseTransform(text, mode);
        range.deleteContents();
        range.insertNode(document.createTextNode(converted));
        sync(editor);
    }

    function caseTransform(text, mode) {
        if (mode === "Uppercase") return text.toUpperCase();
        if (mode === "lowercase") return text.toLowerCase();
        if (mode === "Capitalize Each Word") return text.toLowerCase().replace(/\b([a-z])/g, char => char.toUpperCase());
        if (mode === "tOGGLE cASE") return [...text].map(ch => ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase()).join("");
        if (mode === "Sentence case") return text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
        return text;
    }

    function applyColor(editor, type) {
        const color = window.prompt(type === "highlight" ? "Highlight color (e.g. #fff59d):" : "Text color (e.g. #1d4ed8):", type === "highlight" ? "#fff59d" : "#1d4ed8");
        if (!color) return;
        exec(editor, type === "highlight" ? "hiliteColor" : "foreColor", color);
    }

    async function pasteInto(editor) {
        editor.focus();
        try {
            const text = await navigator.clipboard.readText();
            document.execCommand("insertText", false, text);
            sync(editor);
        } catch {
            document.execCommand("paste");
            sync(editor);
        }
    }

    function applyStyle(editor, value) {
        if (value === "overline") {
            document.execCommand("createLink", false, "#");
            const selection = window.getSelection();
            if (selection && selection.anchorNode) {
                const link = selection.anchorNode.parentElement?.closest("a");
                if (link) {
                    link.removeAttribute("href");
                    link.style.textDecoration = "overline";
                }
            }
            sync(editor);
        }
    }

    function applySelect(editor, type, value) {
        if (type === "formatBlock") exec(editor, "formatBlock", value);
        else if (type === "fontName") exec(editor, "fontName", value);
        else if (type === "fontSize") exec(editor, "fontSize", value);
        else if (type === "lineHeight") {
            restoreEditorSelection(editor);
            applyBlockStyle(editor, "lineHeight", value);
            editor.focus();
        }
        else if (type === "paragraphSpacing") {
            restoreEditorSelection(editor);
            applyBlockStyle(editor, "marginBottom", value + "px");
            editor.focus();
        }
        else if (type === "case") {
            restoreEditorSelection(editor);
            applyCase(editor, value);
            editor.focus();
        }
    }

    function applyBlockStyle(editor, property, value) {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || !editor.contains(selection.anchorNode)) return;
        let node = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection.anchorNode.parentElement;
        if (!node) return;
        let block = node.closest("p,h1,h2,h3,h4,h5,h6,div,li") || editor;
        block.style[property] = value;
        sync(editor);
    }

    function link(editor) {
        const url = window.prompt("Link URL:", "https://");
        if (!url) return;
        exec(editor, "createLink", url);
    }

    function makeToolbar(editor) {
        const toolbar = document.createElement("div");
        toolbar.className = "rich-editor-toolbar";
        toolbar.setAttribute("role", "toolbar");
        toolbar.innerHTML = groups.map(group => `
            <div class="rich-editor-group">
                <div class="rich-editor-group-controls">${group.items.join("")}</div>
                <div class="rich-editor-group-label">${escapeHTML(group.label)}</div>
            </div>
        `).join("");

        toolbar.addEventListener("mousedown", event => {
            const target = event.target.closest("button, select");
            if (!target) return;

            // Buttons must not steal the text selection. Native selects must
            // keep their default mouse behavior so their option popup opens.
            if (target.matches("button")) event.preventDefault();
            preserveEditorSelection(editor);
        });

        toolbar.addEventListener("click", async event => {
            const target = event.target.closest("button[data-rich-action]");
            if (!target) return;
            const action = target.dataset.richAction;
            const value = target.dataset.richValue;

            if (action === "exec") exec(editor, value);
            else if (action === "paste") await pasteInto(editor);
            else if (action === "link") link(editor);
            else if (action === "color") applyColor(editor, value);
            else if (action === "style") applyStyle(editor, value);
            else if (action === "focus") editor.focus();
        });

        // Native <select> controls emit `change` when an option is actually
        // chosen. Handling them here avoids relying on click behavior, which
        // is inconsistent for option selection across browsers.
        toolbar.addEventListener("change", event => {
            const target = event.target.closest("select[data-rich-action=select]");
            if (!target) return;
            preserveEditorSelection(editor);
            applySelect(editor, target.dataset.richValue, target.value);
        });

        return toolbar;
    }

    function toEditorHTML(value) {
        const raw = String(value ?? "");
        if (!raw) return "<p><br></p>";
        if (/<\/?(p|div|br|strong|em|u|span|ol|ul|li|h[1-6]|a|sub|sup)\b/i.test(raw)) return sanitizeHTML(raw);
        return escapeHTML(raw).replace(/\r?\n/g, "<br>");
    }

    function sanitizeHTML(html) {
        const template = document.createElement("template");
        template.innerHTML = html;
        template.content.querySelectorAll("script,style,iframe,object,embed,form,meta,link").forEach(node => node.remove());
        template.content.querySelectorAll("*").forEach(node => {
            [...node.attributes].forEach(attr => {
                const name = attr.name.toLowerCase();
                const value = attr.value;
                if (name.startsWith("on")) node.removeAttribute(attr.name);
                if (name === "href" && /^\s*javascript:/i.test(value)) node.removeAttribute(attr.name);
                if (name === "src" && /^\s*javascript:/i.test(value)) node.removeAttribute(attr.name);
            });
        });
        return template.innerHTML;
    }

    function plainText(editor) {
        return editor.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    }

    function sync(editor) {
        const host = editor.closest(".rich-editor" ) || editor.parentElement;
        const textarea = host?.querySelector("textarea.rich-source-textarea");
        if (!textarea) return;
        textarea.value = plainText(editor);
        textarea.dataset.richHtml = sanitizeHTML(editor.innerHTML);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function collapse(instance) {
        if (!instance || instance.collapsed) return;
        const { wrapper, textarea, editor, button } = instance;
        textarea.classList.remove("rich-source-textarea");
        textarea.hidden = false;
        textarea.style.display = "";
        textarea.value = plainText(editor);
        textarea.dataset.richHtml = sanitizeHTML(editor.innerHTML);
        wrapper.replaceWith(textarea);
        instance.collapsed = true;
        textarea.dataset.richEnhanced = "0";
        textarea.dataset.richLauncher = "0";
        delete textarea.__richInstance;
        attachLauncher(textarea);
    }

    function expand(textarea) {
        if (textarea.dataset.richEnhanced === "1") return;

        const sourceParent = textarea.parentElement;
        const launcherId = textarea.dataset.richLauncherId;
        const originalLauncher = launcherId
            ? sourceParent?.querySelector(`.rich-format-launcher[data-rich-target="${CSS.escape(launcherId)}"]`)
            : sourceParent?.querySelector(".rich-format-launcher");
        originalLauncher?.remove();

        textarea.dataset.richEnhanced = "1";

        const wrapper = document.createElement("div");
        wrapper.className = "rich-editor";

        const topbar = document.createElement("div");
        topbar.className = "rich-editor-topbar";

        const close = document.createElement("button");
        close.type = "button";
        close.className = "rich-editor-close";
        close.innerHTML = "×";
        close.title = "Close advanced formatting";
        topbar.appendChild(close);

        const source = textarea;
        source.classList.add("rich-source-textarea");
        source.hidden = true;
        source.style.display = "none";

        const editor = document.createElement("div");
        editor.className = "rich-editor-content";
        editor.contentEditable = "true";
        editor.setAttribute("role", "textbox");
        editor.setAttribute("aria-multiline", "true");
        editor.innerHTML = source.dataset.richHtml ? sanitizeHTML(source.dataset.richHtml) : toEditorHTML(source.value);

        topbar.appendChild(makeToolbar(editor));
        wrapper.appendChild(topbar);
        wrapper.appendChild(editor);
        source.parentElement.insertBefore(wrapper, source);
        wrapper.appendChild(source);

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "rich-format-launcher rich-format-launcher-in-editor";
        toggle.innerHTML = SVG.format;
        toggle.title = "Close advanced formatting";
        toggle.setAttribute("aria-label", "Close advanced formatting");
        wrapper.appendChild(toggle);

        const instance = { wrapper, textarea: source, editor, button: toggle, collapsed: false };
        source.__richInstance = instance;

        editor.addEventListener("input", () => sync(editor));
        editor.addEventListener("blur", () => {
            source.value = plainText(editor);
            source.dataset.richHtml = sanitizeHTML(editor.innerHTML);
        });

        close.addEventListener("click", () => collapse(instance));
        toggle.addEventListener("click", () => collapse(instance));
    }

    let launcherSequence = 0;

    function attachLauncher(textarea) {
        if (!(textarea instanceof HTMLTextAreaElement)) return;
        if (textarea.id === "notesEditor" || textarea.dataset.richIgnore === "true") return;
        if (textarea.dataset.richLauncher === "1") return;

        textarea.dataset.richLauncher = "1";
        if (!textarea.dataset.richLauncherId) {
            launcherSequence += 1;
            textarea.dataset.richLauncherId = `rich-${launcherSequence}`;
        }
        const parent = textarea.parentElement;
        if (!parent) return;
        if (getComputedStyle(parent).position === "static") parent.style.position = "relative";

        const launcher = document.createElement("button");
        launcher.type = "button";
        launcher.className = "rich-format-launcher";
        launcher.dataset.richTarget = textarea.dataset.richLauncherId;
        launcher.innerHTML = SVG.format;
        launcher.title = "Advanced formatting";
        launcher.setAttribute("aria-label", "Advanced formatting");
        launcher.addEventListener("mousedown", event => event.preventDefault());
        launcher.addEventListener("click", () => expand(textarea));
        parent.appendChild(launcher);
    }

    function scan(root = document) {
        root.querySelectorAll?.("textarea").forEach(attachLauncher);
        if (root instanceof HTMLTextAreaElement) attachLauncher(root);
    }

    function initRichTextEditors() {
        scan(document);
        const observer = new MutationObserver(records => {
            for (const record of records) {
                record.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) scan(node);
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    ns.initRichTextEditors = initRichTextEditors;
    ns.richTextToPlain = value => {
        const box = document.createElement("div");
        box.innerHTML = sanitizeHTML(value);
        return box.innerText || box.textContent || "";
    };
    ns.richTextSanitize = sanitizeHTML;
})(window.everyLearn);
