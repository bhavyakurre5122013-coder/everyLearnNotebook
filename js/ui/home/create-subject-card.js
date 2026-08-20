(function(ns){
    "use strict";
/* everyLearn — Create Subject Card */
function renderCreateSubjectCard() {
    const grid =
        document.getElementById("subjectGrid");

    if (!grid) return;

    grid
        .querySelector(
            "[data-create-subject]"
        )
        ?.remove();

    const card =
        document.createElement("article");

    card.className =
        "create-subject-card";

    card.dataset.createSubject =
        "true";

    card.innerHTML = `
        <div class="create-card-icon">
            <img src="./assets/icons/ui/plus.svg" alt="">
        </div>

        <div class="create-card-title">
            New Subject
        </div>

        <div class="create-card-description">
            Add a predefined or custom subject.
        </div>
    `;

    grid.appendChild(card);
}

    ns.renderCreateSubjectCard = renderCreateSubjectCard;
})(window.everyLearn);
