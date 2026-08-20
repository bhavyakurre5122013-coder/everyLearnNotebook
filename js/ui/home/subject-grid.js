(function(ns){
    "use strict";
/* everyLearn — Subject Grid */
function renderSubjectGrid(subjects) {
    const grid =
        document.getElementById("subjectGrid");

    if (!grid) return;

    const createCard =
        grid.querySelector(
            "[data-create-subject]"
        );

    grid.innerHTML = "";

    for (const subject of subjects) {
        const card =
            document.createElement("article");

        card.className = "subject-card";
        card.dataset.subjectCard =
            subject.id;

        card.style.setProperty(
            "--card-color",
            subject.color
        );
        card.style.setProperty(
            "--card-light",
            subject.light
        );

        card.innerHTML = `
            <div class="card-actions">
                ${ns.renderItemActionMenu("subject", subject.id, { label: subject.name })}
            </div>

            <div
                class="card-icon"
                aria-hidden="true"
            >
                <img
                    src="./assets/icons/subjects/${escapeHTML(
                        subject.icon || "science.svg"
                    )}"
                    alt=""
                >
            </div>

            <div class="card-title">
                ${escapeHTML(subject.name)}
            </div>

            <div class="card-description">
                Open to see notebooks linked to this subject.
            </div>

            <div class="card-footer">
                <span>Open subject</span>
                <span>→</span>
            </div>
        `;

        grid.appendChild(card);
    }

    if (createCard) {
        grid.appendChild(createCard);
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

    ns.renderSubjectGrid = renderSubjectGrid;
})(window.everyLearn);
