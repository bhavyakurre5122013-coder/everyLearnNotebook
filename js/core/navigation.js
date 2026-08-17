(function(ns){
    "use strict";
    const ROUTES = ns.ROUTES;
    const state = ns.state;
    const resetWorkspaceSelection = (...args) => ns.resetWorkspaceSelection(...args);
/*
=============================================================
everyLearn — Navigation
-------------------------------------------------------------
Purpose:
    Controls the Home ↔ Workspace transition and keeps
    navigation state centralized.
=============================================================
*/




function goHome() {
    state.route = ROUTES.HOME;
    state.homeSubjectFilterId = null;
    resetWorkspaceSelection();
}

function openWorkspace(notebookId, topicId = null) {
    state.route = ROUTES.WORKSPACE;
    state.notebookId = notebookId;
    state.topicId = topicId;
    state.practice.index = 0;
    state.editingQuestionId = null;
}

function isHome() {
    return state.route === ROUTES.HOME;
}

function isWorkspace() {
    return state.route === ROUTES.WORKSPACE;
}

function setMainTab(tab) {
    state.mainTab = tab;
}

function setQuestionMode(mode) {
    state.questionMode = mode;
}

    ns.goHome = goHome;
    ns.openWorkspace = openWorkspace;
    ns.isHome = isHome;
    ns.isWorkspace = isWorkspace;
    ns.setMainTab = setMainTab;
    ns.setQuestionMode = setQuestionMode;
})(window.everyLearn);
