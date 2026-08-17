(function(ns){
    "use strict";
    const state = ns.state;
    const listQuestions = (...args) => ns.listQuestions(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);
    const showToast = (...args) => ns.showToast(...args);
/* everyLearn — Practice */




function renderPractice() {
    const mode =
        document.getElementById(
            "practiceMode"
        );

    if (!mode) return;

    if (
        state.questionMode !== "practice" ||
        state.mainTab !== "questions"
    ) {
        mode.classList.add("hidden");
        return;
    }

    mode.classList.remove("hidden");

    const questions =
        listQuestions(
            state.notebookId,
            state.topicId
        );

    mode.innerHTML = `
        <div class="practice-shell">

            <div class="practice-header">
                <div>
                    <div class="practice-title">
                        Practice
                    </div>

                    <div class="practice-subtitle">
                        ${
                            questions.length
                                ? "Answer the questions you created."
                                : "Create questions first."
                        }
                    </div>
                </div>

                <button
                    class="practice-settings-button"
                    type="button"
                    data-practice-settings
                >
                    ⚙
                </button>
            </div>

            ${
                questions.length
                    ? renderQuestion(
                        getCurrentQuestion(
                            questions
                        )
                    )
                    : `
                        <div class="empty-state">
                            <strong>No questions</strong>
                            Create one in Manage Questions.
                        </div>
                    `
            }
        </div>
    `;

    mode.querySelector(
        "[data-practice-settings]"
    ).onclick = () =>
        document.dispatchEvent(
            new Event(
                "everylearn:practice-settings"
            )
        );

    if (questions.length) {
        bindPractice(
            mode,
            questions
        );
    }
}

function getCurrentQuestion(
    questions
) {
    if (state.practice.random) {
        return questions[
            Math.floor(
                Math.random() *
                questions.length
            )
        ];
    }

    return questions[
        Math.min(
            state.practice.index,
            questions.length - 1
        )
    ];
}

function renderQuestion(
    question
) {
    return `
        <div class="practice-layout">

            <section class="practice-question-card">

                <div class="practice-question-header">
                    <span class="practice-question-number">
                        ${
                            state.practice.random
                                ? "Random"
                                : `Question ${
                                    state.practice.index + 1
                                }`
                        }
                    </span>

                    <button
                        class="practice-marker-button ${
                            question.bookmarked
                                ? "active"
                                : ""
                        }"
                        data-practice-bookmark
                        type="button"
                        aria-label="Bookmark question"
                    >
                        <img src="./assets/icons/ui/bookmark.svg" alt="">
                    </button>
                </div>

                <div
                    class="practice-question-text"
                >
                    ${escapeHTML(
                        question.text ||
                        "Untitled question"
                    )}
                </div>

                <div
                    class="practice-answer-area"
                    data-practice-answer-area
                >
                    ${renderAnswerControl(question)}
                </div>

                <div class="practice-actions">
                    <div class="practice-navigation">
                        <button
                            class="secondary-button"
                            data-prev
                            type="button"
                        >
                            ← Previous
                        </button>

                        <button
                            class="secondary-button"
                            data-next
                            type="button"
                        >
                            Next →
                        </button>
                    </div>

                    <div class="practice-answer-actions">
                        <button
                            class="secondary-button"
                            data-hint
                            type="button"
                        >
                            Hint
                        </button>

                        <button
                            class="save-button"
                            data-check
                            type="button"
                        >
                            <img src="./assets/icons/ui/bookmark.svg" alt=""> Check answer
                        </button>
                    </div>
                </div>

                <div
                    class="practice-feedback"
                    data-feedback
                    hidden
                ></div>

            </section>

            <aside class="practice-info-card">
                <div class="practice-stat-list">

                    <div class="practice-stat">
                        <span class="practice-stat-label">
                            Difficulty
                        </span>

                        <strong class="practice-stat-value">
                            ${
                                question.difficulty === 3
                                    ? "Difficult"
                                    : question.difficulty === 2
                                        ? "Medium"
                                        : "Easy"
                            }
                        </strong>
                    </div>

                    <div class="practice-stat">
                        <span class="practice-stat-label">
                            Attempts
                        </span>

                        <strong class="practice-stat-value">
                            ${
                                question.attempts || 0
                            }
                        </strong>
                    </div>

                    <div class="practice-stat">
                        <span class="practice-stat-label">
                            Importance
                        </span>

                        <strong class="practice-stat-value">
                            ${
                                question.important
                                    ? "★".repeat(
                                        question.important
                                    )
                                    : "—"
                            }
                        </strong>
                    </div>

                </div>
            </aside>

        </div>
    `;
}

function renderAnswerControl(
    question
) {
    if (
        question.type === "trueFalse"
    ) {
        return `
            <div class="practice-choice-list">
                <label class="practice-choice">
                    <input
                        type="radio"
                        name="practice-answer"
                        value="true"
                    >
                    True
                </label>

                <label class="practice-choice">
                    <input
                        type="radio"
                        name="practice-answer"
                        value="false"
                    >
                    False
                </label>
            </div>
        `;
    }

    if (
        question.type === "singleCorrect"
    ) {
        return `
            <div class="practice-choice-list">
                ${
                    question.options.map(
                        option =>
                            `
                                <label class="practice-choice">
                                    <input
                                        type="radio"
                                        name="practice-answer"
                                        value="${option.id}"
                                    >
                                    ${escapeHTML(
                                        option.text
                                    )}
                                </label>
                            `
                    ).join("")
                }
            </div>
        `;
    }

    if (
        question.type === "multipleCorrect"
    ) {
        return `
            <div class="practice-choice-list">
                ${
                    question.options.map(
                        option =>
                            `
                                <label class="practice-choice">
                                    <input
                                        type="checkbox"
                                        name="practice-answer"
                                        value="${option.id}"
                                    >
                                    ${escapeHTML(
                                        option.text
                                    )}
                                </label>
                            `
                    ).join("")
                }
            </div>
        `;
    }

    if (
        question.type === "fill"
    ) {
        const count =
            (
                question.text.match(
                    /\{\{blank\}\}/g
                ) || []
            ).length || 1;

        return `
            <div class="stack">
                ${Array.from(
                    { length: count },
                    (_, index) =>
                        `
                            <div class="inline-field">
                                <span class="chip">
                                    Blank ${index + 1}
                                </span>

                                <input
                                    class="field-input"
                                    data-fill-answer="${index}"
                                    placeholder="Answer"
                                >
                            </div>
                        `
                ).join("")}
            </div>
        `;
    }

    if (
        question.type === "caseBased"
    ) {
        return `
            <div class="practice-case">
                <div class="practice-case-passage">
                    ${escapeHTML(
                        question.casePassage || ""
                    )}
                </div>

                ${
                    question.caseQuestions.map(
                        (
                            sub,
                            index
                        ) =>
                            `
                                <div class="practice-subquestion">
                                    <div class="practice-subquestion-title">
                                        Question ${index + 1}
                                    </div>

                                    <div>
                                        ${escapeHTML(
                                            sub.text
                                        )}
                                    </div>

                                    <textarea
                                        class="practice-answer-textarea"
                                        data-case-answer="${sub.id}"
                                        placeholder="Answer"
                                    ></textarea>
                                </div>
                            `
                    ).join("")
                }
            </div>
        `;
    }

    if (
        question.type === "difference"
    ) {
        return `
            <div class="practice-data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Aspect</th>
                            ${
                                question.difference.terms.map(
                                    term =>
                                        `<th>${escapeHTML(term)}</th>`
                                ).join("")
                            }
                        </tr>
                    </thead>

                    <tbody>
                        ${
                            question.difference.rows.map(
                                row =>
                                    `
                                        <tr>
                                            <td>${escapeHTML(row.aspect || "")}</td>
                                            ${
                                                row.values.map(
                                                    value =>
                                                        `<td>${escapeHTML(value)}</td>`
                                                ).join("")
                                            }
                                        </tr>
                                    `
                            ).join("")
                        }
                    </tbody>
                </table>
            </div>

            <textarea
                class="practice-answer-textarea"
                data-text-answer
                placeholder="Write the comparison..."
            ></textarea>
        `;
    }

    return `
        <textarea
            class="practice-answer-textarea"
            data-text-answer
            placeholder="Type your answer..."
        ></textarea>
    `;
}

function bindPractice(
    mode,
    questions
) {
    mode.querySelector(
        "[data-practice-bookmark]"
    ).onclick = () => {
        const question =
            getCurrentQuestion(
                questions
            );

        updateQuestion(
            state.notebookId,
            state.topicId,
            question.id,
            {
                bookmarked:
                    !question.bookmarked
            }
        );

        renderPractice();
    };

    mode.querySelector(
        "[data-prev]"
    ).onclick = () => {
        if (
            state.practice.random ||
            state.practice.index <= 0
        ) return;

        state.practice.index--;
        renderPractice();
    };

    mode.querySelector(
        "[data-next]"
    ).onclick = () => {
        if (
            state.practice.random ||
            state.practice.index >=
            questions.length - 1
        ) return;

        state.practice.index++;
        renderPractice();
    };

    mode.querySelector(
        "[data-hint]"
    ).onclick = () => {
        const question =
            getCurrentQuestion(
                questions
            );

        const feedback =
            mode.querySelector(
                "[data-feedback]"
            );

        if (
            state.practice.showHints &&
            question.hints?.length
        ) {
            feedback.hidden = false;
            feedback.textContent =
                `Hint: ${question.hints[0]}`;
            feedback.className =
                "practice-feedback hint";
        }
    };

    mode.querySelector(
        "[data-check]"
    ).onclick = () => {
        const question =
            getCurrentQuestion(
                questions
            );

        const answer =
            collectAnswer(
                mode,
                question
            );

        const correct =
            evaluate(
                question,
                answer
            );

        question.attempts =
            Number(
                question.attempts || 0
            ) + 1;

        if (correct) {
            question.correct =
                Number(
                    question.correct || 0
                ) + 1;
        }

        updateQuestion(
            state.notebookId,
            state.topicId,
            question.id,
            {
                attempts:
                    question.attempts,
                correct:
                    question.correct,
                lastPractice:
                    answer
            }
        );

        const feedback =
            mode.querySelector(
                "[data-feedback]"
            );

        feedback.hidden = false;
        feedback.textContent =
            correct
                ? "Correct."
                : "Not correct.";

        feedback.className =
            `practice-feedback ${
                correct
                    ? "correct"
                    : "incorrect"
            }`;

        if (
            correct &&
            state.practice.autoNext &&
            !state.practice.random &&
            state.practice.index <
                questions.length - 1
        ) {
            setTimeout(
                () => {
                    state.practice.index++;
                    renderPractice();
                },
                450
            );
        } else {
            showToast({
                message:
                    correct
                        ? "Correct."
                        : "Answer checked.",
                type:
                    correct
                        ? "success"
                        : "info"
            });
        }
    };
}

function collectAnswer(
    mode,
    question
) {
    if (
        ["text", "difference"].includes(
            question.type
        )
    ) {
        return {
            text:
                mode.querySelector(
                    "[data-text-answer]"
                )?.value || ""
        };
    }

    if (
        question.type === "trueFalse"
    ) {
        return {
            value:
                mode.querySelector(
                    "input[name='practice-answer']:checked"
                )?.value || ""
        };
    }

    if (
        [
            "singleCorrect",
            "multipleCorrect"
        ].includes(question.type)
    ) {
        return {
            values:
                [...mode.querySelectorAll(
                    "input[name='practice-answer']:checked"
                )].map(
                    input => input.value
                )
        };
    }

    if (
        question.type === "fill"
    ) {
        return {
            values:
                [...mode.querySelectorAll(
                    "[data-fill-answer]"
                )].map(
                    input => input.value
                )
        };
    }

    if (
        question.type === "caseBased"
    ) {
        return {
            values:
                Object.fromEntries(
                    [...mode.querySelectorAll(
                        "[data-case-answer]"
                    )].map(
                        field => [
                            field.dataset.caseAnswer,
                            field.value
                        ]
                    )
                )
        };
    }

    return {};
}

function evaluate(
    question,
    answer
) {
    const clean =
        value =>
            String(value || "")
                .trim()
                .toLowerCase();

    if (
        question.type === "text" ||
        question.type === "difference"
    ) {
        return (
            clean(answer.text) ===
            clean(question.answer)
        );
    }

    if (
        question.type === "trueFalse"
    ) {
        return (
            clean(answer.value) ===
            clean(question.answer)
        );
    }

    if (
        question.type === "singleCorrect"
    ) {
        const correct =
            question.options.find(
                option => option.correct
            )?.id;

        return answer.values?.[0] === correct;
    }

    if (
        question.type === "multipleCorrect"
    ) {
        const correct =
            question.options
                .filter(
                    option => option.correct
                )
                .map(
                    option => option.id
                )
                .sort();

        const received =
            [...(answer.values || [])]
                .sort();

        return (
            correct.length ===
            received.length &&
            correct.every(
                (value, index) =>
                    value === received[index]
            )
        );
    }

    if (
        question.type === "fill"
    ) {
        const expected =
            question.answerData?.blanks ||
            [];

        const received =
            answer.values || [];

        return (
            expected.length ===
            received.length &&
            expected.every(
                (value, index) =>
                    clean(value) ===
                    clean(received[index])
            )
        );
    }

    if (
        question.type === "caseBased"
    ) {
        return question.caseQuestions.every(
            sub =>
                clean(
                    answer.values?.[sub.id]
                ) ===
                clean(sub.answer)
        );
    }

    return false;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.renderPractice = renderPractice;
})(window.everyLearn);
