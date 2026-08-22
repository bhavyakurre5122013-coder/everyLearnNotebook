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
        exerciseStatus: {},
        scopeKey: null,
        questionSetKey: null
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

function resetPracticeSession() {
    if (state.practice.timerId) {
        clearInterval(state.practice.timerId);
    }
    state.practice.index = 0;
    state.practice.answers = {};
    state.practice.results = {};
    state.practice.orderIds = [];
    state.practice.exerciseStatus = {};
    state.practice.exerciseComplete = false;
    state.practice.seconds = 0;
    state.practice.timerId = null;
}

function resetWorkspaceSelection() {
    state.notebookId = null;
    state.sectionId = null;
    state.chapterId = null;
    state.topicId = null;
    state.editingQuestionId = null;
    resetPracticeSession();
    state.practice.scopeKey = null;
    state.practice.questionSetKey = null;
}

    ns.resetPracticeSession = resetPracticeSession;
    ns.resetWorkspaceSelection = resetWorkspaceSelection;
    ns.state = state;
})(window.everyLearn);
