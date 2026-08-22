/*
everyLearnNotebook — classic-script loader
*/
(function () {
    "use strict";
    window.everyLearn = window.everyLearn || {};

    const modules = [
    // Core constants and primitives must exist before any module captures them.
    "js/core/constants.js",
    "js/core/ids.js",
    "js/core/utils.js",
    "js/data/subjects.js",
    "js/core/state.js",

    // Models/data depend on the core layer above.
    "js/models/chapter-model.js",
    "js/models/topic-model.js",
    "js/models/bookmark-model.js",
    "js/models/subpart-model.js",
    "js/models/notebook-model.js",
    "js/models/subject-model.js",
    "js/models/section-model.js",
    "js/models/question-model.js",
    "js/data/default-data.js",
    "js/data/migrations.js",
    "js/core/storage.js",

    // Services depend on state, storage, models, and each other.
    "js/services/cache/cache-service.js",
    "js/services/notebooks/notebook-service.js",
    "js/services/hierarchy/hierarchy-service.js",
    "js/services/subjects/subject-service.js",
    "js/services/filters/filter-service.js",
    "js/services/import-export/import-export-service.js",
    "js/services/questions/question-service.js",
    "js/services/checking/checking-core.js",
    "js/services/bookmarks/bookmark-service.js",
    "js/services/search/search-service.js",

    // Navigation is consumed by UI modules.
    "js/core/navigation.js",

    // Non-stateful interaction helpers.
    "js/interactions/autosave.js",
    "js/interactions/drag-drop.js",
    "js/interactions/keyboard-shortcuts.js",
    "js/interactions/matching-lines.js",

    // Shared UI primitives.
    "js/ui/practice/practice-navigation.js",
    "js/ui/practice/answer/answer-collector.js",
    "js/ui/practice/renderers/practice-renderer.js",
    "js/ui/shared/controls/buttons.js",
    "js/ui/shared/controls/dropdowns.js",
    "js/ui/shared/controls/color-picker.js",
    "js/ui/shared/rich-text/rich-text.js",
    "js/ui/shared/icons.js",
    "js/ui/shared/feedback/toast.js",
    "js/ui/shared/feedback/confirmations.js",
    "js/ui/shared/feedback/dialogs.js",
    "js/ui/shared/menus/action-menu.js",
    "js/ui/workspace/breadcrumb.js",
    "js/ui/home-cards/create-notebook-card.js",
    "js/ui/home-cards/subject-grid.js",
    "js/ui/home-cards/notebook-grid.js",
    "js/ui/home-cards/create-subject-card.js",
    "js/ui/shell/menu.js",
    "js/ui/shell/account.js",
    "js/ui/shell/ribbon.js",

    // Feature UI.
    "js/ui/bookmarks/bookmark-browser.js",
    "js/ui/bookmarks/bookmark-editor.js",
    "js/ui/bookmarks/bookmarks.js",
    "js/ui/notes/editor/notes-editor.js",
    "js/ui/notes/toolbar/notes-toolbar.js",
    "js/ui/notes/notes.js",
    "js/ui/questions/subpart-manager.js",
    "js/ui/questions/question-renderer.js",
    "js/ui/questions/editors/difference-editor.js",
    "js/ui/questions/editors/multiple-correct-editor.js",
    "js/ui/questions/editors/ordering-editor.js",
    "js/ui/questions/editors/assertion-reasoning-editor.js",
    "js/ui/questions/editors/fill-editor.js",
    "js/ui/questions/editors/matching-editor.js",
    "js/ui/questions/editors/single-correct-editor.js",
    "js/ui/questions/editors/case-based-editor.js",
    "js/ui/questions/editors/text-editor.js",
    "js/ui/questions/editors/true-false-editor.js",
    "js/ui/questions/question-type-selector.js",
    "js/ui/questions/question-editor.js",
    "js/ui/questions/question-metadata.js",
    "js/ui/questions/question-manager.js",
    "js/ui/questions/question-hints.js",
    "js/ui/filters/filter-results.js",
    "js/ui/filters/question-filters.js",
    "js/ui/practice/settings/practice-settings.js",
    "js/ui/practice/practice.js",
    "js/ui/workspace/workspace-controller.js",
    "js/ui/workspace/content-area.js",
    "js/ui/workspace/hierarchy/hierarchy-tree.js",
    "js/ui/workspace/sidebar/sidebar.js",
    "js/ui/home/home.js",
    "js/ui/shell/settings.js",

    // Application entry point must always be last.
    "js/app/bootstrap.js"
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
