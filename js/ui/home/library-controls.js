(function(ns){
    "use strict";

    const state = ns.state;
    const iconImage = (...args) => ns.iconImage(...args);

    const DEFAULT_STATE = {
        query: "",
        view: "grid",
        sort: "date-latest"
    };

    function getLibraryState(key) {
        state.library = state.library || {};
        if (!state.library[key]) {
            state.library[key] = { ...DEFAULT_STATE };
        }
        return state.library[key];
    }

    function renderLibraryControls({
        key,
        createLabel,
        createEvent,
        searchPlaceholder = "Search",
        createDisabled = false
    }) {
        const settings = getLibraryState(key);
        const searchOpen = Boolean(settings.query);

        return `
            <div class="library-controls" data-library-controls="${escapeHTML(key)}">
                <div class="library-search ${searchOpen ? "expanded" : ""}" data-library-search>
                    <button
                        class="library-control-button library-search-toggle"
                        type="button"
                        data-library-search-toggle
                        aria-label="Search"
                        title="Search"
                        aria-expanded="${searchOpen ? "true" : "false"}"
                    >
                        ${iconImage("search")}
                    </button>
                    <input
                        class="library-search-input"
                        data-library-search-input
                        type="search"
                        value="${escapeAttribute(settings.query)}"
                        placeholder="${escapeAttribute(searchPlaceholder)}"
                        aria-label="${escapeAttribute(searchPlaceholder)}"
                    >
                    <button
                        class="library-search-clear ${settings.query ? "" : "hidden"}"
                        type="button"
                        data-library-search-clear
                        aria-label="Clear search"
                        title="Clear search"
                    >
                        ${iconImage("close")}
                    </button>
                </div>

                <div class="library-control-menu-wrap">
                    <button
                        class="library-control-button"
                        type="button"
                        data-library-view-toggle
                        aria-expanded="false"
                    >
                        <span>View as</span>
                    </button>
                    <div class="library-control-popover hidden" data-library-view-menu>
                        <button type="button" data-library-view="grid" class="${settings.view === "grid" ? "active" : ""}">
                            Grid
                        </button>
                        <button type="button" data-library-view="list" class="${settings.view === "list" ? "active" : ""}">
                            Details
                        </button>
                    </div>
                </div>

                <div class="library-control-menu-wrap">
                    <button
                        class="library-control-button"
                        type="button"
                        data-library-sort-toggle
                        aria-expanded="false"
                    >
                        <span>Sort as</span>
                    </button>
                    <div class="library-control-popover hidden" data-library-sort-menu>
                        <button type="button" data-library-sort="date-latest" class="${settings.sort === "date-latest" ? "active" : ""}">
                            Date — latest
                        </button>
                        <button type="button" data-library-sort="date-oldest" class="${settings.sort === "date-oldest" ? "active" : ""}">
                            Date — oldest
                        </button>
                        <button type="button" data-library-sort="alpha-az" class="${settings.sort === "alpha-az" ? "active" : ""}">
                            Alphabetical — A–Z
                        </button>
                        <button type="button" data-library-sort="alpha-za" class="${settings.sort === "alpha-za" ? "active" : ""}">
                            Alphabetical — Z–A
                        </button>
                    </div>
                </div>

                <button
                    class="create-button library-create-button"
                    type="button"
                    data-library-create
                    ${createDisabled ? "disabled" : ""}
                >
                    ${iconImage("plus")}
                    <span>${escapeHTML(createLabel)}</span>
                </button>
            </div>
        `;
    }

    function initLibraryControls(root = document) {
        if (root.__everyLearnLibraryControlsBound) return;
        root.__everyLearnLibraryControlsBound = true;

        root.addEventListener("click", event => {
            const controls = event.target.closest("[data-library-controls]");
            if (!controls) return;

            const key = controls.dataset.libraryControls;
            const settings = getLibraryState(key);

            const searchToggle = event.target.closest("[data-library-search-toggle]");
            if (searchToggle) {
                const search = controls.querySelector("[data-library-search]");
                const input = controls.querySelector("[data-library-search-input]");
                const expanded = search?.classList.toggle("expanded") || false;
                searchToggle.setAttribute("aria-expanded", String(expanded));
                if (expanded) input?.focus();
                return;
            }

            const clearSearch = event.target.closest("[data-library-search-clear]");
            if (clearSearch) {
                settings.query = "";
                dispatchLibraryRender();
                return;
            }

            const viewToggle = event.target.closest("[data-library-view-toggle]");
            if (viewToggle) {
                togglePopover(controls, "[data-library-view-menu]", viewToggle);
                return;
            }

            const viewOption = event.target.closest("[data-library-view]");
            if (viewOption) {
                settings.view = viewOption.dataset.libraryView === "list" ? "list" : "grid";
                closePopovers(controls);
                dispatchLibraryRender();
                return;
            }

            const sortToggle = event.target.closest("[data-library-sort-toggle]");
            if (sortToggle) {
                togglePopover(controls, "[data-library-sort-menu]", sortToggle);
                return;
            }

            const sortOption = event.target.closest("[data-library-sort]");
            if (sortOption) {
                settings.sort = sortOption.dataset.librarySort || DEFAULT_STATE.sort;
                closePopovers(controls);
                dispatchLibraryRender();
                return;
            }

            const create = event.target.closest("[data-library-create]");
            if (create && !create.disabled) {
                document.dispatchEvent(new CustomEvent(createEventFor(key), {
                    detail: { libraryKey: key }
                }));
            }
        });

        root.addEventListener("input", event => {
            const input = event.target.closest("[data-library-search-input]");
            if (!input) return;

            const controls = input.closest("[data-library-controls]");
            if (!controls) return;

            const key = controls.dataset.libraryControls;
            const settings = getLibraryState(key);
            settings.query = input.value;

            const clear = controls.querySelector("[data-library-search-clear]");
            clear?.classList.toggle("hidden", !settings.query);

            document.dispatchEvent(new CustomEvent("everylearn:library-filter", {
                detail: { key }
            }));
        });

        root.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            const controls = event.target.closest("[data-library-controls]");
            if (!controls) return;
            closePopovers(controls);
        });

        document.addEventListener("click", event => {
            if (event.target.closest("[data-library-controls]")) return;
            document.querySelectorAll("[data-library-controls]").forEach(closePopovers);
        });
    }

    function createEventFor(key) {
        switch (key) {
            case "subjects":
                return "everylearn:create-subject";
            case "notebooks":
                return "everylearn:create-notebook";
            case "subject-notebooks":
                return "everylearn:create-subject-notebook";
            case "bookmarks":
                return "everylearn:create-bookmark";
            default:
                return "everylearn:create-library-item";
        }
    }

    function dispatchLibraryRender() {
        document.dispatchEvent(new Event("everylearn:render"));
    }

    function togglePopover(controls, selector, trigger) {
        const target = controls.querySelector(selector);
        if (!target) return;
        const willOpen = target.classList.contains("hidden");
        closePopovers(controls);
        if (willOpen) {
            target.classList.remove("hidden");
            trigger.setAttribute("aria-expanded", "true");
        }
    }

    function closePopovers(controls) {
        controls.querySelectorAll(".library-control-popover").forEach(popover => {
            popover.classList.add("hidden");
        });
        controls.querySelectorAll("[data-library-view-toggle], [data-library-sort-toggle]").forEach(button => {
            button.setAttribute("aria-expanded", "false");
        });
    }

    function getSortTimestamp(item) {
        if (Number.isFinite(Number(item?.createdAt))) return Number(item.createdAt);
        if (Number.isFinite(Number(item?.updatedAt))) return Number(item.updatedAt);

        const parts = String(item?.id || "").split("_");
        if (parts.length >= 2) {
            const timestamp = Number.parseInt(parts[1], 36);
            if (Number.isFinite(timestamp)) return timestamp;
        }

        return 0;
    }

    function sortLibraryItems(items, settings, getName = item => item?.name || "") {
        const result = [...items];
        const compareName = (a, b) =>
            String(getName(a)).localeCompare(String(getName(b)), undefined, {
                sensitivity: "base",
                numeric: true
            });

        if (settings.sort === "alpha-az") {
            return result.sort(compareName);
        }
        if (settings.sort === "alpha-za") {
            return result.sort((a, b) => compareName(b, a));
        }
        if (settings.sort === "date-oldest") {
            return result.sort((a, b) => getSortTimestamp(a) - getSortTimestamp(b));
        }
        return result.sort((a, b) => getSortTimestamp(b) - getSortTimestamp(a));
    }

    function filterLibraryItems(items, settings, getText = item => item?.name || "") {
        const query = String(settings.query || "").trim().toLowerCase();
        if (!query) return [...items];
        return items.filter(item => String(getText(item) || "").toLowerCase().includes(query));
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

    ns.getLibraryState = getLibraryState;
    ns.renderLibraryControls = renderLibraryControls;
    ns.initLibraryControls = initLibraryControls;
    ns.filterLibraryItems = filterLibraryItems;
    ns.sortLibraryItems = sortLibraryItems;
})(window.everyLearn);
