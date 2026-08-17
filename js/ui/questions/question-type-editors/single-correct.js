(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/* everyLearn — Single Correct */


function renderSingleCorrectEditor(
    mount,
    question
) {
    renderChoiceEditor(
        mount,
        question,
        false
    );
}

function renderChoiceEditor(
    mount,
    question,
    multiple
) {
    question.options =
        Array.isArray(question.options)
            ? question.options
            : [];

    if (!question.options.length) {
        question.options.push({
            id: createId("option"),
            text: "",
            correct: false,
            hints: []
        });
    }

    mount.innerHTML = `
        <div class="stack">

            <div class="form-group">
                <label>Question</label>
                <textarea
                    class="field-textarea"
                    data-question-text
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="subparts-header">
                <div>
                    <strong>Options</strong>
                    <div class="muted">
                        ${
                            multiple
                                ? "Select one or more correct answers."
                                : "Select exactly one correct answer."
                        }
                    </div>
                </div>

                <button
                    class="create-button small-button"
                    data-add-option
                >
                    ＋ Option
                </button>
            </div>

            <div class="choice-list-builder">
                ${
                    question.options.map(
                        (
                            option,
                            index
                        ) =>
                            `
                                <div class="choice-builder-row">
                                    <input
                                        type="${
                                            multiple
                                                ? "checkbox"
                                                : "radio"
                                        }"
                                        name="correct-${question.id}"
                                        data-option-correct="${option.id}"
                                        ${
                                            option.correct
                                                ? "checked"
                                                : ""
                                        }
                                    >

                                    <input
                                        class="field-input"
                                        data-option-text="${option.id}"
                                        value="${escapeHTML(option.text)}"
                                        placeholder="Option ${index + 1}"
                                    >

                                    <button
                                        class="delete-button small-button"
                                        data-delete-option="${option.id}"
                                    >
                                        ×
                                    </button>
                                </div>
                            `
                    ).join("")
                }
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-add-option]"
    ).onclick = () => {
        question.options.push({
            id: createId("option"),
            text: "",
            correct: false,
            hints: []
        });

        renderChoiceEditor(
            mount,
            question,
            multiple
        );
    };

    mount.querySelectorAll(
        "[data-option-text]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    const option =
                        question.options.find(
                            item =>
                                item.id ===
                                input.dataset.optionText
                        );

                    if (option) {
                        option.text =
                            input.value;
                    }
                }
    );

    mount.querySelectorAll(
        "[data-option-correct]"
    ).forEach(
        input =>
            input.onchange =
                () => {
                    if (!multiple) {
                        question.options.forEach(
                            option =>
                                option.correct =
                                    false
                        );
                    }

                    const option =
                        question.options.find(
                            item =>
                                item.id ===
                                input.dataset.optionCorrect
                        );

                    if (option) {
                        option.correct =
                            input.checked;
                    }
                }
    );

    mount.querySelectorAll(
        "[data-delete-option]"
    ).forEach(
        button =>
            button.onclick = () => {
                question.options =
                    question.options.filter(
                        option =>
                            option.id !==
                            button.dataset.deleteOption
                    );

                renderChoiceEditor(
                    mount,
                    question,
                    multiple
                );
            }
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.renderSingleCorrectEditor = renderSingleCorrectEditor;
    ns.renderChoiceEditor = renderChoiceEditor;
})(window.everyLearn);
