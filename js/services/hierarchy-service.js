(function(ns){
    "use strict";
    const createSection = (...args) => ns.createSection(...args);
    const createChapter = (...args) => ns.createChapter(...args);
    const createTopic = (...args) => ns.createTopic(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const touchNotebook = (...args) => ns.touchNotebook(...args);
/* everyLearn — Hierarchy Service */





function requireNotebook(id) {
    const notebook = getNotebook(id);
    if (!notebook) throw new Error("Notebook not found.");
    return notebook;
}

function getSection(notebookId, sectionId) {
    const notebook = requireNotebook(notebookId);
    return notebook.sections.find(item => item.id === sectionId) || null;
}

function getChapter(notebookId, chapterId) {
    const notebook = requireNotebook(notebookId);

    const rootChapter =
        (notebook.rootChapters || []).find(
            item => item.id === chapterId
        );

    if (rootChapter) {
        return rootChapter;
    }

    for (const section of notebook.sections) {
        const chapter =
            (section.chapters || []).find(
                item => item.id === chapterId
            );

        if (chapter) {
            return chapter;
        }
    }

    return null;
}

function getTopic(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);

    for (const chapter of notebook.rootChapters || []) {
        const topic =
            (chapter.topics || []).find(
                item => item.id === topicId
            );

        if (topic) {
            return topic;
        }
    }

    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const topic =
                (chapter.topics || []).find(
                    item => item.id === topicId
                );

            if (topic) {
                return topic;
            }
        }
    }

    return null;
}

function findTopicContext(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);

    for (const chapter of notebook.rootChapters || []) {
        const topic =
            (chapter.topics || []).find(
                item => item.id === topicId
            );

        if (topic) {
            return {
                notebook,
                section: null,
                chapter,
                topic
            };
        }
    }

    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const topic =
                (chapter.topics || []).find(
                    item => item.id === topicId
                );

            if (topic) {
                return {
                    notebook,
                    section,
                    chapter,
                    topic
                };
            }
        }
    }

    return null;
}

function addSection(notebookId, name) {
    const notebook = requireNotebook(notebookId);
    const section = createSection(name);

    notebook.sections.push(section);

    touchNotebook(notebookId);

    return section;
}

function updateSection(notebookId, sectionId, changes) {
    const section =
        getSection(
            notebookId,
            sectionId
        );

    if (!section) {
        throw new Error("Section not found.");
    }

    Object.assign(
        section,
        changes
    );

    touchNotebook(notebookId);

    return section;
}

function deleteSection(notebookId, sectionId) {
    const notebook =
        requireNotebook(
            notebookId
        );

    const index =
        notebook.sections.findIndex(
            item =>
                item.id ===
                sectionId
        );

    if (index < 0) {
        throw new Error(
            "Section not found."
        );
    }

    notebook.sections.splice(
        index,
        1
    );

    touchNotebook(notebookId);
}

function addChapter(
    notebookId,
    sectionId,
    name
) {
    const notebook =
        requireNotebook(
            notebookId
        );

    const chapter =
        createChapter(name);

    if (sectionId) {
        const section =
            getSection(
                notebookId,
                sectionId
            );

        if (!section) {
            throw new Error(
                "Section not found."
            );
        }

        section.chapters.push(
            chapter
        );
    } else {
        notebook.rootChapters =
            Array.isArray(
                notebook.rootChapters
            )
                ? notebook.rootChapters
                : [];

        notebook.rootChapters.push(
            chapter
        );
    }

    touchNotebook(
        notebookId
    );

    return chapter;
}

function updateChapter(
    notebookId,
    chapterId,
    changes
) {
    const chapter =
        getChapter(
            notebookId,
            chapterId
        );

    if (!chapter) {
        throw new Error(
            "Chapter not found."
        );
    }

    Object.assign(
        chapter,
        changes
    );

    touchNotebook(
        notebookId
    );

    return chapter;
}

function deleteChapter(
    notebookId,
    chapterId
) {
    const notebook =
        requireNotebook(
            notebookId
        );

    const rootIndex =
        (notebook.rootChapters || [])
            .findIndex(
                item =>
                    item.id ===
                    chapterId
            );

    if (rootIndex >= 0) {
        notebook.rootChapters.splice(
            rootIndex,
            1
        );

        touchNotebook(
            notebookId
        );

        return;
    }

    for (const section of notebook.sections) {
        const index =
            (section.chapters || [])
                .findIndex(
                    item =>
                        item.id ===
                        chapterId
                );

        if (index >= 0) {
            section.chapters.splice(
                index,
                1
            );

            touchNotebook(
                notebookId
            );

            return;
        }
    }

    throw new Error(
        "Chapter not found."
    );
}

function addTopic(
    notebookId,
    chapterId,
    name
) {
    const chapter =
        getChapter(
            notebookId,
            chapterId
        );

    if (!chapter) {
        throw new Error(
            "Chapter not found."
        );
    }

    chapter.topics =
        Array.isArray(
            chapter.topics
        )
            ? chapter.topics
            : [];

    const topic =
        createTopic(name);

    chapter.topics.push(
        topic
    );

    touchNotebook(
        notebookId
    );

    return topic;
}

function updateTopic(
    notebookId,
    topicId,
    changes
) {
    const topic =
        getTopic(
            notebookId,
            topicId
        );

    if (!topic) {
        throw new Error(
            "Topic not found."
        );
    }

    Object.assign(
        topic,
        changes
    );

    touchNotebook(
        notebookId
    );

    return topic;
}

function deleteTopic(
    notebookId,
    topicId
) {
    const notebook =
        requireNotebook(
            notebookId
        );

    for (const chapter of notebook.rootChapters || []) {
        const index =
            (chapter.topics || [])
                .findIndex(
                    item =>
                        item.id ===
                        topicId
                );

        if (index >= 0) {
            chapter.topics.splice(
                index,
                1
            );

            touchNotebook(
                notebookId
            );

            return;
        }
    }

    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const index =
                (chapter.topics || [])
                    .findIndex(
                        item =>
                            item.id ===
                            topicId
                    );

            if (index >= 0) {
                chapter.topics.splice(
                    index,
                    1
                );

                touchNotebook(
                    notebookId
                );

                return;
            }
        }
    }

    throw new Error(
        "Topic not found."
    );
}

function saveTopicNotes(notebookId, topicId, html) {
    const topic = getTopic(notebookId, topicId);
    if (!topic) throw new Error("Topic not found.");
    topic.notes = String(html || "");
    touchNotebook(notebookId);
}

    ns.getSection = getSection;
    ns.getChapter = getChapter;
    ns.getTopic = getTopic;
    ns.findTopicContext = findTopicContext;
    ns.addSection = addSection;
    ns.updateSection = updateSection;
    ns.deleteSection = deleteSection;
    ns.addChapter = addChapter;
    ns.updateChapter = updateChapter;
    ns.deleteChapter = deleteChapter;
    ns.addTopic = addTopic;
    ns.updateTopic = updateTopic;
    ns.deleteTopic = deleteTopic;
    ns.saveTopicNotes = saveTopicNotes;
})(window.everyLearn);
