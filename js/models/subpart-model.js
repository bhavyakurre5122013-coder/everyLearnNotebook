(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Subpart Model
-------------------------------------------------------------
Used by complex question types such as:
    • Case based
    • Matching
    • Difference between
    • Ordering
    • Options

Individual subparts can own up to two hints.
=============================================================
*/



function createSubpart({
    type = "generic",
    text = "",
    answer = ""
} = {}) {
    return {
        id: createId("subpart"),
        type,
        text,
        answer,
        hints: []
    };
}

    ns.createSubpart = createSubpart;
})(window.everyLearn);
