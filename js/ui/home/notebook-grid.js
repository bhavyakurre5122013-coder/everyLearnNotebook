(function(ns){
    "use strict";
/* everyLearn — Notebook Grid */
function renderNotebookGrid(notebooks) {
    const grid =
        document.getElementById("notebookGrid");

    if (!grid) return;

    const createCard =
        grid.querySelector(
            "[data-create-notebook]"
        );

    grid.innerHTML = "";

    for (const notebook of notebooks) {
        const card =
            document.createElement("article");

        card.className = "notebook-card";
        card.dataset.notebookCard =
            notebook.id;

        card.style.setProperty(
            "--card-color",
            notebook.color
        );
        card.style.setProperty(
            "--card-light",
            notebook.light
        );

        card.innerHTML = `
            <div class="card-actions">
                ${ns.renderItemActionMenu("notebook", notebook.id, { label: notebook.name })}
            </div>
            <div
                class="card-icon"
                aria-hidden="true"
            >
                <img
                    src="./assets/icons/ui/notebook.svg"
                    alt=""
                >
            </div>

            <div class="card-title">
                ${escapeHTML(notebook.name)}
            </div>

            <div class="card-description">
                ${
                    notebook.subjectId
                        ? "Linked to a subject"
                        : "No subject"
                }
            </div>

            ${
                notebook.description
                    ? `
                        <div class="card-description">
                            ${escapeHTML(
                                notebook.description
                            )}
                        </div>
                    `
                    : ""
            }

            <div class="card-footer">
                <span>Open notebook</span>
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

    ns.renderNotebookGrid = renderNotebookGrid;
})(window.everyLearn);
