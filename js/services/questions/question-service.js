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
    topic.questions.push(question);
    saveStoredData(state.data);
    return question;
}

function updateQuestion(notebookId, topicId, questionId, changes) {
    const question = getQuestion(notebookId, topicId, questionId);
    if (!question) throw new Error("Question not found.");

    Object.assign(question, changes);
    question.hints = Array.isArray(question.hints)
        ? question.hints.slice(0, 4)
        : [];
    question.important = Math.max(
        0, Math.min(3, Number(question.important) || 0)
    );
    question.difficulty = Math.max(
        1, Math.min(3, Number(question.difficulty) || 1)
    );

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

function cloneQuestion(question) {
    const source = structuredClone(question);
    const idMap = new Map();

    function prefixForId(id) {
        const prefix = String(id).split("_")[0];
        return prefix || "id";
    }

    function cloneValue(value) {
        if (Array.isArray(value)) return value.map(cloneValue);
        if (!value || typeof value !== "object") return value;

        const result = {};
        for (const [key, item] of Object.entries(value)) {
            if (key === "id" && typeof item === "string") {
                const newId = createId(prefixForId(item));
                idMap.set(item, newId);
                result[key] = newId;
            } else {
                result[key] = cloneValue(item);
            }
        }
        return result;
    }

    const result = cloneValue(source);

    // Matching connections use pair IDs as object keys and values rather than
    // storing those references under an `id` property. Remap this known
    // reference structure at every nesting level; arbitrary strings elsewhere
    // remain untouched.
    function remapKnownReferences(sourceValue, resultValue) {
        if (!sourceValue || typeof sourceValue !== "object" || !resultValue || typeof resultValue !== "object") {
            return;
        }

        if (sourceValue.matchingConnections && typeof sourceValue.matchingConnections === "object") {
            resultValue.matchingConnections = Object.fromEntries(
                Object.entries(sourceValue.matchingConnections)
                    .map(([left, right]) => [
                        idMap.get(left) || left,
                        idMap.get(right) || right
                    ])
            );
        }

        if (Array.isArray(sourceValue)) {
            sourceValue.forEach((item, index) => remapKnownReferences(item, resultValue[index]));
            return;
        }

        for (const key of Object.keys(sourceValue)) {
            if (key !== "matchingConnections") {
                remapKnownReferences(sourceValue[key], resultValue[key]);
            }
        }
    }

    remapKnownReferences(source, result);

    result.attempts = 0;
    result.correct = 0;
    result.lastPractice = null;
    return result;
}

function duplicateQuestion(notebookId, topicId, questionId) {
    const original = getQuestion(notebookId, topicId, questionId);
    if (!original) throw new Error("Question not found.");

    const copy = cloneQuestion(original);
    getTopic(notebookId, topicId).questions.push(copy);
    saveStoredData(state.data);
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
