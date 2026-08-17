(function(ns){
    "use strict";
    const state = ns.state;
    const saveQuestionHint = (...args) => ns.saveQuestionHint(...args);
    const removeQuestionHint = (...args) => ns.removeQuestionHint(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);
/* everyLearn — Question Hints */



function renderQuestionHints(question) {
    const mount =
        document.getElementById(
            "questionHints"
        );

    if (!mount) return;

    mount.innerHTML = `
        <div class="hints-section">
            <div class="hints-header">
                <div>
                    <strong>Hints</strong>
                    <div class="muted">
                        Optional. Up to 4 hints.
                    </div>
                </div>

                <button
                    class="secondary-button small-button"
                    data-add-question-hint
                    type="button"
                    ${
                        question.hints.length >= 4
                            ? "disabled"
                            : ""
                    }
                >
                    ＋ Hint
                </button>
            </div>

            <div class="hints-list">
                ${
                    question.hints.length
                        ? question.hints.map(
                            (
                                hint,
                                index
                            ) =>
                                `
                                    <div class="hint-row">
                                        <input
                                            class="field-input"
                                            data-question-hint="${index}"
                                            value="${escapeHTML(
                                                hint
                                            )}"
                                            placeholder="Hint ${index + 1}"
                                        >

                                        <button
                                            class="delete-button small-button"
                                            data-delete-question-hint="${index}"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </div>
                                `
                        ).join("")
                        : `
                            <div class="muted">
                                No hints.
                            </div>
                        `
                }
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-add-question-hint]"
    ).onclick = () => {
        if (question.hints.length >= 4) return;

        updateQuestion(
            state.notebookId,
            state.topicId,
            question.id,
            {
                hints: [
                    ...question.hints,
                    ""
                ]
            }
        );

        renderQuestionHints(
            question
        );
    };

    mount.querySelectorAll(
        "[data-question-hint]"
    ).forEach(
        input =>
            input.oninput = () =>
                saveQuestionHint(
                    state.notebookId,
                    state.topicId,
                    question.id,
                    Number(
                        input.dataset.questionHint
                    ),
                    input.value
                )
    );

    mount.querySelectorAll(
        "[data-delete-question-hint]"
    ).forEach(
        button =>
            button.onclick = () => {
                removeQuestionHint(
                    state.notebookId,
                    state.topicId,
                    question.id,
                    Number(
                        button.dataset
                            .deleteQuestionHint
                    )
                );

                renderQuestionHints(
                    question
                );
            }
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

    ns.renderQuestionHints = renderQuestionHints;
})(window.everyLearn);
