(function(ns){
    "use strict";

    const state = ns.state;

    const addSection =
        (...args) => ns.addSection(...args);

    const addChapter =
        (...args) => ns.addChapter(...args);

    const addTopic =
        (...args) => ns.addTopic(...args);

    const updateSection =
        (...args) => ns.updateSection(...args);

    const updateChapter =
        (...args) => ns.updateChapter(...args);

    const updateTopic =
        (...args) => ns.updateTopic(...args);

    const deleteSection =
        (...args) => ns.deleteSection(...args);

    const deleteChapter =
        (...args) => ns.deleteChapter(...args);

    const deleteTopic =
        (...args) => ns.deleteTopic(...args);

    const confirmAction =
        (...args) => ns.confirmAction(...args);

    const showToast =
        (...args) => ns.showToast(...args);

    /*
    =============================================================
    everyLearnNotebook — Hierarchy Tree
    -------------------------------------------------------------
    The hierarchy is always shown first.

    Creation controls are intentionally hidden by default.
    A single "Add" toggle reveals the three creation panels
    underneath the existing hierarchy.
    =============================================================
    */

    function renderHierarchyTree(notebook) {
        const tree =
            document.getElementById(
                "hierarchyTree"
            );

        if (!tree) return;

        state.ui =
            state.ui || {};

        if (
            typeof state.ui.hierarchyCreateOpen !==
            "boolean"
        ) {
            state.ui.hierarchyCreateOpen =
                false;
        }

        const hasSections =
            Array.isArray(
                notebook.sections
            ) &&
            notebook.sections.length > 0;

        const rootChapters =
            Array.isArray(
                notebook.rootChapters
            )
                ? notebook.rootChapters
                : [];

        const hasAnyHierarchy =
            hasSections ||
            rootChapters.length > 0;

        tree.innerHTML = `
            <div class="tree-content">

                ${
                    hasAnyHierarchy
                        ? `
                            ${
                                hasSections
                                    ? notebook.sections
                                        .map(
                                            section =>
                                                renderSection(
                                                    section
                                                )
                                        )
                                        .join("")
                                    : ""
                            }

                            ${
                                rootChapters.length
                                    ? `
                                        <div class="tree-root-chapters">
                                            ${rootChapters
                                                .map(
                                                    chapter =>
                                                        renderRootChapter(
                                                            chapter
                                                        )
                                                )
                                                .join("")}
                                        </div>
                                    `
                                    : ""
                            }
                        `
                        : `
                            <div class="empty-state">
                                <strong>
                                    No hierarchy yet
                                </strong>

                                Use Add below to create your
                                first section, chapter or topic.
                            </div>
                        `
                }

            </div>

            <div class="hierarchy-create-toggle">
                <button
                    class="secondary-button hierarchy-add-toggle"
                    data-toggle-create
                    type="button"
                    aria-expanded="${
                        state.ui.hierarchyCreateOpen
                            ? "true"
                            : "false"
                    }"
                >
                    ${
                        state.ui.hierarchyCreateOpen
                            ? "− Hide add controls"
                            : "＋ Add section, chapter or topic"
                    }
                </button>
            </div>

            <div
                class="hierarchy-create-panels ${
                    state.ui.hierarchyCreateOpen
                        ? ""
                        : "hidden"
                }"
                data-create-panels
            >

                ${renderCreateSectionPanel()}

                ${renderCreateChapterPanel(
                    notebook
                )}

                ${renderCreateTopicPanel(
                    notebook
                )}

            </div>
        `;

        bindToggle(tree);
        bindCreateButtons(
            tree,
            notebook
        );
        bindTreeActions(
            tree,
            notebook
        );
        bindTopicSelection(
            tree
        );
    }

    function renderSection(section) {
        return `
            <div class="tree-section">
                <div class="tree-label">
                    <span>${escapeHTML(section.name)}</span>
                    ${ns.renderItemActionMenu("section", section.id, { label: section.name })}
                </div>
                <div class="tree-chapters">
                    ${(section.chapters || []).map(chapter => renderChapter(chapter)).join("")}
                </div>
            </div>
        `;
    }

    function renderRootChapter(chapter) {
        return `
            <div class="tree-root-chapter">
                <div class="tree-item-wrap">
                    <div class="tree-item tree-chapter-label">${escapeHTML(chapter.name)}</div>
                    ${ns.renderItemActionMenu("chapter", chapter.id, { label: chapter.name })}
                </div>
                <div class="tree-topics">
                    ${(chapter.topics || []).map(topic => renderTopic(topic)).join("")}
                </div>
            </div>
        `;
    }

    function renderChapter(chapter) {
        return `
            <div class="tree-chapter">
                <div class="tree-item-wrap">
                    <div class="tree-item tree-chapter-label">${escapeHTML(chapter.name)}</div>
                    ${ns.renderItemActionMenu("chapter", chapter.id, { label: chapter.name })}
                </div>
                <div class="tree-topics">
                    ${(chapter.topics || []).map(topic => renderTopic(topic)).join("")}
                </div>
            </div>
        `;
    }

    function renderTopic(topic) {
        return `
            <div class="tree-item-wrap">
                <button
                    class="tree-item ${topic.id === state.topicId ? "active" : ""}"
                    data-topic="${topic.id}"
                    type="button"
                >
                    ${escapeHTML(topic.name)}
                </button>
                ${ns.renderItemActionMenu("topic", topic.id, { label: topic.name })}
            </div>
        `;
    }

    function renderCreateSectionPanel() {
        return `
            <section
                class="hierarchy-create-card"
                data-create-card="section"
            >
                <div class="hierarchy-create-title">
                    New section
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Section name
                    </label>

                    <input
                        class="field-input"
                        data-create-section-name
                        placeholder="Section name"
                    >
                </div>

                <div class="hierarchy-create-actions">
                    <button
                        class="create-button"
                        data-create-section-save
                        type="button"
                    >
                        <img
                            src="./assets/icons/ui/plus.svg"
                            alt=""
                        >
                        Create
                    </button>

                    <button
                        class="secondary-button"
                        data-create-section-cancel
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </section>
        `;
    }

    function renderCreateChapterPanel(
        notebook
    ) {
        const sections =
            notebook.sections || [];

        return `
            <section
                class="hierarchy-create-card"
                data-create-card="chapter"
            >
                <div class="hierarchy-create-title">
                    New chapter
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Section
                        <span class="optional-label">
                            (optional)
                        </span>
                    </label>

                    <select
                        class="field-select"
                        data-create-chapter-section
                    >
                        <option value="">
                            No section — root
                        </option>

                        ${
                            sections
                                .map(
                                    section =>
                                        `
                                            <option
                                                value="${section.id}"
                                            >
                                                ${escapeHTML(
                                                    section.name
                                                )}
                                            </option>
                                        `
                                )
                                .join("")
                        }

                    </select>
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Chapter name
                    </label>

                    <input
                        class="field-input"
                        data-create-chapter-name
                        placeholder="Chapter name"
                    >
                </div>

                <div class="hierarchy-create-actions">
                    <button
                        class="create-button"
                        data-create-chapter-save
                        type="button"
                    >
                        <img
                            src="./assets/icons/ui/plus.svg"
                            alt=""
                        >
                        Create
                    </button>

                    <button
                        class="secondary-button"
                        data-create-chapter-cancel
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </section>
        `;
    }

    function renderCreateTopicPanel(
        notebook
    ) {
        return `
            <section
                class="hierarchy-create-card"
                data-create-card="topic"
            >
                <div class="hierarchy-create-title">
                    New topic
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Section
                        <span class="optional-label">
                            (optional)
                        </span>
                    </label>

                    <select
                        class="field-select"
                        data-create-topic-section
                    >
                        <option value="">
                            No section — root
                        </option>

                        ${
                            (notebook.sections || [])
                                .map(
                                    section =>
                                        `
                                            <option
                                                value="${section.id}"
                                            >
                                                ${escapeHTML(
                                                    section.name
                                                )}
                                            </option>
                                        `
                                )
                                .join("")
                        }

                    </select>
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Chapter
                    </label>

                    <select
                        class="field-select"
                        data-create-topic-chapter
                    >
                        ${renderChapterOptions(
                            notebook,
                            null
                        )}
                    </select>
                </div>

                <div class="hierarchy-create-field">
                    <label>
                        Topic name
                    </label>

                    <input
                        class="field-input"
                        data-create-topic-name
                        placeholder="Topic name"
                    >
                </div>

                <div class="hierarchy-create-actions">
                    <button
                        class="create-button"
                        data-create-topic-save
                        type="button"
                    >
                        <img
                            src="./assets/icons/ui/plus.svg"
                            alt=""
                        >
                        Create
                    </button>

                    <button
                        class="secondary-button"
                        data-create-topic-cancel
                        type="button"
                    >
                        Cancel
                    </button>
                </div>
            </section>
        `;
    }

    function renderChapterOptions(
        notebook,
        sectionId
    ) {
        const chapters = [];

        if (!sectionId) {
            (
                notebook.rootChapters || []
            ).forEach(
                chapter =>
                    chapters.push({
                        value:
                            chapter.id,
                        label:
                            chapter.name
                    })
            );
        } else {
            const section =
                notebook.sections.find(
                    item =>
                        item.id ===
                        sectionId
                );

            (
                section?.chapters ||
                []
            ).forEach(
                chapter =>
                    chapters.push({
                        value:
                            chapter.id,
                        label:
                            chapter.name
                    })
            );
        }

        if (!chapters.length) {
            return `
                <option value="">
                    No chapters available
                </option>
            `;
        }

        return chapters
            .map(
                chapter =>
                    `
                        <option
                            value="${chapter.value}"
                        >
                            ${escapeHTML(
                                chapter.label
                            )}
                        </option>
                    `
            )
            .join("");
    }

    function bindToggle(
        tree
    ) {
        const toggle =
            tree.querySelector(
                "[data-toggle-create]"
            );

        if (!toggle) return;

        toggle.onclick = () => {
            state.ui.hierarchyCreateOpen =
                !state.ui
                    .hierarchyCreateOpen;

            renderHierarchyTree(
                ns.getNotebook(
                    state.notebookId
                )
            );
        };
    }

    function bindCreateButtons(
        tree,
        notebook
    ) {
        const sectionCard =
            tree.querySelector(
                '[data-create-card="section"]'
            );

        const chapterCard =
            tree.querySelector(
                '[data-create-card="chapter"]'
            );

        const topicCard =
            tree.querySelector(
                '[data-create-card="topic"]'
            );

        sectionCard.querySelector(
            "[data-create-section-cancel]"
        ).onclick = () => {
            clearForm(
                sectionCard
            );
        };

        sectionCard.querySelector(
            "[data-create-section-save]"
        ).onclick = () => {
            const name =
                sectionCard.querySelector(
                    "[data-create-section-name]"
                ).value.trim();

            if (!name) {
                showToast({
                    message:
                        "Enter a section name.",
                    type: "error"
                });
                return;
            }

            addSection(
                notebook.id,
                name
            );

            state.ui.hierarchyCreateOpen =
                true;

            document.dispatchEvent(
                new Event(
                    "everylearn:render"
                )
            );
        };

        chapterCard.querySelector(
            "[data-create-chapter-cancel]"
        ).onclick = () => {
            clearForm(
                chapterCard
            );
        };

        chapterCard.querySelector(
            "[data-create-chapter-save]"
        ).onclick = () => {
            const sectionId =
                chapterCard.querySelector(
                    "[data-create-chapter-section]"
                ).value || null;

            const name =
                chapterCard.querySelector(
                    "[data-create-chapter-name]"
                ).value.trim();

            if (!name) {
                showToast({
                    message:
                        "Enter a chapter name.",
                    type: "error"
                });
                return;
            }

            addChapter(
                notebook.id,
                sectionId,
                name
            );

            state.ui.hierarchyCreateOpen =
                true;

            document.dispatchEvent(
                new Event(
                    "everylearn:render"
                )
            );
        };

        const topicSection =
            topicCard.querySelector(
                "[data-create-topic-section]"
            );

        const topicChapter =
            topicCard.querySelector(
                "[data-create-topic-chapter]"
            );

        topicSection.onchange =
            () => {
                topicChapter.innerHTML =
                    renderChapterOptions(
                        notebook,
                        topicSection.value ||
                            null
                    );
            };

        topicCard.querySelector(
            "[data-create-topic-cancel]"
        ).onclick = () => {
            clearForm(
                topicCard
            );
        };

        topicCard.querySelector(
            "[data-create-topic-save]"
        ).onclick = () => {
            const chapterId =
                topicChapter.value;

            const name =
                topicCard.querySelector(
                    "[data-create-topic-name]"
                ).value.trim();

            if (!chapterId) {
                showToast({
                    message:
                        "Select a chapter first.",
                    type: "error"
                });
                return;
            }

            if (!name) {
                showToast({
                    message:
                        "Enter a topic name.",
                    type: "error"
                });
                return;
            }

            addTopic(
                notebook.id,
                chapterId,
                name
            );

            state.ui.hierarchyCreateOpen =
                true;

            document.dispatchEvent(
                new Event(
                    "everylearn:render"
                )
            );
        };
    }

    function clearForm(
        card
    ) {
        card
            .querySelectorAll(
                "input"
            )
            .forEach(
                input =>
                    input.value = ""
            );
    }

    function bindTreeActions(tree, notebook) {
        // Item actions are handled by the shared delegated action-menu controller.
    }

    function bindTopicSelection(
        tree
    ) {
        tree.querySelectorAll(
            "[data-topic]"
        ).forEach(
            button =>
                button.onclick = () => {
                    state.topicId =
                        button.dataset
                            .topic;

                    state.editingQuestionId =
                        null;

                    document.dispatchEvent(
                        new Event(
                            "everylearn:render"
                        )
                    );
                }
        );
    }

    async function deleteTreeItem(
        kind,
        id,
        deleteFunction
    ) {
        const ok =
            await confirmAction({
                title:
                    `Delete ${kind}?`,
                message:
                    `This will delete the ${kind} and everything nested beneath it.`,
                confirmText:
                    `Delete ${kind}`
            });

        if (!ok) return;

        deleteFunction();

        if (
            state.topicId ===
            id
        ) {
            state.topicId =
                null;
        }

        showToast({
            message:
                `${
                    kind[0].toUpperCase() +
                    kind.slice(1)
                } deleted.`,
            type: "success"
        });

        document.dispatchEvent(
            new Event(
                "everylearn:render"
            )
        );
    }

    function inlineEdit(
        label,
        id,
        saveFunction
    ) {
        /*
            Keep existing inline-edit behavior from the application.
            The editor is not used for creating hierarchy items.
        */
        const host =
            document.getElementById(
                "hierarchyTree"
            );

        const current =
            host.querySelector(
                `[data-edit-${label.toLowerCase()}="${id}"]`
            );

        const existing =
            host.querySelector(
                "[data-inline-editor]"
            );

        existing?.remove();

        const editor =
            document.createElement(
                "div"
            );

        editor.dataset.inlineEditor =
            "true";

        editor.className =
            "inline-panel";

        editor.innerHTML = `
            <div class="inline-panel-header">
                <strong>
                    Edit ${label}
                </strong>
            </div>

            <div class="inline-field">
                <input
                    class="field-input"
                    data-inline-name
                    placeholder="${label} name"
                >

                <button
                    class="edit-button"
                    data-inline-save
                    type="button"
                >
                    <img
                        src="./assets/icons/ui/pencil.svg"
                        alt=""
                    >
                    Save
                </button>

                <button
                    class="secondary-button"
                    data-inline-cancel
                    type="button"
                >
                    Cancel
                </button>
            </div>
        `;

        host.prepend(
            editor
        );

        const finish =
            () =>
                editor.remove();

        editor.querySelector(
            "[data-inline-cancel]"
        ).onclick =
            finish;

        editor.querySelector(
            "[data-inline-save]"
        ).onclick = () => {
            const name =
                editor.querySelector(
                    "[data-inline-name]"
                ).value.trim();

            if (!name) return;

            saveFunction(
                name
            );

            finish();

            document.dispatchEvent(
                new Event(
                    "everylearn:render"
                )
            );
        };
    }

    function escapeHTML(
        value
    ) {
        return String(
            value ?? ""
        )
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );
    }

    ns.renderHierarchyTree =
        renderHierarchyTree;

})(window.everyLearn);
