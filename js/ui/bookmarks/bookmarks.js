(function(ns){
    "use strict";

    const state = ns.state;
    const listBookmarks = (...args) => ns.listBookmarks(...args);
    const deleteBookmark = (...args) => ns.deleteBookmark(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const findTopicContext = (...args) => ns.findTopicContext(...args);
    const getSection = (...args) => ns.getSection(...args);
    const getChapter = (...args) => ns.getChapter(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const openWorkspace = (...args) => ns.openWorkspace(...args);
    const getLibraryState = (...args) => ns.getLibraryState(...args);
    const filterLibraryItems = (...args) => ns.filterLibraryItems(...args);
    const sortLibraryItems = (...args) => ns.sortLibraryItems(...args);
    const walkNotebookHierarchy = (...args) => ns.walkNotebookHierarchy(...args);
    const createLocationBookmark = (...args) => ns.createLocationBookmark(...args);

    /* everyLearn — Bookmark Browser / Library */

    function initBookmarks() {
        document.addEventListener("everylearn:show-bookmarks", openBookmarkBrowser);
    }

    function openBookmarkBrowser() {
        const bookmarks = listBookmarks();

        openDialog({
            title: "Bookmarks",
            bodyHTML: `
                <div class="bookmark-browser">
                    ${bookmarks.length
                        ? bookmarks.map(renderBookmark).join("")
                        : `
                            <div class="empty-state">
                                <strong>No bookmarks</strong>
                                Create a location bookmark while working on a topic.
                            </div>
                        `}
                </div>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Close</button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector("[data-dialog-cancel]").onclick = close;
                bindBookmarkActions(host, bookmarks, close);
            }
        });
    }

    function bindBookmarkActions(host, bookmarks, close) {
        host.querySelectorAll("[data-open-bookmark]").forEach(button => {
            button.onclick = () => {
                const bookmark = bookmarks.find(item => item.id === button.dataset.openBookmark);
                if (!bookmark) return;
                close();
                openBookmarkLocation(bookmark);
                document.dispatchEvent(new Event("everylearn:render"));
            };
        });

        host.querySelectorAll("[data-delete-bookmark]").forEach(button => {
            button.onclick = async event => {
                event.stopPropagation();
                const ok = await confirmAction({
                    title: "Delete bookmark?",
                    message: "Only the bookmark is deleted; your content remains.",
                    confirmText: "Delete bookmark"
                });
                if (!ok) return;
                deleteBookmark(button.dataset.deleteBookmark);
                close();
                openBookmarkBrowser();
                showToast({ message: "Bookmark deleted.", type: "success" });
            };
        });
    }

    function openBookmarkLocation(bookmark) {
        const notebookId = bookmark?.notebookId;
        const notebook = getNotebook(notebookId);
        if (!notebook) {
            showToast({ message: "The bookmarked notebook no longer exists.", type: "error" });
            return false;
        }

        let topicId = null;
        let sectionId = null;
        let chapterId = null;

        if (bookmark.topicId) {
            const context = findTopicContext(notebookId, bookmark.topicId);
            if (!context) {
                showToast({ message: "The bookmarked topic no longer exists.", type: "error" });
                return false;
            }
            topicId = context.topic.id;
            sectionId = context.section?.id || null;
            chapterId = context.chapter?.id || null;
        } else if (bookmark.chapterId) {
            const chapter = getChapter(notebookId, bookmark.chapterId);
            const parentSection = notebook.sections?.find(section =>
                section.chapters?.some(item => item.id === bookmark.chapterId)
            ) || null;

            if (!chapter) {
                showToast({ message: "The bookmarked chapter no longer exists.", type: "error" });
                return false;
            }

            chapterId = chapter.id;
            sectionId = parentSection?.id || null;
        } else if (bookmark.sectionId) {
            const section = getSection(notebookId, bookmark.sectionId);
            if (!section) {
                showToast({ message: "The bookmarked section no longer exists.", type: "error" });
                return false;
            }
            sectionId = section.id;
        }

        openWorkspace(notebookId, topicId);
        state.sectionId = sectionId;
        state.chapterId = chapterId;
        state.topicId = topicId;
        return true;
    }

    function openBookmarkLocationById(id) {
        const bookmark = listBookmarks().find(item => item.id === id);
        if (!bookmark) {
            showToast({ message: "Bookmark not found.", type: "error" });
            return false;
        }

        const opened = openBookmarkLocation(bookmark);
        if (opened) document.dispatchEvent(new Event("everylearn:render"));
        return opened;
    }

    function renderBookmarkLibrary({ view = "grid", sort = "date-latest", query = "" } = {}) {
        const grid = document.getElementById("bookmarkGrid");
        if (!grid) return;

        const settings = getLibraryState("bookmarks");
        settings.view = view === "list" ? "list" : "grid";
        settings.sort = sort;
        settings.query = query;

        let bookmarks = listBookmarks();
        bookmarks = filterLibraryItems(bookmarks, settings, bookmark => {
            const location = getBookmarkLocationPath(bookmark);
            return `${bookmark.name} ${location}`;
        });
        bookmarks = sortLibraryItems(bookmarks, settings, bookmark => bookmark.name);

        grid.className = `card-grid bookmark-grid ${settings.view === "list" ? "library-list-view" : ""}`;
        grid.innerHTML = "";

        if (!bookmarks.length) {
            grid.innerHTML = `
                <div class="empty-state library-empty-state">
                    <strong>${query ? "No bookmarks found" : "No bookmarks yet"}</strong>
                    <span>${query ? "Try a different search." : "Create a bookmark to save a useful notebook location."}</span>
                </div>
            `;
            return;
        }

        for (const bookmark of bookmarks) {
            const row = document.createElement("article");
            row.className = settings.view === "list"
                ? "bookmark-card library-detail-row"
                : "bookmark-card";
            row.dataset.openLibraryBookmark = bookmark.id;

            const path = getBookmarkLocationPath(bookmark);
            const level = getBookmarkLevel(bookmark);

            if (settings.view === "list") {
                row.innerHTML = `
                    <div class="library-detail-main">
                        <div class="bookmark-library-icon" aria-hidden="true">${iconBookmark()}</div>
                        <div class="library-detail-text">
                            <div class="card-title">${escapeHTML(bookmark.name)}</div>
                            <div class="card-description">${escapeHTML(path)}</div>
                        </div>
                    </div>
                    <div class="library-detail-meta">
                        <span>${escapeHTML(level)}</span>
                        <button class="delete-button small-button" type="button" data-delete-library-bookmark="${escapeAttribute(bookmark.id)}" aria-label="Delete ${escapeAttribute(bookmark.name)}">×</button>
                    </div>
                `;
            } else {
                row.innerHTML = `
                    <div class="bookmark-library-header">
                        <div class="bookmark-library-icon" aria-hidden="true">${iconBookmark()}</div>
                        <span class="bookmark-location-chip">${escapeHTML(level)}</span>
                    </div>
                    <div class="card-title">${escapeHTML(bookmark.name)}</div>
                    <div class="card-description">${escapeHTML(path)}</div>
                    <div class="card-footer">
                        <span>Open bookmark</span>
                        <button class="delete-button small-button" type="button" data-delete-library-bookmark="${escapeAttribute(bookmark.id)}" aria-label="Delete ${escapeAttribute(bookmark.name)}">×</button>
                    </div>
                `;
            }

            grid.appendChild(row);
        }
    }

    async function deleteBookmarkFromLibrary(id) {
        const bookmark = listBookmarks().find(item => item.id === id);
        if (!bookmark) return;

        const ok = await confirmAction({
            title: "Delete bookmark?",
            message: "Only the bookmark is deleted; your content remains.",
            confirmText: "Delete bookmark"
        });
        if (!ok) return;

        deleteBookmark(id);
        const settings = getLibraryState("bookmarks");
        renderBookmarkLibrary({
            view: settings.view,
            sort: settings.sort,
            query: settings.query
        });
        document.dispatchEvent(new Event("everylearn:render"));
        showToast({ message: "Bookmark deleted.", type: "success" });
    }

    function getBookmarkLocationPath(bookmark) {
        const notebook = getNotebook(bookmark.notebookId);
        if (!notebook) return "Notebook no longer exists";

        if (bookmark.topicId) {
            const context = findTopicContext(bookmark.notebookId, bookmark.topicId);
            if (!context) return `${notebook.name} / Topic no longer exists`;
            return [notebook.name, context.section?.name, context.chapter?.name, context.topic?.name]
                .filter(Boolean)
                .join(" / ");
        }

        if (bookmark.chapterId) {
            const chapter = getChapter(bookmark.notebookId, bookmark.chapterId);
            const section = notebook.sections?.find(item => item.chapters?.some(chapterItem => chapterItem.id === bookmark.chapterId));
            return [notebook.name, section?.name, chapter?.name].filter(Boolean).join(" / ");
        }

        if (bookmark.sectionId) {
            const section = getSection(bookmark.notebookId, bookmark.sectionId);
            return [notebook.name, section?.name].filter(Boolean).join(" / ");
        }

        return notebook.name;
    }

    function getBookmarkLevel(bookmark) {
        if (bookmark.topicId) return "Topic";
        if (bookmark.chapterId) return "Chapter";
        if (bookmark.sectionId) return "Section";
        return "Notebook";
    }

    function renderBookmark(bookmark) {
        const path = getBookmarkLocationPath(bookmark);
        return `
            <div class="bookmark-item" data-open-bookmark="${escapeAttribute(bookmark.id)}">
                <div class="bookmark-item-main">
                    <div class="bookmark-item-title">
                        <img class="marker-icon" src="./assets/icons/ui/bookmark.svg" alt="">
                        ${escapeHTML(bookmark.name)}
                    </div>
                    <div class="bookmark-item-path">${escapeHTML(path)}</div>
                </div>
                <div class="bookmark-item-actions">
                    <button class="delete-button small-button" data-delete-bookmark="${escapeAttribute(bookmark.id)}" type="button">×</button>
                </div>
            </div>
        `;
    }

    function iconBookmark() {
        return `<img src="./assets/icons/ui/bookmark.svg" alt="">`;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHTML(value);
    }

    ns.initBookmarks = initBookmarks;
    ns.openBookmarkBrowser = openBookmarkBrowser;
    ns.openBookmarkLocation = openBookmarkLocation;
    ns.openBookmarkLocationById = openBookmarkLocationById;
    ns.renderBookmarkLibrary = renderBookmarkLibrary;
    ns.deleteBookmarkFromLibrary = deleteBookmarkFromLibrary;
})(window.everyLearn);
