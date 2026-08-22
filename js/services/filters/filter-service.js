(function(ns){
    "use strict";

    const state = ns.state;

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
            const visitChapter = (chapter, section = null) => {
                for (const topic of chapter.topics || []) {
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

                    for (const question of topic.questions || []) {
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
                    }
                }
            };

            for (const chapter of notebook.rootChapters || []) {
                visitChapter(chapter, null);
            }

            for (const section of notebook.sections || []) {
                for (const chapter of section.chapters || []) {
                    visitChapter(chapter, section);
                }
            }
        }

        return results;
    }

    ns.matchesQuestionFilter = matchesQuestionFilter;
    ns.filterQuestions = filterQuestions;
})(window.everyLearn);
