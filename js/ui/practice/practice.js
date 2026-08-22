(function(ns){
    "use strict";
    const state = ns.state;
    const listQuestions = (...args) => ns.listQuestions(...args);
    const updateQuestion = (...args) => ns.updateQuestion(...args);
    const checkQuestion = (...args) => ns.checkQuestion(...args);
    const scoreForQuestion = (...args) => ns.scoreForQuestion(...args);
    const showToast = (...args) => ns.showToast(...args);

    function renderPractice() {
        const mode = document.getElementById("practiceMode");
        if (!mode) return;
        if (state.questionMode !== "practice" || state.mainTab !== "questions") {
            mode.classList.add("hidden");
            return;
        }
        mode.classList.remove("hidden");

        const sourceQuestions = listQuestions(state.notebookId, state.topicId);
        const questions = getPracticeQuestions(sourceQuestions);
        if (!questions.length) {
            mode.innerHTML = `
                <div class="practice-shell">
                    <div class="practice-header">
                        <div>
                            <div class="practice-title">Practice</div>
                            <div class="practice-subtitle">Create questions first.</div>
                        </div>
                    </div>
                    <div class="empty-state"><strong>No questions</strong>Create one in Manage Questions.</div>
                </div>
            `;
            return;
        }

        if (!state.practice.answers) state.practice.answers = {};
        const total = questions.length;
        state.practice.index = Math.min(Math.max(0, Number(state.practice.index) || 0), total - 1);
        state.practice.exerciseStatus = state.practice.exerciseStatus || {};
        const currentQuestionId = questions[state.practice.index].id;
        if (state.practice.exerciseStatus[currentQuestionId] !== "given") {
            state.practice.exerciseStatus[currentQuestionId] = "seen";
        }
        const question = questions[state.practice.index];
        const resultState = state.practice.exerciseComplete ? renderExerciseResults(questions) : renderPracticeQuestion(questions, question);

        mode.innerHTML = `
            <div class="practice-shell">
                <div class="practice-header">
                    <div>
                        <div class="practice-title">Practice</div>
                        <div class="practice-subtitle">${state.practice.exerciseComplete ? "Exercise results" : "Answer the questions you created."}</div>
                    </div>
                    <button class="practice-settings-button" type="button" data-practice-settings aria-label="Practice settings">⚙</button>
                </div>
                ${resultState}
            </div>
        `;

        mode.querySelector("[data-practice-settings]")?.addEventListener("click", () =>
            document.dispatchEvent(new Event("everylearn:practice-settings"))
        );

        if (state.practice.exerciseComplete) {
            bindExerciseResults(mode, questions);
            return;
        }
        bindPractice(mode, questions, question);
    }


    function getPracticeQuestions(sourceQuestions) {
        if (!state.practice.random) {
            state.practice.orderIds = [];
            return sourceQuestions;
        }
        const ids = sourceQuestions.map(question => question.id);
        const validOrder = Array.isArray(state.practice.orderIds) &&
            state.practice.orderIds.length === ids.length &&
            state.practice.orderIds.every(id => ids.includes(id));
        if (!validOrder) {
            state.practice.orderIds = [...ids].sort(() => Math.random() - 0.5);
        }
        return state.practice.orderIds.map(id => sourceQuestions.find(question => question.id === id)).filter(Boolean);
    }

    function renderQuestionList(questions) {
        return `
            <aside class="practice-question-list-panel">
                <div class="practice-question-list-header">
                    <strong>Questions</strong>
                    <span>${questions.length}</span>
                </div>
                <div class="practice-question-list" data-practice-question-list>
                    ${questions.map((question, index) => `
                        <button
                            type="button"
                            class="practice-question-list-item ${index === state.practice.index ? "active" : ""}"
                            data-practice-question-id="${question.id}"
                        >
                            <span class="practice-question-list-item-topline"><span>Question ${index + 1}</span><span class="practice-question-status practice-question-status-${state.practice.exerciseStatus?.[question.id] || "unseen"}" aria-label="${statusLabel(state.practice.exerciseStatus?.[question.id])}"></span></span>
                            <strong>${escapeHTML(question.text || label(question.type))}</strong>
                            <small>${label(question.type)}</small>
                        </button>
                    `).join("")}
                </div>
            </aside>
        `;
    }

    function renderPracticeQuestion(questions, question) {
        const currentAnswer = state.practice.answers[question.id] || null;
        const answered = Boolean(state.practice.results?.[question.id]?.checked);
        const header = `
            <div class="practice-question-tools">
                <div class="practice-navigation-compact">
                    <button class="practice-nav-button" data-prev type="button" ${state.practice.index === 0 ? "disabled" : ""} aria-label="Previous question">&lt;</button>
                    <strong>${state.practice.index + 1} of ${questions.length}</strong>
                    <button class="practice-nav-button" data-next type="button" ${state.practice.index === questions.length - 1 ? "disabled" : ""} aria-label="Next question">&gt;</button>
                    <button class="practice-submit-exercise-button" data-submit-exercise type="button" aria-label="Submit exercise">
                        <img src="./assets/icons/ui/submit.svg" alt="">
                        <span>Submit exercise</span>
                    </button>
                </div>
                <div class="practice-meta-strip">
                    <span><b>DIF</b> ${difficultyLabel(question.difficulty)}</span>
                    <span><b>IMP</b> ${"★".repeat(Number(question.important) || 0) || "—"}</span>
                    <span><b>ATP</b> ${Number(question.attempts) || 0}</span>
                    <button class="practice-icon-button ${question.bookmarked ? "active" : ""}" data-practice-bookmark type="button" aria-label="Bookmark question">
                        <img src="./assets/icons/ui/${question.bookmarked ? "bookmark-filled.svg" : "bookmark.svg"}" alt="">
                    </button>
                    <button class="practice-icon-button" data-practice-notes type="button" aria-label="Question notes">
                        <img src="./assets/icons/ui/notebook.svg" alt="">
                    </button>
                    <button class="practice-icon-button" data-hint type="button" aria-label="Hint">
                        <img src="./assets/icons/ui/hint.svg" alt="">
                    </button>
                </div>
            </div>
        `;
        const result = state.practice.results?.[question.id];
        const feedback = answered && state.practice.answerDisplayMode === "after-each" ? renderFeedback(question, result) : "";

        return `
            <div class="practice-workspace">
                ${renderQuestionList(questions)}
                <section class="practice-question-card">
                    ${header}
                    <div class="practice-question-text">${escapeHTML(question.text || "Untitled question")}</div>
                    <div class="practice-answer-area" data-practice-answer-area>${renderAnswerControl(question, currentAnswer)}</div>
                    <div class="practice-actions">
                        <button class="save-button" data-check type="button">Check answer</button>
                    </div>
                    <div data-practice-note-area class="practice-note-area ${question.notes ? "has-note" : ""}">
                        ${renderPracticeNote(question)}
                    </div>
                    <div class="practice-feedback-host">${feedback}</div>
                </section>
            </div>
        `;
    }

    function renderPracticeNote(question) {
        if (!question.notes) return "";
        return `<div class="practice-note-view"><strong>Notes</strong><div>${escapeHTML(question.notes)}</div></div>`;
    }

    function renderFeedback(question, result) {
        if (!result) return "";
        const status = result.status || (result.correct ? "correct" : "incorrect");
        const title = status === "correct" ? "Correct" : status === "partial" ? "Partially correct" : status === "unanswered" ? "Not answered" : "Not correct";
        const className = status === "correct" ? "correct" : status === "partial" ? "info" : "incorrect";
        return `
            <div class="practice-feedback ${className}">
                <div class="practice-feedback-title">${title}</div>
                <div>Score: ${result.scoreDisplay}</div>
                ${status !== "correct" ? `<div class="practice-feedback-corrections">${renderCorrectionSummary(result)}</div>` : ""}
            </div>
        `;
    }

    function renderCorrectionSummary(result) {
        const parts = [];
        if (result.status === "unanswered") {
            parts.push(`<div><strong>No answer was provided.</strong></div>`);
        }
        if (result.expectedTokens?.length || result.receivedTokens?.length) {
            const expected = result.expectedTokens || [];
            const received = result.receivedTokens || [];
            parts.push(`<div class="checking-diff-grid"><div><span>Correct answer</span><div class="checking-diff-text">${expected.map(item => `<span class="checking-token ${item.status}">${escapeHTML(item.token)}</span>`).join(" ")}</div></div><div><span>Your answer</span><div class="checking-diff-text">${received.map(item => `<span class="checking-token ${item.status}">${escapeHTML(item.token)}</span>`).join(" ")}</div></div></div>`);
        }
        if (result.missing?.length) parts.push(`<div><strong>Missing:</strong> ${escapeHTML(result.missing.join(", "))}</div>`);
        if (result.extra?.length) parts.push(`<div><strong>Extra:</strong> ${escapeHTML(result.extra.join(", "))}</div>`);
        if (result.points?.length) {
            const partial = result.points.filter(item => item.score < 1).length;
            if (partial) parts.push(`<div><strong>Required points:</strong> ${partial} incomplete</div>`);
        }
        if (result.details?.length) {
            const incomplete = result.details.filter(item => !item.correct).length;
            if (incomplete) parts.push(`<div><strong>Subquestions:</strong> ${incomplete} incomplete</div>`);
        }
        return parts.join("");
    }

    function renderExerciseResults(questions) {
        const results = state.practice.results || {};
        const scored = questions.map(question => results[question.id]).filter(Boolean);
        const totalMarks = scored.reduce((sum, item) => sum + item.marks, 0);
        const maxMarks = questions.reduce((sum, question) => sum + Math.max(0, Number(question.marks) || 1), 0);
        return `
            <div class="practice-results-workspace">
                <div class="practice-results-summary">
                    <div><strong>Total score</strong><span>${totalMarks.toFixed(2)} / ${maxMarks}</span></div>
                    <button class="secondary-button" data-retry-exercise type="button">Try again</button>
                </div>
                <div class="practice-results-list">
                    ${questions.map((question, index) => {
                        const result = results[question.id];
                        if (!result) return "";
                        return `
                            <article class="practice-result-card">
                                <div class="practice-result-question"><strong>Question ${index + 1}</strong><div>${escapeHTML(question.text || label(question.type))}</div></div>
                                <div class="practice-result-answer">
                                    <div class="practice-result-status">
                                        <img src="./assets/icons/ui/${result.correct ? "check.svg" : "close.svg"}" alt="">
                                    </div>
                                    <div><span>User's Answer</span><div>${renderStoredAnswer(question, result.answer)}</div></div>
                                </div>
                                ${!result.correct ? `<div class="practice-result-correct-answer"><span>Correct answer</span><div>${renderCorrectAnswer(question)}</div></div>` : ""}
                                <div class="practice-result-footer">
                                    <span>Score: ${result.scoreDisplay}</span>
                                    <button class="notes-action-button" data-result-notes="${question.id}" type="button"><img src="./assets/icons/ui/notebook.svg" alt=""> Notes</button>
                                </div>
                                <div class="result-note-slot" data-result-note-slot="${question.id}">${question.notes ? `<div class="practice-note-view"><strong>Notes</strong><div>${escapeHTML(question.notes)}</div></div>` : ""}</div>
                            </article>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    function bindPractice(mode, questions, question) {
        mode.querySelectorAll("[data-practice-question-id]").forEach(button => {
            button.onclick = () => {
                persistCurrentAnswer(mode, question);
                const targetId = button.dataset.practiceQuestionId;
                if (state.practice.exerciseStatus?.[targetId] !== "given") state.practice.exerciseStatus[targetId] = "seen";
                state.practice.index = questions.findIndex(item => item.id === targetId);
                renderPractice();
            };
        });
        mode.querySelector("[data-prev]")?.addEventListener("click", () => {
            persistCurrentAnswer(mode, question);
            if (state.practice.index > 0) state.practice.index--;
            renderPractice();
        });
        mode.querySelector("[data-next]")?.addEventListener("click", () => {
            persistCurrentAnswer(mode, question);
            if (state.practice.index < questions.length - 1) state.practice.index++;
            renderPractice();
        });
        mode.querySelector("[data-submit-exercise]")?.addEventListener("click", () => submitExercise(mode, questions));
        mode.querySelector("[data-practice-bookmark]")?.addEventListener("click", () => {
            updateQuestion(state.notebookId, state.topicId, question.id, { bookmarked: !question.bookmarked });
            renderPractice();
        });
        mode.querySelector("[data-hint]")?.addEventListener("click", () => {
            if (!state.practice.showHints || !question.hints?.length) return;
            const host = mode.querySelector(".practice-feedback-host");
            host.innerHTML = `<div class="practice-feedback hint"><strong>Hint</strong><div>${escapeHTML(question.hints[0])}</div></div>`;
        });
        mode.querySelector("[data-practice-notes]")?.addEventListener("click", () => openPracticeNoteEditor(mode, question));
        mode.querySelector("[data-check]")?.addEventListener("click", () => submitCurrentAnswer(mode, question, questions));
    }

    function persistCurrentAnswer(mode, question) {
        state.practice.answers[question.id] = collectAnswer(mode, question);
    }

    function submitCurrentAnswer(mode, question, questions) {
        persistCurrentAnswer(mode, question);
        const answer = state.practice.answers[question.id];
        const result = checkQuestion(question, answer, state.data.settings);
        const marks = scoreForQuestion(question, result);
        question.attempts = Number(question.attempts || 0) + 1;
        if (result.correct) question.correct = Number(question.correct || 0) + 1;
        updateQuestion(state.notebookId, state.topicId, question.id, {
            attempts: question.attempts,
            correct: question.correct,
            lastPractice: answer
        });
        state.practice.results = state.practice.results || {};
        state.practice.exerciseStatus = state.practice.exerciseStatus || {};
        state.practice.exerciseStatus[question.id] = "given";
        state.practice.results[question.id] = {
            ...result,
            answer,
            marks,
            scoreDisplay: `${marks} / ${Math.max(0, Number(question.marks) || 1)}`,
            checked: true
        };

        const isFinal = questions.every(item => state.practice.results[item.id]?.checked);
        if (state.practice.answerDisplayMode === "after-all" && isFinal) {
            state.practice.exerciseComplete = true;
            renderPractice();
            return;
        }

        if (state.practice.answerDisplayMode === "after-each") {
            renderPractice();
        } else {
            const host = mode.querySelector(".practice-feedback-host");
            host.innerHTML = `<div class="practice-feedback info">Answer recorded.${isFinal ? " Finish the exercise to see results." : ""}</div>`;
            if (!isFinal && state.practice.autoNext && state.practice.index < questions.length - 1) {
                setTimeout(() => { state.practice.index++; renderPractice(); }, 250);
            }
        }
    }

    function submitExercise(mode, questions) {
        persistCurrentAnswer(mode, questions[state.practice.index]);
        questions.forEach(question => {
            if (!state.practice.answers[question.id]) {
                state.practice.answers[question.id] = emptyAnswer(question);
            }
            const existing = state.practice.results?.[question.id]?.checked;
            if (!existing) submitQuestionDirect(question);
        });
        state.practice.exerciseComplete = true;
        state.practice.exerciseStatus = {};
        renderPractice();
    }

    function submitQuestionDirect(question) {
        const answer = state.practice.answers[question.id] || emptyAnswer(question);
        const result = checkQuestion(question, answer, state.data.settings);
        const marks = scoreForQuestion(question, result);
        question.attempts = Number(question.attempts || 0) + 1;
        if (result.correct) question.correct = Number(question.correct || 0) + 1;
        updateQuestion(state.notebookId, state.topicId, question.id, {
            attempts: question.attempts,
            correct: question.correct,
            lastPractice: answer
        });
        state.practice.results = state.practice.results || {};
        state.practice.results[question.id] = {
            ...result,
            answer,
            marks,
            scoreDisplay: `${marks} / ${Math.max(0, Number(question.marks) || 1)}`,
            checked: true
        };
    }

    function statusLabel(status) {
        return status === "given" ? "Given" : status === "seen" ? "Seen" : "Not seen";
    }

    function bindExerciseResults(mode, questions) {
        mode.querySelector("[data-retry-exercise]")?.addEventListener("click", () => {
            state.practice.index = 0;
            state.practice.answers = {};
            state.practice.results = {};
            state.practice.exerciseComplete = false;
            state.practice.exerciseStatus = {};
            state.practice.orderIds = [];
            renderPractice();
        });
        mode.querySelectorAll("[data-result-notes]").forEach(button => {
            button.onclick = () => {
                const question = questions.find(item => item.id === button.dataset.resultNotes);
                if (question) openResultNoteEditor(mode, question, button.closest(".practice-result-card"));
            };
        });
    }

    function openPracticeNoteEditor(mode, question) {
        const area = mode.querySelector("[data-practice-note-area]");
        area.innerHTML = renderNoteEditor(question, "practice");
        bindNoteEditor(area, question);
    }

    function openResultNoteEditor(mode, question, card) {
        const slot = card?.querySelector(`[data-result-note-slot="${question.id}"]`);
        if (!slot) return;
        slot.innerHTML = renderNoteEditor(question, "results");
        bindNoteEditor(slot, question);
    }

    function renderNoteEditor(question, context) {
        return `
            <div class="question-notes-editor" data-note-editor-context="${context}">
                <div class="form-group"><label>Notes</label><textarea class="field-textarea" data-note-input placeholder="Add notes for this question">${escapeHTML(question.notes || "")}</textarea></div>
                <div class="question-notes-actions">
                    <button class="create-button small-button" data-note-add type="button"><img src="./assets/icons/ui/plus.svg" alt=""> Add</button>
                    <button class="edit-button small-button" data-note-save type="button"><img src="./assets/icons/ui/pencil.svg" alt=""> Edit</button>
                    <button class="delete-button small-button" data-note-delete type="button"><img src="./assets/icons/ui/delete.svg" alt=""> Delete</button>
                </div>
            </div>
        `;
    }

    function bindNoteEditor(host, question) {
        const input = host.querySelector("[data-note-input]");
        const save = () => {
            updateQuestion(state.notebookId, state.topicId, question.id, { notes: input.value.trim() });
            renderPractice();
        };
        host.querySelector("[data-note-add]")?.addEventListener("click", save);
        host.querySelector("[data-note-save]")?.addEventListener("click", save);
        host.querySelector("[data-note-delete]")?.addEventListener("click", () => {
            updateQuestion(state.notebookId, state.topicId, question.id, { notes: "" });
            renderPractice();
        });
    }

    function collectAnswer(mode, question) {
        return collectAnswerFromContainer(mode, question);
    }

    function collectAnswerFromContainer(container, question) {
        if (question.type === "text") return { text: container.querySelector("[data-text-answer]")?.value || "" };
        if (question.type === "difference") {
            const values = {};
            container.querySelectorAll("[data-difference-answer]").forEach(input => {
                const [rowId, column] = input.dataset.differenceAnswer.split(":");
                values[rowId] = values[rowId] || [];
                values[rowId][Number(column)] = input.value || "";
            });
            return { values };
        }
        if (question.type === "trueFalse") return { value: container.querySelector("[data-true-false-answer]")?.value || "" };
        if (question.type === "assertionReasoning") return { value: container.querySelector("[data-assertion-answer]")?.value || "" };
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) {
            return { values: [...container.querySelectorAll("input[data-choice-answer]:checked")].map(input => input.value) };
        }
        if (question.type === "fill") return { values: [...container.querySelectorAll("[data-fill-answer]")].map(input => input.value || "") };
        if (question.type === "ordering") return { values: [...container.querySelectorAll("[data-order-answer]")].map(select => select.value || "") };
        if (question.type === "matching") {
            const values = {};
            container.querySelectorAll("[data-matching-answer]").forEach(select => { values[select.dataset.matchingAnswer] = select.value || ""; });
            return { values };
        }
        if (question.type === "caseBased") {
            const values = {};
            question.caseQuestions?.forEach(sub => {
                const host = container.querySelector(`[data-case-answer-container="${CSS.escape(sub.id)}"]`);
                if (host) values[sub.id] = collectAnswerFromContainer(host, sub);
            });
            return { values };
        }
        return {};
    }

    function emptyAnswer(question) {
        if (question.type === "text") return { text: "" };
        if (question.type === "difference" || question.type === "matching" || question.type === "caseBased") return { values: {} };
        if (["singleCorrect", "multipleCorrect", "fill", "ordering"].includes(question.type)) return { values: [] };
        if (["trueFalse", "assertionReasoning"].includes(question.type)) return { value: "" };
        return {};
    }

    function renderAnswerControl(question, currentAnswer) {
        if (question.type === "trueFalse") {
            return `<select class="field-select" data-true-false-answer><option value="">Choose an answer</option><option value="true" ${currentAnswer?.value === "true" ? "selected" : ""}>True</option><option value="false" ${currentAnswer?.value === "false" ? "selected" : ""}>False</option></select>`;
        }
        if (question.type === "assertionReasoning") {
            const options = [
                ["a", "Both true; reason explains assertion"],
                ["b", "Both true; reason does not explain assertion"],
                ["c", "Assertion true; reason false"],
                ["d", "Assertion false; reason true"]
            ];
            return `<select class="field-select" data-assertion-answer><option value="">Choose an answer</option>${options.map(([value, text]) => `<option value="${value}" ${currentAnswer?.value === value ? "selected" : ""}>${escapeHTML(text)}</option>`).join("")}</select>`;
        }
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) {
            return `<div class="practice-choice-list">${(question.options || []).map(option => `<label class="practice-choice"><input type="${question.type === "singleCorrect" ? "radio" : "checkbox"}" data-choice-answer name="practice-answer" value="${escapeHTML(option.id)}" ${(currentAnswer?.values || []).includes(option.id) ? "checked" : ""}>${escapeHTML(option.text)}</label>`).join("")}</div>`;
        }
        if (question.type === "fill") {
            const count = (question.text.match(/\{\{blank\}\}/g) || []).length || (question.answerData?.blanks || []).length || 1;
            return `<div class="stack">${Array.from({ length: count }, (_, index) => `<div class="inline-field"><span class="chip">Blank ${index + 1}</span><input class="field-input" data-fill-answer value="${escapeHTML(currentAnswer?.values?.[index] || "")}" placeholder="Answer"></div>`).join("")}</div>`;
        }
        if (question.type === "ordering") {
            const current = currentAnswer?.values || [];
            return `<div class="stack">${(question.orderItems || []).map((item, index) => `<div class="inline-field"><span class="chip">Position ${index + 1}</span><select class="field-select" data-order-answer><option value="">Choose item</option>${(question.orderItems || []).map(candidate => `<option value="${escapeHTML(candidate.id)}" ${current[index] === candidate.id ? "selected" : ""}>${escapeHTML(candidate.text)}</option>`).join("")}</select></div>`).join("")}</div>`;
        }
        if (question.type === "matching") {
            const current = currentAnswer?.values || {};
            const pairs = question.pairs || [];
            return `<div class="stack">${pairs.map(pair => `<div class="inline-field"><span class="chip">${escapeHTML(pair.left)}</span><select class="field-select" data-matching-answer="${escapeHTML(pair.id)}"><option value="">Choose match</option>${pairs.map(candidate => `<option value="${escapeHTML(candidate.id)}" ${current[pair.id] === candidate.id ? "selected" : ""}>${escapeHTML(candidate.right)}</option>`).join("")}</select></div>`).join("")}</div>`;
        }
        if (question.type === "difference") {
            const current = currentAnswer?.values || {};
            const diff = question.difference || { terms: [], rows: [] };
            return `<div class="stack"><table class="difference-table"><thead><tr><th>Aspect</th>${(diff.terms || []).map(term => `<th>${escapeHTML(term)}</th>`).join("")}</tr></thead><tbody>${(diff.rows || []).map(row => `<tr><td>${escapeHTML(row.aspect || "")}</td>${(row.values || []).map((_, index) => `<td><input class="table-input" data-difference-answer="${escapeHTML(row.id)}:${index}" value="${escapeHTML(current[row.id]?.[index] || "")}" placeholder="Answer"></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        }
        if (question.type === "caseBased") {
            const current = currentAnswer?.values || {};
            return `<div class="practice-case"><div class="practice-case-passage">${escapeHTML(question.casePassage || "")}</div>${(question.caseQuestions || []).map((sub, index) => `<div class="practice-subquestion" data-case-answer-container="${escapeHTML(sub.id)}"><div class="practice-subquestion-title">Question ${index + 1}: ${escapeHTML(sub.text || label(sub.type))}</div>${renderAnswerControl(sub, current[sub.id])}</div>`).join("")}</div>`;
        }
        return `<textarea class="practice-answer-textarea" data-text-answer placeholder="Type your answer...">${escapeHTML(currentAnswer?.text || "")}</textarea>`;
    }

    function renderCorrectAnswer(question) {
        if (question.type === "text") return escapeHTML(question.answer || "—").replaceAll("\n", "<br>");
        if (question.type === "trueFalse") return escapeHTML(question.answer || "—");
        if (question.type === "assertionReasoning") return escapeHTML(question.answerData?.result || "—");
        if (question.type === "fill") return escapeHTML((question.answerData?.blanks || []).join(", "));
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) return escapeHTML((question.options || []).filter(option => option.correct).map(option => option.text).join(", "));
        if (question.type === "ordering") return escapeHTML((question.orderItems || []).map(item => item.text).join(" → "));
        if (question.type === "matching") return (question.pairs || []).map(pair => `<div>${escapeHTML(pair.left)} → ${escapeHTML((question.pairs || []).find(item => item.id === question.matchingConnections?.[pair.id])?.right || "—")}</div>`).join("");
        if (question.type === "difference") return `<table class="difference-table"><tbody>${(question.difference?.rows || []).map(row => `<tr><td>${escapeHTML(row.aspect || "")}</td>${(row.values || []).map(value => `<td>${escapeHTML(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        if (question.type === "caseBased") return (question.caseQuestions || []).map((item, index) => `<div><strong>${index + 1}.</strong> ${escapeHTML(renderNestedCorrectAnswer(item))}</div>`).join("");
        return escapeHTML(question.answer || "—");
    }

    function renderNestedCorrectAnswer(question) {
        if (question.type === "text") return question.answer || "—";
        if (question.type === "trueFalse") return question.answer || "—";
        if (question.type === "assertionReasoning") return question.answerData?.result || "—";
        if (question.type === "fill") return (question.answerData?.blanks || []).join(", ");
        if (["singleCorrect", "multipleCorrect"].includes(question.type)) return (question.options || []).filter(option => option.correct).map(option => option.text).join(", ");
        if (question.type === "ordering") return (question.orderItems || []).map(item => item.text).join(" → ");
        if (question.type === "matching") return (question.pairs || []).map(pair => `${pair.left} → ${(question.pairs || []).find(item => item.id === question.matchingConnections?.[pair.id])?.right || "—"}`).join(", ");
        if (question.type === "difference") return (question.difference?.rows || []).map(row => `${row.aspect || ""}: ${(row.values || []).join(" | ")}`).join("; ");
        return question.answer || "—";
    }

    function label(type) {
        return { text: "Text", fill: "Fill in the blanks", trueFalse: "True / False", assertionReasoning: "Assertion / Reasoning", caseBased: "Case based questions", matching: "Matching", singleCorrect: "Single correct", multipleCorrect: "Multiple correct", ordering: "Ordering", difference: "Difference between" }[type] || "Question";
    }

    function difficultyLabel(value) {
        return Number(value) === 3 ? "hard" : Number(value) === 2 ? "medium" : "easy";
    }

    function escapeHTML(value) {
        return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    ns.renderPractice = renderPractice;
})(window.everyLearn);
