(function(ns){
    "use strict";
    const QUESTION_TYPES = ns.QUESTION_TYPES;
    const prepareQuestionForType = (...args) => ns.prepareQuestionForType(...args);
/* everyLearn — Question Type Selector */

function renderQuestionTypeSelector(question) {
    const mount = document.getElementById("questionTypeSelector");
    if (!mount) return;

    mount.innerHTML = `
        <div class="form-group question-type-row">
            <label>Question type</label>
            <select class="field-select" data-question-type>
                ${QUESTION_TYPES.map(type => `
                    <option value="${type.id}" ${type.id === question.type ? "selected" : ""}>
                        ${escapeHTML(type.label)}
                    </option>
                `).join("")}
            </select>
        </div>
    `;

    mount.querySelector("[data-question-type]").onchange = event => {
        prepareQuestionForType(question, event.target.value);
        const editorMount = document.getElementById("questionTypeEditorMount");
        if (editorMount) ns.renderQuestionTypeEditor(editorMount, question);
    };
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.renderQuestionTypeSelector = renderQuestionTypeSelector;
})(window.everyLearn);
