(function(ns){
    "use strict";
/* everyLearn — Fill In The Blanks */
function renderFillEditor(
    mount,
    question
) {
    const blanks =
        question.answerData?.blanks || [];

    mount.innerHTML = `
        <div class="stack">
            <div class="form-group">
                <label>
                    Question
                </label>
                <textarea
                    class="field-textarea"
                    data-question-text
                    placeholder="Use {{blank}} for every blank."
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="form-group">
                <label>
                    Answers in order
                </label>
                <input
                    class="field-input"
                    data-fill-answer
                    value="${escapeHTML(
                        blanks.join(" | ")
                    )}"
                    placeholder="Answer 1 | Answer 2"
                >
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-fill-answer]"
    ).oninput =
        event => {
            question.answerData = {
                ...(question.answerData || {}),
                blanks:
                    event.target.value
                        .split("|")
                        .map(v => v.trim())
                        .filter(Boolean)
            };
        };
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.renderFillEditor = renderFillEditor;
})(window.everyLearn);
