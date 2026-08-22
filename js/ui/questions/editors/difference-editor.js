(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/* everyLearn — Difference Between */


function renderDifferenceEditor(
    mount,
    question
) {
    if (
        !question.difference ||
        typeof question.difference !== "object"
    ) {
        question.difference = {
            termCount: 2,
            terms: ["", ""],
            rows: []
        };
    }

    const diff =
        question.difference;

    diff.termCount =
        Math.max(
            2,
            Number(diff.termCount) || 2
        );

    while (
        diff.terms.length <
        diff.termCount
    ) {
        diff.terms.push("");
    }

    diff.terms =
        diff.terms.slice(
            0,
            diff.termCount
        );

    mount.innerHTML = `
        <div class="stack">

            <div class="form-group">
                <label>
                    Question / instruction
                </label>

                <textarea
                    class="field-textarea"
                    data-question-text
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="form-group">
                <label>
                    How many terms are being compared?
                </label>

                <input
                    class="field-input"
                    type="number"
                    min="2"
                    step="1"
                    data-term-count
                    value="${diff.termCount}"
                >
            </div>

            <div class="subparts-header">
                <div>
                    <strong>
                        Comparison table
                    </strong>

                    <div class="muted">
                        Aspect is optional.
                    </div>
                </div>

                <button
                    class="create-button small-button"
                    data-add-difference-row
                >
                    ＋ Point
                </button>
            </div>

            <div class="question-table-shell">
                <table class="difference-table">
                    <thead>
                        <tr>
                            <th>
                                Aspect
                            </th>

                            ${
                                diff.terms.map(
                                    (
                                        term,
                                        index
                                    ) =>
                                        `
                                            <th>
                                                <input
                                                    class="table-input"
                                                    data-term="${index}"
                                                    value="${escapeHTML(term)}"
                                                    placeholder="Term ${index + 1}"
                                                >
                                            </th>
                                        `
                                ).join("")
                            }

                            <th>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${
                            diff.rows.map(
                                (
                                    row,
                                    rowIndex
                                ) => {
                                    row.values =
                                        Array.isArray(row.values)
                                            ? row.values
                                            : [];

                                    while (
                                        row.values.length <
                                        diff.termCount
                                    ) {
                                        row.values.push("");
                                    }

                                    return `
                                        <tr>
                                            <td>
                                                <input
                                                    class="table-input"
                                                    data-aspect="${rowIndex}"
                                                    value="${escapeHTML(row.aspect || "")}"
                                                    placeholder="Optional"
                                                >
                                            </td>

                                            ${
                                                row.values.map(
                                                    (
                                                        value,
                                                        column
                                                    ) =>
                                                        `
                                                            <td>
                                                                <input
                                                                    class="table-input"
                                                                    data-cell="${rowIndex}:${column}"
                                                                    value="${escapeHTML(value)}"
                                                                >
                                                            </td>
                                                        `
                                                ).join("")
                                            }

                                            <td>
                                                <button
                                                    class="delete-button small-button"
                                                    data-delete-row="${rowIndex}"
                                                >
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }
                            ).join("")
                        }
                    </tbody>
                </table>
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-term-count]"
    ).onchange =
        event => {
            diff.termCount =
                Math.max(
                    2,
                    Number(
                        event.target.value
                    ) || 2
                );

            while (
                diff.terms.length <
                diff.termCount
            ) {
                diff.terms.push("");
            }

            diff.terms =
                diff.terms.slice(
                    0,
                    diff.termCount
                );

            renderDifferenceEditor(
                mount,
                question
            );
        };

    mount.querySelector(
        "[data-add-difference-row]"
    ).onclick = () => {
        diff.rows.push({
            id: createId("difference"),
            aspect: "",
            values:
                Array(
                    diff.termCount
                ).fill(""),
            hints: []
        });

        renderDifferenceEditor(
            mount,
            question
        );
    };

    mount.querySelectorAll(
        "[data-term]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    diff.terms[
                        Number(
                            input.dataset.term
                        )
                    ] =
                        input.value;
                }
    );

    mount.querySelectorAll(
        "[data-aspect]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    diff.rows[
                        Number(
                            input.dataset.aspect
                        )
                    ].aspect =
                        input.value;
                }
    );

    mount.querySelectorAll(
        "[data-cell]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    const [
                        row,
                        column
                    ] =
                        input.dataset.cell
                            .split(":")
                            .map(Number);

                    diff.rows[row].values[column] =
                        input.value;
                }
    );

    mount.querySelectorAll(
        "[data-delete-row]"
    ).forEach(
        button =>
            button.onclick =
                () => {
                    diff.rows.splice(
                        Number(
                            button.dataset.deleteRow
                        ),
                        1
                    );

                    renderDifferenceEditor(
                        mount,
                        question
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

    ns.renderDifferenceEditor = renderDifferenceEditor;
})(window.everyLearn);
