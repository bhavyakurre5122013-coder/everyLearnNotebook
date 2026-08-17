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
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = () => {
                state.practice.random =
                    host.querySelector(
                        "#practiceRandom"
                    ).checked;

                state.practice.showHints =
                    host.querySelector(
                        "#practiceHints"
                    ).checked;

                state.practice.autoNext =
                    host.querySelector(
                        "#practiceAutoNext"
                    ).checked;

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
