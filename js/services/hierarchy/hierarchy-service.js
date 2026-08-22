(function(ns){
    "use strict";
    const createSection = (...args) => ns.createSection(...args);
    const createChapter = (...args) => ns.createChapter(...args);
    const createTopic = (...args) => ns.createTopic(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const touchNotebook = (...args) => ns.touchNotebook(...args);
    const createId = (...args) => ns.createId(...args);
/* everyLearn — Hierarchy Service */

function requireNotebook(id) {
    const notebook = getNotebook(id);
    if (!notebook) throw new Error("Notebook not found.");
    notebook.sections = Array.isArray(notebook.sections) ? notebook.sections : [];
    notebook.rootChapters = Array.isArray(notebook.rootChapters) ? notebook.rootChapters : [];
    return notebook;
}

function getSection(notebookId, sectionId) {
    return requireNotebook(notebookId).sections.find(item => item.id === sectionId) || null;
}

function getChapter(notebookId, chapterId) {
    const notebook = requireNotebook(notebookId);
    const root = notebook.rootChapters.find(item => item.id === chapterId);
    if (root) return root;
    for (const section of notebook.sections) {
        const chapter = (section.chapters || []).find(item => item.id === chapterId);
        if (chapter) return chapter;
    }
    return null;
}

function getTopic(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);
    for (const chapter of notebook.rootChapters) {
        const topic = (chapter.topics || []).find(item => item.id === topicId);
        if (topic) return topic;
    }
    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const topic = (chapter.topics || []).find(item => item.id === topicId);
            if (topic) return topic;
        }
    }
    return null;
}

function findTopicContext(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);
    for (const chapter of notebook.rootChapters) {
        const topic = (chapter.topics || []).find(item => item.id === topicId);
        if (topic) return { notebook, section: null, chapter, topic };
    }
    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const topic = (chapter.topics || []).find(item => item.id === topicId);
            if (topic) return { notebook, section, chapter, topic };
        }
    }
    return null;
}

function walkNotebookHierarchy(notebook, visitor) {
    if (!notebook || typeof visitor !== "function") return;

    for (const chapter of notebook.rootChapters || []) {
        visitor({
            type: "chapter",
            notebook,
            section: null,
            chapter,
            topic: null,
            question: null,
            root: true
        });

        for (const topic of chapter.topics || []) {
            visitor({
                type: "topic",
                notebook,
                section: null,
                chapter,
                topic,
                question: null,
                root: true
            });

            for (const question of topic.questions || []) {
                visitor({
                    type: "question",
                    notebook,
                    section: null,
                    chapter,
                    topic,
                    question,
                    root: true
                });
            }
        }
    }

    for (const section of notebook.sections || []) {
        visitor({
            type: "section",
            notebook,
            section,
            chapter: null,
            topic: null,
            question: null,
            root: false
        });

        for (const chapter of section.chapters || []) {
            visitor({
                type: "chapter",
                notebook,
                section,
                chapter,
                topic: null,
                question: null,
                root: false
            });

            for (const topic of chapter.topics || []) {
                visitor({
                    type: "topic",
                    notebook,
                    section,
                    chapter,
                    topic,
                    question: null,
                    root: false
                });

                for (const question of topic.questions || []) {
                    visitor({
                        type: "question",
                        notebook,
                        section,
                        chapter,
                        topic,
                        question,
                        root: false
                    });
                }
            }
        }
    }
}

function addSection(notebookId, name) {
    const notebook = requireNotebook(notebookId);
    const section = createSection(name);
    notebook.sections.push(section);
    touchNotebook(notebookId);
    return section;
}

function updateSection(notebookId, sectionId, changes) {
    const section = getSection(notebookId, sectionId);
    if (!section) throw new Error("Section not found.");
    Object.assign(section, changes);
    touchNotebook(notebookId);
    return section;
}

function deleteSection(notebookId, sectionId) {
    const notebook = requireNotebook(notebookId);
    const index = notebook.sections.findIndex(item => item.id === sectionId);
    if (index < 0) throw new Error("Section not found.");
    notebook.sections.splice(index, 1);
    touchNotebook(notebookId);
}

function addChapter(notebookId, sectionId, name) {
    const notebook = requireNotebook(notebookId);
    const chapter = createChapter(name);
    if (sectionId) {
        const section = getSection(notebookId, sectionId);
        if (!section) throw new Error("Section not found.");
        section.chapters = Array.isArray(section.chapters) ? section.chapters : [];
        section.chapters.push(chapter);
    } else {
        notebook.rootChapters.push(chapter);
    }
    touchNotebook(notebookId);
    return chapter;
}

function updateChapter(notebookId, chapterId, changes) {
    const chapter = getChapter(notebookId, chapterId);
    if (!chapter) throw new Error("Chapter not found.");
    Object.assign(chapter, changes);
    touchNotebook(notebookId);
    return chapter;
}

