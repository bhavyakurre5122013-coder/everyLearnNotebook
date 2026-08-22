(function(ns){
    "use strict";
    const state = ns.state;
    const openDialog = (...args) => ns.openDialog(...args);
/* everyLearn — Practice Settings */



function initPracticeSettings() {
    document.addEventListener(
        "everylearn:practice-settings",
        openPracticeSettings
    );
}

function openPracticeSettings() {
    openDialog({
        title: "Practice settings",
        bodyHTML: `
            <div class="stack">
                <div class="setting-row">
                    <div>
                        <strong>Random questions</strong>
                        <small>
                            Move through a random question selection.
                        </small>
                    </div>
                    <input
                        id="practiceRandom"
                        type="checkbox"
                        ${
                            state.practice.random
                                ? "checked"
                                : ""
                        }
                    >
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Show hints</strong>
                        <small>
                            Show the Hint control during practice.
                        </small>
                    </div>
                    <input
                        id="practiceHints"
                        type="checkbox"
                        ${
                            state.practice.showHints
                                ? "checked"
                                : ""
                        }
                    >
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Answer display</strong>
                        <small>
                            Choose when answers and results are revealed.
                        </small>
                    </div>
                    <select id="practiceAnswerDisplay" class="field-select">
                        <option value="after-each">Show answer after solving each question</option>
                        <option value="after-all">Show answers after solving the entire exercise</option>
                    </select>
                </div>

                <div class="setting-row">
                    <div>
                        <strong>Auto-next</strong>
                        <small>
                            Advance after a correct answer.
                        </small>
                    </div>
                    <input
                        id="practiceAutoNext"
                        type="checkbox"
                        ${
                            state.practice.autoNext
                                ? "checked"
                                : ""
                        }
                    >
                </div>
            </div>
        `,
        footerHTML: `
            <button
                class="secondary-button"
                data-dialog-cancel
            >
                Close
            </button>

            <button
                class="save-button"
                data-dialog-save
            >
                <img src="./assets/icons/ui/bookmark.svg" alt=""> Save
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector("#practiceAnswerDisplay").value =
                state.data.settings.practice?.answerDisplayMode || "after-each";

            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = () => {
                const nextRandom = host.querySelector("#practiceRandom").checked;
                if (nextRandom !== state.practice.random) {
                    state.practice.orderIds = [];
                    state.practice.index = 0;
                    state.practice.answers = {};
                    state.practice.results = {};
                    state.practice.exerciseComplete = false;
                }
                state.practice.random = nextRandom;

                state.practice.showHints =
                    host.querySelector(
                        "#practiceHints"
                    ).checked;

                state.practice.autoNext =
                    host.querySelector(
                        "#practiceAutoNext"
                    ).checked;

                state.data.settings.practice.answerDisplayMode =
                    host.querySelector("#practiceAnswerDisplay").value;
                state.practice.answerDisplayMode =
                    state.data.settings.practice.answerDisplayMode;

                ns.saveStoredData(state.data);

                close();

                document.dispatchEvent(
                    new Event(
                        "everylearn:render"
                    )
                );
            };
        }
    });
}

    ns.initPracticeSettings = initPracticeSettings;
})(window.everyLearn);
