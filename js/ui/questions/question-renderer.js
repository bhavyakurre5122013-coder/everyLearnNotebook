(function(ns){
    "use strict";
    const renderTextEditor = (...args) => ns.renderTextEditor(...args);
    const renderFillEditor = (...args) => ns.renderFillEditor(...args);
    const renderTrueFalseEditor = (...args) => ns.renderTrueFalseEditor(...args);
    const renderAssertionEditor = (...args) => ns.renderAssertionEditor(...args);
    const renderCaseEditor = (...args) => ns.renderCaseEditor(...args);
    const renderMatchingEditor = (...args) => ns.renderMatchingEditor(...args);
    const renderSingleCorrectEditor = (...args) => ns.renderSingleCorrectEditor(...args);
    const renderMultipleCorrectEditor = (...args) => ns.renderMultipleCorrectEditor(...args);
    const renderOrderingEditor = (...args) => ns.renderOrderingEditor(...args);
    const renderDifferenceEditor = (...args) => ns.renderDifferenceEditor(...args);
/* everyLearn — Question Type Router */











function renderQuestionType(
    mount,
    question
) {
    const renderer = {
        text: renderTextEditor,
        fill: renderFillEditor,
        trueFalse: renderTrueFalseEditor,
        assertionReasoning: renderAssertionEditor,
        caseBased: renderCaseEditor,
        matching: renderMatchingEditor,
        singleCorrect: renderSingleCorrectEditor,
        multipleCorrect: renderMultipleCorrectEditor,
        ordering: renderOrderingEditor,
        difference: renderDifferenceEditor
    }[question.type];

    (renderer || renderTextEditor)(
        mount,
        question
    );
}

    ns.renderQuestionTypeEditor = renderQuestionType;
})(window.everyLearn);
