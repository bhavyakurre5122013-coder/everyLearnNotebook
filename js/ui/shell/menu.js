(function(ns){
    "use strict";
    const iconImage = (...args) => ns.iconImage(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const exportApplicationData = (...args) => ns.exportApplicationData(...args);
    const importApplicationData = (...args) => ns.importApplicationData(...args);
    const clearApplicationCache = (...args) => ns.clearApplicationCache(...args);
    const searchEverything = (...args) => ns.searchEverything(...args);
    const openBookmarkEditor = (...args) => ns.openBookmarkEditor(...args);
    const openBookmarkBrowser = (...args) => ns.openBookmarkBrowser(...args);
/*
=============================================================
everyLearn — Application Menu
=============================================================
*/











function initMenu() {
    const button =
        document.getElementById("menuButton");

    const menu =
        document.getElementById(
            "applicationMenu"
        );

    if (!button || !menu) return;

    renderMenu(menu);

    button.onclick = event => {
        event.stopPropagation();

        const rect =
            button.getBoundingClientRect();

        menu.style.top =
            `${rect.bottom + 8}px`;

        menu.style.right =
            `${Math.max(
                10,
                window.innerWidth - rect.right
            )}px`;

        menu.classList.toggle(
            "hidden"
        );

        button.setAttribute(
            "aria-expanded",
            String(
                !menu.classList.contains(
                    "hidden"
                )
            )
        );
    };

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest(
                    "#applicationMenu"
                ) &&
                !event.target.closest(
                    "#menuButton"
                )
            ) {
                menu.classList.add(
                    "hidden"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
}

function renderMenu(menu) {
    menu.innerHTML = `
        <div class="menu-group-label">
            Create
        </div>

        <button
            class="menu-item"
            data-menu-action="subject"
            type="button"
        >
            <span class="menu-item-label">
                <span class="menu-item-icon">
                    ${iconImage("plus")}
                </span>
                Subject
            </span>
        </button>

        <button
            class="menu-item"
            data-menu-action="notebook"
            type="button"
        >
            <span class="menu-item-label">
                <span class="menu-item-icon">
                    ${iconImage("plus")}
                </span>
                Notebook
            </span>
        </button>

        <button
            class="menu-item"
            data-menu-action="bookmark"
            type="button"
        >
            <span class="menu-item-label">
                <span class="menu-item-icon">
                    ${iconImage("bookmark")}
                </span>
                Bookmark
            </span>
        </button>

        <div class="menu-divider"></div>

        <button
            class="menu-item"
            data-menu-action="bookmarks"
            type="button"
        >
            Bookmarks
        </button>

        <button
            class="menu-item"
            data-menu-action="filters"
            type="button"
        >
            Question filters
        </button>

        <button
            class="menu-item"
            data-menu-action="settings"
            type="button"
        >
            <span class="menu-item-label">
                <span class="menu-item-icon">
                    ${iconImage("settings")}
                </span>
                Settings
            </span>
        </button>

        <div class="menu-divider"></div>

        <button
            class="menu-item"
            data-menu-action="export"
            type="button"
        >
            Export data
        </button>

        <button
            class="menu-item"
            data-menu-action="import"
            type="button"
        >
            Import data
        </button>

        <div class="menu-divider"></div>

        <button
            class="menu-item menu-item-danger"
            data-menu-action="clear-cache"
            type="button"
        >
            <span class="menu-item-label">
                <span class="menu-item-icon">
                    ${iconImage("delete")}
                </span>
                Delete all cache
            </span>
        </button>
    `;

    menu.addEventListener(
        "click",
        event => {
            const action =
                event.target.closest(
                    "[data-menu-action]"
                )?.dataset.menuAction;

            if (!action) return;

            handleAction(action);
        }
    );
}

async function handleAction(action) {
    document
        .getElementById("applicationMenu")
        ?.classList.add("hidden");

    switch (action) {
        case "subject":
            document.dispatchEvent(
                new Event(
                    "everylearn:create-subject"
                )
            );
            break;

        case "notebook":
            document.dispatchEvent(
                new Event(
                    "everylearn:create-notebook"
                )
            );
            break;

        case "bookmark":
            openBookmarkEditor();
            break;

        case "bookmarks":
            openBookmarkBrowser();
            break;

        case "filters":
            document.dispatchEvent(
                new Event(
                    "everylearn:show-filters"
                )
            );
            break;

        case "settings":
            document.dispatchEvent(
                new Event(
                    "everylearn:show-settings"
                )
            );
            break;

        case "export":
            exportApplicationData();
            showToast({
                message: "Data exported.",
                type: "success"
            });
            break;

        case "import":
            importData();
            break;

        case "clear-cache":
            clearCache();
            break;

        default:
            break;
    }
}

function importData() {
    const input =
        document.createElement("input");

    input.type = "file";
    input.accept =
        ".json,application/json";

    input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;

        try {
            await importApplicationData(
                file
            );

            showToast({
                message: "Data imported.",
                type: "success"
            });

            location.reload();
        } catch (error) {
            showToast({
                message:
                    `Import failed: ${error.message}`,
                type: "error"
            });
        }
    };

    input.click();
}

async function clearCache() {
    const confirmed =
        await confirmAction({
            title: "Delete all cache?",
            message:
                "This will clear everyLearn local data and accessible Cache API entries.",
            confirmText:
                "Delete all cache"
        });

    if (!confirmed) return;

    await clearApplicationCache();

    showToast({
        message:
            "Application cache deleted.",
        type: "success"
    });

    location.reload();
}

    ns.initMenu = initMenu;
})(window.everyLearn);
