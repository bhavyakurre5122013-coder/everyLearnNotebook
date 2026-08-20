(function(ns){
    "use strict";
    const APP = ns.APP;
/*
=============================================================
everyLearn — Default Data
-------------------------------------------------------------
Purpose:
    Provides the empty application state. No fake notebooks,
    subjects, names, topics or sample user content are seeded.
=============================================================
*/



function createDefaultData() {
    return {
        version: APP.DATA_VERSION,

        settings: {
            theme: "light",
            practice: {
                answerDisplayMode: "after-each"
            },
            checkingSystem: {
                spellingStrict: true,
                punctuationStrict: true,
                partialCredit: true,
                pointBased: true,
                caseSensitive: false
            }
        },

        subjects: [],

        /*
            There is only ONE notebook collection.

            subjectId:
                null  → unlinked notebook
                ID    → notebook associated with that subject
        */
        notebooks: [],

        /*
            Location bookmarks may point to notebook, section,
            chapter or topic.
        */
        bookmarks: []
    };
}

    ns.createDefaultData = createDefaultData;
})(window.everyLearn);
