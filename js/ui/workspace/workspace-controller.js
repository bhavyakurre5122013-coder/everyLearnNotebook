(function(ns){
    "use strict";
    const state = ns.state;
    const isWorkspace = (...args) => ns.isWorkspace(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const findTopicContext = (...args) => ns.findTopicContext(...args);
    const renderSidebar = (...args) => ns.renderSidebar(...args);
    const renderBreadcrumb = (...args) => ns.renderBreadcrumb(...args);
    const renderHierarchyTree = (...args) => ns.renderHierarchyTree(...args);
    const renderContentArea = (...args) => ns.renderContentArea(...args);
/* everyLearn — Workspace */









function initWorkspace() {
    // Workspace rendering is coordinated by app/bootstrap.js so the home
    // and workspace views are rendered together from one render event.
}

function renderWorkspace() {
    const view =
        document.getElementById("workspaceView");

    if (!view) return;

    view.classList.toggle(
        "hidden",
        !isWorkspace()
    );

    if (!isWorkspace()) return;

    const notebook =
        getNotebook(state.notebookId);

    if (!notebook) return;

    renderSidebar(notebook);
    renderHierarchyTree(notebook);

    renderBreadcrumb(
        findTopicContext(
            state.notebookId,
            state.topicId
        )
    );

    renderContentArea();
}

    ns.initWorkspace = initWorkspace;
    ns.renderWorkspace = renderWorkspace;
})(window.everyLearn);
