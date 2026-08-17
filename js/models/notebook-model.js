(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Notebook Model
-------------------------------------------------------------
A notebook is always just a notebook.
subjectId is optional.
=============================================================
*/



function createNotebook({
    name,
    subjectId = null,
    color = "#2563EB",
    light = "#E8F1FF",
    description = ""
}) {
    return {
        id: createId("notebook"),
        name: String(name).trim(),
        subjectId: subjectId || null,
        color,
        light,
        description: String(description).trim(),
        updatedAt: Date.now(),
        sections: [],

        /*
            Chapters can optionally live directly under a notebook
            without belonging to a section.
        */
        rootChapters: []
    };
}

    ns.createNotebook = createNotebook;
})(window.everyLearn);
