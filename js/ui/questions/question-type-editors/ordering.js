(function(ns){
    "use strict";
    const createId = (...args) => ns.createId(...args);
/* everyLearn — Ordering */


function renderOrderingEditor(
    mount,
    question
) {
    question.orderItems =
        Array.isArray(question.orderItems)
            ? question.orderItems
            : [];

    mount.innerHTML = `
        <div class="stack">

            <div class="form-group">
                <label>Question</label>
                <textarea
                    class="field-textarea"
                    data-question-text
                >${escapeHTML(question.text)}</textarea>
            </div>

            <div class="subparts-header">
                <div>
                    <strong>Correct order</strong>
                    <div class="muted">
                        Add any number of items.
                    </div>
                </div>

                <button
                    class="create-button small-button"
                    data-add-order
                >
                    ＋ Item
                </button>
            </div>

            <div class="order-list">
                ${
                    question.orderItems.map(
                        (
                            item,
                            index
                        ) =>
                            `
                                <div class="order-row">
                                    <div class="order-number">
                                        ${index + 1}
                                    </div>

                                    <input
                                        class="field-input"
                                        data-order-text="${item.id}"
                                        value="${escapeHTML(item.text)}"
                                        placeholder="Item"
                                    >

                                    <button
                                        class="delete-button small-button"
                                        data-delete-order="${item.id}"
                                    >
                                        ×
                                    </button>
                                </div>
                            `
                    ).join("")
                }
            </div>
        </div>
    `;

    mount.querySelector(
        "[data-add-order]"
    ).onclick = () => {
        question.orderItems.push({
            id: createId("order"),
            text: "",
            hints: []
        });

        renderOrderingEditor(
            mount,
            question
        );
    };

    mount.querySelectorAll(
        "[data-order-text]"
    ).forEach(
        input =>
            input.oninput =
                () => {
                    const item =
                        question.orderItems.find(
                            row =>
                                row.id ===
                                input.dataset.orderText
                        );

                    if (item) {
                        item.text =
                            input.value;
                    }
                }
    );

    mount.querySelectorAll(
        "[data-delete-order]"
    ).forEach(
        button =>
            button.onclick =
                () => {
                    question.orderItems =
                        question.orderItems.filter(
                            item =>
                                item.id !==
                                button.dataset.deleteOrder
                        );

                    renderOrderingEditor(
                        mount,
                        question
                    );
                }
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

    ns.renderOrderingEditor = renderOrderingEditor;
})(window.everyLearn);
