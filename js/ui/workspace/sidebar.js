(function(ns){
    "use strict";
    const state = ns.state;
    const getSubject = (...args) => ns.getSubject(...args);
    const openDialog = (...args) => ns.openDialog(...args);
    const updateNotebook = (...args) => ns.updateNotebook(...args);
    const deleteNotebook = (...args) => ns.deleteNotebook(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const openNotebooksPage = (...args) => ns.openNotebooksPage(...args);
/* everyLearn — Workspace Sidebar */





function renderSidebar(notebook) {
    const header =
        document.getElementById(
            "workspaceSidebarHeader"
        );

    if (!header) return;

    const subject =
        notebook.subjectId
            ? getSubject(notebook.subjectId)
            : null;

    header.innerHTML = `
        <div class="sidebar-header-title">
            ${escapeHTML(notebook.name)}
        </div>

        <div class="sidebar-header-subtitle">
            ${subject ? escapeHTML(subject.name) : "No subject"}
        </div>

        <div class="sidebar-header-actions">
            ${window.everyLearn.renderItemActionMenu("notebook", notebook.id, { label: notebook.name })}
        </div>
    `;

    ensureSidebarResizer();

}

function openNotebookEdit(notebook) {
    openDialog({
        title: "Edit notebook",
        bodyHTML: `
            <div class="form-grid">

                <div class="form-group full">
                    <label>
                        Notebook name
                    </label>

                    <input
                        class="field-input"
                        id="workspaceNotebookName"
                        value="${escapeHTML(
                            notebook.name
                        )}"
                    >
                </div>

                <div class="form-group">
                    <label>
                        Color
                    </label>

                    <input
                        id="workspaceNotebookColor"
                        type="color"
                        value="${
                            notebook.color ||
                            "#2563EB"
                        }"
                    >
                </div>

                <div class="form-group">
                    <label>
                        Subject
                    </label>

                    <select
                        class="field-select"
                        id="workspaceNotebookSubject"
                    >
                        <option value="">
                            None
                        </option>

                        ${
                            window.everyLearnSubjects
                                ?.map(
                                    subject =>
                                        `
                                            <option
                                                value="${subject.id}"
                                                ${
                                                    subject.id ===
                                                    notebook.subjectId
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escapeHTML(
                                                    subject.name
                                                )}
                                            </option>
                                        `
                                )
                                .join("") || ""
                        }
                    </select>
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
                class="save-button"
                data-dialog-save
            >
                <img src="./assets/icons/ui/bookmark.svg" alt=""> Save
            </button>
        `,
        onOpen: ({ host, close }) => {
            host.querySelector(
                "[data-dialog-cancel]"
            ).onclick = close;

            host.querySelector(
                "[data-dialog-save]"
            ).onclick = () => {
                updateNotebook(
                    notebook.id,
                    {
                        name:
                            host.querySelector(
                                "#workspaceNotebookName"
                            ).value.trim(),

                        color:
                            host.querySelector(
                                "#workspaceNotebookColor"
                            ).value,

                        subjectId:
                            host.querySelector(
                                "#workspaceNotebookSubject"
                            ).value ||
                            null
                    }
                );

                close();
                document.dispatchEvent(
                    new Event("everylearn:render")
                );
            };
        }
    });
}


function ensureSidebarResizer() {
    const sidebar =
        document.getElementById(
            "workspaceSidebar"
        );

    if (!sidebar) return;

    const root =
        document.documentElement;

    const saved =
        Number(
            localStorage.getItem(
                "everyLearnNotebook.sidebarWidth"
            )
        );

    const initialWidth =
        Number.isFinite(saved) &&
        saved >= 220 &&
        saved <= 520
            ? saved
            : 320;

    root.style.setProperty(
        "--workspace-sidebar-width",
        `${initialWidth}px`
    );

    if (
        sidebar.querySelector(
            "[data-sidebar-resizer]"
        )
    ) {
        return;
    }

    const resizer =
        document.createElement(
            "div"
        );

    resizer.className =
        "workspace-sidebar-resizer";

    resizer.dataset.sidebarResizer =
        "true";

    resizer.title =
        "Drag to resize sidebar";

    sidebar.appendChild(
        resizer
    );

    let startX = 0;
    let startWidth = initialWidth;

    resizer.addEventListener(
        "pointerdown",
        event => {
            if (
                window.matchMedia(
                    "(max-width: 1100px)"
                ).matches
            ) {
                return;
            }

            startX =
                event.clientX;

            startWidth =
                parseInt(
                    getComputedStyle(
                        root
                    ).getPropertyValue(
                        "--workspace-sidebar-width"
                    ),
                    10
                ) ||
                initialWidth;

            resizer.setPointerCapture(
                event.pointerId
            );

            document.body.classList.add(
                "sidebar-resizing"
            );
        }
    );

    resizer.addEventListener(
        "pointermove",
        event => {
            if (
                !resizer.hasPointerCapture(
                    event.pointerId
                )
            ) {
                return;
            }

            const nextWidth =
                Math.max(
                    220,
                    Math.min(
                        520,
                        startWidth +
                            (
                                event.clientX -
                                startX
                            )
                    )
                );

            root.style.setProperty(
                "--workspace-sidebar-width",
                `${nextWidth}px`
            );
        }
    );

    resizer.addEventListener(
        "pointerup",
        event => {
            if (
                resizer.hasPointerCapture(
                    event.pointerId
                )
            ) {
                resizer.releasePointerCapture(
                    event.pointerId
                );
            }

            const current =
                parseInt(
                    getComputedStyle(
                        root
                    ).getPropertyValue(
                        "--workspace-sidebar-width"
                    ),
                    10
                ) ||
                initialWidth;

            localStorage.setItem(
                "everyLearnNotebook.sidebarWidth",
                String(
                    current
                )
            );

            document.body.classList.remove(
                "sidebar-resizing"
            );
        }
    );

    resizer.addEventListener(
        "lostpointercapture",
        () =>
            document.body.classList.remove(
                "sidebar-resizing"
            )
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.renderSidebar = renderSidebar;
    ns.openNotebookEdit = openNotebookEdit;
})(window.everyLearn);
