(function(ns){
    "use strict";
    const listBookmarks = (...args) => ns.listBookmarks(...args);
/* everyLearn — Bookmark Browser Utilities */


function getBookmarkCount() {
    return listBookmarks().length;
}

    ns.getBookmarkCount = getBookmarkCount;
})(window.everyLearn);
