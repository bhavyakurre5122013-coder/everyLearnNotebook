(function(ns){
    "use strict";
/* everyLearn — Keyboard Shortcuts */
function initKeyboardShortcuts({
    onSearch,
    onSave,
    onHome
}) {
    document.addEventListener(
        "keydown",
        event => {
            const modifier =
                event.ctrlKey ||
                event.metaKey;

            if (
                modifier &&
                event.key.toLowerCase() ===
                "k"
            ) {
                event.preventDefault();
                onSearch?.();
                return;
            }

            if (
                modifier &&
                event.key.toLowerCase() ===
                "s"
            ) {
                event.preventDefault();
                onSave?.();
                return;
            }

            if (event.key === "Escape") {
                onHome?.();
            }
        }
    );
}

    ns.initKeyboardShortcuts = initKeyboardShortcuts;
})(window.everyLearn);
