(function(ns){
    "use strict";
/* everyLearn — Notes Toolbar */
function renderNotesToolbar() {
    const toolbar =
        document.getElementById(
            "notesToolbar"
        );

    if (!toolbar) return;

    toolbar.innerHTML = `
        <button
            class="editor-tool"
            data-note-command="bold"
            type="button"
        >
            <strong>B</strong>
        </button>

        <button
            class="editor-tool"
            data-note-command="italic"
            type="button"
        >
            <em>I</em>
        </button>

        <button
            class="editor-tool"
            data-note-command="underline"
            type="button"
        >
            <u>U</u>
        </button>

        <button
            class="editor-tool"
            data-note-command="insertUnorderedList"
            type="button"
        >
            • List
        </button>

        <button
            class="editor-tool"
            data-note-command="insertOrderedList"
            type="button"
        >
            1. List
        </button>

        <button
            class="editor-tool"
            data-note-command="formatBlock"
            data-note-value="h2"
            type="button"
        >
            H2
        </button>

        <button
            class="editor-tool"
            data-note-command="formatBlock"
            data-note-value="h3"
            type="button"
        >
            H3
        </button>

        <button
            class="editor-tool"
            data-note-action="image"
            type="button"
        >
            Image
        </button>
    `;

    toolbar.onclick = event => {
        const button =
            event.target.closest(
                "[data-note-command]"
            );

        if (button) {
            document.execCommand(
                button.dataset.noteCommand,
                false,
                button.dataset.noteValue ||
                    null
            );

            document.getElementById(
                "notesEditor"
            )?.focus();

            return;
        }

        if (
            event.target.closest(
                "[data-note-action='image']"
            )
        ) {
            const url =
                window.prompt(
                    "Image URL"
                );

            if (url) {
                document.execCommand(
                    "insertImage",
                    false,
                    url
                );
            }
        }
    };
}

    ns.renderNotesToolbar = renderNotesToolbar;
})(window.everyLearn);
