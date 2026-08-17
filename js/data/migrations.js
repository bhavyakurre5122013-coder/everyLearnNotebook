(function(ns){
    "use strict";
    const APP = ns.APP;
    const createDefaultData = (...args) => ns.createDefaultData(...args);
/*
=============================================================
everyLearn — Data Migrations
-------------------------------------------------------------
Purpose:
    Gives future versions a safe place to convert older local
    data structures without mixing migration logic with UI.
=============================================================
*/




function migrateData(input) {
    if (!input || typeof input !== "object") {
        return createDefaultData();
    }

    const data = structuredClone(input);

    /*
        Initial modular schema.
        Older versions can be transformed here later.
    */

    data.version = APP.DATA_VERSION;

    if (!Array.isArray(data.subjects)) {
        data.subjects = [];
    }

    if (!Array.isArray(data.notebooks)) {
        data.notebooks = [];
    }

    if (!Array.isArray(data.bookmarks)) {
        data.bookmarks = [];
    }

    if (!data.settings || typeof data.settings !== "object") {
        data.settings = {};
    }

    data.settings.theme =
        data.settings.theme === "dark"
            ? "dark"
            : "light";

    /*
        Remove the old concept of notebook type if an older
        version had it. The existence of subjectId now defines
        whether a notebook is associated with a subject.
    */
    for (const notebook of data.notebooks) {
        if (!("subjectId" in notebook)) {
            notebook.subjectId = null;
        }

        delete notebook.type;

        if (!Array.isArray(notebook.sections)) {
            notebook.sections = [];
        }

        if (!Array.isArray(notebook.rootChapters)) {
            notebook.rootChapters = [];
        }

        for (const section of notebook.sections) {
            if (!Array.isArray(section.chapters)) {
                section.chapters = [];
            }

            for (const chapter of section.chapters) {
                if (!Array.isArray(chapter.topics)) {
                    chapter.topics = [];
                }
            }
        }

        for (const chapter of notebook.rootChapters) {
            if (!Array.isArray(chapter.topics)) {
                chapter.topics = [];
            }
        }
    }

    return data;
}

    ns.migrateData = migrateData;
})(window.everyLearn);
