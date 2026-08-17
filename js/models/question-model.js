(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
    const QUESTION_TYPES = ns.QUESTION_TYPES;
/* everyLearn — Question Model */



function createQuestion(type = "text") {
    const safeType = QUESTION_TYPES.some(item => item.id === type)
        ? type
        : "text";

    return {
        id: createId("question"),
        type: safeType,
        text: "",
        answer: "",
        difficulty: 1,
        important: 0,
        favorite: false,
        bookmarked: false,
        hints: [],
        options: [],
        casePassage: "",
        caseQuestions: [],
        pairs: [],
        matchingConnections: {},
        orderItems: [],
        difference: { termCount: 2, terms: ["", ""], rows: [] },
        answerData: {},
        attempts: 0,
        correct: 0,
        lastPractice: null
    };
}

    ns.createQuestion = createQuestion;
})(window.everyLearn);
