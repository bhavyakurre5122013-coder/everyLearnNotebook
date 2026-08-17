(function(ns){
    "use strict";
    const iconImage = (...args) => ns.iconImage(...args);
/* everyLearn — Shared Button HTML */


function actionButton({
    action,
    text = "",
    icon = null,
    className = "",
    attributes = ""
}) {
    const allowed = new Set([
        "create",
        "edit",
        "delete",
        "save",
        "secondary",
        "ghost"
    ]);

    const type = allowed.has(action)
        ? action
        : "secondary";

    return `
        <button
            type="button"
            class="${type}-button ${className}"
            ${attributes}
        >
            ${icon ? iconImage(icon) : ""}
            ${escapeHTML(text)}
        </button>
    `;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.actionButton = actionButton;
})(window.everyLearn);
