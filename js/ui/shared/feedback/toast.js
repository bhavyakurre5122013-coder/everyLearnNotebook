(function(ns){
    "use strict";
/* everyLearn — Toast */
let timer = null;

function showToast({
    message,
    type = "info",
    duration = 2200
}) {
    const host = document.getElementById("toastHost");
    if (!host) return;

    host.innerHTML = `
        <div class="toast toast-${escapeHTML(type)}">
            ${escapeHTML(message)}
        </div>
    `;

    clearTimeout(timer);
    timer = setTimeout(() => {
        host.innerHTML = "";
    }, duration);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.showToast = showToast;
})(window.everyLearn);
