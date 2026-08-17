/*
everyLearnNotebook — classic-script loader
*/
(function () {
    "use strict";
    window.everyLearn = window.everyLearn || {};

    const modules = [
    "js/models/chapter-model.js",
    "js/models/topic-model.js",
    "js/models/bookmark-model.js",
    "js/models/subpart-model.js",
    "js/models/notebook-model.js",
    "js/models/subject-model.js",
    "js/models/section-model.js",
    "js/interactions/autosave.js",
    "js/interactions/drag-drop.js",
    "js/interactions/keyboard-shortcuts.js",
    "js/interactions/matching-lines.js",
    "js/services/cache-service.js",
    "js/services/hierarchy-service.js",
    "js/data/subjects.js",
    "js/core/ids.js",
    "js/core/utils.js",
    "js/core/constants.js",
    "js/ui/practice/practice-navigation.js",
    "js/ui/practice/practice-answer.js",
    "js/ui/practice/practice-renderer.js",
    "js/ui/shared/buttons.js",
    "js/ui/shared/dropdowns.js",
    "js/ui/shared/color-picker.js",
    "js/ui/shared/icons.js",
    "js/ui/shared/toast.js",
    "js/ui/shared/confirmations.js",
    "js/ui/shared/dialogs.js",
    "js/ui/workspace/breadcrumb.js",
    "js/ui/home/create-notebook-card.js",
    "js/ui/home/subject-grid.js",
    "js/ui/home/notebook-grid.js",
    "js/ui/home/create-subject-card.js",
    "js/ui/shell/menu.js",
    "js/ui/shell/account.js",
    "js/ui/shell/ribbon.js",
    "js/ui/bookmarks/bookmark-browser.js",
    "js/ui/notes/notes-editor.js",
    "js/ui/notes/notes-toolbar.js",
    "js/ui/questions/subpart-manager.js",
    "js/ui/questions/question-type-renderer.js",
    "js/ui/filters/filter-results.js",
    "js/ui/questions/question-type-editors/difference-table.js",
    "js/ui/questions/question-type-editors/multiple-correct.js",
    "js/ui/questions/question-type-editors/ordering.js",
    "js/ui/questions/question-type-editors/assertion-reasoning.js",
    "js/ui/questions/question-type-editors/fill.js",
    "js/ui/questions/question-type-editors/matching.js",
    "js/ui/questions/question-type-editors/single-correct.js",
    "js/ui/questions/question-type-editors/case-based.js",
    "js/ui/questions/question-type-editors/text.js",
    "js/ui/questions/question-type-editors/true-false.js",
    "js/models/question-model.js",
    "js/data/default-data.js",
    "js/data/migrations.js",
    "js/core/storage.js",
    "js/core/state.js",
    "js/services/subject-service.js",
    "js/services/filter-service.js",
    "js/services/import-export-service.js",
    "js/services/question-service.js",
    "js/services/notebook-service.js",
    "js/services/bookmark-service.js",
    "js/services/search-service.js",
    "js/core/navigation.js",
    "js/ui/practice/practice-settings.js",
    "js/ui/practice/practice.js",
    "js/ui/workspace/workspace.js",
    "js/ui/workspace/content-area.js",
    "js/ui/workspace/hierarchy-tree.js",
    "js/ui/workspace/sidebar.js",
    "js/ui/shell/home.js",
    "js/ui/shell/settings.js",
    "js/ui/bookmarks/bookmark-editor.js",
    "js/ui/bookmarks/bookmarks.js",
    "js/ui/notes/notes.js",
    "js/ui/questions/question-type-selector.js",
    "js/ui/questions/question-editor.js",
    "js/ui/questions/question-metadata.js",
    "js/ui/questions/question-manager.js",
    "js/ui/questions/question-hints.js",
    "js/ui/filters/question-filters.js",
    "js/app-main.js"
];

    function fail(error) {
        console.error("everyLearnNotebook failed to load.", error);
        const app = document.getElementById("app");
        if (!app) return;
        app.innerHTML = `
            <main style="min-height:100vh;display:grid;place-items:center;padding:32px;background:#F4F8FA;color:#172033;font-family:Arial,Helvetica,sans-serif">
                <section style="width:min(700px,100%);padding:30px;border:1px solid #F3B7B7;border-radius:18px;background:#fff;box-shadow:0 18px 46px rgba(23,32,51,.12)">
                    <h1 style="margin:0 0 10px">everyLearnNotebook could not start</h1>
                    <p style="margin:0;color:#5B667A;line-height:1.6">A project JavaScript file failed to load. Check the browser console for the exact file.</p>
                </section>
            </main>`;
    }

    function load(index) {
        if (index >= modules.length) return;

        const script = document.createElement("script");
        script.src = "./" + modules[index];
        script.async = false;

        script.onload = () => load(index + 1);
        script.onerror = () => fail(new Error("Could not load " + modules[index]));

        document.head.appendChild(script);
    }

    load(0);
})();
