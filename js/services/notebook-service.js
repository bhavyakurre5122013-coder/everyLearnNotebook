(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const createNotebook = (...args) => ns.createNotebook(...args);
/* everyLearn — Notebook Service */




function getNotebook(id) {
    return state.data.notebooks.find(item => item.id === id) || null;
}

function listNotebooks() {
    return [...state.data.notebooks].sort(
        (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
    );
}

function listNotebooksForSubject(subjectId) {
    return listNotebooks().filter(
        notebook => notebook.subjectId === subjectId
    );
}

function createNotebookRecord(options) {
    const notebook = createNotebook(options);
    state.data.notebooks.push(notebook);
    saveStoredData(state.data);
    return notebook;
}

function updateNotebook(id, changes) {
    const notebook = getNotebook(id);
    if (!notebook) throw new Error("Notebook not found.");

    Object.assign(notebook, changes);
    notebook.updatedAt = Date.now();
    saveStoredData(state.data);
    return notebook;
}

function deleteNotebook(id) {
    if (!getNotebook(id)) throw new Error("Notebook not found.");

    state.data.notebooks = state.data.notebooks.filter(
        notebook => notebook.id !== id
    );
    state.data.bookmarks = state.data.bookmarks.filter(
        bookmark => bookmark.notebookId !== id
    );

    saveStoredData(state.data);
}

function touchNotebook(id) {
    const notebook = getNotebook(id);
    if (notebook) {
        notebook.updatedAt = Date.now();
        saveStoredData(state.data);
    }
}

    ns.getNotebook = getNotebook;
    ns.listNotebooks = listNotebooks;
    ns.listNotebooksForSubject = listNotebooksForSubject;
    ns.createNotebookRecord = createNotebookRecord;
    ns.updateNotebook = updateNotebook;
    ns.deleteNotebook = deleteNotebook;
    ns.touchNotebook = touchNotebook;
})(window.everyLearn);
