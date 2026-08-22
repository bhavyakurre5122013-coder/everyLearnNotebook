(function(ns){
    "use strict";
    const state = ns.state;
    const saveTopicNotes = (...args) => ns.saveTopicNotes(...args);
    const scheduleAutosave = (...args) => ns.scheduleAutosave(...args);
    const renderNotesToolbar = (...args) => ns.renderNotesToolbar(...args);
/* everyLearn — Notes */





function renderNotes(topic) {
    const editor =
        document.getElementById(
            "notesEditor"
        );

    const footer =
        document.getElementById(
            "notesFooter"
        );

    if (!editor || !footer) return;

    renderNotesToolbar();
    ns.notesEditorAPI?.attachSelectionTracking();

    if (document.activeElement !== editor) {
        editor.innerHTML =
            topic.notes || "";
    }

    footer.innerHTML = `
        <span
            class="notes-save-state"
            id="notesSaveState"
        >
            Saved
        </span>

        <button
            class="save-button"
            id="saveNotesButton"
            type="button"
        >
            <img src="./assets/icons/ui/bookmark.svg" alt=""> Save notes
        </button>
    `;

    editor.oninput = () => {
        document.getElementById(
            "notesSaveState"
        ).textContent =
            "Unsaved changes";

        scheduleAutosave(
            () => saveNotes(topic.id),
            650
        );
    };

    footer.querySelector(
        "#saveNotesButton"
    ).onclick = () =>
        saveNotes(topic.id);

    document.addEventListener(
        "everylearn:save",
        () => {
            if (
                state.topicId ===
                topic.id
            ) {
                saveNotes(topic.id);
            }
        },
        { once: true }
    );
}

function saveNotes(topicId) {
    const editor =
        document.getElementById(
            "notesEditor"
        );

    if (!editor) return;

    saveTopicNotes(
        state.notebookId,
        topicId,
        editor.innerHTML
    );

    document.getElementById(
        "notesSaveState"
    ).textContent = "Saved";
}

    ns.renderNotes = renderNotes;
})(window.everyLearn);
