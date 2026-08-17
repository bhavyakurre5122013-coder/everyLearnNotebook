(function(ns){
    "use strict";
/* everyLearn — Notes Editor */
function focusNotesEditor() {
    document
        .getElementById("notesEditor")
        ?.focus();
}

function insertTextAtCursor(text) {
    focusNotesEditor();

    document.execCommand(
        "insertText",
        false,
        text
    );
}

    ns.focusNotesEditor = focusNotesEditor;
    ns.insertTextAtCursor = insertTextAtCursor;
})(window.everyLearn);
