(function(ns){
    "use strict";
    const state = ns.state;
    const findTopicContext = (...args) => ns.findTopicContext(...args);
    const renderNotes = (...args) => ns.renderNotes(...args);
    const renderQuestionManager = (...args) => ns.renderQuestionManager(...args);
    const renderPractice = (...args) => ns.renderPractice(...args);
/* everyLearn — Content Area */






let tabsBound = false;

function renderContentArea() {
    const context =
        findTopicContext(
            state.notebookId,
            state.topicId
        );

    const title =
        document.getElementById(
            "workspaceTitleArea"
        );

    if (!title) return;

    if (!context) {
        title.innerHTML = `
            <h1>Select a topic</h1>
            <p class="muted">
                Choose a topic from the hierarchy.
            </p>
        `;

        showTab("notes");
        return;
    }

    title.innerHTML = `
        <h1>
            ${escapeHTML(context.topic.name)}
        </h1>

        <p class="muted">
            ${escapeHTML(context.chapter.name)}
        </p>
    `;

    bindTabsOnce();

    renderNotes(context.topic);

    if (state.mainTab === "questions") {
        renderQuestionManager();
        renderPractice();
    }

    showTab(state.mainTab);
}

function bindTabsOnce() {
    if (tabsBound) return;

    const notesTab =
        document.getElementById("notesTab");

    const questionsTab =
        document.getElementById("questionsTab");

    notesTab?.addEventListener(
        "click",
        () => {
            state.mainTab = "notes";
            showTab("notes");
        }
    );

    questionsTab?.addEventListener(
        "click",
        () => {
            state.mainTab = "questions";
            showTab("questions");
            renderQuestionManager();
            renderPractice();
        }
    );

    const manageTab =
        document.getElementById(
            "manageQuestionsTab"
        );

    const practiceTab =
        document.getElementById(
            "practiceQuestionsTab"
        );

    manageTab?.addEventListener(
        "click",
        () => {
            state.questionMode = "manage";
            renderQuestionManager();
            showQuestionMode("manage");
        }
    );

    practiceTab?.addEventListener(
        "click",
        () => {
            state.questionMode = "practice";
            renderPractice();
            showQuestionMode("practice");
        }
    );

    tabsBound = true;
}

function showTab(tab) {
    const notesTab =
        document.getElementById("notesTab");

    const questionsTab =
        document.getElementById("questionsTab");

    const notesContent =
        document.getElementById("notesContent");

    const questionsContent =
        document.getElementById(
            "questionsContent"
        );

    const notesActive =
        tab === "notes";

    notesTab?.classList.toggle(
        "active",
        notesActive
    );

    questionsTab?.classList.toggle(
        "active",
        !notesActive
    );

    notesContent?.classList.toggle(
        "hidden",
        !notesActive
    );

    questionsContent?.classList.toggle(
        "hidden",
        notesActive
    );

    notesContent?.removeAttribute(
        "hidden"
    );

    questionsContent?.removeAttribute(
        "hidden"
    );

    notesContent?.setAttribute(
        "aria-hidden",
        String(!notesActive)
    );

    questionsContent?.setAttribute(
        "aria-hidden",
        String(notesActive)
    );

    if (notesContent) {
        notesContent.hidden =
            !notesActive;
    }

    if (questionsContent) {
        questionsContent.hidden =
            notesActive;
    }

    showQuestionMode(
        state.questionMode
    );
}

function showQuestionMode(mode) {
    const manager =
        document.getElementById(
            "questionManager"
        );

    const practice =
        document.getElementById(
            "practiceMode"
        );

    const manageTab =
        document.getElementById(
            "manageQuestionsTab"
        );

    const practiceTab =
        document.getElementById(
            "practiceQuestionsTab"
        );

    const manage =
        mode === "manage";

    manager?.classList.toggle(
        "hidden",
        !manage
    );

    practice?.classList.toggle(
        "hidden",
        manage
    );

    if (manager) {
        manager.hidden = !manage;
    }

    if (practice) {
        practice.hidden = manage;
    }

    manageTab?.classList.toggle(
        "active",
        manage
    );

    practiceTab?.classList.toggle(
        "active",
        !manage
    );

    manageTab?.setAttribute(
        "aria-selected",
        String(manage)
    );

    practiceTab?.setAttribute(
        "aria-selected",
        String(!manage)
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.renderContentArea = renderContentArea;
})(window.everyLearn);