function deleteChapter(notebookId, chapterId) {
    const notebook = requireNotebook(notebookId);
    const rootIndex = notebook.rootChapters.findIndex(item => item.id === chapterId);
    if (rootIndex >= 0) {
        notebook.rootChapters.splice(rootIndex, 1);
        touchNotebook(notebookId);
        return;
    }
    for (const section of notebook.sections) {
        const index = (section.chapters || []).findIndex(item => item.id === chapterId);
        if (index >= 0) {
            section.chapters.splice(index, 1);
            touchNotebook(notebookId);
            return;
        }
    }
    throw new Error("Chapter not found.");
}

function addTopic(notebookId, chapterId, name) {
    const chapter = getChapter(notebookId, chapterId);
    if (!chapter) throw new Error("Chapter not found.");
    chapter.topics = Array.isArray(chapter.topics) ? chapter.topics : [];
    const topic = createTopic(name);
    chapter.topics.push(topic);
    touchNotebook(notebookId);
    return topic;
}

function updateTopic(notebookId, topicId, changes) {
    const topic = getTopic(notebookId, topicId);
    if (!topic) throw new Error("Topic not found.");
    Object.assign(topic, changes);
    touchNotebook(notebookId);
    return topic;
}

function deleteTopic(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);
    for (const chapter of notebook.rootChapters) {
        const index = (chapter.topics || []).findIndex(item => item.id === topicId);
        if (index >= 0) {
            chapter.topics.splice(index, 1);
            touchNotebook(notebookId);
            return;
        }
    }
    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const index = (chapter.topics || []).findIndex(item => item.id === topicId);
            if (index >= 0) {
                chapter.topics.splice(index, 1);
                touchNotebook(notebookId);
                return;
            }
        }
    }
    throw new Error("Topic not found.");
}

function saveTopicNotes(notebookId, topicId, html) {
    const topic = getTopic(notebookId, topicId);
    if (!topic) throw new Error("Topic not found.");
    topic.notes = String(html || "");
    touchNotebook(notebookId);
}

function cloneWithFreshIds(value) {
    if (Array.isArray(value)) return value.map(cloneWithFreshIds);
    if (!value || typeof value !== "object") return value;
    const copy = {};
    for (const [key, item] of Object.entries(value)) {
        if (key === "id" && typeof item === "string") {
            const prefix = item.split("_")[0] || "id";
            copy[key] = createId(prefix);
        } else {
            copy[key] = cloneWithFreshIds(item);
        }
    }
    return copy;
}

function removeSectionFromNotebook(notebookId, sectionId) {
    const notebook = requireNotebook(notebookId);
    const index = notebook.sections.findIndex(item => item.id === sectionId);
    if (index < 0) throw new Error("Section not found.");
    return notebook.sections.splice(index, 1)[0];
}

function removeChapterFromNotebook(notebookId, chapterId) {
    const notebook = requireNotebook(notebookId);
    const rootIndex = notebook.rootChapters.findIndex(item => item.id === chapterId);
    if (rootIndex >= 0) return notebook.rootChapters.splice(rootIndex, 1)[0];
    for (const section of notebook.sections) {
        const index = (section.chapters || []).findIndex(item => item.id === chapterId);
        if (index >= 0) return section.chapters.splice(index, 1)[0];
    }
    throw new Error("Chapter not found.");
}

function removeTopicFromNotebook(notebookId, topicId) {
    const notebook = requireNotebook(notebookId);
    for (const chapter of notebook.rootChapters) {
        const index = (chapter.topics || []).findIndex(item => item.id === topicId);
        if (index >= 0) return chapter.topics.splice(index, 1)[0];
    }
    for (const section of notebook.sections) {
        for (const chapter of section.chapters || []) {
            const index = (chapter.topics || []).findIndex(item => item.id === topicId);
            if (index >= 0) return chapter.topics.splice(index, 1)[0];
        }
    }
    throw new Error("Topic not found.");
}

function findChapterParent(notebookId, chapterId) {
    const notebook = requireNotebook(notebookId);
    for (const section of notebook.sections) {
        if ((section.chapters || []).some(chapter => chapter.id === chapterId)) return { section };
    }
    if (notebook.rootChapters.some(chapter => chapter.id === chapterId)) return { section: null };
    return null;
}

function moveSection(sourceNotebookId, sectionId, destinationNotebookId) {
    const sourceNotebook = requireNotebook(sourceNotebookId);
    const section = sourceNotebook.sections.find(item => item.id === sectionId);
    if (!section) throw new Error("Section not found.");

    const destinationNotebook = requireNotebook(destinationNotebookId);

    if (sourceNotebookId === destinationNotebookId) {
        const index = sourceNotebook.sections.findIndex(item => item.id === sectionId);
        if (index < 0) throw new Error("Section not found.");
        sourceNotebook.sections.splice(index, 1);
        destinationNotebook.sections.push(section);
        touchNotebook(sourceNotebookId);
        return section;
    }

    sourceNotebook.sections = sourceNotebook.sections.filter(item => item.id !== sectionId);
    destinationNotebook.sections.push(section);
    touchNotebook(sourceNotebookId);
    touchNotebook(destinationNotebookId);
    return section;
}

