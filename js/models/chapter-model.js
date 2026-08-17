(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Chapter Model
=============================================================
*/



function createChapter(name) {
    return {
        id: createId("chapter"),
        name: String(name).trim(),
        topics: []
    };
}

    ns.createChapter = createChapter;
})(window.everyLearn);
