(function(ns){
    "use strict";

    const state = ns.state;
    const walkNotebookHierarchy = (...args) => ns.walkNotebookHierarchy(...args);

    /* everyLearnNotebook — Question Filter Service */

    function matchesQuestionFilter(question, filterId) {
        switch (filterId) {
            case "bookmark":
                return question.bookmarked === true;
            case "favorite":
                return question.favorite === true;
            case "important":
                return Number(question.important) > 0;
            case "difficult":
                return Number(question.difficulty) === 3;
            default:
                return false;
        }
    }

    function filterQuestions({
        filterId,
        level,
        targetId = null
    }) {
        const results = [];

        for (const notebook of state.data.notebooks) {
            walkNotebookHierarchy(notebook, ({
                type,
                section,
                chapter,
                topic,
                question
            }) => {
                if (type !== "question") return;

                let scopeMatch = true;

                if (level === "subject") {
                    scopeMatch = notebook.subjectId === targetId;
                } else if (level === "notebook") {
                    scopeMatch = notebook.id === targetId;
                } else if (level === "section") {
                    scopeMatch = section?.id === targetId;
                } else if (level === "chapter") {
                    scopeMatch = chapter.id === targetId;
                } else if (level === "topic") {
                    scopeMatch = topic.id === targetId;
                }

                if (
                    scopeMatch &&
                    matchesQuestionFilter(question, filterId)
                ) {
                    results.push({
                        question,
                        notebook,
                        section,
                        chapter,
                        topic
                    });
                }
            });
        }

        return results;
    }

    ns.matchesQuestionFilter = matchesQuestionFilter;
    ns.filterQuestions = filterQuestions;
})(window.everyLearn);
