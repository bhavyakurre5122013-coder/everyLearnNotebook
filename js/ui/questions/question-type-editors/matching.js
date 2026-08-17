(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
    const setupMatchingLines = (...args) => ns.setupMatchingLines(...args);
/* everyLearn — Matching */



function renderMatchingEditor(
    mount,
    question
) {
    question.pairs =
        Array.isArray(question.pairs)
            ? question.pairs
            : [];

    question.matchingConnections =
        question.matchingConnections || {};

    mount.innerHTML = `
        <div class="stack">

            <div class="form-group">
                <label>Instruction</label>
                <textarea
                    class="field-textarea"
                    data-question-text
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="subparts-header">
                <div>
                    <strong>
                        Matching table
                    </strong>
                    <div class="muted">
                        Points connect left → right.
                    </div>
                </div>

                <button
                    class="create-button small-button"
                    data-add-match
                >
                    ＋ Point
                </button>
            </div>

            <div
                class="matching-builder"
                data-matching-root
            >
                <div class="matching-stage">

                    <svg
                        class="matching-line-layer"
                        data-matching-lines
                    ></svg>

                    <div class="matching-columns">

                        <div class="matching-column">
                            ${
                                question.pairs.map(
                                    pair =>
                                        `
                                            <div class="matching-row left">
                                                <input
                                                    class="field-input"
                                                    data-left-text="${pair.id}"
                                                    value="${escapeHTML(pair.left)}"
                                                    placeholder="Left point"
                                                >

                                                <button
                                                    class="matching-point"
                                                    data-match-left="${pair.id}"
                                                    type="button"
                                                    aria-label="Connect left point"
                                                    title="Connect left point"
                                                ></button>
                                            </div>
                                        `
                                ).join("")
                            }
                        </div>

                        <div class="matching-column">
                            ${
                                question.pairs.map(
                                    pair =>
                                        `
                                            <div class="matching-row right">
                                                <button
                                                    class="matching-point"
                                                    data-match-right="${pair.id}"
                                                    type="button"
                                                    aria-label="Connect right point"
                                                    title="Connect right point"
                                                ></button>

                                                <input
                                                    class="field-input"
                                                    data-right-text="${pair.id}"
                                                    value="${escapeHTML(pair.right)}"
                                                    placeholder="Right point"
                                                >
                                            </div>
                                        `
                                ).join("")
                            }
                        </div>

                    </div>
                </div>
            </div>

            <div class="subparts-list">
                ${
                    question.pairs.map(
                        (
                            pair,
                            index
                        ) =>
                            `
                                <div class="subpart-card">
                                    <div class="subpart-header">
                                        <strong>
                                            Point ${index + 1}
                                        </strong>

                                        <button
                                            class="delete-button small-button"
                                            data-delete-match="${pair.id}"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div class="subpart-hints">
                                        <div class="subpart-hints-header">
                                            <strong>Hints</strong>

                                            <button
                                                class="secondary-button small-button"
                                                data-add-match-hint="${pair.id}"
                                                ${
                                                    (pair.hints || []).length >= 2
                                                        ? "disabled"
                                                        : ""
                                                }
                                            >
                                                ＋ Hint
                                            </button>
                                        </div>

                                        <div class="stack">
                                            ${(pair.hints || []).map(
                                                (
                                                    hint,
                                                    hintIndex
                                                ) =>
                                                    `
                                                        <div class="hint-row">
                                                            <input
                                                                class="field-input"
                                                                data-match-hint="${pair.id}:${hintIndex}"
                                                                value="${escapeHTML(hint)}"
                                                            >

                                                            <button
                                                                class="delete-button small-button"
                                                                data-delete-match-hint="${pair.id}:${hintIndex}"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    `
                                            ).join("")}
                                        </div>
                                    </div>
                                </div>
                            `
                    ).join("")
                }
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-add-match]"
    ).onclick = () => {
        question.pairs.push({
            id: createId("match"),
            left: "",
            right: "",
            hints: []
        });

        renderMatchingEditor(
            mount,
            question
        );
    };

    mount.querySelectorAll(
        "[data-left-text]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    const pair =
                        question.pairs.find(
                            item =>
                                item.id ===
                                input.dataset.leftText
                        );

                    if (pair) {
                        pair.left =
                            input.value;
                    }
                }
    );

    mount.querySelectorAll(
        "[data-right-text]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    const pair =
                        question.pairs.find(
                            item =>
                                item.id ===
                                input.dataset.rightText
                        );

                    if (pair) {
                        pair.right =
                            input.value;
                    }
                }
    );

    mount.querySelectorAll(
        "[data-delete-match]"
    ).forEach(
        button =>
            button.onclick = () => {
                const id =
                    button.dataset.deleteMatch;

                question.pairs =
                    question.pairs.filter(
                        pair => pair.id !== id
                    );

                delete question
                    .matchingConnections[id];

                for (
                    const [left, right]
                    of Object.entries(
                        question.matchingConnections
                    )
                ) {
                    if (right === id) {
                        delete question
                            .matchingConnections[left];
                    }
                }

                renderMatchingEditor(
                    mount,
                    question
                );
            }
    );

    mount.querySelectorAll(
        "[data-add-match-hint]"
    ).forEach(
        button =>
            button.onclick =
                () => {
                    const pair =
                        question.pairs.find(
                            item =>
                                item.id ===
                                button.dataset
                                    .addMatchHint
                        );

                    if (!pair) return;

                    pair.hints =
                        Array.isArray(
                            pair.hints
                        )
                            ? pair.hints
                            : [];

                    if (pair.hints.length >= 2) return;

                    pair.hints.push("");

                    renderMatchingEditor(
                        mount,
                        question
                    );
                }
    );

    mount.querySelectorAll(
        "[data-delete-match-hint]"
    ).forEach(
        button =>
            button.onclick =
                () => {
                    const [
                        pairId,
                        index
                    ] =
                        button.dataset
                            .deleteMatchHint
                            .split(":");

                    const pair =
                        question.pairs.find(
                            item =>
                                item.id ===
                                pairId
                        );

                    if (pair) {
                        pair.hints.splice(
                            Number(index),
                            1
                        );
                    }

                    renderMatchingEditor(
                        mount,
                        question
                    );
                }
    );

    setupMatchingLines({
        root:
            mount.querySelector(
                "[data-matching-root]"
            ),
        connections:
            question.matchingConnections,
        onConnect: () => {}
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.renderMatchingEditor = renderMatchingEditor;
})(window.everyLearn);
