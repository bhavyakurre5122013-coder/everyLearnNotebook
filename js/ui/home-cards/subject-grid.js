(function(ns){
    "use strict";

    function renderSubjectGrid(subjects, options = {}) {
        const grid = document.getElementById("subjectGrid");
        if (!grid) return;

        const view = options.view === "list" ? "list" : "grid";
        const showCreateCard = options.showCreateCard !== false;
        const createCard = grid.querySelector("[data-create-subject]");
        const items = Array.isArray(subjects) ? subjects : [];

        grid.className = `card-grid subject-grid ${view === "list" ? "library-list-view" : ""}`;
        grid.innerHTML = "";

        for (const subject of items) {
            const card = document.createElement("article");
            card.className = view === "list" ? "subject-card library-detail-row" : "subject-card";
            card.dataset.subjectCard = subject.id;
            card.style.setProperty("--card-color", subject.color);
            card.style.setProperty("--card-light", subject.light);

            if (view === "list") {
                card.innerHTML = `
                    <div class="library-detail-main">
                        <div class="card-icon" aria-hidden="true">
                            <img src="./assets/icons/subjects/${escapeHTML(subject.icon || "science.svg")}" alt="">
                        </div>
                        <div class="library-detail-text">
                            <div class="card-title">${escapeHTML(subject.name)}</div>
                            <div class="card-description">${escapeHTML(getSubjectDetail(subject))}</div>
                        </div>
                    </div>
                    <div class="library-detail-meta">
                        <span>Subject</span>
                        ${ns.renderItemActionMenu("subject", subject.id, { label: subject.name })}
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-actions">
                        ${ns.renderItemActionMenu("subject", subject.id, { label: subject.name })}
                    </div>
                    <div class="card-icon" aria-hidden="true">
                        <img src="./assets/icons/subjects/${escapeHTML(subject.icon || "science.svg")}" alt="">
                    </div>
                    <div class="card-title">${escapeHTML(subject.name)}</div>
                    <div class="card-description">Open to see notebooks linked to this subject.</div>
                    <div class="card-footer">
                        <span>Open subject</span>
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
                ? "create-subject-card library-detail-row library-create-row"
                : "create-subject-card";
            card.dataset.createSubject = "true";
            card.innerHTML = `
                <div class="create-card-icon">
                    <img src="./assets/icons/ui/plus.svg" alt="">
                </div>
                <div class="create-card-title">New Subject</div>
                <div class="create-card-description">Add a predefined or custom subject.</div>
            `;
            grid.appendChild(card);
        }
    }

    function getSubjectDetail(subject) {
        const count = ns.listNotebooksForSubject(subject.id).length;
        return `${count} linked notebook${count === 1 ? "" : "s"}`;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    ns.renderSubjectGrid = renderSubjectGrid;
})(window.everyLearn);
