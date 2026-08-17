(function(ns){
    "use strict";
/* everyLearn — Application Dialogs */
function openDialog({
    title,
    bodyHTML,
    footerHTML = "",
    large = false,
    onOpen
}) {
    const host = document.getElementById("dialogHost");
    if (!host) return () => {};

    host.innerHTML = `
        <div class="dialog-backdrop">
            <section
                class="dialog ${large ? "large" : ""}"
                role="dialog"
                aria-modal="true"
                aria-label="${escapeHTML(title)}"
            >
                <header class="dialog-header">
                    <h2 class="dialog-title">
                        ${escapeHTML(title)}
                    </h2>

                    <button
                        class="icon-action"
                        type="button"
                        data-dialog-close
                        aria-label="Close"
                    >
                        ×
                    </button>
                </header>

                <div class="dialog-body">
                    ${bodyHTML}
                </div>

                ${
                    footerHTML
                        ? `
                            <footer class="dialog-footer">
                                ${footerHTML}
                            </footer>
                        `
                        : ""
                }
            </section>
        </div>
    `;

    const close = () => {
        host.innerHTML = "";
    };

    host.querySelector(
        "[data-dialog-close]"
    )?.addEventListener(
        "click",
        close
    );

    host.querySelector(
        ".dialog-backdrop"
    )?.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                event.currentTarget
            ) {
                close();
            }
        }
    );

    onOpen?.({
        host,
        close
    });

    return close;
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

    ns.openDialog = openDialog;
})(window.everyLearn);
