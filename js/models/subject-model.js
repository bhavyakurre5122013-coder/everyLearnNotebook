(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Subject Model
=============================================================
*/



function createSubject({
    name,
    icon = "•",
    color = "#2563EB",
    light = "#E8F1FF"
}) {
    return {
        id: createId("subject"),
        name: String(name).trim(),
        icon,
        color,
        light
    };
}

    ns.createSubject = createSubject;
})(window.everyLearn);
