(function(ns){
    "use strict";
    const state = ns.state;
    const ROUTES = ns.ROUTES;
    const isHome = (...args) => ns.isHome(...args);
    const openWorkspace = (...args) => ns.openWorkspace(...args);
    const openSubjectsPage = (...args) => ns.openSubjectsPage(...args);
    const openNotebooksPage = (...args) => ns.openNotebooksPage(...args);
    const openSubjectPage = (...args) => ns.openSubjectPage(...args);
    const goHome = (...args) => ns.goHome(...args);
    const listSubjects = (...args) => ns.listSubjects(...args);
    const createSubject = (...args) => ns.createSubject(...args);
    const updateSubject = (...args) => ns.updateSubject(...args);
    const deleteSubject = (...args) => ns.deleteSubject(...args);
    const listNotebooks = (...args) => ns.listNotebooks(...args);
    const createNotebookRecord = (...args) => ns.createNotebookRecord(...args);
    const renderSubjectGrid = (...args) => ns.renderSubjectGrid(...args);
    const renderNotebookGrid = (...args) => ns.renderNotebookGrid(...args);
    const renderCreateSubjectCard = (...args) => ns.renderCreateSubjectCard(...args);
    const renderCreateNotebookCard = (...args) => ns.renderCreateNotebookCard(...args);
    const PREDEFINED_SUBJECTS = ns.PREDEFINED_SUBJECTS;
    const colorToLight = (...args) => ns.colorToLight(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const getLibraryState = (...args) => ns.getLibraryState(...args);
    const renderLibraryControls = (...args) => ns.renderLibraryControls(...args);
    const initLibraryControls = (...args) => ns.initLibraryControls(...args);
    const filterLibraryItems = (...args) => ns.filterLibraryItems(...args);
    const sortLibraryItems = (...args) => ns.sortLibraryItems(...args);
    const renderBookmarkLibrary = (...args) => ns.renderBookmarkLibrary(...args);
    const openBookmarkEditor = (...args) => ns.openBookmarkEditor(...args);
/*
=============================================================
everyLearn — Home / Library Pages
=============================================================
*/

function isLibraryRoute() {
    return [
        ROUTES.HOME,
        ROUTES.SUBJECTS,
        ROUTES.NOTEBOOKS,
        ROUTES.SUBJECT,
        ROUTES.BOOKMARKS
    ].includes(state.route);
}

function setSectionAction(sectionId, label, handler) {
    const section = document.getElementById(sectionId);
    const header = section?.querySelector('.section-header');
    if (!header) return;

    let actions = header.querySelector('[data-section-actions]');
    if (!actions) {
        actions = document.createElement('div');
        actions.dataset.sectionActions = 'true';
        actions.className = 'view-header-actions';
        header.appendChild(actions);
    }

    actions.innerHTML = `
        <button class="secondary-button small-button" type="button" data-section-link>
            ${escapeHTML(label)}
        </button>
    `;
    actions.querySelector('[data-section-link]').onclick = handler;
}

function clearSectionAction(sectionId) {
    document.getElementById(sectionId)
        ?.querySelector('[data-section-actions]')
        ?.remove();
}

function initHome() {
    document.getElementById("subjectGrid")?.addEventListener("click", onSubjectClick);
    document.getElementById("notebookGrid")?.addEventListener("click", onNotebookClick);
    document.getElementById("bookmarkGrid")?.addEventListener("click", onBookmarkClick);

    document.addEventListener("everylearn:create-subject", () => openSubjectEditor());
    document.addEventListener("everylearn:create-notebook", () => openNotebookEditor());
    document.addEventListener("everylearn:create-subject-notebook", () => {
        if (state.route === ROUTES.SUBJECT && state.subjectPageId) {
            openNotebookEditor(state.subjectPageId);
        }
    });
    document.addEventListener("everylearn:create-bookmark", () => openBookmarkEditor({ libraryMode: true }));
    document.addEventListener("everylearn:open-notebook-editor", event => openNotebookEditor(event.detail?.subjectId || null));
    document.addEventListener("everylearn:edit-subject", event => openSubjectEditor(event.detail.subject));
    document.addEventListener("everylearn:delete-subject", event => removeSubject(event.detail.subjectId));
    document.addEventListener("everylearn:library-filter", event => {
        const key = event.detail?.key;
        if (!key) return;
        renderHome();
        requestAnimationFrame(() => {
            const input = document.querySelector(`[data-library-controls="${CSS.escape(key)}"] [data-library-search-input]`);
            if (!input) return;
            input.focus();
            const end = input.value.length;
            input.setSelectionRange(end, end);
        });
    });

    initLibraryControls(document);
}

function renderHome() {
    const view = document.getElementById("homeView");
    const bookmarksView = document.getElementById("bookmarksView");
    if (!view || !bookmarksView) return;

    const libraryActive = isLibraryRoute();
    view.classList.toggle("hidden", !libraryActive || state.route === ROUTES.BOOKMARKS);
    bookmarksView.classList.toggle("hidden", state.route !== ROUTES.BOOKMARKS);

    if (!libraryActive) return;

    const subjectsSection = document.getElementById("subjectsSection");
    const notebooksSection = document.getElementById("notebooksSection");
    const notebookHeading = document.getElementById("notebooksHeading");
    const notebookDescription = document.getElementById("notebooksDescription");
    const homeTitle = document.getElementById("homeTitle");
    const homeSubtitle = document.getElementById("homeSubtitle");
    const headerActions = document.getElementById("homeHeaderActions");

    headerActions.innerHTML = "";
    document.getElementById("subjectsControls").innerHTML = "";
    document.getElementById("notebooksControls").innerHTML = "";

    const allSubjects = listSubjects();
    const allNotebooks = listNotebooks();

    if (state.route === ROUTES.BOOKMARKS) {
        renderBookmarksPage();
        return;
    }

    if (state.route === ROUTES.HOME) {
        homeTitle.textContent = "everyLearnNotebook";
        homeSubtitle.textContent = "Your learning workspace.";
        subjectsSection?.classList.remove("hidden");
        notebooksSection?.classList.remove("hidden");
        notebookHeading.textContent = "Notebooks";
        notebookDescription.textContent = "Create notebooks with an optional subject.";

        setSectionAction("subjectsSection", "View all subjects", () => {
            openSubjectsPage();
            document.dispatchEvent(new Event("everylearn:render"));
        });
        setSectionAction("notebooksSection", "View all notebooks", () => {
            openNotebooksPage();
            document.dispatchEvent(new Event("everylearn:render"));
        });

        renderCreateSubjectCard();
        renderCreateNotebookCard();
        renderSubjectGrid(allSubjects);
        renderNotebookGrid(allNotebooks);
        return;
    }

    if (state.route === ROUTES.SUBJECTS) {
        homeTitle.textContent = "All subjects";
        homeSubtitle.textContent = "Every subject in your everyLearnNotebook.";
        subjectsSection?.classList.remove("hidden");
        notebooksSection?.classList.add("hidden");
        clearSectionAction("subjectsSection");

        document.getElementById("subjectsControls").innerHTML = renderLibraryControls({
            key: "subjects",
            createLabel: "New Subject",
            searchPlaceholder: "Search subjects"
        });

        const settings = getLibraryState("subjects");
        let subjects = filterLibraryItems(
            allSubjects,
            settings,
            subject => `${subject.name}`
        );
        subjects = sortLibraryItems(subjects, settings);
        renderSubjectGrid(subjects, { view: settings.view, showCreateCard: false });
        return;
    }

    if (state.route === ROUTES.NOTEBOOKS) {
        homeTitle.textContent = "All notebooks";
        homeSubtitle.textContent = "Every notebook in your everyLearnNotebook.";
        subjectsSection?.classList.add("hidden");
        notebooksSection?.classList.remove("hidden");
        notebookHeading.textContent = "Notebooks";
        notebookDescription.textContent = "All notebooks across every subject.";
        clearSectionAction("notebooksSection");

        document.getElementById("notebooksControls").innerHTML = renderLibraryControls({
            key: "notebooks",
            createLabel: "New Notebook",
            searchPlaceholder: "Search notebooks"
        });

        const settings = getLibraryState("notebooks");
        let notebooks = filterLibraryItems(
            allNotebooks,
            settings,
            notebook => `${notebook.name} ${notebook.description || ""} ${ns.getSubject(notebook.subjectId)?.name || ""}`
        );
        notebooks = sortLibraryItems(notebooks, settings);
        renderNotebookGrid(notebooks, { view: settings.view, showCreateCard: false });
        return;
    }

    const subject = allSubjects.find(item => item.id === state.subjectPageId);
    if (!subject) {
        openSubjectsPage();
        renderHome();
        return;
    }

    homeTitle.textContent = subject.name;
    homeSubtitle.textContent = "Subject page";
    headerActions.innerHTML = `
        <button class="secondary-button" type="button" data-subject-back>← All subjects</button>
        ${ns.renderItemActionMenu("subject", subject.id, { label: subject.name })}
    `;
    headerActions.querySelector('[data-subject-back]').onclick = () => {
        openSubjectsPage();
        document.dispatchEvent(new Event("everylearn:render"));
    };

    subjectsSection?.classList.add("hidden");
    notebooksSection?.classList.remove("hidden");
    notebookHeading.textContent = "Notebooks";
    notebookDescription.textContent = `Notebooks linked to ${subject.name}.`;
    clearSectionAction("notebooksSection");

    document.getElementById("notebooksControls").innerHTML = renderLibraryControls({
        key: "subject-notebooks",
        createLabel: "New Notebook",
        searchPlaceholder: `Search ${subject.name} notebooks`
    });

    const settings = getLibraryState("subject-notebooks");
    let notebooks = allNotebooks.filter(notebook => notebook.subjectId === subject.id);
    notebooks = filterLibraryItems(
        notebooks,
        settings,
        notebook => `${notebook.name} ${notebook.description || ""}`
    );
    notebooks = sortLibraryItems(notebooks, settings);
    renderNotebookGrid(notebooks, { view: settings.view, showCreateCard: false });
}

function renderBookmarksPage() {
    const settings = getLibraryState("bookmarks");
    const controls = document.getElementById("bookmarksControls");
    if (!controls) return;

    controls.innerHTML = renderLibraryControls({
        key: "bookmarks",
        createLabel: "New Bookmark",
        searchPlaceholder: "Search bookmarks"
    });

    renderBookmarkLibrary({
        view: settings.view,
        sort: settings.sort,
        query: settings.query
    });
}

function onBookmarkClick(event) {
    const remove = event.target.closest("[data-delete-library-bookmark]");
    if (remove) {
        event.stopPropagation();
        ns.deleteBookmarkFromLibrary?.(remove.dataset.deleteLibraryBookmark);
        return;
    }

    const open = event.target.closest("[data-open-library-bookmark]");
    if (open) {
        ns.openBookmarkLocationById?.(open.dataset.openLibraryBookmark);
    }
}

function onSubjectClick(event) {
    if (event.target.closest("[data-item-menu]")) return;

    const create = event.target.closest("[data-create-subject]");
    if (create) {
        openSubjectEditor();
        return;
    }

    const card = event.target.closest("[data-subject-card]");
    if (card) {
        openSubjectPage(card.dataset.subjectCard);
        document.dispatchEvent(new Event("everylearn:render"));
    }
}

function onNotebookClick(event) {
    if (event.target.closest("[data-item-menu]")) return;

    const create = event.target.closest("[data-create-notebook]");
    if (create) {
        openNotebookEditor();
        return;
    }

    const card = event.target.closest("[data-notebook-card]");
    if (card) {
        openWorkspace(card.dataset.notebookCard);
        document.dispatchEvent(new Event("everylearn:render"));
    }
}

function openSubjectEditor(
    subject = null
) {
    const editing =
        Boolean(subject);

    openDialog({
        title:
            editing
                ? "Edit subject"
                : "Create subject",
        bodyHTML: `
            <div class="form-grid">

                ${
                    editing
                        ? ""
                        : `
                            <div class="form-group full">
                                <label>
                                    Predefined subject
                                </label>

                                <select
                                    class="field-select"
                                    id="subjectPreset"
                                >
                                    <option value="">
                                        Custom subject
                                    </option>

                                    ${
                                        PREDEFINED_SUBJECTS.map(
                                            item =>
                                                `
                                                    <option
                                                        value="${item.key}"
                                                    >
                                                        ${escapeHTML(item.name)}
                                                    </option>
                                                `
                                        ).join("")
                                    }
                                </select>
                            </div>
                        `
                }

                <div class="form-group full">
                    <label>
                        Subject name
                    </label>

                    <input
                        class="field-input"
                        id="subjectName"
                        value="${escapeHTML(
                            subject?.name || ""
                        )}"
                        placeholder="Subject name"
                    >
                </div>

                <div class="form-group">
                    <label>
                        Icon
                    </label>

                    <input
                        class="field-input"
                        id="subjectIcon"
                        maxlength="4"
                        value="${escapeHTML(
                            subject?.icon || ""
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>
                        Color
                    </label>

                    <input
                        type="color"
                        id="subjectColor"
                        value="${
                            subject?.color ||
                            "#2563EB"
                        }"
                    >
                </div>
            </div>
        `,
        footerHTML: `
            <button
                class="secondary-button"
                data-dialog-cancel
            >
                Cancel
            </button>

            <button
                class="${
                    editing
                        ? "edit-button"
                        : "create-button"
                }"
                data-dialog-save
            >
                ${
                    editing
                        ? "Save"
                        : "Create"
                }
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "#subjectPreset"
            )?.addEventListener(
                "change",
                event => {
                    const preset =
                        PREDEFINED_SUBJECTS.find(
                            item =>
                                item.key ===
                                event.target.value
                        );

                    if (!preset) return;

                    host.querySelector(
                        "#subjectName"
                    ).value = preset.name;

                    host.querySelector(
                        "#subjectIcon"
                    ).value = preset.icon;

                    host.querySelector(
                        "#subjectColor"
                    ).value = preset.color;
                }
            );

            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = () => {
                try {
                    const name =
                        host.querySelector(
                            "#subjectName"
                        ).value.trim();

                    const icon =
                        host.querySelector(
                            "#subjectIcon"
                        ).value.trim() ||
                        "•";

                    const color =
                        host.querySelector(
                            "#subjectColor"
                        ).value;

                    if (editing) {
                        updateSubject(
                            subject.id,
                            {
                                name,
                                icon,
                                color,
                                light:
                                    colorToLight(color)
                            }
                        );
                    } else {
                        createSubject({
                            name,
                            icon,
                            color,
                            light:
                                colorToLight(color)
                        });
                    }

                    close();
                    renderHome();
                } catch (error) {
                    showToast({
                        message:
                            error.message,
                        type: "error"
                    });
                }
            };
        }
    });
}

function openNotebookEditor(
    preferredSubjectId = null
) {
    const subjects =
        listSubjects();

    openDialog({
        title: "Create notebook",
        bodyHTML: `
            <div class="form-grid">

                <div class="form-group full">
                    <label>
                        Notebook name
                    </label>

                    <input
                        class="field-input"
                        id="notebookName"
                        placeholder="Mid-term, Rough work, SQPs..."
                    >
                </div>

                <div class="form-group">
                    <label>
                        Subject (optional)
                    </label>

                    <select
                        class="field-select"
                        id="notebookSubject"
                    >
                        <option value="">
                            None
                        </option>

                        ${
                            subjects.map(
                                subject =>
                                    `
                                        <option
                                            value="${subject.id}"
                                            ${
                                                subject.id ===
                                                preferredSubjectId
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${escapeHTML(
                                                subject.name
                                            )}
                                        </option>
                                    `
                            ).join("")
                        }
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        Color
                    </label>

                    <input
                        type="color"
                        id="notebookColor"
                        value="#2563EB"
                    >
                </div>

                <div class="form-group full">
                    <label>
                        Description
                    </label>

                    <textarea
                        class="field-textarea"
                        id="notebookDescription"
                        placeholder="Optional"
                    ></textarea>
                </div>

            </div>
        `,
        footerHTML: `
            <button
                class="secondary-button"
                data-dialog-cancel
            >
                Cancel
            </button>

            <button
                class="create-button"
                data-dialog-save
            >
                ＋ Create notebook
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = () => {
                const color =
                    host.querySelector(
                        "#notebookColor"
                    ).value;

                try {
                    const notebook =
                        createNotebookRecord({
                            name:
                                host.querySelector(
                                    "#notebookName"
                                ).value,
                            subjectId:
                                host.querySelector(
                                    "#notebookSubject"
                                ).value ||
                                null,
                            color,
                            light:
                                colorToLight(
                                    color
                                ),
                            description:
                                host.querySelector(
                                    "#notebookDescription"
                                ).value
                        });

                    close();

                    openWorkspace(
                        notebook.id
                    );

                    document.dispatchEvent(
                        new Event(
                            "everylearn:render"
                        )
                    );
                } catch (error) {
                    showToast({
                        message:
                            error.message,
                        type: "error"
                    });
                }
            };
        }
    });
}

async function removeSubject(id) {
    const subject =
        listSubjects().find(
            item => item.id === id
        );

    if (!subject) return;

    const linked =
        listNotebooks().filter(
            notebook =>
                notebook.subjectId === id
        );

    const confirmed =
        await confirmAction({
            title: "Delete subject?",
            message:
                linked.length
                    ? `"${subject.name}" has ${linked.length} linked notebook${linked.length === 1 ? "" : "s"}. Deleting it will also delete those linked notebooks.`
                    : `Delete "${subject.name}"?`,
            confirmText:
                "Delete subject"
        });

    if (!confirmed) return;

    deleteSubject(id);
    renderHome();

    showToast({
        message: "Subject deleted.",
        type: "success"
    });
}

function openSubjectNotebooks(
    subjectId
) {
    const subject =
        listSubjects().find(
            item => item.id === subjectId
        );

    if (!subject) return;

    const notebooks =
        listNotebooks().filter(
            notebook =>
                notebook.subjectId ===
                subjectId
        );

    openDialog({
        title:
            `${subject.icon || "•"} ${subject.name}`,
        bodyHTML: `
            <div class="stack">

                <p class="muted">
                    These are the notebooks linked to this subject.
                    Subject notebooks are not a separate notebook type.
                </p>

                ${
                    notebooks.length
                        ? notebooks.map(
                            notebook =>
                                `
                                    <button
                                        class="location-result"
                                        data-open-notebook="${notebook.id}"
                                        type="button"
                                    >
                                        <div class="result-title">
                                            ${escapeHTML(
                                                notebook.name
                                            )}
                                        </div>

                                        <div class="result-path">
                                            ${
                                                notebook.description
                                                    ? escapeHTML(
                                                        notebook.description
                                                    )
                                                    : "Notebook"
                                            }
                                        </div>
                                    </button>
                                `
                        ).join("")
                        : `
                            <div class="empty-state">
                                <strong>
                                    No notebooks linked
                                </strong>

                                Create a notebook and optionally
                                select this subject.
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

            <button
                class="create-button"
                data-create-linked
            >
                ＋ Create notebook
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-create-linked]"
            ).onclick = () => {
                close();
                openNotebookEditor(
                    subjectId
                );
            };

            host.querySelectorAll(
                "[data-open-notebook]"
            ).forEach(
                button =>
                    button.onclick = () => {
                        close();
                        openWorkspace(
                            button.dataset.openNotebook
                        );

                        document.dispatchEvent(
                            new Event(
                                "everylearn:render"
                            )
                        );
                    }
            );
        }
    });
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.initHome = initHome;
    ns.renderHome = renderHome;
    ns.openSubjectEditor = openSubjectEditor;
})(window.everyLearn);
