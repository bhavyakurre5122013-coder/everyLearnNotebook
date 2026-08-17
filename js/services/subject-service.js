(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const PREDEFINED_SUBJECTS = ns.PREDEFINED_SUBJECTS;
/* everyLearn — Subject Service */





function getSubject(id) {
    return state.data.subjects.find(item => item.id === id) || null;
}

function listSubjects() {
    return [...state.data.subjects];
}

function createSubjectFromPreset(key) {
    const preset = PREDEFINED_SUBJECTS.find(item => item.key === key);
    if (!preset) throw new Error("Unknown subject preset.");
    return createSubject(preset);
}

function createSubject({ name, icon = "•", color = "#2563EB", light = "#E8F1FF" }) {
    const cleanName = String(name || "").trim();
    if (!cleanName) throw new Error("Subject name is required.");

    if (state.data.subjects.some(
        subject => subject.name.toLowerCase() === cleanName.toLowerCase()
    )) {
        throw new Error("A subject with that name already exists.");
    }

    const subject = {
        id: createId("subject"),
        name: cleanName,
        icon,
        color,
        light
    };

    state.data.subjects.push(subject);
    saveStoredData(state.data);
    return subject;
}

function updateSubject(id, changes) {
    const subject = getSubject(id);
    if (!subject) throw new Error("Subject not found.");
    Object.assign(subject, changes);
    saveStoredData(state.data);
    return subject;
}

function deleteSubject(id) {
    if (!getSubject(id)) throw new Error("Subject not found.");

    state.data.notebooks = state.data.notebooks.filter(
        notebook => notebook.subjectId !== id
    );
    state.data.subjects = state.data.subjects.filter(
        subject => subject.id !== id
    );
    state.data.bookmarks = state.data.bookmarks.filter(
        bookmark => state.data.notebooks.some(
            notebook => notebook.id === bookmark.notebookId
        )
    );

    saveStoredData(state.data);
}

    ns.getSubject = getSubject;
    ns.listSubjects = listSubjects;
    ns.createSubjectFromPreset = createSubjectFromPreset;
    ns.createSubject = createSubject;
    ns.updateSubject = updateSubject;
    ns.deleteSubject = deleteSubject;
})(window.everyLearn);