function duplicateSection(sourceNotebookId, sectionId, destinationNotebookId, name) {
    const source = getSection(sourceNotebookId, sectionId);
    if (!source) throw new Error("Section not found.");
    const copy = cloneWithFreshIds(source);
    if (name) copy.name = String(name).trim();
    requireNotebook(destinationNotebookId).sections.push(copy);
    touchNotebook(destinationNotebookId);
    return copy;
}

function moveChapter(sourceNotebookId, chapterId, destinationNotebookId, destinationSectionId = null) {
    const sourceNotebook = requireNotebook(sourceNotebookId);
    const chapter = getChapter(sourceNotebookId, chapterId);
    if (!chapter) throw new Error("Chapter not found.");

    const sourceParent = findChapterParent(sourceNotebookId, chapterId);
    if (!sourceParent) throw new Error("Chapter not found.");

    const destinationNotebook = requireNotebook(destinationNotebookId);
    let destinationSection = null;

    if (destinationSectionId) {
        destinationSection = getSection(destinationNotebookId, destinationSectionId);
        if (!destinationSection) throw new Error("Destination section not found.");
        destinationSection.chapters = Array.isArray(destinationSection.chapters)
            ? destinationSection.chapters
            : [];

        if (destinationNotebookId === sourceNotebookId &&
            sourceParent.section?.id === destinationSectionId) {
            return chapter;
        }
    }

    if (sourceParent.section) {
        const sourceIndex = sourceParent.section.chapters.findIndex(item => item.id === chapterId);
        if (sourceIndex < 0) throw new Error("Chapter not found.");
        sourceParent.section.chapters.splice(sourceIndex, 1);
    } else {
        const sourceIndex = sourceNotebook.rootChapters.findIndex(item => item.id === chapterId);
        if (sourceIndex < 0) throw new Error("Chapter not found.");
        sourceNotebook.rootChapters.splice(sourceIndex, 1);
    }

    if (destinationSection) {
        destinationSection.chapters.push(chapter);
    } else {
        destinationNotebook.rootChapters.push(chapter);
    }

    touchNotebook(sourceNotebookId);
    if (destinationNotebookId !== sourceNotebookId) touchNotebook(destinationNotebookId);
    return chapter;
}

function duplicateChapter(sourceNotebookId, chapterId, destinationNotebookId, destinationSectionId = null, name) {
    const source = getChapter(sourceNotebookId, chapterId);
    if (!source) throw new Error("Chapter not found.");
    const copy = cloneWithFreshIds(source);
    if (name) copy.name = String(name).trim();
    const destination = requireNotebook(destinationNotebookId);
    if (destinationSectionId) {
        const section = getSection(destinationNotebookId, destinationSectionId);
        if (!section) throw new Error("Destination section not found.");
        section.chapters = Array.isArray(section.chapters) ? section.chapters : [];
        section.chapters.push(copy);
    } else {
        destination.rootChapters.push(copy);
    }
    touchNotebook(destinationNotebookId);
    return copy;
}

function moveTopic(sourceNotebookId, topicId, destinationNotebookId, destinationChapterId) {
    const sourceNotebook = requireNotebook(sourceNotebookId);
    const sourceContext = findTopicContext(sourceNotebookId, topicId);
    if (!sourceContext) throw new Error("Topic not found.");

    const destinationNotebook = requireNotebook(destinationNotebookId);
    const destinationChapter = getChapter(destinationNotebookId, destinationChapterId);
    if (!destinationChapter) throw new Error("Destination chapter not found.");

    if (destinationNotebookId === sourceNotebookId &&
        sourceContext.chapter.id === destinationChapterId) {
        return sourceContext.topic;
    }

    const topic = sourceContext.topic;
    const sourceTopics = sourceContext.chapter.topics;
    const sourceIndex = sourceTopics.findIndex(item => item.id === topicId);
    if (sourceIndex < 0) throw new Error("Topic not found.");

    sourceTopics.splice(sourceIndex, 1);
    destinationChapter.topics = Array.isArray(destinationChapter.topics)
        ? destinationChapter.topics
        : [];
    destinationChapter.topics.push(topic);

    touchNotebook(sourceNotebookId);
    if (destinationNotebookId !== sourceNotebookId) touchNotebook(destinationNotebookId);
    return topic;
}

function duplicateTopic(sourceNotebookId, topicId, destinationNotebookId, destinationChapterId, name) {
    const source = getTopic(sourceNotebookId, topicId);
    if (!source) throw new Error("Topic not found.");
    const chapter = getChapter(destinationNotebookId, destinationChapterId);
    if (!chapter) throw new Error("Destination chapter not found.");
    const copy = cloneWithFreshIds(source);
    if (name) copy.name = String(name).trim();
    chapter.topics = Array.isArray(chapter.topics) ? chapter.topics : [];
    chapter.topics.push(copy);
    touchNotebook(destinationNotebookId);
    return copy;
}

    ns.walkNotebookHierarchy = walkNotebookHierarchy;
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
    ns.moveSection = moveSection;
    ns.duplicateSection = duplicateSection;
    ns.moveChapter = moveChapter;
    ns.duplicateChapter = duplicateChapter;
    ns.moveTopic = moveTopic;
    ns.duplicateTopic = duplicateTopic;
})(window.everyLearn);
