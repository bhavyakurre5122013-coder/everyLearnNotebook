(function(ns){
    "use strict";

    function renderNotebookGrid(notebooks, options = {}) {
        const grid = document.getElementById("notebookGrid");
        if (!grid) return;

        const view = options.view === "list" ? "list" : "grid";
        const showCreateCard = options.showCreateCard !== false;
        const createCard = grid.querySelector("[data-create-notebook]");
        const items = Array.isArray(notebooks) ? notebooks : [];

        grid.className = `card-grid notebook-grid ${view === "list" ? "library-list-view" : ""}`;
        grid.innerHTML = "";

        for (const notebook of items) {
            const card = document.createElement("article");
            card.className = view === "list" ? "notebook-card library-detail-row" : "notebook-card";
            card.dataset.notebookCard = notebook.id;
            card.style.setProperty("--card-color", notebook.color);
            card.style.setProperty("--card-light", notebook.light);

            const subject = notebook.subjectId ? ns.getSubject(notebook.subjectId) : null;
            const detail = subject ? `Linked to ${subject.name}` : "No subject";

            if (view === "list") {
                card.innerHTML = `
                    <div class="library-detail-main">
                        <div class="card-icon" aria-hidden="true">
                            <img src="./assets/icons/ui/notebook.svg" alt="">
                        </div>
                        <div class="library-detail-text">
                            <div class="card-title">${escapeHTML(notebook.name)}</div>
                            <div class="card-description">${escapeHTML(detail)}${notebook.description ? ` · ${escapeHTML(notebook.description)}` : ""}</div>
                        </div>
                    </div>
                    <div class="library-detail-meta">
                        <span>Notebook</span>
                        ${ns.renderItemActionMenu("notebook", notebook.id, { label: notebook.name })}
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-actions">
                        ${ns.renderItemActionMenu("notebook", notebook.id, { label: notebook.name })}
                    </div>
                    <div class="card-icon" aria-hidden="true">
                        <img src="./assets/icons/ui/notebook.svg" alt="">
                    </div>
                    <div class="card-title">${escapeHTML(notebook.name)}</div>
                    <div class="card-description">${escapeHTML(detail)}</div>
                    ${notebook.description ? `<div class="card-description">${escapeHTML(notebook.description)}</div>` : ""}
                    <div class="card-footer">
                        <span>Open notebook</span>
                        <span>→</span>
                    </div>
                `;
            }

            grid.appendChild(card);
        }

        if (showCreateCard && createCard) {
            grid.appendChild(createCard);
        }

        if (showCreateCard && !createCard) {
            const card = document.createElement("article");
            card.className = view === "list"
                ? "create-notebook-card library-detail-row library-create-row"
                : "create-notebook-card";
            card.dataset.createNotebook = "true";
            card.innerHTML = `
                <div class="create-card-icon">
                    <img src="./assets/icons/ui/plus.svg" alt="">
                </div>
                <div class="create-card-title">New Notebook</div>
                <div class="create-card-description">Add an optional subject.</div>
            `;
            grid.appendChild(card);
        }
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    ns.renderNotebookGrid = renderNotebookGrid;
})(window.everyLearn);
