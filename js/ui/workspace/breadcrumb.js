(function(ns){
    "use strict";

    /* everyLearnNotebook — Breadcrumb */

    function renderBreadcrumb(context) {
        const node = document.getElementById("breadcrumb");
        if (!node) return;

        if (!context) {
            node.innerHTML = `
                <span class="muted">
                    No topic selected
                </span>
            `;
            return;
        }

        const parts = [
            context.notebook.name,
            context.section?.name,
            context.chapter.name,
            context.topic.name
        ].filter(Boolean);

        node.innerHTML = parts
            .map(
                (part, index) =>
                    index === parts.length - 1
                        ? `<strong>${escapeHTML(part)}</strong>`
                        : `<span>${escapeHTML(part)}</span><span>/</span>`
            )
            .join("");
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    ns.renderBreadcrumb = renderBreadcrumb;
})(window.everyLearn);
