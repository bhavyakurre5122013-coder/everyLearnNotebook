(function(ns){
    "use strict";

    const state = ns.state;
    const saveTopicNotes = (...args) => ns.saveTopicNotes(...args);
    const scheduleAutosave = (...args) => ns.scheduleAutosave(...args);
    const cancelAutosave = (...args) => ns.cancelAutosave(...args);

    let activeNotebookId = null;
    let activeTopicId = null;
    let dirty = false;

    function getEditor() {
        return document.getElementById("notesEditor");
    }

    function setSaveState(text) {
        const saveState = document.getElementById("notesSaveState");
        if (saveState) saveState.textContent = text;
    }

    function contextMatches(notebookId, topicId) {
        return activeNotebookId === notebookId && activeTopicId === topicId;
    }

    function saveNotes(notebookId = activeNotebookId, topicId = activeTopicId, html = null) {
        const editor = getEditor();
        if (!editor || notebookId == null || topicId == null) return false;

        const content = html == null ? editor.innerHTML : String(html);
        saveTopicNotes(notebookId, topicId, content);

        if (contextMatches(notebookId, topicId)) {
            dirty = false;
            setSaveState("Saved");
        }
        return true;
    }

    function flushActiveNote() {
        if (activeNotebookId == null || activeTopicId == null) return;

        cancelAutosave();

        const editor = getEditor();
        if (!editor || !dirty) return;

        saveNotes(activeNotebookId, activeTopicId, editor.innerHTML);
    }

    function markDirty() {
        const editor = getEditor();
        if (!editor || activeNotebookId == null || activeTopicId == null) return;

        dirty = true;
        setSaveState("Unsaved changes");

        const notebookId = activeNotebookId;
        const topicId = activeTopicId;
        const html = editor.innerHTML;

        scheduleAutosave(() => {
            if (!contextMatches(notebookId, topicId)) return;
            saveNotes(notebookId, topicId, html);
        }, 650);
    }

    function renderNotes(topic) {
        const editor = getEditor();
        const footer = document.getElementById("notesFooter");
        if (!editor || !footer || !topic) return;

        const notebookChanged = activeNotebookId !== state.notebookId;
        const topicChanged = activeTopicId !== topic.id;
        const contextChanged = notebookChanged || topicChanged;

        if (contextChanged) {
            flushActiveNote();
            ns.notesEditorAPI?.resetSelection();

            activeNotebookId = state.notebookId;
            activeTopicId = topic.id;
            dirty = false;

            editor.innerHTML = topic.notes || "";
        }

        ns.renderNotesToolbar?.();
        ns.notesEditorAPI?.attachSelectionTracking();

        footer.innerHTML = `
            <span class="notes-save-state" id="notesSaveState">
                ${dirty ? "Unsaved changes" : "Saved"}
            </span>
            <button class="save-button" id="saveNotesButton" type="button">
                <img src="./assets/icons/ui/bookmark.svg" alt=""> Save notes
            </button>
        `;

        editor.oninput = markDirty;
        footer.querySelector("#saveNotesButton").onclick = () => {
            cancelAutosave();
            const currentEditor = getEditor();
            if (!currentEditor) return;
            saveNotes(activeNotebookId, activeTopicId, currentEditor.innerHTML);
        };
    }

    ns.renderNotes = renderNotes;
    ns.flushNotes = flushActiveNote;
})(window.everyLearn);
