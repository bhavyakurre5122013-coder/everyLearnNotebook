(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const openDialog = (...args) => ns.openDialog(...args);
/* everyLearn — Settings */




function initSettings() {
    document.addEventListener(
        "everylearn:show-settings",
        openSettings
    );
}

function openSettings() {
    openDialog({
        title: "Settings",
        bodyHTML: `
            <div class="stack">
                <div class="setting-row">
                    <div>
                        <strong>Theme</strong>
                        <small>
                            Choose light or dark appearance.
                        </small>
                    </div>

                    <select
                        class="field-select"
                        id="applicationTheme"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
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
            const theme =
                host.querySelector(
                    "#applicationTheme"
                );

            theme.value =
                state.data.settings.theme;

            theme.onchange = () => {
                state.data.settings.theme =
                    theme.value;

                document.documentElement.dataset.theme =
                    theme.value;

                saveStoredData(state.data);
            };

            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = close;
        }
    });
}

    ns.initSettings = initSettings;
})(window.everyLearn);
