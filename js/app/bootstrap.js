(function(ns){
    "use strict";
    const state = ns.state;
    const loadStoredData = ns.loadStoredData;
    const saveStoredData = ns.saveStoredData;
    const APP = ns.APP;
    const createDefaultData = ns.createDefaultData;
    const migrateData = ns.migrateData;
    const initRibbon = ns.initRibbon;
    const initMenu = ns.initMenu;
    const initAccount = ns.initAccount;
    const initSettings = ns.initSettings;
    const initHome = ns.initHome;
    const initWorkspace = ns.initWorkspace;
    const initBookmarks = ns.initBookmarks;
    const initQuestionFilters = ns.initQuestionFilters;
    const initPracticeSettings = ns.initPracticeSettings;
    const initRichTextEditors = ns.initRichTextEditors;
    const showToast = (...args) => ns.showToast(...args);
    const renderHome = (...args) => ns.renderHome(...args);
    const renderWorkspace = (...args) => ns.renderWorkspace(...args);

/*
=============================================================
everyLearnNotebook — Application Entry
=============================================================
*/

















function ensureRichTextStylesheet() {
    if (document.querySelector("link[data-rich-text-styles]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./css/notes/rich-text.css";
    link.dataset.richTextStyles = "1";
    document.head.appendChild(link);
}

function loadData() {
    const stored = loadStoredData();
    state.data = migrateData(
        stored || createDefaultData()
    );

    window.everyLearnState = state;
    window.everyLearnSubjects =
        state.data.subjects;

    state.practice.answerDisplayMode =
        state.data.settings.practice?.answerDisplayMode || "after-each";

    saveStoredData(state.data);
}

function applyTheme() {
    document.documentElement.dataset.theme =
        state.data.settings.theme === "dark"
            ? "dark"
            : "light";
}

function renderAll() {
    renderHome();
    renderWorkspace();
}

async function init() {
    loadData();
    applyTheme();

    initRibbon();
    initMenu();
    initAccount();
    initSettings();
    initHome();
    initWorkspace();
    initBookmarks();
    initQuestionFilters();
    ensureRichTextStylesheet();
    initRichTextEditors();
    initPracticeSettings();

    document.addEventListener(
        "everylearn:render",
        renderAll
    );

    renderAll();

    showToast({
        message: `${APP.NAME} ready.`,
        type: "success",
        duration: 900
    });
}

init().catch(error => {
    console.error(
        "everyLearn failed to initialize.",
        error
    );

    showToast({
        message:
            "everyLearn could not initialize.",
        type: "error"
    });
});
})(window.everyLearn);
