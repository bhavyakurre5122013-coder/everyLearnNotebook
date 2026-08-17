(function(ns){
    "use strict";
/* everyLearn — Practice Answer Helpers */
function collectTextAnswer(container) {
    return {
        text:
            container.querySelector(
                "[data-text-answer]"
            )?.value || ""
    };
}

    ns.collectTextAnswer = collectTextAnswer;
})(window.everyLearn);
