(function(ns){
    "use strict";
/* everyLearn — Autosave */
let timer = null;

function scheduleAutosave(
    saveFunction,
    delay = 600
) {
    clearTimeout(timer);

    timer = setTimeout(
        () => {
            saveFunction();
            timer = null;
        },
        delay
    );
}

function cancelAutosave() {
    clearTimeout(timer);
    timer = null;
}

    ns.scheduleAutosave = scheduleAutosave;
    ns.cancelAutosave = cancelAutosave;
})(window.everyLearn);
