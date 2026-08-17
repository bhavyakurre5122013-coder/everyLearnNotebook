(function(ns){
    "use strict";
/* everyLearn — Dropdown Utilities */
function setSelectOptions(
    select,
    options,
    {
        placeholder = null,
        value = ""
    } = {}
) {
    if (!select) return;

    const first =
        placeholder === null
            ? ""
            : `<option value="">${escapeHTML(placeholder)}</option>`;

    select.innerHTML =
        first +
        options.map(
            option => `
                <option value="${escapeHTML(option.value)}">
                    ${escapeHTML(option.label)}
                </option>
            `
        ).join("");

    select.value = value;
}

function getSelectedValue(select) {
    return select?.value || "";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.setSelectOptions = setSelectOptions;
    ns.getSelectedValue = getSelectedValue;
})(window.everyLearn);
