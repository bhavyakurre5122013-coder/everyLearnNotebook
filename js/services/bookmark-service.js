(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const createBookmark = (...args) => ns.createBookmark(...args);
/* everyLearn — Bookmark Service */




function listBookmarks() {
    return [...state.data.bookmarks];
}

function getBookmark(id) {
    return state.data.bookmarks.find(item => item.id === id) || null;
}

function createLocationBookmark(options) {
    const bookmark = createBookmark(options);
    state.data.bookmarks.push(bookmark);
    saveStoredData(state.data);
    return bookmark;
}

function updateBookmark(id, changes) {
    const bookmark = getBookmark(id);
    if (!bookmark) throw new Error("Bookmark not found.");

    Object.assign(bookmark, changes);
    saveStoredData(state.data);
    return bookmark;
}

function deleteBookmark(id) {
    state.data.bookmarks =
        state.data.bookmarks.filter(item => item.id !== id);

    saveStoredData(state.data);
}

function bookmarksForNotebook(notebookId) {
    return listBookmarks().filter(
        bookmark => bookmark.notebookId === notebookId
    );
}

    ns.listBookmarks = listBookmarks;
    ns.getBookmark = getBookmark;
    ns.createLocationBookmark = createLocationBookmark;
    ns.updateBookmark = updateBookmark;
    ns.deleteBookmark = deleteBookmark;
    ns.bookmarksForNotebook = bookmarksForNotebook;
})(window.everyLearn);
