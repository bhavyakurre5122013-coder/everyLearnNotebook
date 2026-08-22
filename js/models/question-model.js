(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
    const QUESTION_TYPES = ns.QUESTION_TYPES;

    function emptyDifference() {
        return {
            termCount: 2,
            terms: ["", ""],
            rows: []
        };
    }

    function createTypeDefaults(type) {
        const defaults = {
            answer: "",
            options: [],
            casePassage: "",
            caseQuestions: [],
            pairs: [],
            matchingConnections: {},
            orderItems: [],
            difference: emptyDifference(),
            answerData: {}
        };

        switch (type) {
            case "fill":
                defaults.answerData = { blanks: [] };
                break;
            case "assertionReasoning":
                defaults.answerData = {
                    assertion: "",
                    reason: "",
                    result: "a"
                };
                break;
            case "caseBased":
                defaults.casePassage = "";
                defaults.caseQuestions = [];
                break;
            case "difference":
                defaults.difference = emptyDifference();
                break;
            default:
                break;
        }

        return defaults;
    }

    function createQuestion(type = "text") {
        const safeType = QUESTION_TYPES.some(item => item.id === type)
            ? type
            : "text";

        const typeDefaults = createTypeDefaults(safeType);

        return {
            id: createId("question"),
            type: safeType,
            text: "",
            ...typeDefaults,
            difficulty: 1,
            important: 0,
            favorite: false,
            bookmarked: false,
            hints: [],
            attempts: 0,
            correct: 0,
            lastPractice: null,
            notes: "",
            marks: 1,
            checking: {
                spellingStrict: true,
                punctuationStrict: true,
                partialCredit: true,
                pointBased: true,
                caseSensitive: false
            }
        };
    }

    function resetTypeSpecificData(question, type) {
        if (!question || typeof question !== "object") {
            throw new Error("Invalid question.");
        }

        const safeType = QUESTION_TYPES.some(item => item.id === type)
            ? type
            : "text";
        const id = question.id;
        const defaults = createTypeDefaults(safeType);

        question.type = safeType;
        question.answer = defaults.answer;
        question.options = defaults.options;
        question.casePassage = defaults.casePassage;
        question.caseQuestions = defaults.caseQuestions;
        question.pairs = defaults.pairs;
        question.matchingConnections = defaults.matchingConnections;
        question.orderItems = defaults.orderItems;
        question.difference = defaults.difference;
        question.answerData = defaults.answerData;
        question.id = id;

        return question;
    }

    function prepareQuestionForType(question, type) {
        if (!question || typeof question !== "object") {
            throw new Error("Invalid question.");
        }

        if (question.type === type) {
            return question;
        }

        return resetTypeSpecificData(question, type);
    }

    function normalizeQuestion(question) {
        if (!question || typeof question !== "object") {
            throw new Error("Invalid question.");
        }

        if (!QUESTION_TYPES.some(item => item.id === question.type)) {
            question.type = "text";
        }

        question.text = String(question.text ?? "");
        question.hints = Array.isArray(question.hints) ? question.hints.slice(0, 4).map(String) : [];
        question.difficulty = Math.max(1, Math.min(3, Number(question.difficulty) || 1));
        question.important = Math.max(0, Math.min(3, Number(question.important) || 0));
        question.favorite = Boolean(question.favorite);
        question.bookmarked = Boolean(question.bookmarked);
        question.notes = String(question.notes ?? "");
        question.marks = Math.max(0, Number(question.marks) || 1);

        question.options = Array.isArray(question.options) ? question.options : [];
        question.pairs = Array.isArray(question.pairs) ? question.pairs : [];
        question.orderItems = Array.isArray(question.orderItems) ? question.orderItems : [];
        question.caseQuestions = Array.isArray(question.caseQuestions) ? question.caseQuestions : [];
        question.matchingConnections = question.matchingConnections && typeof question.matchingConnections === "object"
            ? question.matchingConnections
            : {};
        question.answerData = question.answerData && typeof question.answerData === "object"
            ? question.answerData
            : {};
        question.difference = question.difference && typeof question.difference === "object"
            ? question.difference
            : emptyDifference();

        for (const option of question.options) {
            if (!option.id) option.id = createId("option");
            option.text = String(option.text ?? "");
            option.correct = Boolean(option.correct);
            option.hints = Array.isArray(option.hints) ? option.hints : [];
        }

        for (const pair of question.pairs) {
            if (!pair.id) pair.id = createId("match");
            pair.left = String(pair.left ?? "");
            pair.right = String(pair.right ?? "");
            pair.hints = Array.isArray(pair.hints) ? pair.hints : [];
        }

        for (const item of question.orderItems) {
            if (!item.id) item.id = createId("order");
            item.text = String(item.text ?? "");
            item.hints = Array.isArray(item.hints) ? item.hints : [];
        }

        if (!Number.isInteger(Number(question.difference.termCount)) || Number(question.difference.termCount) < 2) {
            question.difference.termCount = 2;
        }
        question.difference.termCount = Number(question.difference.termCount);
        question.difference.terms = Array.isArray(question.difference.terms)
            ? question.difference.terms.map(value => String(value ?? ""))
            : [];
        while (question.difference.terms.length < question.difference.termCount) {
            question.difference.terms.push("");
        }
        question.difference.terms = question.difference.terms.slice(0, question.difference.termCount);
        question.difference.rows = Array.isArray(question.difference.rows) ? question.difference.rows : [];
        for (const row of question.difference.rows) {
            if (!row.id) row.id = createId("difference");
            row.aspect = String(row.aspect ?? "");
            row.values = Array.isArray(row.values) ? row.values.map(value => String(value ?? "")) : [];
            while (row.values.length < question.difference.termCount) row.values.push("");
            row.values = row.values.slice(0, question.difference.termCount);
            row.hints = Array.isArray(row.hints) ? row.hints : [];
        }

        if (question.type === "fill") {
            question.answerData.blanks = Array.isArray(question.answerData.blanks)
                ? question.answerData.blanks.map(value => String(value).trim()).filter(Boolean)
                : [];
        }

        if (question.type === "assertionReasoning") {
            question.answerData.assertion = String(question.answerData.assertion ?? "");
            question.answerData.reason = String(question.answerData.reason ?? "");
            question.answerData.result = ["a", "b", "c", "d"].includes(question.answerData.result)
                ? question.answerData.result
                : "a";
        }

        if (question.type === "caseBased") {
            question.casePassage = String(question.casePassage ?? "");
            question.caseQuestions = question.caseQuestions.filter(sub => sub && typeof sub === "object");
            for (const sub of question.caseQuestions) {
                if (!sub.id) sub.id = createId("caseq");
                if (!QUESTION_TYPES.some(item => item.id === sub.type) || sub.type === "caseBased") sub.type = "text";
                normalizeQuestion(sub);
            }
        }

        if (question.type === "text" || question.type === "trueFalse") {
            question.answer = String(question.answer ?? "");
        }

        return question;
    }

    function validateQuestion(question) {
        const errors = [];
        if (!question || typeof question !== "object") return ["Question must be an object."];
        if (typeof question.id !== "string" || !question.id.trim()) errors.push("Question ID is required.");
        if (!QUESTION_TYPES.some(item => item.id === question.type)) errors.push("Question type is invalid.");
        if (!Array.isArray(question.hints)) errors.push("Hints must be an array.");
        if (!Array.isArray(question.options)) errors.push("Options must be an array.");
        if (!Array.isArray(question.pairs)) errors.push("Matching pairs must be an array.");
        if (!Array.isArray(question.orderItems)) errors.push("Ordering items must be an array.");
        if (!Array.isArray(question.caseQuestions)) errors.push("Case subquestions must be an array.");
        if (!question.difference || typeof question.difference !== "object") errors.push("Difference data is invalid.");

        const ids = new Set();
        for (const item of [...question.options, ...question.pairs, ...question.orderItems, ...(question.difference?.rows || [])]) {
            if (!item || typeof item.id !== "string" || !item.id.trim()) errors.push("A nested question item is missing its ID.");
            else if (ids.has(item.id)) errors.push(`Duplicate nested ID: ${item.id}`);
            else ids.add(item.id);
        }
        for (const sub of question.caseQuestions) {
            const subErrors = validateQuestion(sub);
            errors.push(...subErrors.map(error => `Case subquestion: ${error}`));
        }
        return errors;
    }

    ns.createQuestion = createQuestion;
    ns.prepareQuestionForType = prepareQuestionForType;
    ns.resetQuestionTypeData = resetTypeSpecificData;
    ns.normalizeQuestion = normalizeQuestion;
    ns.validateQuestion = validateQuestion;
})(window.everyLearn);
