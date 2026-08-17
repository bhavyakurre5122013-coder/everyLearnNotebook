(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const createQuestion = (...args) => ns.createQuestion(...args);
    const getTopic = (...args) => ns.getTopic(...args);
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

function duplicateQuestion(notebookId, topicId, questionId) {
    const original = getQuestion(notebookId, topicId, questionId);
    if (!original) throw new Error("Question not found.");

    const copy = structuredClone(original);
    copy.id = `${original.id}_copy_${Date.now().toString(36)}`;
    copy.attempts = 0;
    copy.correct = 0;
    copy.lastPractice = null;

    getTopic(notebookId, topicId).questions.push(copy);
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
    ns.duplicateQuestion = duplicateQuestion;
    ns.setQuestionBookmark = setQuestionBookmark;
    ns.setQuestionFavorite = setQuestionFavorite;
    ns.setQuestionImportance = setQuestionImportance;
    ns.saveQuestionHint = saveQuestionHint;
    ns.removeQuestionHint = removeQuestionHint;
})(window.everyLearn);
