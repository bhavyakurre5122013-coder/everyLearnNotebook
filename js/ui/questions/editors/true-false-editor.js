(function(ns){
    "use strict";
/* everyLearn — True / False */
function renderTrueFalseEditor(
    mount,
    question
) {
    mount.innerHTML = `
        <div class="stack">
            <div class="form-group">
                <label>Statement</label>
                <textarea
                    class="field-textarea"
                    data-question-text
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="form-group">
                <label>Correct answer</label>
                <select
                    class="field-select"
                    data-tf-answer
                >
                    <option
                        value="true"
                        ${
                            String(question.answer) === "true"
                                ? "selected"
                                : ""
                        }
                    >
                        True
                    </option>

                    <option
                        value="false"
                        ${
                            String(question.answer) === "false"
                                ? "selected"
                                : ""
                        }
                    >
                        False
                    </option>
                </select>
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-tf-answer]"
    ).onchange =
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

    ns.renderTrueFalseEditor = renderTrueFalseEditor;
})(window.everyLearn);
