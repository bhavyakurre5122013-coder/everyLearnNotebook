(function(ns){
    "use strict";

    const createId = (...args) => ns.createId(...args);
    const renderTextEditor = (...args) => ns.renderTextEditor(...args);
    const renderFillEditor = (...args) => ns.renderFillEditor(...args);
    const renderTrueFalseEditor = (...args) => ns.renderTrueFalseEditor(...args);
    const renderAssertionEditor = (...args) => ns.renderAssertionEditor(...args);
    const renderMatchingEditor = (...args) => ns.renderMatchingEditor(...args);
    const renderSingleCorrectEditor = (...args) => ns.renderSingleCorrectEditor(...args);
    const renderMultipleCorrectEditor = (...args) => ns.renderMultipleCorrectEditor(...args);
    const renderOrderingEditor = (...args) => ns.renderOrderingEditor(...args);
    const renderDifferenceEditor = (...args) => ns.renderDifferenceEditor(...args);

    /*
    =============================================================
    everyLearnNotebook — Case Based Question Editor
    -------------------------------------------------------------
    The passage is the parent question.

    Each sub-question can independently be:
        • Text
        • Fill in the blanks
        • True / False
        • Assertion / Reasoning
        • Matching
        • Single correct
        • Multiple correct
        • Ordering
        • Difference between

    Case based questions are deliberately excluded from the
    sub-question selector so the nesting never becomes recursive.

    Each sub-question can have 0–2 hints.
    =============================================================
    */

    const SUBQUESTION_TYPES = [
        { id: "text", label: "Text" },
        { id: "fill", label: "Fill in the blanks" },
        { id: "trueFalse", label: "True / False" },
        { id: "assertionReasoning", label: "Assertion / Reasoning" },
        { id: "matching", label: "Matching" },
        { id: "singleCorrect", label: "Single correct questions" },
        { id: "multipleCorrect", label: "Multiple correct questions" },
        { id: "ordering", label: "Ordering" },
        { id: "difference", label: "Difference between" }
    ];

    function renderCaseEditor(mount, question) {
        question.caseQuestions = Array.isArray(question.caseQuestions)
            ? question.caseQuestions
            : [];

        mount.innerHTML = `
            <div class="stack">

                <div class="form-group">
                    <label>
                        Passage / case
                    </label>

                    <textarea
                        class="field-textarea"
                        data-case-passage
                        placeholder="Write the passage or case"
                    >${escapeHTML(question.casePassage || "")}</textarea>
                </div>

                <div class="subparts-header">
                    <div>
                        <strong>
                            Questions on the passage
                        </strong>

                        <div class="muted">
                            Unlimited sub-questions. Each one can use a different question type.
                        </div>
                    </div>

                    <button
                        class="create-button small-button"
                        data-add-case
                        type="button"
                    >
                        ＋ Question
                    </button>
                </div>

                <div class="case-subquestion-list">
                    ${
                        question.caseQuestions.map(
                            (sub, index) =>
                                renderSubquestion(
                                    sub,
                                    index
                                )
                        ).join("")
                    }
                </div>
            </div>
        `;

        mount.querySelector(
            "[data-case-passage]"
        ).oninput = event => {
            question.casePassage = event.target.value;
        };

        mount.querySelector(
            "[data-add-case]"
        ).onclick = () => {
            question.caseQuestions.push(
                createCaseSubquestion()
            );

            renderCaseEditor(
                mount,
                question
            );
        };

        bindSubquestionEditors(
            mount,
            question
        );
    }

    function createCaseSubquestion() {
        return {
            id: createId("caseq"),
            type: "text",
            text: "",
            answer: "",
            difficulty: 1,
            important: 0,
            favorite: false,
            bookmarked: false,
            hints: [],
            options: [],
            answerData: {},
            pairs: [],
            matchingConnections: {},
            orderItems: [],
            difference: {
                termCount: 2,
                terms: ["", ""],
                rows: []
            }
        };
    }

    function renderSubquestion(sub, index) {
        sub.hints = Array.isArray(sub.hints)
            ? sub.hints.slice(0, 2)
            : [];

        return `
            <article class="subpart-card case-subquestion-card">

                <div class="subpart-header">
                    <div>
                        <strong>
                            Question ${index + 1}
                        </strong>

                        <div class="muted subquestion-type-label">
                            ${escapeHTML(
                                getTypeLabel(sub.type)
                            )}
                        </div>
                    </div>

                    <button
                        class="delete-button small-button"
                        data-delete-case="${sub.id}"
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div class="form-group case-subquestion-type">
                    <label>
                        Question type
                    </label>

                    <select
                        class="field-select"
                        data-case-type="${sub.id}"
                    >
                        ${
                            SUBQUESTION_TYPES.map(
                                type => `
                                    <option
                                        value="${type.id}"
                                        ${
                                            type.id === sub.type
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(type.label)}
                                    </option>
                                `
                            ).join("")
                        }
                    </select>
                </div>

                <div
                    class="case-subquestion-builder"
                    data-case-builder="${sub.id}"
                ></div>

                <div class="subpart-hints">
                    <div class="subpart-hints-header">
                        <div>
                            <strong>
                                Hints
                            </strong>

                            <div class="muted">
                                0–2 hints for this sub-question.
                            </div>
                        </div>

                        <button
                            class="secondary-button small-button"
                            data-add-case-hint="${sub.id}"
                            type="button"
                            ${
                                sub.hints.length >= 2
                                    ? "disabled"
                                    : ""
                            }
                        >
                            ＋ Hint
                        </button>
                    </div>

                    <div class="stack">
                        ${
                            sub.hints.map(
                                (hint, hintIndex) => `
                                    <div class="hint-row">
                                        <input
                                            class="field-input"
                                            data-case-hint="${sub.id}:${hintIndex}"
                                            value="${escapeHTML(hint)}"
                                            placeholder="Hint ${hintIndex + 1}"
                                        >

                                        <button
                                            class="delete-button small-button"
                                            data-delete-case-hint="${sub.id}:${hintIndex}"
                                            type="button"
                                        >
                                            ×
                                        </button>
                                    </div>
                                `
                            ).join("")
                        }
                    </div>
                </div>
            </article>
        `;
    }

    function bindSubquestionEditors(mount, parentQuestion) {
        mount.querySelectorAll(
            "[data-delete-case]"
        ).forEach(button => {
            button.onclick = () => {
                parentQuestion.caseQuestions =
                    parentQuestion.caseQuestions.filter(
                        sub => sub.id !== button.dataset.deleteCase
                    );

                renderCaseEditor(
                    mount,
                    parentQuestion
                );
            };
        });

        mount.querySelectorAll(
            "[data-case-type]"
        ).forEach(select => {
            select.onchange = () => {
                const sub = parentQuestion.caseQuestions.find(
                    item => item.id === select.dataset.caseType
                );

                if (!sub) return;

                sub.type = select.value;

                renderCaseEditor(
                    mount,
                    parentQuestion
                );
            };
        });

        mount.querySelectorAll(
            "[data-add-case-hint]"
        ).forEach(button => {
            button.onclick = () => {
                const sub = parentQuestion.caseQuestions.find(
                    item => item.id === button.dataset.addCaseHint
                );

                if (!sub) return;

                sub.hints = Array.isArray(sub.hints)
                    ? sub.hints
                    : [];

                if (sub.hints.length >= 2) return;

                sub.hints.push("");

                renderCaseEditor(
                    mount,
                    parentQuestion
                );
            };
        });

        mount.querySelectorAll(
            "[data-case-hint]"
        ).forEach(input => {
            input.oninput = () => {
                const [subId, index] =
                    input.dataset.caseHint.split(":");

                const sub = parentQuestion.caseQuestions.find(
                    item => item.id === subId
                );

                if (!sub) return;

                sub.hints[Number(index)] = input.value;
            };
        });

        mount.querySelectorAll(
            "[data-delete-case-hint]"
        ).forEach(button => {
            button.onclick = () => {
                const [subId, index] =
                    button.dataset.deleteCaseHint.split(":");

                const sub = parentQuestion.caseQuestions.find(
                    item => item.id === subId
                );

                if (!sub) return;

                sub.hints.splice(
                    Number(index),
                    1
                );

                renderCaseEditor(
                    mount,
                    parentQuestion
                );
            };
        });

        parentQuestion.caseQuestions.forEach(sub => {
            const builder = mount.querySelector(
                `[data-case-builder="${CSS.escape(sub.id)}"]`
            );

            if (!builder) return;

            renderSubquestionType(
                builder,
                sub
            );
        });
    }

    function renderSubquestionType(mount, sub) {
        switch (sub.type) {
            case "fill":
                renderFillEditor(mount, sub);
                break;

            case "trueFalse":
                renderTrueFalseEditor(mount, sub);
                break;

            case "assertionReasoning":
                renderAssertionEditor(mount, sub);
                break;

            case "matching":
                renderMatchingEditor(mount, sub);
                break;

            case "singleCorrect":
                renderSingleCorrectEditor(mount, sub);
                break;

            case "multipleCorrect":
                renderMultipleCorrectEditor(mount, sub);
                break;

            case "ordering":
                renderOrderingEditor(mount, sub);
                break;

            case "difference":
                renderDifferenceEditor(mount, sub);
                break;

            case "text":
            default:
                renderTextEditor(mount, sub);
                break;
        }
    }

    function getTypeLabel(type) {
        return SUBQUESTION_TYPES.find(
            item => item.id === type
        )?.label || "Text";
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    ns.renderCaseEditor = renderCaseEditor;
})(window.everyLearn);
