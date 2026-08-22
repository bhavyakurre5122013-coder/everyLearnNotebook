(function(ns){
    "use strict";

    let timer = null;
    let sequence = 0;

    function scheduleAutosave(saveFunction, delay = 600) {
        clearTimeout(timer);
        const currentSequence = ++sequence;

        timer = setTimeout(() => {
            timer = null;
            if (currentSequence !== sequence) return;
            saveFunction();
        }, delay);
    }

    function cancelAutosave() {
        clearTimeout(timer);
        timer = null;
        sequence += 1;
    }

    ns.scheduleAutosave = scheduleAutosave;
    ns.cancelAutosave = cancelAutosave;
})(window.everyLearn);
