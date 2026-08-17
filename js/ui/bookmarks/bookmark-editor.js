(function(ns){
    "use strict";

    const state = ns.state;
    const findTopicContext = (...args) => ns.findTopicContext(...args);
    const createLocationBookmark = (...args) => ns.createLocationBookmark(...args);
    const openDialog = (...args) => ns.openDialog(...args);

    /* everyLearnNotebook — Bookmark Editor */

    function openBookmarkEditor() {
        const context = findTopicContext(
            state.notebookId,
            state.topicId
        );

        if (!context) return;

        openDialog({
            title: "Create bookmark",
            bodyHTML: `
                <div class="stack">

                    <div class="form-group">
                        <label>
                            Bookmark name
                        </label>

                        <input
                            class="field-input"
                            id="bookmarkName"
                            value="${escapeHTML(context.topic.name)}"
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            Bookmark level
                        </label>

                        <select
                            class="field-select"
                            id="bookmarkLevel"
                        >
                            <option value="notebook">
                                Notebook
                            </option>
                            ${
                                context.section
                                    ? `
                                        <option value="section">
                                            Section
                                        </option>
                                    `
                                    : ""
                            }
                            <option value="chapter">
                                Chapter
                            </option>
                            <option value="topic" selected>
                                Topic
                            </option>
                        </select>
                    </div>

                </div>
            `,
            footerHTML: `
                <button
                    class="secondary-button"
                    data-dialog-cancel
                >
                    Cancel
                </button>

                <button
                    class="create-button"
                    data-dialog-save
                >
                    ＋ Create bookmark
                </button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector(
                    "[data-dialog-cancel]"
                ).onclick = close;

                host.querySelector(
                    "[data-dialog-save]"
                ).onclick = () => {
                    const level =
                        host.querySelector(
                            "#bookmarkLevel"
                        ).value;

                    createLocationBookmark({
                        name:
                            host.querySelector(
                                "#bookmarkName"
                            ).value.trim() ||
                            context.topic.name,
                        notebookId:
                            context.notebook.id,
                        sectionId:
                            level === "section"
                                ? context.section?.id || null
                                : null,
                        chapterId:
                            ["chapter", "topic"].includes(level)
                                ? context.chapter.id
                                : null,
                        topicId:
                            level === "topic"
                                ? context.topic.id
                                : null
                    });

                    close();
                };
            }
        });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    ns.openBookmarkEditor = openBookmarkEditor;
})(window.everyLearn);
