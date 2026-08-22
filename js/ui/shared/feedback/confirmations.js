(function(ns){
    "use strict";
    const iconImage = (...args) => ns.iconImage(...args);
/* everyLearn — In-App Confirmations */


function confirmAction({
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    destructive = true
}) {
    return new Promise(resolve => {
        const host = document.getElementById("dialogHost");

        if (!host) {
            resolve(false);
            return;
        }

        host.innerHTML = `
            <div class="dialog-backdrop">
                <section
                    class="dialog confirmation-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-label="${escapeHTML(title)}"
                >
                    <div class="dialog-body">
                        ${
                            destructive
                                ? `
                                    <div class="confirmation-icon">
                                        ${iconImage("delete")}
                                    </div>
                                `
                                : ""
                        }

                        <h2 class="confirmation-title">
                            ${escapeHTML(title)}
                        </h2>

                        <p class="confirmation-message">
                            ${escapeHTML(message)}
                        </p>
                    </div>

                    <footer class="dialog-footer">
                        <button
                            type="button"
                            class="secondary-button"
                            data-confirm-cancel
                        >
                            ${escapeHTML(cancelText)}
                        </button>

                        <button
                            type="button"
                            class="${
                                destructive
                                    ? "delete-button"
                                    : "save-button"
                            }"
                            data-confirm-submit
                        >
                            ${destructive
                                ? iconImage("delete")
                                : iconImage("save")}
                            ${escapeHTML(confirmText)}
                        </button>
                    </footer>
                </section>
            </div>
        `;

        const finish = value => {
            host.innerHTML = "";
            resolve(value);
        };

        host.querySelector(
            "[data-confirm-cancel]"
        ).onclick = () => finish(false);

        host.querySelector(
            "[data-confirm-submit]"
        ).onclick = () => finish(true);
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

    ns.confirmAction = confirmAction;
})(window.everyLearn);
