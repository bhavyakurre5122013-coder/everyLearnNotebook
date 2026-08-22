(function(ns){
    "use strict";
    const QUESTION_FILTERS = ns.QUESTION_FILTERS;
    const filterQuestions = (...args) => ns.filterQuestions(...args);
    const state = ns.state;
    const openDialog = (...args) => ns.openDialog(...args);
/* everyLearn — Question Filters */





function initQuestionFilters() {
    document.addEventListener(
        "everylearn:show-filters",
        openQuestionFilters
    );
}

function openQuestionFilters() {
    openDialog({
        title: "Question filters",
        bodyHTML: `
            <div class="form-grid">

                <div class="form-group">
                    <label>Filter</label>
                    <select
                        class="field-select"
                        id="filterKind"
                    >
                        ${
                            QUESTION_FILTERS.map(
                                filter =>
                                    `
                                        <option
                                            value="${filter.id}"
                                        >
                                            ${filter.label}
                                        </option>
                                    `
                            ).join("")
                        }
                    </select>
                </div>

                <div class="form-group">
                    <label>Scope</label>
                    <select
                        class="field-select"
                        id="filterScope"
                    >
                        <option value="subject">Subject</option>
                        <option value="notebook">Notebook</option>
                        <option value="section">Section</option>
                        <option value="chapter">Chapter</option>
                        <option value="topic">Topic</option>
                    </select>
                </div>

            </div>

            <div
                class="stack"
                style="margin-top:20px"
                id="filterResults"
            ></div>
        `,
        footerHTML: `
            <button
                class="secondary-button"
                data-dialog-cancel
            >
                Close
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "#filterKind"
            ).onchange =
                () => renderResults(host);

            host.querySelector(
                "#filterScope"
            ).onchange =
                () => renderResults(host);

            renderResults(host);
        }
    });
}

function renderResults(host) {
    const filterId =
        host.querySelector(
            "#filterKind"
        ).value;

    const scope =
        host.querySelector(
            "#filterScope"
        ).value;

    const target =
        resolveDefaultTarget(scope);

    const results =
        target
            ? filterQuestions({
                filterId,
                level: scope,
                targetId: target
            })
            : [];

    host.querySelector(
        "#filterResults"
    ).innerHTML =
        results.length
            ? results.map(
                result =>
                    `
                        <div class="location-result">
                            <div class="result-title">
                                ${escapeHTML(
                                    result.question.text ||
                                    "Untitled question"
                                )}
                            </div>

                            <div class="result-path">
                                ${escapeHTML(
                                    [
                                        result.notebook.name,
                                        result.section?.name,
                                        result.chapter?.name,
                                        result.topic.name
                                    ].join(" / ")
                                )}
                            </div>
                        </div>
                    `
            ).join("")
            : `
                <div class="empty-state">
                    <strong>
                        No results
                    </strong>
                    There are no matching questions in the selected scope.
                </div>
            `;
}

function resolveDefaultTarget(scope) {
    const notebooks =
        state.data.notebooks;

    if (!notebooks.length) return null;

    if (scope === "subject") {
        return notebooks.find(
            notebook => notebook.subjectId
        )?.subjectId || null;
    }

    if (scope === "notebook") {
        return notebooks[0].id;
    }

    if (scope === "section") {
        return notebooks[0]
            .sections?.[0]?.id || null;
    }

    if (scope === "chapter") {
        return notebooks[0]
            .sections?.[0]
            ?.chapters?.[0]?.id || null;
    }

    return notebooks[0]
        .sections?.[0]
        ?.chapters?.[0]
        ?.topics?.[0]?.id || null;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.initQuestionFilters = initQuestionFilters;
    ns.openQuestionFilters = openQuestionFilters;
})(window.everyLearn);
