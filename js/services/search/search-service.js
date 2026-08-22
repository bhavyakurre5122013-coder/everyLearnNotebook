(function(ns){
    "use strict";

    const state = ns.state;
    const walkNotebookHierarchy = (...args) => ns.walkNotebookHierarchy(...args);

    /* everyLearnNotebook — Search Service */

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function stripHTML(value) {
        const template = document.createElement("template");
        template.innerHTML = String(value || "");
        return template.content.textContent || "";
    }

    function makePath(notebook, section, chapter, topic) {
        return [
            notebook?.name,
            section?.name,
            chapter?.name,
            topic?.name
        ]
            .filter(Boolean)
            .join(" / ");
    }

    function searchEverything(query) {
        const q = normalize(query);
        if (!q) return [];

        const results = [];

        for (const subject of state.data.subjects) {
            if (normalize(subject.name).includes(q)) {
                results.push({
                    type: "subject",
                    title: subject.name,
                    subjectId: subject.id,
                    notebookId: null,
                    topicId: null,
                    path: subject.name
                });
            }
        }

        for (const notebook of state.data.notebooks) {
            const notebookText = `${notebook.name} ${notebook.description}`;

            if (normalize(notebookText).includes(q)) {
                results.push({
                    type: "notebook",
                    title: notebook.name,
                    notebookId: notebook.id,
                    topicId: null,
                    path: notebook.name
                });
            }

            walkNotebookHierarchy(notebook, ({
                type,
                section,
                chapter,
                topic,
                question
            }) => {
                if (type === "section") {
                    if (normalize(section.name).includes(q)) {
                        results.push({
                            type: "section",
                            title: section.name,
                            notebookId: notebook.id,
                            sectionId: section.id,
                            topicId: null,
                            path: makePath(notebook, section, null, null)
                        });
                    }
                    return;
                }

                if (type === "chapter") {
                    if (normalize(chapter.name).includes(q)) {
                        results.push({
                            type: "chapter",
                            title: chapter.name,
                            notebookId: notebook.id,
                            sectionId: section?.id || null,
                            chapterId: chapter.id,
                            topicId: null,
                            path: makePath(notebook, section, chapter, null)
                        });
                    }
                    return;
                }

                if (type === "topic") {
                    const text = normalize(
                        [
                            topic.name,
                            stripHTML(topic.notes)
                        ].join(" ")
                    );

                    if (text.includes(q)) {
                        results.push({
                            type: "topic",
                            title: topic.name,
                            notebookId: notebook.id,
                            sectionId: section?.id || null,
                            chapterId: chapter.id,
                            topicId: topic.id,
                            path: makePath(notebook, section, chapter, topic)
                        });
                    }
                    return;
                }

                if (type === "question") {
                    const text = normalize(
                        [
                            question.text,
                            stripHTML(question.notes)
                        ].join(" ")
                    );

                    if (text.includes(q)) {
                        results.push({
                            type: "question",
                            title: question.text || "Untitled question",
                            notebookId: notebook.id,
                            sectionId: section?.id || null,
                            chapterId: chapter.id,
                            topicId: topic.id,
                            questionId: question.id,
                            path: makePath(notebook, section, chapter, topic)
                        });
                    }
                }
            });
        }

        return results.slice(0, 100);
    }

    ns.searchEverything = searchEverything;
})(window.everyLearn);
