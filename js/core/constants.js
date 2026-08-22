(function(ns){
    "use strict";
/*
=============================================================
everyLearn — Core Constants
-------------------------------------------------------------
Purpose:
    Centralized application rules shared across features.
=============================================================
*/

const APP = {
    NAME: "everyLearnNotebook",
    STORAGE_KEY: "everyLearnNotebookBeta",
    DATA_VERSION: 1,
    MAX_QUESTION_HINTS: 4,
    MAX_SUBPART_HINTS: 2,
    MAX_IMPORTANCE: 3
};

const QUESTION_TYPES = [
    { id: "text", label: "Text" },
    { id: "fill", label: "Fill in the blanks" },
    { id: "trueFalse", label: "True / False" },
    { id: "assertionReasoning", label: "Assertion / Reasoning" },
    { id: "caseBased", label: "Case based questions" },
    { id: "matching", label: "Matching" },
    { id: "singleCorrect", label: "Single correct questions" },
    { id: "multipleCorrect", label: "Multiple correct questions" },
    { id: "ordering", label: "Ordering" },
    { id: "difference", label: "Difference between" }
];

const HIERARCHY_LEVELS = [
    "subject",
    "notebook",
    "section",
    "chapter",
    "topic"
];

const BOOKMARK_LEVELS = [
    "notebook",
    "section",
    "chapter",
    "topic"
];

const QUESTION_FILTERS = [
    { id: "bookmark", label: "Bookmarked" },
    { id: "favorite", label: "Favorites" },
    { id: "important", label: "Important" },
    { id: "difficult", label: "Difficult" }
];

const DIFFICULTY = {
    EASY: 1,
    MEDIUM: 2,
    DIFFICULT: 3
};

const ACTIONS = {
    CREATE: "create",
    EDIT: "edit",
    DELETE: "delete",
    SAVE: "save"
};

const ROUTES = {
    HOME: "home",
    SUBJECTS: "subjects",
    NOTEBOOKS: "notebooks",
    SUBJECT: "subject",
    BOOKMARKS: "bookmarks",
    WORKSPACE: "workspace"
};

    ns.APP = APP;
    ns.QUESTION_TYPES = QUESTION_TYPES;
    ns.HIERARCHY_LEVELS = HIERARCHY_LEVELS;
    ns.BOOKMARK_LEVELS = BOOKMARK_LEVELS;
    ns.QUESTION_FILTERS = QUESTION_FILTERS;
    ns.DIFFICULTY = DIFFICULTY;
    ns.ACTIONS = ACTIONS;
    ns.ROUTES = ROUTES;
})(window.everyLearn);
