(function(ns){
    "use strict";
    const state = ns.state;
    const isHome = (...args) => ns.isHome(...args);
    const openWorkspace = (...args) => ns.openWorkspace(...args);
    const listSubjects = (...args) => ns.listSubjects(...args);
    const createSubject = (...args) => ns.createSubject(...args);
    const updateSubject = (...args) => ns.updateSubject(...args);
    const deleteSubject = (...args) => ns.deleteSubject(...args);
    const listNotebooks = (...args) => ns.listNotebooks(...args);
    const createNotebookRecord = (...args) => ns.createNotebookRecord(...args);
    const updateNotebook = (...args) => ns.updateNotebook(...args);
    const deleteNotebook = (...args) => ns.deleteNotebook(...args);
    const renderSubjectGrid = (...args) => ns.renderSubjectGrid(...args);
    const renderNotebookGrid = (...args) => ns.renderNotebookGrid(...args);
    const renderCreateSubjectCard = (...args) => ns.renderCreateSubjectCard(...args);
    const renderCreateNotebookCard = (...args) => ns.renderCreateNotebookCard(...args);
    const PREDEFINED_SUBJECTS = ns.PREDEFINED_SUBJECTS;
    const colorToLight = (...args) => ns.colorToLight(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
/*
=============================================================
everyLearn — Home Shell
=============================================================
*/















function initHome() {
    document.getElementById("subjectGrid")
        ?.addEventListener(
            "click",
            onSubjectClick
        );

    document.getElementById("notebookGrid")
        ?.addEventListener(
            "click",
            onNotebookClick
        );

    document.addEventListener(
        "everylearn:create-subject",
        () => openSubjectEditor()
    );

    document.addEventListener(
        "everylearn:create-notebook",
        () => openNotebookEditor()
    );

    document.addEventListener(
        "everylearn:open-notebook-editor",
        event =>
            openNotebookEditor(
                event.detail?.subjectId || null
            )
    );

    document.addEventListener(
        "everylearn:edit-subject",
        event =>
            openSubjectEditor(
                event.detail.subject
            )
    );

    document.addEventListener(
        "everylearn:delete-subject",
        event =>
            removeSubject(
                event.detail.subjectId
            )
    );
}

function renderHome() {
    const view =
        document.getElementById(
            "homeView"
        );

    if (!view) return;

    view.classList.toggle(
        "hidden",
        !isHome()
    );

    if (!isHome()) return;

    const filteredSubject =
        state.homeSubjectFilterId
            ? listSubjects().find(
                subject =>
                    subject.id ===
                    state.homeSubjectFilterId
            )
            : null;

    const subjectsSection =
        document.getElementById(
            "subjectsSection"
        );

    const notebookHeading =
        document.getElementById(
            "notebooksHeading"
        );

    const notebookDescription =
        document.getElementById(
            "notebooksDescription"
        );

    const homeTitle =
        document.getElementById(
            "homeTitle"
        );

    const homeSubtitle =
        document.getElementById(
            "homeSubtitle"
        );

    const headerActions =
        document.getElementById(
            "homeHeaderActions"
        );

    if (filteredSubject) {
        subjectsSection?.classList.add(
            "hidden"
        );

        homeTitle.textContent =
            filteredSubject.name;

        homeSubtitle.textContent =
            "Notebooks linked to this subject.";

        notebookHeading.textContent =
            "Notebooks";

        notebookDescription.textContent =
            `All notebooks under ${filteredSubject.name}.`;

        headerActions.innerHTML = `
            <button
                class="secondary-button"
                type="button"
                data-subject-home
            >
                ← All subjects
            </button>

            <button
                class="create-button"
                type="button"
                data-home-new-notebook
            >
                ＋ New notebook
            </button>
        `;

        headerActions
            .querySelector(
                "[data-subject-home]"
            )
            .onclick = () => {
                state.homeSubjectFilterId =
                    null;

                renderHome();
            };

        headerActions
            .querySelector(
                "[data-home-new-notebook]"
            )
            .onclick = () =>
            document.dispatchEvent(
                new Event(
                    "everylearn:create-notebook"
                )
            );
    } else {
        subjectsSection?.classList.remove(
            "hidden"
        );

        homeTitle.textContent =
            "everyLearnNotebook";

        homeSubtitle.textContent =
            "Your learning workspace.";

        notebookHeading.textContent =
            "Notebooks";

        notebookDescription.textContent =
            "Create notebooks with an optional subject.";

        headerActions.innerHTML = `
            <button
                class="create-button"
                type="button"
                data-home-new-notebook
            >
                ＋ New notebook
            </button>
        `;

        headerActions
            .querySelector(
                "[data-home-new-notebook]"
            )
            .onclick = () =>
            document.dispatchEvent(
                new Event(
                    "everylearn:create-notebook"
                )
            );
    }

    renderCreateSubjectCard();
    renderCreateNotebookCard();

    if (!filteredSubject) {
        renderSubjectGrid(
            listSubjects()
        );
    } else {
        const subjectGrid =
            document.getElementById(
                "subjectGrid"
            );

        if (subjectGrid) {
            subjectGrid.innerHTML = "";
        }
    }

    const notebooks =
        filteredSubject
            ? listNotebooks().filter(
                notebook =>
                    notebook.subjectId ===
                    filteredSubject.id
            )
            : listNotebooks();

    renderNotebookGrid(
        notebooks
    );
}

function onSubjectClick(event) {
    const create =
        event.target.closest(
            "[data-create-subject]"
        );

    if (create) {
        openSubjectEditor();
        return;
    }

    const edit =
        event.target.closest(
            "[data-edit-subject]"
        );

    if (edit) {
        event.stopPropagation();

        const subject =
            listSubjects().find(
                item =>
                    item.id ===
                    edit.dataset.editSubject
            );

        if (subject) {
            openSubjectEditor(subject);
        }

        return;
    }

    const del =
        event.target.closest(
            "[data-delete-subject]"
        );

    if (del) {
        event.stopPropagation();
        removeSubject(
            del.dataset.deleteSubject
        );
        return;
    }

    const card =
        event.target.closest(
            "[data-subject-card]"
        );

    if (card) {
        state.homeSubjectFilterId =
            card.dataset.subjectCard;

        renderHome();
    }
}

function onNotebookClick(event) {
    const create =
        event.target.closest(
            "[data-create-notebook]"
        );

    if (create) {
        openNotebookEditor();
        return;
    }

    const card =
        event.target.closest(
            "[data-notebook-card]"
        );

    if (card) {
        openWorkspace(
            card.dataset.notebookCard
        );

        document.dispatchEvent(
            new Event(
                "everylearn:render"
            )
        );
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
})(window.everyLearn);
