(function(ns){
    "use strict";
    const listBookmarks = (...args) => ns.listBookmarks(...args);
    const deleteBookmark = (...args) => ns.deleteBookmark(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const findTopicContext = (...args) => ns.findTopicContext(...args);
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
                        state.notebookId =
                            bookmark.notebookId;
                        state.topicId =
                            bookmark.topicId;
                        openWorkspace(
                            bookmark.notebookId,
                            bookmark.topicId
                        );

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
