(function(ns){
    "use strict";
    const state = ns.state;
    const getQuestion = (...args) => ns.getQuestion(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);
    const deleteQuestion = (...args) => ns.deleteQuestion(...args);
    const showToast = (...args) => ns.showToast(...args);
    const renderQuestionManager = (...args) => ns.renderQuestionManager(...args);
    const renderQuestionTypeSelector = (...args) => ns.renderQuestionTypeSelector(...args);
    const renderQuestionMetadata = (...args) => ns.renderQuestionMetadata(...args);
    const renderQuestionHints = (...args) => ns.renderQuestionHints(...args);
    const renderQuestionTypeRenderer = (...args) => ns.renderQuestionType(...args);
    const normalizeQuestion = (...args) => ns.normalizeQuestion(...args);

    function renderQuestionEditor() {
        const panel = document.getElementById("questionEditorPanel");
        if (!panel) return;

        const persisted = getQuestion(
            state.notebookId,
            state.topicId,
            state.editingQuestionId
        );

        if (!persisted) {
            state.editingQuestionDraft = null;
            panel.innerHTML = `
                <div class="empty-state">
                    <strong>Question editor</strong>
                    Select a question or create a new one.
                </div>
            `;
            return;
        }

        if (!state.editingQuestionDraft || state.editingQuestionDraft.id !== persisted.id) {
            state.editingQuestionDraft = structuredClone(persisted);
            normalizeQuestion(state.editingQuestionDraft);
        }

        const question = state.editingQuestionDraft;

        panel.innerHTML = `
            <div class="question-editor-header">
                <div>
                    <div class="question-editor-title">
                        ${escapeHTML(question.text || "New question")}
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
                    <button class="save-button" type="button" data-save-question>
                        <img src="./assets/icons/ui/bookmark.svg" alt=""> Save question
                    </button>
                    <button class="secondary-button small-button" type="button" data-cancel-question>
                        Cancel
                    </button>
                </div>
            </div>
        `;

        renderQuestionTypeSelector(question);
        renderQuestionType(question);
        renderQuestionMetadata(question);
        renderQuestionHints(question);

        panel.querySelector("[data-save-question]").onclick = () => {
            if (question.type !== "caseBased") {
                const text = panel.querySelector("[data-question-text]")?.value;
                if (typeof text === "string") question.text = text;
            }

            try {
                normalizeQuestion(question);
                updateQuestion(
                    state.notebookId,
                    state.topicId,
                    question.id,
                    question
                );
                state.editingQuestionDraft = null;
                state.editingQuestionIsNew = false;
                showToast({ message: "Question saved.", type: "success" });
                renderQuestionManager();
            } catch (error) {
                showToast({ message: error.message || "Question could not be saved.", type: "error" });
            }
        };

        panel.querySelector("[data-cancel-question]").onclick = () => {
            if (state.editingQuestionIsNew) {
                try {
                    deleteQuestion(state.notebookId, state.topicId, question.id);
                } catch (_) {}
            }
            state.editingQuestionDraft = null;
            state.editingQuestionIsNew = false;
            renderQuestionManager();
        };
    }

    function renderQuestionType(question) {
        const mount = document.getElementById("questionTypeEditorMount");
        if (!mount) return;
        renderQuestionTypeRenderer(mount, question);
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
    ns.renderQuestionType = renderQuestionType;
})(window.everyLearn);
