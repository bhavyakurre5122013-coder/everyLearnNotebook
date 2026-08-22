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
    Controls the Home ↔ Library pages ↔ Workspace transition
    and keeps navigation state centralized.
=============================================================
*/

function goHome() {
    state.route = ROUTES.HOME;
    state.homeSubjectFilterId = null;
    state.subjectPageId = null;
    resetWorkspaceSelection();
}

function openSubjectsPage() {
    state.route = ROUTES.SUBJECTS;
    state.subjectPageId = null;
    resetWorkspaceSelection();
}

function openNotebooksPage() {
    state.route = ROUTES.NOTEBOOKS;
    state.subjectPageId = null;
    resetWorkspaceSelection();
}

function openSubjectPage(subjectId) {
    state.route = ROUTES.SUBJECT;
    state.subjectPageId = subjectId;
    resetWorkspaceSelection();
}

function openWorkspace(notebookId, topicId = null) {
    state.route = ROUTES.WORKSPACE;
    state.notebookId = notebookId;
    state.sectionId = null;
    state.chapterId = null;
    state.topicId = topicId;
    state.subjectPageId = null;
    ns.resetPracticeSession();
    state.practice.scopeKey = null;
    state.practice.questionSetKey = null;
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
    ns.openSubjectsPage = openSubjectsPage;
    ns.openNotebooksPage = openNotebooksPage;
    ns.openSubjectPage = openSubjectPage;
    ns.openWorkspace = openWorkspace;
    ns.isHome = isHome;
    ns.isWorkspace = isWorkspace;
    ns.setMainTab = setMainTab;
    ns.setQuestionMode = setQuestionMode;
})(window.everyLearn);
