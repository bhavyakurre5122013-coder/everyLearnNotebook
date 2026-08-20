(function(ns){
    "use strict";
    const state = ns.state;
    const getQuestion = (...args) => ns.getQuestion(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);
    const duplicateQuestion = (...args) => ns.duplicateQuestion(...args);
    const deleteQuestion = (...args) => ns.deleteQuestion(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const renderQuestionManager = (...args) => ns.renderQuestionManager(...args);
    const renderQuestionTypeSelector = (...args) => ns.renderQuestionTypeSelector(...args);
    const renderQuestionMetadata = (...args) => ns.renderQuestionMetadata(...args);
    const renderQuestionHints = (...args) => ns.renderQuestionHints(...args);
    const renderQuestionTypeRenderer = (...args) => ns.renderQuestionType(...args);
/* everyLearn — Question Editor */










function renderQuestionEditor() {
    const panel =
        document.getElementById(
            "questionEditorPanel"
        );

    if (!panel) return;

    const question =
        getQuestion(
            state.notebookId,
            state.topicId,
            state.editingQuestionId
        );

    if (!question) {
        panel.innerHTML = `
            <div class="empty-state">
                <strong>Question editor</strong>
                Select a question or create a new one.
            </div>
        `;
        return;
    }

    panel.innerHTML = `
        <div class="question-editor-header">
            <div>
                <div class="question-editor-title">
                    ${
                        escapeHTML(
                            question.text ||
                            "New question"
                        )
                    }
                </div>

                <div class="question-editor-subtitle">
                    Edit the question here. Practice is separate.
                </div>
            </div>

            <div class="builder-actions">
                ${ns.renderItemActionMenu("question", question.id, { label: question.text || "Question" })}
            </div>
        </div>

        <div class="question-editor-body">
            <div id="questionTypeSelector"></div>
            <div id="questionTypeEditorMount"></div>
            <div id="questionMetadata"></div>
            <div id="questionHints"></div>

            <div class="question-save-area">
                <button
                    class="save-button"
                    type="button"
                    data-save-question
                >
                    <img src="./assets/icons/ui/bookmark.svg" alt=""> Save question
                </button>
            </div>
        </div>
    `;

    renderQuestionTypeSelector(question);
    renderQuestionType(question);
    renderQuestionMetadata(question);
    renderQuestionHints(question);

    panel.querySelector(
        "[data-save-question]"
    ).onclick = () => {
        const text =
            panel.querySelector(
                "[data-question-text]"
            )?.value;

        if (typeof text === "string") {
            question.text = text;
        }

        updateQuestion(
            state.notebookId,
            state.topicId,
            question.id,
            question
        );

        showToast({
            message: "Question saved.",
            type: "success"
        });

        renderQuestionManager();
    };


}

function renderQuestionType(question) {
    const mount =
        document.getElementById(
            "questionTypeEditorMount"
        );

    if (!mount) return;

    renderQuestionTypeRenderer(
        mount,
        question
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.renderQuestionEditor = renderQuestionEditor;
})(window.everyLearn);
