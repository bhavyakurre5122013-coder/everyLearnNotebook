(function(ns){
    "use strict";

    const state = ns.state;

    const setQuestionImportance = (...args) =>
        ns.setQuestionImportance(...args);

    const setQuestionFavorite = (...args) =>
        ns.setQuestionFavorite(...args);

    const setQuestionBookmark = (...args) =>
        ns.setQuestionBookmark(...args);

    const updateQuestion = (...args) =>
        ns.updateQuestion(...args);

    /*
     * Question metadata controls.
     *
     * IMPORTANT:
     * The outline and filled icons are separate SVG files.
     * Toggling a marker changes the actual <img> source rather
     * than relying on CSS to fake a filled icon.
     */

    function renderQuestionMetadata(question) {
        const mount =
            document.getElementById("questionMetadata");

        if (!mount) return;

        const importance =
            Math.max(
                0,
                Math.min(
                    3,
                    Number(question.important) || 0
                )
            );

        const favorite =
            Boolean(question.favorite);

        const bookmarked =
            Boolean(question.bookmarked);

        mount.innerHTML = `
            <div class="question-meta">

                <div class="question-meta-group">
                    <span class="question-meta-label">
                        Important
                    </span>

                    <div
                        class="star-picker"
                        role="group"
                        aria-label="Importance"
                    >
                        ${[1, 2, 3].map(value => {
                            const active =
                                value <= importance;

                            return `
                                <button
                                    class="star-button ${
                                        active
                                            ? "active"
                                            : ""
                                    }"
                                    data-importance="${value}"
                                    type="button"
                                    aria-label="Set importance to ${value} star${value === 1 ? "" : "s"}"
                                    aria-pressed="${
                                        value === importance
                                            ? "true"
                                            : "false"
                                    }"
                                    title="Set importance to ${value} star${value === 1 ? "" : "s"}"
                                >
                                    <img
                                        class="marker-icon"
                                        src="./assets/icons/ui/${
                                            active
                                                ? "star-filled.svg"
                                                : "star.svg"
                                        }"
                                        alt=""
                                    >
                                </button>
                            `;
                        }).join("")}
                    </div>
                </div>

                <div class="question-meta-group">
                    <span class="question-meta-label">
                        Favorite
                    </span>

                    <button
                        class="favorite-button ${
                            favorite ? "active" : ""
                        }"
                        data-question-favorite
                        type="button"
                        aria-pressed="${
                            favorite ? "true" : "false"
                        }"
                        title="${
                            favorite
                                ? "Remove favorite"
                                : "Add favorite"
                        }"
                    >
                        <img
                            class="marker-icon"
                            src="./assets/icons/ui/${
                                favorite
                                    ? "favorite-filled.svg"
                                    : "favorite.svg"
                            }"
                            alt=""
                        >
                    </button>
                </div>

                <div class="question-meta-group">
                    <span class="question-meta-label">
                        Bookmark
                    </span>

                    <button
                        class="bookmark-button ${
                            bookmarked ? "active" : ""
                        }"
                        data-question-bookmark
                        type="button"
                        aria-pressed="${
                            bookmarked ? "true" : "false"
                        }"
                        title="${
                            bookmarked
                                ? "Remove bookmark"
                                : "Bookmark question"
                        }"
                    >
                        <img
                            class="marker-icon"
                            src="./assets/icons/ui/${
                                bookmarked
                                    ? "bookmark-filled.svg"
                                    : "bookmark.svg"
                            }"
                            alt=""
                        >
                    </button>
                </div>

                <div class="question-meta-group">
                    <span class="question-meta-label">
                        Difficulty
                    </span>

                    <select
                        class="field-select"
                        data-question-difficulty
                    >
                        <option
                            value="1"
                            ${
                                Number(question.difficulty) === 1
                                    ? "selected"
                                    : ""
                            }
                        >
                            Easy
                        </option>

                        <option
                            value="2"
                            ${
                                Number(question.difficulty) === 2
                                    ? "selected"
                                    : ""
                            }
                        >
                            Medium
                        </option>

                        <option
                            value="3"
                            ${
                                Number(question.difficulty) === 3
                                    ? "selected"
                                    : ""
                            }
                        >
                            Difficult
                        </option>
                    </select>
                </div>

            </div>
        `;

        function refreshMetadata(updatedQuestion) {
            /* Marker controls update immediately; Save question is not required. */
            renderQuestionMetadata(updatedQuestion);
        }

        mount.querySelectorAll(
            "[data-importance]"
        ).forEach(button => {
            button.onclick = () => {
                const value = Number(button.dataset.importance);
                const updated = setQuestionImportance(
                    state.notebookId, state.topicId, question.id, value
                );
                refreshMetadata(updated || { ...question, important: value });
            };
        });

        mount.querySelector(
            "[data-question-favorite]"
        ).onclick = () => {
            const value = !Boolean(question.favorite);
            const updated = setQuestionFavorite(
                state.notebookId, state.topicId, question.id, value
            );
            refreshMetadata(updated || { ...question, favorite: value });
        };

        mount.querySelector(
            "[data-question-bookmark]"
        ).onclick = () => {
            const value = !Boolean(question.bookmarked);
            const updated = setQuestionBookmark(
                state.notebookId, state.topicId, question.id, value
            );
            refreshMetadata(updated || { ...question, bookmarked: value });
        };

        mount.querySelector(
            "[data-question-difficulty]"
        ).onchange = event =>
            updateQuestion(
                state.notebookId,
                state.topicId,
                question.id,
                {
                    difficulty:
                        Number(
                            event.target.value
                        )
                }
            );
    }

    ns.renderQuestionMetadata =
        renderQuestionMetadata;

})(window.everyLearn);
