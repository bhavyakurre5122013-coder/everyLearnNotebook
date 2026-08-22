(function(ns){
    "use strict";
    const listBookmarks = (...args) => ns.listBookmarks(...args);
    const deleteBookmark = (...args) => ns.deleteBookmark(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const findTopicContext = (...args) => ns.findTopicContext(...args);
    const getSection = (...args) => ns.getSection(...args);
    const getChapter = (...args) => ns.getChapter(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const state = ns.state;
    const openWorkspace = (...args) => ns.openWorkspace(...args);
/* everyLearn — Bookmark Browser */









function initBookmarks() {
    document.addEventListener(
        "everylearn:show-bookmarks",
        openBookmarkBrowser
    );
}

function openBookmarkBrowser() {
    const bookmarks =
        listBookmarks();

    openDialog({
        title: "Bookmarks",
        bodyHTML: `
            <div class="bookmark-browser">
                ${
                    bookmarks.length
                        ? bookmarks.map(
                            renderBookmark
                        ).join("")
                        : `
                            <div class="empty-state">
                                <strong>
                                    No bookmarks
                                </strong>
                                Create a location bookmark while working on a topic.
                            </div>
                        `
                }
            </div>
        `,
        footerHTML: `
            <button
                class="secondary-button"
                data-dialog-cancel
            >
                Close
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelectorAll(
                "[data-open-bookmark]"
            ).forEach(
                button =>
                    button.onclick = () => {
                        const bookmark =
                            bookmarks.find(
                                item =>
                                    item.id ===
                                    button.dataset.openBookmark
                            );

                        if (!bookmark) return;

                        close();
                        openBookmarkLocation(bookmark);

                        document.dispatchEvent(
                            new Event(
                                "everylearn:render"
                            )
                        );
                    }
            );

            host.querySelectorAll(
                "[data-delete-bookmark]"
            ).forEach(
                button =>
                    button.onclick = async () => {
                        const ok =
                            await confirmAction({
                                title:
                                    "Delete bookmark?",
                                message:
                                    "Only the bookmark is deleted; your content remains.",
                                confirmText:
                                    "Delete bookmark"
                            });

                        if (!ok) return;

                        deleteBookmark(
                            button.dataset
                                .deleteBookmark
                        );

                        close();
                        openBookmarkBrowser();

                        showToast({
                            message:
                                "Bookmark deleted.",
                            type: "success"
                        });
                    }
            );
        }
    });
}

function openBookmarkLocation(bookmark) {
    const notebookId = bookmark.notebookId;
    const notebook = getNotebook(notebookId);
    if (!notebook) {
        showToast({
            message: "The bookmarked notebook no longer exists.",
            type: "error"
        });
        return false;
    }

    let topicId = null;
    let sectionId = null;
    let chapterId = null;

    if (bookmark.topicId) {
        const context = findTopicContext(notebookId, bookmark.topicId);
        if (!context) {
            showToast({
                message: "The bookmarked topic no longer exists.",
                type: "error"
            });
            return false;
        }
        topicId = context.topic.id;
        sectionId = context.section?.id || null;
        chapterId = context.chapter?.id || null;
    } else if (bookmark.chapterId) {
        const chapter = getChapter(notebookId, bookmark.chapterId);
        const parentSection =
            notebook.sections?.find(
                section =>
                    section.chapters?.some(
                        item => item.id === bookmark.chapterId
                    )
            ) || null;

        if (!chapter) {
            showToast({
                message: "The bookmarked chapter no longer exists.",
                type: "error"
            });
            return false;
        }

        chapterId = chapter.id;
        sectionId = parentSection?.id || null;
    } else if (bookmark.sectionId) {
        const section = getSection(notebookId, bookmark.sectionId);
        if (!section) {
            showToast({
                message: "The bookmarked section no longer exists.",
                type: "error"
            });
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

function renderBookmark(bookmark) {
    const notebook =
        getNotebook(
            bookmark.notebookId
        );

    if (!notebook) return "";

    const context =
        bookmark.topicId
            ? findTopicContext(
                bookmark.notebookId,
                bookmark.topicId
            )
            : null;

    const path =
        [
            notebook.name,
            context?.section?.name,
            context?.chapter?.name,
            context?.topic?.name
        ]
            .filter(Boolean)
            .join(" / ");

    return `
        <div
            class="bookmark-item"
            data-open-bookmark="${bookmark.id}"
        >
            <div class="bookmark-item-main">
                <div class="bookmark-item-title">
                    <img class="marker-icon" src="./assets/icons/ui/bookmark.svg" alt="">
                    ${escapeHTML(
                        bookmark.name
                    )}
                </div>

                <div class="bookmark-item-path">
                    ${escapeHTML(path)}
                </div>
            </div>

            <div class="bookmark-item-actions">
                <button
                    class="delete-button small-button"
                    data-delete-bookmark="${bookmark.id}"
                    type="button"
                >
                    ×
                </button>
            </div>
        </div>
    `;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.initBookmarks = initBookmarks;
    ns.openBookmarkBrowser = openBookmarkBrowser;
})(window.everyLearn);
