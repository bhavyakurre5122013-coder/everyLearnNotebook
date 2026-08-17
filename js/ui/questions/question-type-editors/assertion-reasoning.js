(function(ns){
    "use strict";
/* everyLearn — Assertion / Reasoning */
function renderAssertionEditor(
    mount,
    question
) {
    const data =
        question.answerData || {};

    mount.innerHTML = `
        <div class="stack">
            <div class="form-group">
                <label>Assertion</label>
                <textarea
                    class="field-textarea"
                    data-assertion
                >${escapeHTML(data.assertion || "")}</textarea>
            </div>

            <div class="form-group">
                <label>Reason</label>
                <textarea
                    class="field-textarea"
                    data-reason
                >${escapeHTML(data.reason || "")}</textarea>
            </div>

            <div class="form-group">
                <label>Correct option</label>
                <select
                    class="field-select"
                    data-assertion-result
                >
                    <option value="a">Both true; reason explains assertion</option>
                    <option value="b">Both true; reason does not explain assertion</option>
                    <option value="c">Assertion true; reason false</option>
                    <option value="d">Assertion false; reason true</option>
                </select>
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-assertion-result]"
    ).value =
        data.result || "a";

    mount.querySelector(
        "[data-assertion]"
    ).oninput =
        event => {
            question.answerData = {
                ...(question.answerData || {}),
                assertion:
                    event.target.value
            };
        };

    mount.querySelector(
        "[data-reason]"
    ).oninput =
        event => {
            question.answerData = {
                ...(question.answerData || {}),
                reason:
                    event.target.value
            };
        };

    mount.querySelector(
        "[data-assertion-result]"
    ).onchange =
        event => {
            question.answerData = {
                ...(question.answerData || {}),
                result:
                    event.target.value
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

    ns.renderAssertionEditor = renderAssertionEditor;
})(window.everyLearn);
