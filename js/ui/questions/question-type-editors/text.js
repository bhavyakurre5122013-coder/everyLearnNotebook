(function(ns){
    "use strict";
/* everyLearn — Text Question */
function renderTextEditor(
    mount,
    question
) {
    mount.innerHTML = `
        <div class="form-grid">
            <div class="form-group full">
                <label>Question</label>
                <textarea
                    class="field-textarea"
                    data-question-text
                    placeholder="Write the question"
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="form-group full">
                <label>Correct answer</label>
                <textarea
                    class="field-textarea"
                    data-answer
                    placeholder="Write the expected answer"
                >${escapeHTML(question.answer)}</textarea>
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-answer]"
    ).oninput =
        event => {
            question.answer =
                event.target.value;
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

    ns.renderTextEditor = renderTextEditor;
})(window.everyLearn);
