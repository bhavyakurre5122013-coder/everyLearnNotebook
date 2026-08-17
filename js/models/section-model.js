(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Section Model
=============================================================
*/



function createSection(name) {
    return {
        id: createId("section"),
        name: String(name).trim(),
        chapters: []
    };
}

    ns.createSection = createSection;
})(window.everyLearn);
