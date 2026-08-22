(function(ns){
    "use strict";
    const renderChoiceEditor = (...args) => ns.renderChoiceEditor(...args);
/* everyLearn — Multiple Correct */


function renderMultipleCorrectEditor(
    mount,
    question
) {
    renderChoiceEditor(
        mount,
        question,
        true
    );
}

    ns.renderMultipleCorrectEditor = renderMultipleCorrectEditor;
})(window.everyLearn);
