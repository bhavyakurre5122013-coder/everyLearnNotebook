(function(ns){
    "use strict";

    let savedRange = null;

    function getEditor() {
        return document.getElementById("notesEditor");
    }

    function focusNotesEditor() {
        const editor = getEditor();
        if (!editor) return;
        editor.focus();
        restoreSelection();
    }

    function selectionInsideEditor() {
        const editor = getEditor();
        const selection = window.getSelection();
        if (!editor || !selection || !selection.rangeCount) return false;
        const range = selection.getRangeAt(0);
        return editor.contains(range.commonAncestorContainer);
    }

    function saveSelection() {
        const editor = getEditor();
        const selection = window.getSelection();
        if (!editor || !selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;
        savedRange = range.cloneRange();
    }

    function restoreSelection() {
        const editor = getEditor();
        const selection = window.getSelection();
        if (!editor || !selection) return;
        if (!savedRange) {
            editor.focus();
            return;
        }
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }

    function selectEditorContents() {
        const editor = getEditor();
        if (!editor) return;
        const range = document.createRange();
        range.selectNodeContents(editor);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        savedRange = range.cloneRange();
    }

    function exec(command, value = null) {
        const editor = getEditor();
        if (!editor) return false;
        editor.focus();
        restoreSelection();
        try {
            const result = document.execCommand(command, false, value);
            saveSelection();
            editor.dispatchEvent(new Event("input", { bubbles: true }));
            return result;
        } catch (error) {
            console.warn("Notes command failed:", command, error);
            return false;
        }
    }

    function insertHTML(html) {
        const editor = getEditor();
        if (!editor) return;
        editor.focus();
        restoreSelection();

        try {
            document.execCommand("insertHTML", false, html);
        } catch (error) {
            const selection = window.getSelection();
            if (!selection || !selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const template = document.createElement("template");
            template.innerHTML = html;
            range.insertNode(template.content);
            range.collapse(false);
        }

        saveSelection();
        editor.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function insertTextAtCursor(text) {
        const safeText = String(text ?? "");
        if (!safeText) return;
        exec("insertText", safeText);
    }

    function getSelectedText() {
        const selection = window.getSelection();
        return selection ? selection.toString() : "";
    }

    function getSelectedRootElement() {
        const editor = getEditor();
        if (!editor) return null;
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return editor;
        let node = selection.getRangeAt(0).startContainer;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        while (node && node !== editor) {
            if (/^(P|DIV|H[1-6]|LI|DT|DD|BLOCKQUOTE|PRE)$/.test(node.tagName)) {
                return node;
            }
            node = node.parentElement;
        }
        return editor;
    }

    function wrapSelection(style, tag = "span") {
        const editor = getEditor();
        if (!editor) return;
        editor.focus();
        restoreSelection();

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || selection.isCollapsed) {
            const node = document.createElement(tag);
            Object.assign(node.style, style);
            node.appendChild(document.createTextNode(""));
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            range.insertNode(node);
            const newRange = document.createRange();
            newRange.setStart(node, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            saveSelection();
            return;
        }

        try {
            const wrapper = document.createElement(tag);
            Object.assign(wrapper.style, style);
            selection.getRangeAt(0).surroundContents(wrapper);
        } catch (error) {
            insertHTML(`<${tag} style="${styleToString(style)}">${escapeHTML(selection.toString())}</${tag}>`);
        }

        saveSelection();
        editor.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function styleToString(style) {
        return Object.entries(style)
            .map(([key, value]) => {
                const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
                return `${cssKey}:${String(value).replace(/"/g, "&quot;")}`;
            })
            .join(";");
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function clearFormatting() {
        exec("removeFormat");
        exec("formatBlock", "p");
    }

    function applyFont(fontFamily) {
        if (!fontFamily) return;
        exec("fontName", fontFamily);
    }

    function applyHeading(tagName) {
        exec("formatBlock", tagName || "p");
    }

    function applyFontSize(size) {
        if (!size) return;
        wrapSelection({ fontSize: `${size}px` });
    }

    function applyLineSpacing(value) {
        const root = getSelectedRootElement();
        if (!root || root.id === "notesEditor") return;
        root.style.lineHeight = value;
        getEditor()?.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function applyParagraphSpacing(value) {
        const root = getSelectedRootElement();
        if (!root || root.id === "notesEditor") return;
        root.style.marginBottom = `${value}px`;
        getEditor()?.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function applyColor(type, color) {
        if (!color) return;
        exec(type === "highlight" ? "hiliteColor" : "foreColor", color);
    }

    function applyCase(mode) {
        const editor = getEditor();
        const selection = window.getSelection();
        if (!editor || !selection || !selection.rangeCount) return;
        restoreSelection();

        let text = selection.toString();
        if (!text) return;

        switch (mode) {
            case "upper":
                text = text.toUpperCase();
                break;
            case "lower":
                text = text.toLowerCase();
                break;
            case "capitalize":
                text = text.toLowerCase().replace(/\b\p{L}/gu, char => char.toUpperCase());
                break;
            case "toggle":
                text = [...text].map(char => {
                    if (char.toLowerCase() === char.toUpperCase()) return char;
                    return char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
                }).join("");
                break;
            case "sentence":
                text = text.toLowerCase().replace(/(^|[.!?]\s+)(\p{L})/gu, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);
                break;
            default:
                return;
        }

        document.execCommand("insertText", false, text);
        saveSelection();
        editor.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function insertLink() {
        const selectedText = getSelectedText();
        const url = window.prompt("Link URL", "https://");
        if (!url) return;

        if (selectedText) {
            exec("createLink", url.trim());
            return;
        }

        const label = window.prompt("Link text", url);
        if (!label) return;
        insertHTML(`<a href="${escapeHTML(url.trim())}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`);
    }

    function insertDescriptionList() {
        insertHTML(`
            <dl class="notes-description-list">
                <dt>Term</dt>
                <dd>Description</dd>
            </dl>
        `);
    }

    async function copySelection() {
        const text = getSelectedText();
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            exec("copy");
        }
    }

    async function cutSelection() {
        try {
            await navigator.clipboard.writeText(getSelectedText());
            exec("delete");
        } catch {
            exec("cut");
        }
    }

    async function pasteClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            if (text) insertTextAtCursor(text);
        } catch {
            window.alert("Clipboard access is unavailable here. Use Ctrl+V to paste.");
        }
    }

    function attachSelectionTracking() {
        const editor = getEditor();
        if (!editor || editor.dataset.selectionTracking === "true") return;
        editor.dataset.selectionTracking = "true";

        ["mouseup", "keyup", "input", "focus"].forEach(eventName => {
            editor.addEventListener(eventName, saveSelection);
        });

        document.addEventListener("selectionchange", () => {
            if (selectionInsideEditor()) saveSelection();
        });
    }

    ns.notesEditorAPI = {
        getEditor,
        focusNotesEditor,
        saveSelection,
        restoreSelection,
        selectEditorContents,
        exec,
        insertHTML,
        insertTextAtCursor,
        getSelectedText,
        clearFormatting,
        applyFont,
        applyHeading,
        applyFontSize,
        applyLineSpacing,
        applyParagraphSpacing,
        applyColor,
        applyCase,
        insertLink,
        insertDescriptionList,
        copySelection,
        cutSelection,
        pasteClipboard,
        wrapSelection,
        attachSelectionTracking
    };

    ns.focusNotesEditor = focusNotesEditor;
    ns.insertTextAtCursor = insertTextAtCursor;
})(window.everyLearn);
