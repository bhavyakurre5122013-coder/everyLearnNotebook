(function(ns){
    "use strict";

    const state = ns.state;
    const setQuestionImportance = (...args) => ns.setQuestionImportance(...args);
    const setQuestionFavorite = (...args) => ns.setQuestionFavorite(...args);
    const setQuestionBookmark = (...args) => ns.setQuestionBookmark(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);

    function renderQuestionMetadata(question) {
        const mount = document.getElementById("questionMetadata");
        if (!mount) return;

        const importance = Math.max(0, Math.min(3, Number(question.important) || 0));
        const favorite = Boolean(question.favorite);
        const bookmarked = Boolean(question.bookmarked);

        mount.innerHTML = `
            <div class="question-meta">
                <div class="question-meta-group">
                    <span class="question-meta-label">Important</span>
                    <div class="star-picker" role="group" aria-label="Importance">
                        ${[1,2,3].map(value => `
                            <button class="star-button ${value <= importance ? "active" : ""}" data-importance="${value}" type="button" aria-label="Set importance to ${value} star${value === 1 ? "" : "s"}">
                                <img class="marker-icon" src="./assets/icons/ui/${value <= importance ? "star-filled.svg" : "star.svg"}" alt="">
                            </button>
                        `).join("")}
                    </div>
                </div>
                <div class="question-meta-group">
                    <span class="question-meta-label">Favorite</span>
                    <button class="favorite-button ${favorite ? "active" : ""}" data-question-favorite type="button" title="${favorite ? "Remove favorite" : "Add favorite"}">
                        <img class="marker-icon" src="./assets/icons/ui/${favorite ? "favorite-filled.svg" : "favorite.svg"}" alt="">
                    </button>
                </div>
                <div class="question-meta-group">
                    <span class="question-meta-label">Bookmark</span>
                    <button class="bookmark-button ${bookmarked ? "active" : ""}" data-question-bookmark type="button" title="${bookmarked ? "Remove bookmark" : "Bookmark question"}">
                        <img class="marker-icon" src="./assets/icons/ui/${bookmarked ? "bookmark-filled.svg" : "bookmark.svg"}" alt="">
                    </button>
                </div>
                <div class="question-meta-group">
                    <span class="question-meta-label">Difficulty</span>
                    <select class="field-select" data-question-difficulty>
                        <option value="1" ${Number(question.difficulty) === 1 ? "selected" : ""}>Easy</option>
                        <option value="2" ${Number(question.difficulty) === 2 ? "selected" : ""}>Medium</option>
                        <option value="3" ${Number(question.difficulty) === 3 ? "selected" : ""}>Difficult</option>
                    </select>
                </div>
                <div class="question-meta-group">
                    <span class="question-meta-label">Notes</span>
                    <button class="notes-action-button" data-question-notes type="button">
                        <img class="marker-icon" src="./assets/icons/ui/notes.svg" alt=""> Notes
                    </button>
                </div>
                <div class="question-meta-group">
                    <span class="question-meta-label">Checking</span>
                    <button class="secondary-button small-button" data-question-checking type="button">Configure</button>
                </div>
            </div>
            <div class="question-notes-host" data-question-notes-host></div>
        `;

        const refreshMetadata = updatedQuestion => renderQuestionMetadata(updatedQuestion || question);

        mount.querySelectorAll("[data-importance]").forEach(button => {
            button.onclick = () => {
                const updated = setQuestionImportance(state.notebookId, state.topicId, question.id, Number(button.dataset.importance));
                refreshMetadata(updated);
            };
        });
        mount.querySelector("[data-question-favorite]").onclick = () => refreshMetadata(setQuestionFavorite(state.notebookId, state.topicId, question.id, !favorite));
        mount.querySelector("[data-question-bookmark]").onclick = () => refreshMetadata(setQuestionBookmark(state.notebookId, state.topicId, question.id, !bookmarked));
        mount.querySelector("[data-question-difficulty]").onchange = event => updateQuestion(state.notebookId, state.topicId, question.id, { difficulty: Number(event.target.value) });

        mount.querySelector("[data-question-notes]").onclick = () => toggleNotesEditor(mount, question);
        mount.querySelector("[data-question-checking]").onclick = () => {
            document.dispatchEvent(new CustomEvent("everylearn:question-checking-settings", { detail: { questionId: question.id } }));
        };
    }

    function toggleNotesEditor(mount, question) {
        const host = mount.querySelector("[data-question-notes-host]");
        if (host.innerHTML) {
            host.innerHTML = "";
            return;
        }
        host.innerHTML = `
            <div class="question-notes-editor">
                <div class="form-group">
                    <label>Notes</label>
                    <textarea class="field-textarea" data-note-input placeholder="Add notes for this question">${escapeHTML(question.notes || "")}</textarea>
                </div>
                <div class="question-notes-actions">
                    <button class="create-button small-button" data-note-add type="button"><img src="./assets/icons/ui/plus.svg" alt=""> Add</button>
                    <button class="edit-button small-button" data-note-save type="button"><img src="./assets/icons/ui/pencil.svg" alt=""> Edit</button>
                    <button class="delete-button small-button" data-note-delete type="button"><img src="./assets/icons/ui/delete.svg" alt=""> Delete</button>
                </div>
            </div>
        `;
        const input = host.querySelector("[data-note-input]");
        const persist = () => {
            updateQuestion(state.notebookId, state.topicId, question.id, { notes: input.value.trim() });
            const latest = ns.getQuestion(state.notebookId, state.topicId, question.id);
            renderQuestionMetadata(latest || { ...question, notes: input.value.trim() });
        };
        host.querySelector("[data-note-add]").onclick = persist;
        host.querySelector("[data-note-save]").onclick = persist;
        host.querySelector("[data-note-delete]").onclick = () => {
            updateQuestion(state.notebookId, state.topicId, question.id, { notes: "" });
            const latest = ns.getQuestion(state.notebookId, state.topicId, question.id);
            renderQuestionMetadata(latest || { ...question, notes: "" });
        };
    }

    function escapeHTML(value) {
        return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    ns.renderQuestionMetadata = renderQuestionMetadata;
})(window.everyLearn);
