(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const openDialog = (...args) => ns.openDialog(...args);

    function initSettings() {
        document.addEventListener("everylearn:show-settings", () => openSettings({}));
        document.addEventListener("everylearn:checking-settings", () => openSettings({ section: "checking" }));
        document.addEventListener("everylearn:question-checking-settings", event => openSettings({ section: "question", questionId: event.detail?.questionId }));
    }

    function getQuestion(questionId) {
        if (!questionId || !state.notebookId || !state.topicId) return null;
        return ns.getQuestion(state.notebookId, state.topicId, questionId);
    }

    function openSettings({ section = "general", questionId = null } = {}) {
        const question = getQuestion(questionId);
        const checking = question?.checking || state.data.settings.checkingSystem;
        const isQuestion = section === "question" && question;
        const isCheckingOnly = section === "checking" && !isQuestion;

        openDialog({
            title: isQuestion ? "Question checking system" : (isCheckingOnly ? "Checking system" : "Settings"),
            large: true,
            bodyHTML: `
                <div class="settings-sections">
                    ${!isQuestion && !isCheckingOnly ? `
                        <section class="settings-section">
                            <div class="settings-section-header"><h3>General</h3></div>
                            <div class="setting-row">
                                <div><strong>Theme</strong><small>Choose light or dark appearance.</small></div>
                                <select class="field-select" id="applicationTheme"><option value="light">Light</option><option value="dark">Dark</option></select>
                            </div>
                        </section>
                        <section class="settings-section">
                            <div class="settings-section-header"><h3>Practice</h3><p>Choose when answers and results become visible.</p></div>
                            <div class="setting-row setting-column-mobile">
                                <div><strong>Answer display</strong><small>Control whether each answer is revealed immediately or only after the full exercise.</small></div>
                                <select class="field-select" id="practiceAnswerDisplay">
                                    <option value="after-each">Show answer after solving each question</option>
                                    <option value="after-all">Show answers after solving the entire exercise</option>
                                </select>
                            </div>
                        </section>` : ""}
                    <section class="settings-section">
                        <div class="settings-section-header"><h3>Checking system</h3><p>Configure how free-text and point-based answers are evaluated.</p></div>
                        ${renderCheckingControls(checking)}
                        ${isQuestion ? `
                            <div class="setting-row setting-row-stack">
                                <div><strong>Marks</strong><small>Maximum marks awarded to this question.</small></div>
                                <input class="field-input compact-number" id="questionMarks" type="number" min="0" step="0.5" value="${Number(question.marks) || 1}">
                            </div>` : ""}
                    </section>
                </div>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Close</button>
                <button class="save-button" data-dialog-save><img src="./assets/icons/ui/save.svg" alt=""> Save</button>
            `,
            onOpen: ({ host, close }) => {
                const theme = host.querySelector("#applicationTheme");
                if (theme) theme.value = state.data.settings.theme;
                const answerDisplay = host.querySelector("#practiceAnswerDisplay");
                if (answerDisplay) answerDisplay.value = state.data.settings.practice.answerDisplayMode;

                host.querySelector("[data-dialog-cancel]").onclick = close;
                host.querySelector("[data-dialog-save]").onclick = () => {
                    if (theme) {
                        state.data.settings.theme = theme.value;
                        document.documentElement.dataset.theme = theme.value;
                    }
                    if (answerDisplay) state.data.settings.practice.answerDisplayMode = answerDisplay.value;

                    const values = readCheckingControls(host);
                    if (isQuestion) {
                        ns.updateQuestion(state.notebookId, state.topicId, question.id, {
                            checking: values,
                            marks: Math.max(0, Number(host.querySelector("#questionMarks")?.value) || 1)
                        });
                    } else {
                        state.data.settings.checkingSystem = values;
                        state.practice.answerDisplayMode = state.data.settings.practice.answerDisplayMode;
                    }
                    saveStoredData(state.data);
                    close();
                    document.dispatchEvent(new Event("everylearn:render"));
                };
            }
        });
    }

    function renderCheckingControls(values) {
        return `
            <div class="settings-control-grid">
                ${settingToggle("checkingSpelling", "Spelling mistakes count as incorrect", values.spellingStrict !== false)}
                ${settingToggle("checkingPunctuation", "Punctuation mistakes count as incorrect", values.punctuationStrict !== false)}
                ${settingToggle("checkingPartial", "Award partial credit", values.partialCredit !== false)}
                ${settingToggle("checkingPoints", "Compare required points", values.pointBased !== false)}
                ${settingToggle("checkingCase", "Treat letter case as significant", Boolean(values.caseSensitive))}
            </div>
        `;
    }

    function settingToggle(id, title, checked) {
        return `<label class="checking-setting"><span><strong>${title}</strong></span><input id="${id}" type="checkbox" ${checked ? "checked" : ""}></label>`;
    }

    function readCheckingControls(host) {
        return {
            spellingStrict: host.querySelector("#checkingSpelling")?.checked !== false,
            punctuationStrict: host.querySelector("#checkingPunctuation")?.checked !== false,
            partialCredit: host.querySelector("#checkingPartial")?.checked !== false,
            pointBased: host.querySelector("#checkingPoints")?.checked !== false,
            caseSensitive: Boolean(host.querySelector("#checkingCase")?.checked)
        };
    }

    ns.initSettings = initSettings;
})(window.everyLearn);
