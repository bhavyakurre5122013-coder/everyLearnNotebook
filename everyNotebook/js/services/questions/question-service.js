(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const createQuestion = (...args) => ns.createQuestion(...args);
    const getTopic = (...args) => ns.getTopic(...args);
    const createId = (...args) => ns.createId(...args);
/* everyLearn — Question Service */





function listQuestions(notebookId, topicId) {
    return getTopic(notebookId, topicId)?.questions || [];
}

function getQuestion(notebookId, topicId, questionId) {
    return listQuestions(notebookId, topicId).find(
        question => question.id === questionId
    ) || null;
}

function addQuestion(notebookId, topicId, type = "text") {
    const topic = getTopic(notebookId, topicId);
    if (!topic) throw new Error("Topic not found.");

    const question = createQuestion(type);
    ns.normalizeQuestion(question);
    topic.questions.push(question);
    saveStoredData(state.data);
    return question;
}

function updateQuestion(notebookId, topicId, questionId, changes) {
    const question = getQuestion(notebookId, topicId, questionId);
    if (!question) throw new Error("Question not found.");
    if (!changes || typeof changes !== "object") throw new Error("Question changes are invalid.");

    const next = structuredClone(question);
    const incoming = structuredClone(changes);
    const requestedType = incoming.type;
    Object.assign(next, incoming);
    next.id = question.id;

    if (requestedType && requestedType !== question.type) {
        ns.resetQuestionTypeData(next, requestedType);
        const typeFields = {
            text: ["answer"],
            trueFalse: ["answer"],
            fill: ["answerData"],
            assertionReasoning: ["answerData"],
            singleCorrect: ["options"],
            multipleCorrect: ["options"],
            ordering: ["orderItems"],
            matching: ["pairs", "matchingConnections"],
            difference: ["difference"],
            caseBased: ["casePassage", "caseQuestions"]
        };
        for (const field of typeFields[requestedType] || []) {
            if (Object.prototype.hasOwnProperty.call(incoming, field)) {
                next[field] = structuredClone(incoming[field]);
            }
        }
    }

    ns.normalizeQuestion(next);
    const errors = ns.validateQuestion(next);
    if (errors.length) throw new Error(errors[0]);

    Object.keys(question).forEach(key => {
        if (!(key in next)) delete question[key];
    });
    Object.assign(question, next);

    saveStoredData(state.data);
    return question;
}

function deleteQuestion(notebookId, topicId, questionId) {
    const topic = getTopic(notebookId, topicId);
    if (!topic) throw new Error("Topic not found.");

    const index = topic.questions.findIndex(
        question => question.id === questionId
    );

    if (index < 0) throw new Error("Question not found.");

    topic.questions.splice(index, 1);
    saveStoredData(state.data);
}

function duplicateQuestion(notebookId, topicId, questionId) {
    const original = getQuestion(notebookId, topicId, questionId);
    if (!original) throw new Error("Question not found.");

    const copy = cloneQuestion(original);
    getTopic(notebookId, topicId).questions.push(copy);
    saveStoredData(state.data);
    return copy;
}


function cloneQuestion(question) {
    const copy = structuredClone(question);
    const idMap = new Map();

    function regenerateIds(value) {
        if (Array.isArray(value)) {
            value.forEach(regenerateIds);
            return;
        }
        if (!value || typeof value !== "object") return;

        if (typeof value.id === "string" && value.id) {
            const oldId = value.id;
            const prefix = oldId.split("_")[0] || "id";
            const newId = createId(prefix);
            idMap.set(oldId, newId);
            value.id = newId;
        }

        Object.values(value).forEach(regenerateIds);
    }

    function remapReferences(value) {
        if (Array.isArray(value)) {
            value.forEach(remapReferences);
            return;
        }
        if (!value || typeof value !== "object") return;

        if (value.matchingConnections && typeof value.matchingConnections === "object" && !Array.isArray(value.matchingConnections)) {
            const remapped = {};
            for (const [left, right] of Object.entries(value.matchingConnections)) {
                const newLeft = idMap.get(left) || left;
                const newRight = idMap.get(String(right)) || right;
                remapped[newLeft] = newRight;
            }
            value.matchingConnections = remapped;
        }

        Object.values(value).forEach(remapReferences);
    }

    regenerateIds(copy);
    remapReferences(copy);
    copy.attempts = 0;
    copy.correct = 0;
    copy.lastPractice = null;
    ns.normalizeQuestion(copy);
    return copy;
}

function moveQuestion(sourceNotebookId, sourceTopicId, questionId, destinationNotebookId, destinationTopicId) {
    const sourceTopic = getTopic(sourceNotebookId, sourceTopicId);
    const destinationTopic = getTopic(destinationNotebookId, destinationTopicId);
    if (!sourceTopic) throw new Error("Source topic not found.");
    if (!destinationTopic) throw new Error("Destination topic not found.");
    const index = sourceTopic.questions.findIndex(question => question.id === questionId);
    if (index < 0) throw new Error("Question not found.");
    const [question] = sourceTopic.questions.splice(index, 1);
    destinationTopic.questions.push(question);
    saveStoredData(state.data);
    return question;
}

function duplicateQuestionToTopic(sourceNotebookId, sourceTopicId, questionId, destinationNotebookId, destinationTopicId, name) {
    const original = getQuestion(sourceNotebookId, sourceTopicId, questionId);
    const destinationTopic = getTopic(destinationNotebookId, destinationTopicId);
    if (!original) throw new Error("Question not found.");
    if (!destinationTopic) throw new Error("Destination topic not found.");
    const copy = cloneQuestion(original);
    if (name) copy.text = String(name).trim();
    destinationTopic.questions.push(copy);
    saveStoredData(state.data);
    return copy;
}

function setQuestionBookmark(notebookId, topicId, id, value) {
    return updateQuestion(
        notebookId, topicId, id, { bookmarked: Boolean(value) }
    );
}

function setQuestionFavorite(notebookId, topicId, id, value) {
    return updateQuestion(
        notebookId, topicId, id, { favorite: Boolean(value) }
    );
}

function setQuestionImportance(notebookId, topicId, id, value) {
    return updateQuestion(
        notebookId,
        topicId,
        id,
        { important: Math.max(0, Math.min(3, Number(value) || 0)) }
    );
}

function saveQuestionHint(
    notebookId,
    topicId,
    questionId,
    index,
    value
) {
    const question = getQuestion(notebookId, topicId, questionId);
    if (!question) throw new Error("Question not found.");

    if (index < 0 || index >= 4) {
        throw new Error("Invalid hint index.");
    }

    question.hints[index] = String(value || "");
    question.hints = question.hints.slice(0, 4);
    saveStoredData(state.data);
    return question;
}

function removeQuestionHint(
    notebookId,
    topicId,
    questionId,
    index
) {
    const question = getQuestion(notebookId, topicId, questionId);
    if (!question) throw new Error("Question not found.");
    question.hints.splice(index, 1);
    saveStoredData(state.data);
}

    ns.listQuestions = listQuestions;
    ns.getQuestion = getQuestion;
    ns.addQuestion = addQuestion;
    ns.updateQuestion = updateQuestion;
    ns.deleteQuestion = deleteQuestion;
    ns.moveQuestion = moveQuestion;
    ns.duplicateQuestionToTopic = duplicateQuestionToTopic;
    ns.duplicateQuestion = duplicateQuestion;
    ns.setQuestionBookmark = setQuestionBookmark;
    ns.setQuestionFavorite = setQuestionFavorite;
    ns.setQuestionImportance = setQuestionImportance;
    ns.saveQuestionHint = saveQuestionHint;
    ns.removeQuestionHint = removeQuestionHint;
})(window.everyLearn);
