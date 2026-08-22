(function(ns){
    "use strict";

    const state = ns.state;
    const openDialog = (...args) => ns.openDialog(...args);
    const confirmAction = (...args) => ns.confirmAction(...args);
    const showToast = (...args) => ns.showToast(...args);
    const getSubject = (...args) => ns.getSubject(...args);
    const listSubjects = (...args) => ns.listSubjects(...args);
    const getNotebook = (...args) => ns.getNotebook(...args);
    const listNotebooks = (...args) => ns.listNotebooks(...args);
    const getSection = (...args) => ns.getSection(...args);
    const getChapter = (...args) => ns.getChapter(...args);
    const getTopic = (...args) => ns.getTopic(...args);
    const getQuestion = (...args) => ns.getQuestion(...args);
    const openSubjectEditor = (...args) => ns.openSubjectEditor(...args);
    const openNotebookEdit = (...args) => ns.openNotebookEdit(...args);
    const renderQuestionManager = (...args) => ns.renderQuestionManager(...args);

    const TYPES = {
        subject: "Subject",
        notebook: "Notebook",
        section: "Section",
        chapter: "Chapter",
        topic: "Topic",
        question: "Question"
    };

    const ICONS = {
        rename: "./assets/icons/ui/pencil.svg",
        edit: "./assets/icons/ui/edit.svg",
        move: "./assets/icons/ui/move.svg",
        duplicate: "./assets/icons/ui/duplicate.svg",
        delete: "./assets/icons/ui/delete.svg"
    };

    function renderItemActionMenu(kind, id, options = {}) {
        const disabledActions = new Set(options.disabledActions || []);
        const label = options.label || TYPES[kind] || "Item";

        return `
            <div class="item-action-menu" data-item-menu data-item-kind="${escapeAttr(kind)}" data-item-id="${escapeAttr(id)}">
                <button
                    class="item-action-trigger"
                    type="button"
                    data-item-menu-trigger
                    aria-label="More actions for ${escapeAttr(label)}"
                    title="More actions"
                    aria-expanded="false"
                >
                    <span aria-hidden="true">⋮</span>
                </button>

                <div class="item-action-dropdown" data-item-menu-dropdown hidden>
                    ${renderAction("rename", disabledActions.has("rename"), label)}
                    ${renderAction("edit", disabledActions.has("edit"), label)}
                    ${renderAction("move", disabledActions.has("move"), label)}
                    ${renderAction("duplicate", disabledActions.has("duplicate"), label)}
                    <div class="item-action-separator"></div>
                    ${renderAction("delete", disabledActions.has("delete"), label)}
                </div>
            </div>
        `;
    }

    function renderAction(action, disabled, label) {
        const titles = {
            rename: "Rename",
            edit: "Edit",
            move: "Move",
            duplicate: "Duplicate",
            delete: "Delete"
        };
        const title = titles[action];
        return `
            <button
                class="item-action-option ${action === "delete" ? "danger" : ""} ${disabled ? "disabled" : ""}"
                type="button"
                data-item-action="${action}"
                aria-label="${escapeAttr(title)} ${escapeAttr(label)}"
                ${disabled ? "disabled" : ""}
            >
                <img src="${ICONS[action]}" alt="">
                <span>${title}</span>
            </button>
        `;
    }

    function initItemActionMenus(root = document) {
        if (root.__everyLearnActionMenusBound) return;
        root.__everyLearnActionMenusBound = true;

        root.addEventListener("click", event => {
            const trigger = event.target.closest("[data-item-menu-trigger]");
            const action = event.target.closest("[data-item-action]");

            if (trigger) {
                event.preventDefault();
                event.stopPropagation();
                const menu = trigger.closest("[data-item-menu]");
                const dropdown = menu?.querySelector("[data-item-menu-dropdown]");
                if (!menu || !dropdown) return;

                const willOpen = dropdown.hidden;
                closeAllItemMenus();

                if (willOpen) {
                    dropdown.hidden = false;
                    trigger.setAttribute("aria-expanded", "true");
                    menu.classList.add("open");
                }
                return;
            }

            if (action) {
                event.preventDefault();
                event.stopPropagation();
                const menu = action.closest("[data-item-menu]");
                const kind = menu?.dataset.itemKind;
                const id = menu?.dataset.itemId;
                const actionName = action.dataset.itemAction;
                closeAllItemMenus();
                if (kind && id && actionName) {
                    handleItemAction(kind, id, actionName);
                }
                return;
            }

            if (!event.target.closest("[data-item-menu]")) {
                closeAllItemMenus();
            }
        });

        root.addEventListener("keydown", event => {
            if (event.key === "Escape") closeAllItemMenus();
        });
    }

    function bindRenderedItemMenus(root = document) {
        initItemActionMenus(root);
        root.querySelectorAll("[data-item-menu]").forEach(menu => {
            menu.dataset.itemKind = menu.closest("[data-item-owner]")?.dataset.itemKind || menu.dataset.itemKind || "";
            menu.dataset.itemId = menu.closest("[data-item-owner]")?.dataset.itemId || menu.dataset.itemId || "";
        });
    }

    function closeAllItemMenus() {
        document.querySelectorAll("[data-item-menu-dropdown]").forEach(dropdown => {
            dropdown.hidden = true;
            const menu = dropdown.closest("[data-item-menu]");
            menu?.classList.remove("open");
            menu?.querySelector("[data-item-menu-trigger]")?.setAttribute("aria-expanded", "false");
        });
    }

    async function handleItemAction(kind, id, action) {
        try {
            if (action === "rename") return openRenameDialog(kind, id);
            if (action === "edit") return openEditDialog(kind, id);
            if (action === "move") return openMoveDuplicateDialog(kind, id, false);
            if (action === "duplicate") return openMoveDuplicateDialog(kind, id, true);
            if (action === "delete") return deleteItem(kind, id);
        } catch (error) {
            showToast({ message: error.message || "Action failed.", type: "error" });
        }
    }

    function openRenameDialog(kind, id) {
        const item = getItem(kind, id);
        if (!item) return;

        openDialog({
            title: `Rename ${TYPES[kind] || "item"}`,
            bodyHTML: `
                <div class="form-group full">
                    <label>Name</label>
                    <input class="field-input" data-item-rename-input value="${escapeAttr(item.name || questionTitle(item))}">
                </div>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Cancel</button>
                <button class="save-button" data-dialog-save><img src="${ICONS.rename}" alt=""> Save</button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector("[data-dialog-cancel]").onclick = close;
                host.querySelector("[data-dialog-save]").onclick = () => {
                    const name = host.querySelector("[data-item-rename-input]").value.trim();
                    if (!name) {
                        showToast({ message: "Name cannot be empty.", type: "error" });
                        return;
                    }
                    renameItem(kind, id, name);
                    close();
                    rerenderAfterAction(kind);
                };
            }
        });
    }

    function openEditDialog(kind, id) {
        if (kind === "question") {
            state.editingQuestionId = id;
            renderQuestionManager();
            return;
        }

        if (kind === "subject") {
            const subject = getSubject(id);
            if (!subject) return;
            renderEntityEditor("subject", subject);
            return;
        }

        if (kind === "notebook") {
            const notebook = getNotebook(id);
            if (!notebook) return;
            renderEntityEditor("notebook", notebook);
            return;
        }

        const item = getItem(kind, id);
        if (!item) return;
        renderEntityEditor(kind, item);
    }

    function renderEntityEditor(kind, item) {
        const nestedHTML = renderNestedContents(kind, item);
        const fields = renderEditFields(kind, item);

        openDialog({
            title: `Edit ${TYPES[kind]}`,
            bodyHTML: `
                <div class="item-editor-layout">
                    <div class="item-editor-form">
                        ${fields}
                    </div>
                    ${nestedHTML}
                </div>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Cancel</button>
                <button class="save-button" data-dialog-save><img src="${ICONS.edit}" alt=""> Save changes</button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector("[data-dialog-cancel]").onclick = close;
                host.querySelector("[data-dialog-save]").onclick = () => {
                    try {
                        saveEditedEntity(kind, item.id, host);
                        close();
                        rerenderAfterAction(kind);
                    } catch (error) {
                        showToast({ message: error.message, type: "error" });
                    }
                };
            }
        });
    }

    function renderEditFields(kind, item) {
        if (kind === "subject") {
            return `
                <div class="form-grid">
                    <div class="form-group full"><label>Subject name</label><input class="field-input" data-edit-name value="${escapeAttr(item.name)}"></div>
                    <div class="form-group"><label>Icon</label><input class="field-input" data-edit-icon maxlength="32" value="${escapeAttr(item.icon || "")}"></div>
                    <div class="form-group"><label>Color</label><input type="color" data-edit-color value="${escapeAttr(item.color || "#2563EB")}"></div>
                </div>
            `;
        }
        if (kind === "notebook") {
            return `
                <div class="form-grid">
                    <div class="form-group full"><label>Notebook name</label><input class="field-input" data-edit-name value="${escapeAttr(item.name)}"></div>
                    <div class="form-group"><label>Color</label><input type="color" data-edit-color value="${escapeAttr(item.color || "#2563EB")}"></div>
                    <div class="form-group"><label>Subject</label>${renderSubjectSelect(item.subjectId)}</div>
                    <div class="form-group full"><label>Description</label><textarea class="field-textarea" data-edit-description>${escapeHTML(item.description || "")}</textarea></div>
                </div>
            `;
        }
        if (kind === "topic") {
            return `
                <div class="form-grid">
                    <div class="form-group full"><label>Topic name</label><input class="field-input" data-edit-name value="${escapeAttr(item.name)}"></div>
                    <div class="form-group full"><label>Notes</label><textarea class="field-textarea" data-edit-notes>${escapeHTML(item.notes || "")}</textarea></div>
                </div>
            `;
        }
        return `
            <div class="form-group full">
                <label>${TYPES[kind]} name</label>
                <input class="field-input" data-edit-name value="${escapeAttr(item.name)}">
            </div>
        `;
    }

    function renderSubjectSelect(selectedId) {
        return `
            <select class="field-select" data-edit-subject>
                <option value="">None</option>
                ${listSubjects().map(subject => `
                    <option value="${escapeAttr(subject.id)}" ${subject.id === selectedId ? "selected" : ""}>${escapeHTML(subject.name)}</option>
                `).join("")}
            </select>
        `;
    }

    function renderNestedContents(kind, item) {
        let title = "Contents";
        let body = "";

        if (kind === "subject") {
            const notebooks = listNotebooks().filter(notebook => notebook.subjectId === item.id);
            body = notebooks.length ? notebooks.map(notebook => renderNestedLine("notebook", notebook.name, `${countNotebookContents(notebook)} items`)).join("") : renderNestedEmpty("No notebooks linked to this subject.");
        } else if (kind === "notebook") {
            const sections = item.sections || [];
            const roots = item.rootChapters || [];
            body = [...sections.map(section => renderNestedBranch("section", section.name, section.chapters || [])), ...roots.map(chapter => renderNestedBranch("chapter", chapter.name, chapter.topics || [], true))].join("") || renderNestedEmpty("Nothing inside this notebook yet.");
        } else if (kind === "section") {
            const chapters = item.chapters || [];
            body = chapters.length ? chapters.map(chapter => renderNestedBranch("chapter", chapter.name, chapter.topics || [], true)).join("") : renderNestedEmpty("No chapters in this section.");
        } else if (kind === "chapter") {
            const topics = item.topics || [];
            body = topics.length ? topics.map(topic => renderNestedBranch("topic", topic.name, topic.questions || [], false, true)).join("") : renderNestedEmpty("No topics in this chapter.");
        } else if (kind === "topic") {
            const questions = item.questions || [];
            body = questions.length ? questions.map((question, index) => renderNestedLine("question", question.text || `Question ${index + 1}`, labelQuestion(question.type))).join("") : renderNestedEmpty("No questions in this topic.");
        }

        return `
            <div class="item-editor-contents">
                <div class="item-editor-contents-title">${title}</div>
                <div class="item-editor-tree">${body}</div>
            </div>
        `;
    }

    function renderNestedBranch(kind, name, children, childrenAreTopics = false, childrenAreQuestions = false) {
        const childHTML = children.length ? children.map(child => {
            const nextKind = childrenAreTopics ? "topic" : childrenAreQuestions ? "question" : child.topics ? "topic" : "question";
            const nextName = child.name || child.text || "Untitled";
            const meta = nextKind === "topic" ? `${(child.questions || []).length} questions` : nextKind === "question" ? labelQuestion(child.type) : `${(child.topics || []).length} topics`;
            return renderNestedLine(nextKind, nextName, meta, true);
        }).join("") : renderNestedEmpty("Empty");
        return `
            <div class="item-editor-branch">
                <div class="item-editor-branch-title"><strong>${escapeHTML(name)}</strong></div>
                <div class="item-editor-branch-children">${childHTML}</div>
            </div>
        `;
    }

    function renderNestedLine(kind, name, meta = "", indented = false) {
        return `
            <div class="item-editor-line ${indented ? "indented" : ""}">
                <span class="item-editor-line-kind">${escapeHTML(TYPES[kind] || kind)}</span>
                <span class="item-editor-line-name">${escapeHTML(name)}</span>
                <span class="item-editor-line-meta">${escapeHTML(meta)}</span>
            </div>
        `;
    }

    function renderNestedEmpty(message) {
        return `<div class="item-editor-empty">${escapeHTML(message)}</div>`;
    }

    function saveEditedEntity(kind, id, host) {
        const name = host.querySelector("[data-edit-name]")?.value.trim();
        if (!name) throw new Error("Name cannot be empty.");

        if (kind === "subject") {
            ns.updateSubject(id, {
                name,
                icon: host.querySelector("[data-edit-icon]").value.trim() || "•",
                color: host.querySelector("[data-edit-color]").value,
                light: ns.colorToLight ? ns.colorToLight(host.querySelector("[data-edit-color]").value) : undefined
            });
            return;
        }

        if (kind === "notebook") {
            const color = host.querySelector("[data-edit-color]").value;
            ns.updateNotebook(id, {
                name,
                color,
                light: ns.colorToLight ? ns.colorToLight(color) : undefined,
                subjectId: host.querySelector("[data-edit-subject]").value || null,
                description: host.querySelector("[data-edit-description]").value
            });
            return;
        }

        if (kind === "section") return ns.updateSection(state.notebookId, id, { name });
        if (kind === "chapter") return ns.updateChapter(state.notebookId, id, { name });
        if (kind === "topic") {
            return ns.updateTopic(state.notebookId, id, {
                name,
                notes: host.querySelector("[data-edit-notes]").value
            });
        }
    }

    function openMoveDuplicateDialog(kind, id, duplicate) {
        const item = getItem(kind, id);
        if (!item) return;

        if (kind === "subject") {
            if (!duplicate) {
                showToast({ message: "Subjects are already at the top level.", type: "info" });
                return;
            }
            openDuplicateSubjectDialog(item);
            return;
        }

        if (kind === "notebook") {
            openNotebookPlacementDialog(item, duplicate);
            return;
        }

        const options = getPlacementOptions(kind, id);
        const verb = duplicate ? "Duplicate" : "Move";

        openDialog({
            title: `${verb} ${TYPES[kind]}`,
            bodyHTML: renderPlacementForm(kind, id, options, duplicate),
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Cancel</button>
                <button class="save-button" data-dialog-save><img src="${ICONS[duplicate ? "duplicate" : "move"]}" alt=""> ${verb}</button>
            `,
            onOpen: ({ host, close }) => {
                bindPlacementForm(host, kind, id, duplicate, close);
            }
        });
    }

    function renderPlacementForm(kind, id, options, duplicate) {
        const source = options.current;
        const destinationNotebook = source?.notebookId || state.notebookId;
        return `
            <div class="item-move-form">
                <div class="form-group full">
                    <label>${duplicate ? "New name" : "Destination"}</label>
                    ${duplicate ? `<input class="field-input" data-placement-name value="${escapeAttr(options.item.name || questionTitle(options.item))} Copy">` : ""}
                </div>
                ${renderNotebookPicker(options.notebooks, destinationNotebook)}
                ${kind === "chapter" || kind === "topic" || kind === "question" ? renderSectionPicker(options.sections, source?.sectionId) : ""}
                ${kind === "topic" || kind === "question" ? renderChapterPicker(options.chapters, source?.chapterId) : ""}
                ${kind === "question" ? renderTopicPicker(options.topics, source?.topicId) : ""}
                ${kind === "section" ? `<p class="field-help">Sections are top-level children of a notebook.</p>` : ""}
            </div>
        `;
    }

    function renderNotebookPicker(notebooks, selected) {
        return `
            <div class="form-group full">
                <label>Notebook</label>
                <select class="field-select" data-placement-notebook>
                    ${notebooks.map(notebook => `<option value="${escapeAttr(notebook.id)}" ${notebook.id === selected ? "selected" : ""}>${escapeHTML(notebook.name)}</option>`).join("")}
                </select>
            </div>
        `;
    }

    function renderSectionPicker(sections, selected) {
        return `
            <div class="form-group full">
                <label>Section</label>
                <select class="field-select" data-placement-section>
                    <option value="">No section (root chapter)</option>
                    ${sections.map(section => `<option value="${escapeAttr(section.id)}" ${section.id === selected ? "selected" : ""}>${escapeHTML(section.name)}</option>`).join("")}
                </select>
            </div>
        `;
    }

    function renderChapterPicker(chapters, selected) {
        return `
            <div class="form-group full">
                <label>Chapter</label>
                <select class="field-select" data-placement-chapter>
                    ${chapters.map(chapter => `<option value="${escapeAttr(chapter.id)}" ${chapter.id === selected ? "selected" : ""}>${escapeHTML(chapter.label)}</option>`).join("")}
                </select>
            </div>
        `;
    }

    function renderTopicPicker(topics, selected) {
        return `
            <div class="form-group full">
                <label>Topic</label>
                <select class="field-select" data-placement-topic>
                    ${topics.map(topic => `<option value="${escapeAttr(topic.id)}" ${topic.id === selected ? "selected" : ""}>${escapeHTML(topic.label)}</option>`).join("")}
                </select>
            </div>
        `;
    }

    function bindPlacementForm(host, kind, id, duplicate, close) {
        host.querySelector("[data-dialog-cancel]").onclick = close;

        const notebookSelect = host.querySelector("[data-placement-notebook]");
        const sectionSelect = host.querySelector("[data-placement-section]");
        const chapterSelect = host.querySelector("[data-placement-chapter]");

        notebookSelect?.addEventListener("change", () => refreshPlacementSelectors(host, kind, id));
        sectionSelect?.addEventListener("change", () => refreshPlacementSelectors(host, kind, id));

        host.querySelector("[data-dialog-save]").onclick = () => {
            const notebookId = notebookSelect?.value;
            if (!notebookId) return;

            try {
                if (kind === "section") {
                    return finishSimplePlacement(duplicate, close, id, notebookId);
                }

                const sectionId = sectionSelect?.value || null;
                const chapterId = chapterSelect?.value || null;
                const topicId = host.querySelector("[data-placement-topic]")?.value || null;

                if (kind === "chapter") {
                    finishPlacement("chapter", id, notebookId, sectionId, duplicate, host, close);
                } else if (kind === "topic") {
                    if (!chapterId) throw new Error("Select a chapter first.");
                    finishPlacement("topic", id, notebookId, chapterId, duplicate, host, close);
                } else if (kind === "question") {
                    if (!topicId) throw new Error("Select a topic first.");
                    finishPlacement("question", id, notebookId, topicId, duplicate, host, close);
                }
            } catch (error) {
                showToast({ message: error.message, type: "error" });
            }
        };

        refreshPlacementSelectors(host, kind, id);
    }

    function refreshPlacementSelectors(host, kind, id) {
        const notebookId = host.querySelector("[data-placement-notebook]")?.value;
        const section = host.querySelector("[data-placement-section]");
        const chapter = host.querySelector("[data-placement-chapter]");
        const topic = host.querySelector("[data-placement-topic]");
        if (!notebookId) return;

        if (section) {
            const currentSection = section.value;
            section.innerHTML = `<option value="">No section (root chapter)</option>${(getNotebook(notebookId)?.sections || []).map(s => `<option value="${escapeAttr(s.id)}" ${s.id === currentSection ? "selected" : ""}>${escapeHTML(s.name)}</option>`).join("")}`;
        }

        const sectionId = section?.value || null;
        const notebook = getNotebook(notebookId);
        if (!notebook) return;

        let chapters = [];
        if (sectionId) {
            const targetSection = notebook.sections.find(s => s.id === sectionId);
            chapters = (targetSection?.chapters || []).map(ch => ({ id: ch.id, label: ch.name }));
        } else {
            chapters = (notebook.rootChapters || []).map(ch => ({ id: ch.id, label: ch.name }));
        }

        if (chapter) {
            const currentChapter = chapter.value;
            chapter.innerHTML = chapters.map(ch => `<option value="${escapeAttr(ch.id)}" ${ch.id === currentChapter ? "selected" : ""}>${escapeHTML(ch.label)}</option>`).join("");
        }

        if (topic) {
            const selectedChapter = chapter?.value;
            const targetChapter = ns.getChapter(notebookId, selectedChapter);
            const topics = targetChapter?.topics || [];
            const currentTopic = topic.value;
            topic.innerHTML = topics.map(t => `<option value="${escapeAttr(t.id)}" ${t.id === currentTopic ? "selected" : ""}>${escapeHTML(t.name)}</option>`).join("");
        }
    }

    function finishSimplePlacement(duplicate, close, id, notebookId) {
        if (duplicate) {
            const name = document.querySelector("[data-placement-name]")?.value.trim();
            const copy = ns.duplicateSection(state.notebookId, id, notebookId, name);
            if (copy) {
                close();
                rerenderAfterAction("section");
            }
            return;
        }
        ns.moveSection(state.notebookId, id, notebookId);
        close();
        rerenderAfterAction("section");
    }

    function finishPlacement(kind, id, notebookId, destinationId, duplicate, host, close) {
        if (duplicate) {
            const name = host.querySelector("[data-placement-name]")?.value.trim();
            const copy = kind === "chapter"
                ? ns.duplicateChapter(state.notebookId, id, notebookId, destinationId, name)
                : kind === "topic"
                    ? ns.duplicateTopic(state.notebookId, id, notebookId, destinationId, name)
                    : ns.duplicateQuestionToTopic(state.notebookId, state.topicId, id, notebookId, destinationId, name);
            if (copy) {
                close();
                rerenderAfterAction(kind);
            }
            return;
        }

        if (kind === "chapter") ns.moveChapter(state.notebookId, id, notebookId, destinationId);
        if (kind === "topic") ns.moveTopic(state.notebookId, id, notebookId, destinationId);
        if (kind === "question") ns.moveQuestion(state.notebookId, state.topicId, id, notebookId, destinationId);

        close();
        rerenderAfterAction(kind);
    }

    function openNotebookPlacementDialog(notebook, duplicate) {
        openDialog({
            title: `${duplicate ? "Duplicate" : "Move"} Notebook`,
            bodyHTML: `
                <div class="item-move-form">
                    ${duplicate ? `<div class="form-group full"><label>New notebook name</label><input class="field-input" data-placement-name value="${escapeAttr(notebook.name)} Copy"></div>` : ""}
                    <div class="form-group full">
                        <label>Subject</label>
                        <select class="field-select" data-placement-subject>
                            <option value="">None</option>
                            ${listSubjects().map(subject => `<option value="${escapeAttr(subject.id)}" ${subject.id === notebook.subjectId ? "selected" : ""}>${escapeHTML(subject.name)}</option>`).join("")}
                        </select>
                    </div>
                </div>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Cancel</button>
                <button class="save-button" data-dialog-save><img src="${ICONS[duplicate ? "duplicate" : "move"]}" alt=""> ${duplicate ? "Duplicate" : "Move"}</button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector("[data-dialog-cancel]").onclick = close;
                host.querySelector("[data-dialog-save]").onclick = () => {
                    const subjectId = host.querySelector("[data-placement-subject]").value || null;
                    if (duplicate) {
                        const name = host.querySelector("[data-placement-name]").value.trim();
                        if (!name) return showToast({ message: "Name cannot be empty.", type: "error" });
                        ns.duplicateNotebook(notebook.id, name, subjectId);
                    } else {
                        ns.moveNotebook(notebook.id, subjectId);
                    }
                    close();
                    rerenderAfterAction("notebook");
                };
            }
        });
    }

    function openDuplicateSubjectDialog(subject) {
        openDialog({
            title: "Duplicate Subject",
            bodyHTML: `
                <div class="form-group full">
                    <label>New subject name</label>
                    <input class="field-input" data-placement-name value="${escapeAttr(subject.name)} Copy">
                </div>
                <p class="field-help">All notebooks linked to this subject will be duplicated with their hierarchy and questions.</p>
            `,
            footerHTML: `
                <button class="secondary-button" data-dialog-cancel>Cancel</button>
                <button class="save-button" data-dialog-save><img src="${ICONS.duplicate}" alt=""> Duplicate</button>
            `,
            onOpen: ({ host, close }) => {
                host.querySelector("[data-dialog-cancel]").onclick = close;
                host.querySelector("[data-dialog-save]").onclick = () => {
                    const name = host.querySelector("[data-placement-name]").value.trim();
                    if (!name) return showToast({ message: "Name cannot be empty.", type: "error" });
                    ns.duplicateSubject(subject.id, name);
                    close();
                    rerenderAfterAction("subject");
                };
            }
        });
    }

    function getPlacementOptions(kind, id) {
        const item = getItem(kind, id);
        const current = getItemContext(kind, id);
        return {
            item,
            current,
            notebooks: listNotebooks(),
            sections: current?.notebookId ? (getNotebook(current.notebookId)?.sections || []) : [],
            chapters: current?.chapterId ? [{ id: current.chapterId, label: ns.getChapter(current.notebookId, current.chapterId)?.name || "" }] : allChapters(state.notebookId),
            topics: current?.topicId ? [{ id: current.topicId, label: ns.getTopic(current.notebookId, current.topicId)?.name || "" }] : allTopics(state.notebookId)
        };
    }

    function getItem(kind, id) {
        if (kind === "subject") return getSubject(id);
        if (kind === "notebook") return getNotebook(id);
        if (kind === "section") return findEveryNotebookSection(id);
        if (kind === "chapter") return findEveryNotebookChapter(id);
        if (kind === "topic") return findEveryNotebookTopic(id);
        if (kind === "question") return findEveryNotebookQuestion(id);
        return null;
    }

    function getItemContext(kind, id) {
        for (const notebook of state.data.notebooks) {
            if (kind === "section") {
                const section = (notebook.sections || []).find(item => item.id === id);
                if (section) return { notebookId: notebook.id, sectionId: section.id };
            }
            if (kind === "chapter") {
                for (const section of notebook.sections || []) {
                    const chapter = (section.chapters || []).find(item => item.id === id);
                    if (chapter) return { notebookId: notebook.id, sectionId: section.id, chapterId: chapter.id };
                }
                const root = (notebook.rootChapters || []).find(item => item.id === id);
                if (root) return { notebookId: notebook.id, sectionId: null, chapterId: root.id };
            }
            if (kind === "topic") {
                for (const section of notebook.sections || []) {
                    for (const chapter of section.chapters || []) {
                        if ((chapter.topics || []).some(item => item.id === id)) return { notebookId: notebook.id, sectionId: section.id, chapterId: chapter.id, topicId: id };
                    }
                }
                for (const chapter of notebook.rootChapters || []) {
                    if ((chapter.topics || []).some(item => item.id === id)) return { notebookId: notebook.id, sectionId: null, chapterId: chapter.id, topicId: id };
                }
            }
            if (kind === "question") {
                for (const section of notebook.sections || []) for (const chapter of section.chapters || []) for (const topic of chapter.topics || []) if ((topic.questions || []).some(item => item.id === id)) return { notebookId: notebook.id, sectionId: section.id, chapterId: chapter.id, topicId: topic.id };
                for (const chapter of notebook.rootChapters || []) for (const topic of chapter.topics || []) if ((topic.questions || []).some(item => item.id === id)) return { notebookId: notebook.id, sectionId: null, chapterId: chapter.id, topicId: topic.id };
            }
        }
        return null;
    }

    function findEveryNotebookSection(id) { for (const notebook of state.data.notebooks) { const item = (notebook.sections || []).find(section => section.id === id); if (item) return item; } return null; }
    function findEveryNotebookChapter(id) { for (const notebook of state.data.notebooks) { for (const section of notebook.sections || []) { const item = (section.chapters || []).find(chapter => chapter.id === id); if (item) return item; } const item = (notebook.rootChapters || []).find(chapter => chapter.id === id); if (item) return item; } return null; }
    function findEveryNotebookTopic(id) { for (const notebook of state.data.notebooks) { for (const section of notebook.sections || []) for (const chapter of section.chapters || []) { const item = (chapter.topics || []).find(topic => topic.id === id); if (item) return item; } for (const chapter of notebook.rootChapters || []) { const item = (chapter.topics || []).find(topic => topic.id === id); if (item) return item; } } return null; }
    function findEveryNotebookQuestion(id) { for (const notebook of state.data.notebooks) { for (const section of notebook.sections || []) for (const chapter of section.chapters || []) for (const topic of chapter.topics || []) { const item = (topic.questions || []).find(question => question.id === id); if (item) return item; } for (const chapter of notebook.rootChapters || []) for (const topic of chapter.topics || []) { const item = (topic.questions || []).find(question => question.id === id); if (item) return item; } } return null; }

    function renameItem(kind, id, name) {
        if (kind === "subject") return ns.updateSubject(id, { name });
        if (kind === "notebook") return ns.updateNotebook(id, { name });
        const ctx = getItemContext(kind, id);
        if (!ctx) throw new Error(`${TYPES[kind]} not found.`);
        if (kind === "section") return ns.updateSection(ctx.notebookId, id, { name });
        if (kind === "chapter") return ns.updateChapter(ctx.notebookId, id, { name });
        if (kind === "topic") return ns.updateTopic(ctx.notebookId, id, { name });
        if (kind === "question") return ns.updateQuestion(ctx.notebookId, ctx.topicId, id, { text: name });
    }

    async function deleteItem(kind, id) {
        if (kind === "subject") {
            const subject = getSubject(id);
            const linked = listNotebooks().filter(notebook => notebook.subjectId === id);
            if (!subject) return;
            const ok = await confirmAction({ title: "Delete subject?", message: linked.length ? `"${subject.name}" has ${linked.length} linked notebook${linked.length === 1 ? "" : "s"}. Deleting it will also delete those linked notebooks.` : `Delete "${subject.name}"?`, confirmText: "Delete subject" });
            if (!ok) return;
            ns.deleteSubject(id);
            return rerenderAfterAction(kind);
        }
        if (kind === "notebook") {
            const notebook = getNotebook(id);
            if (!notebook) return;
            const ok = await confirmAction({ title: "Delete notebook?", message: `Delete "${notebook.name}" and all of its stored content?`, confirmText: "Delete notebook" });
            if (!ok) return;
            ns.deleteNotebook(id);
            if (state.notebookId === id) {
                ns.goHome();
            }
            return rerenderAfterAction(kind);
        }
        if (kind === "question") {
            const ctx = getItemContext(kind, id);
            if (!ctx) return;
            const ok = await confirmAction({ title: "Delete question?", message: "This removes the question and all of its sub-parts.", confirmText: "Delete question" });
            if (!ok) return;
            ns.deleteQuestion(ctx.notebookId, ctx.topicId, id);
            if (state.editingQuestionId === id) state.editingQuestionId = null;
            return rerenderAfterAction(kind);
        }
        const ctx = getItemContext(kind, id);
        if (!ctx) return;
        const ok = await confirmAction({ title: `Delete ${TYPES[kind].toLowerCase()}?`, message: `This will delete the ${TYPES[kind].toLowerCase()} and everything nested beneath it.`, confirmText: `Delete ${TYPES[kind].toLowerCase()}` });
        if (!ok) return;
        if (kind === "section") ns.deleteSection(ctx.notebookId, id);
        if (kind === "chapter") ns.deleteChapter(ctx.notebookId, id);
        if (kind === "topic") ns.deleteTopic(ctx.notebookId, id);

        if (kind === "section" && state.sectionId === id) {
            state.sectionId = null;
            state.chapterId = null;
            state.topicId = null;
        } else if (kind === "chapter" && state.chapterId === id) {
            state.chapterId = null;
            state.topicId = null;
        } else if (kind === "topic" && state.topicId === id) {
            state.topicId = null;
        }

        rerenderAfterAction(kind);
    }

    function rerenderAfterAction(kind) {
        document.dispatchEvent(new Event("everylearn:render"));
        if (kind === "question" && state.notebookId && state.topicId) renderQuestionManager();
    }

    function allChapters(notebookId) {
        const notebook = getNotebook(notebookId);
        if (!notebook) return [];
        const output = [];
        for (const chapter of notebook.rootChapters || []) output.push({ id: chapter.id, label: `${chapter.name} (root)` });
        for (const section of notebook.sections || []) for (const chapter of section.chapters || []) output.push({ id: chapter.id, label: `${section.name} / ${chapter.name}` });
        return output;
    }

    function allTopics(notebookId) {
        const notebook = getNotebook(notebookId);
        if (!notebook) return [];
        const output = [];
        for (const chapter of notebook.rootChapters || []) for (const topic of chapter.topics || []) output.push({ id: topic.id, label: `${chapter.name} / ${topic.name}` });
        for (const section of notebook.sections || []) for (const chapter of section.chapters || []) for (const topic of chapter.topics || []) output.push({ id: topic.id, label: `${section.name} / ${chapter.name} / ${topic.name}` });
        return output;
    }

    function countNotebookContents(notebook) {
        let count = 0;
        for (const section of notebook.sections || []) { count += 1; for (const chapter of section.chapters || []) { count += 1 + (chapter.topics || []).length; for (const topic of chapter.topics || []) count += topic.questions?.length || 0; } }
        for (const chapter of notebook.rootChapters || []) { count += 1 + (chapter.topics || []).length; for (const topic of chapter.topics || []) count += topic.questions?.length || 0; }
        return count;
    }

    function questionTitle(question) { return question?.text || `Question`; }
    function labelQuestion(type) { return { text: "Text", fill: "Fill in the blanks", trueFalse: "True / False", assertionReasoning: "Assertion / Reasoning", caseBased: "Case based questions", matching: "Matching", singleCorrect: "Single correct", multipleCorrect: "Multiple correct", ordering: "Ordering", difference: "Difference between" }[type] || "Question"; }
    function escapeHTML(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
    function escapeAttr(value) { return escapeHTML(value); }

    ns.renderItemActionMenu = renderItemActionMenu;
    ns.initItemActionMenus = initItemActionMenus;
    ns.bindRenderedItemMenus = bindRenderedItemMenus;
    // Bind once using event delegation; dynamically-rendered menus are covered too.
    initItemActionMenus(document);
})(window.everyLearn);
