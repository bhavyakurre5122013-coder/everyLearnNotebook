(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/*
=============================================================
everyLearn — Bookmark Model
-------------------------------------------------------------
A location bookmark can stop at notebook, section, chapter
or topic level.
=============================================================
*/



function createBookmark({
    name,
    notebookId,
    sectionId = null,
    chapterId = null,
    topicId = null
}) {
    return {
        id: createId("bookmark"),
        name: String(name).trim(),
        notebookId,
        sectionId,
        chapterId,
        topicId
    };
}

    ns.createBookmark = createBookmark;
})(window.everyLearn);
