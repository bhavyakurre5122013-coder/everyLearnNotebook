(function(ns){
    "use strict";

    const state = ns.state;

    /* everyLearnNotebook — Search Service */

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function stripHTML(value) {
        const template = document.createElement("template");
        template.innerHTML = String(value || "");
        return template.content.textContent || "";
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
            const notebookText =
                `${notebook.name} ${notebook.description}`;

            if (normalize(notebookText).includes(q)) {
                results.push({
                    type: "notebook",
                    title: notebook.name,
                    notebookId: notebook.id,
                    topicId: null,
                    path: notebook.name
                });
            }

            const visitChapter = (chapter, section = null) => {
                for (const topic of chapter.topics || []) {
                    const questionText =
                        (topic.questions || [])
                            .map(question => question.text)
                            .join(" ");

                    const text = normalize(
                        [
                            topic.name,
                            stripHTML(topic.notes),
                            questionText
                        ].join(" ")
                    );

                    if (text.includes(q)) {
                        results.push({
                            type: "topic",
                            title: topic.name,
                            notebookId: notebook.id,
                            topicId: topic.id,
                            path: [
                                notebook.name,
                                section?.name,
                                chapter.name,
                                topic.name
                            ]
                                .filter(Boolean)
                                .join(" / ")
                        });
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

        return results.slice(0, 100);
    }

    ns.searchEverything = searchEverything;
})(window.everyLearn);
