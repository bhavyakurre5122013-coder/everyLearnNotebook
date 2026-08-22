(function(ns){
    "use strict";
/* everyLearn — Practice Renderer Helpers */
function difficultyLabel(
    difficulty
) {
    return {
        1: "Easy",
        2: "Medium",
        3: "Difficult"
    }[Number(difficulty)] || "Easy";
}

    ns.difficultyLabel = difficultyLabel;
})(window.everyLearn);
