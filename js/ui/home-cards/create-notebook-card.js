(function(ns){
    "use strict";
/* everyLearn — Create Notebook Card */
function renderCreateNotebookCard() {
    const grid =
        document.getElementById("notebookGrid");

    if (!grid) return;

    grid
        .querySelector(
            "[data-create-notebook]"
        )
        ?.remove();

    const card =
        document.createElement("article");

    card.className =
        "create-notebook-card";

    card.dataset.createNotebook =
        "true";

    card.innerHTML = `
        <div class="create-card-icon">
            <img src="./assets/icons/ui/plus.svg" alt="">
        </div>

        <div class="create-card-title">
            New Notebook
        </div>

        <div class="create-card-description">
            Add an optional subject.
        </div>
    `;

    grid.appendChild(card);
}

    ns.renderCreateNotebookCard = renderCreateNotebookCard;
})(window.everyLearn);
