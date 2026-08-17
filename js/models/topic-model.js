(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Topic Model
=============================================================
*/



function createTopic(name) {
    return {
        id: createId("topic"),
        name: String(name).trim(),
        notes: "",
        questions: []
    };
}

    ns.createTopic = createTopic;
})(window.everyLearn);
