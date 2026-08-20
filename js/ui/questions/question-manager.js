(function(ns){
    "use strict";
    const state = ns.state;
    const listQuestions = (...args) => ns.listQuestions(...args);
    const addQuestion = (...args) => ns.addQuestion(...args);
    const renderQuestionEditor = (...args) => ns.renderQuestionEditor(...args);
/* everyLearn — Question Manager */




function renderQuestionManager() {
    const panel =
        document.getElementById(
            "questionListPanel"
        );

    if (!panel) return;

    const questions =
        listQuestions(
            state.notebookId,
            state.topicId
        );

    panel.innerHTML = `
        <div class="question-list-header">
            <div class="section-header">
                <div>
                    <h3>Questions</h3>
                    <p class="section-description">
                        Create and edit questions separately from practice.
                    </p>
                </div>

                <div class="question-list-header-actions">
                    <button class="secondary-button small-button" data-checking-settings type="button">⚙ Checking</button>
                    <button class="create-button small-button" data-new-question>＋ New</button>
                </div>
            </div>
        </div>

        <div class="question-list">
            ${
                questions.length
                    ? questions.map(
                        (q, index) =>
                            renderItem(q, index)
                    ).join("")
                    : `
                        <div class="empty-state">
                            <strong>
                                No questions
                            </strong>
                            Create the first question.
                        </div>
                    `
            }
        </div>
    `;

    panel.querySelector("[data-checking-settings]")?.addEventListener("click", () => {
        document.dispatchEvent(new Event("everylearn:checking-settings"));
    });

    panel.querySelector(
        "[data-new-question]"
    )?.addEventListener(
        "click",
        () => {
            const question =
                addQuestion(
                    state.notebookId,
                    state.topicId
                );

            state.editingQuestionId =
                question.id;

            renderQuestionManager();
        }
    );

    panel.querySelectorAll(
        "[data-question-id]"
    ).forEach(
        button =>
            button.addEventListener(
                "click",
                () => {
                    state.editingQuestionId =
                        button.dataset.questionId;
                    renderQuestionManager();
                }
            )
    );

    renderQuestionEditor();
}

function renderItem(question, index) {
    const title = question.text || label(question.type);
    return `
        <div class="question-list-item ${question.id === state.editingQuestionId ? "active" : ""}">
            <button class="question-list-select" data-question-id="${question.id}" type="button">
                <div class="question-list-index">Question ${index + 1}</div>
                <div class="question-list-title">${escapeHTML(title)}</div>
                <div class="question-list-meta">
                    <span class="chip">${escapeHTML(label(question.type))}</span>
                    ${question.important ? `<span class="chip">${"★".repeat(question.important)}</span>` : ""}
                    ${question.favorite ? `<span class="chip"><img class="marker-icon" src="./assets/icons/ui/favorite-filled.svg" alt=""> Favorite</span>` : ""}
                    ${question.bookmarked ? `<span class="chip"><img class="marker-icon" src="./assets/icons/ui/bookmark-filled.svg" alt=""> Bookmark</span>` : ""}
                    ${question.notes ? `<span class="chip"><img class="marker-icon" src="./assets/icons/ui/notes.svg" alt=""> Notes</span>` : ""}
                </div>
            </button>
            <div class="question-list-item-actions">
                ${ns.renderItemActionMenu("question", question.id, { label: title })}
            </div>
        </div>
    `;
}

function label(type) {
    return {
        text: "Text",
        fill: "Fill in the blanks",
        trueFalse: "True / False",
        assertionReasoning: "Assertion / Reasoning",
        caseBased: "Case based questions",
        matching: "Matching",
        singleCorrect: "Single correct",
        multipleCorrect: "Multiple correct",
        ordering: "Ordering",
        difference: "Difference between"
    }[type] || "Question";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.renderQuestionManager = renderQuestionManager;
})(window.everyLearn);
