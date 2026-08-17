(function(ns){
    "use strict";
    const openDialog = (...args) => ns.openDialog(...args);
/* everyLearn — Account */


function initAccount() {
    const button =
        document.getElementById("accountButton");

    const menu =
        document.getElementById("accountMenu");

    if (!button || !menu) return;

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            menu.innerHTML = `
                <button
                    class="menu-item"
                    type="button"
                    data-account-open
                >
                    Account
                </button>
            `;

            const rect =
                button.getBoundingClientRect();

            menu.style.top =
                `${rect.bottom + 8}px`;

            menu.style.right =
                `${Math.max(
                    10,
                    window.innerWidth - rect.right
                )}px`;

            menu.classList.toggle("hidden");
            button.setAttribute(
                "aria-expanded",
                String(!menu.classList.contains("hidden"))
            );
        }
    );

    menu.addEventListener(
        "click",
        event => {
            if (
                event.target.closest(
                    "[data-account-open]"
                )
            ) {
                menu.classList.add("hidden");

                openDialog({
                    title: "Account",
                    bodyHTML: `
                        <div class="empty-state">
                            <strong>
                                Account setup is not connected yet.
                            </strong>
                            Real Google Sign-In will be
                            added during the account phase.
                        </div>
                    `,
                    footerHTML: `
                        <button
                            class="secondary-button"
                            data-dialog-cancel
                        >
                            Close
                        </button>
                    `,
                    onOpen: ({ host, close }) => {
                        host.querySelector(
                            "[data-dialog-cancel]"
                        ).onclick = close;
                    }
                });
            }
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (
                !event.target.closest("#accountMenu") &&
                !event.target.closest("#accountButton")
            ) {
                menu.classList.add("hidden");
                button.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );
}

    ns.initAccount = initAccount;
})(window.everyLearn);
