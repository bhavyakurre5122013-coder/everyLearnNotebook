(function(ns){
    "use strict";
    const ROUTES = ns.ROUTES;
/*
=============================================================
everyLearn — Application State
-------------------------------------------------------------
Purpose:
    One reactive-ish state object shared by services and UI.
    Modules should mutate state through services where possible.
=============================================================
*/



const state = {
    data: null,

    route: ROUTES.HOME,

    notebookId: null,
    sectionId: null,
    chapterId: null,
    topicId: null,

    homeSubjectFilterId: null,
    subjectPageId: null,

    mainTab: "notes",
    questionMode: "manage",

    editingQuestionId: null,
    editingQuestionDraft: null,
    editingQuestionIsNew: false,

    practice: {
        index: 0,
        random: false,
        showHints: true,
        autoNext: false,
        timerEnabled: false,
        seconds: 0,
        timerId: null,
        answers: {},
        results: {},
        exerciseComplete: false,
        answerDisplayMode: "after-each",
        orderIds: [],
        exerciseStatus: {}
    },

    ui: {
        menuOpen: false,
        accountOpen: false,
        sidebarOpen: false,
        dialogOpen: false,

        /*
            Creation controls are hidden by default.
            They are opened explicitly from the sidebar.
        */
        hierarchyCreateOpen: false
    }
};

function resetWorkspaceSelection() {
    state.notebookId = null;
    state.sectionId = null;
    state.chapterId = null;
    state.topicId = null;
    state.editingQuestionId = null;
    state.editingQuestionDraft = null;
    state.editingQuestionIsNew = false;
    state.practice.index = 0;
}

    ns.resetWorkspaceSelection = resetWorkspaceSelection;
    ns.state = state;
})(window.everyLearn);
