(function(ns){
    "use strict";
/* everyLearn — Matching Line Geometry */
function setupMatchingLines({
    root,
    connections,
    onConnect
}) {
    if (!root) return;

    let selectedLeft = null;

    root.addEventListener(
        "click",
        event => {
            const left =
                event.target.closest(
                    "[data-match-left]"
                );

            const right =
                event.target.closest(
                    "[data-match-right]"
                );

            if (left) {
                selectedLeft =
                    left.dataset.matchLeft;
                render();
                return;
            }

            if (
                right &&
                selectedLeft
            ) {
                connections[selectedLeft] =
                    right.dataset.matchRight;

                onConnect?.(
                    selectedLeft,
                    right.dataset.matchRight
                );

                selectedLeft = null;
                render();
            }
        }
    );

    const resizeObserver =
        new ResizeObserver(
            render
        );

    resizeObserver.observe(root);

    render();

    function render() {
        const svg =
            root.querySelector(
                "[data-matching-lines]"
            );

        if (!svg) return;

        svg.innerHTML = "";

        for (
            const [
                leftId,
                rightId
            ]
            of Object.entries(
                connections || {}
            )
        ) {
            const left =
                root.querySelector(
                    `[data-match-left="${CSS.escape(leftId)}"]`
                );

            const right =
                root.querySelector(
                    `[data-match-right="${CSS.escape(rightId)}"]`
                );

            if (!left || !right) continue;

            const svgRect =
                svg.getBoundingClientRect();

            const a =
                left.getBoundingClientRect();

            const b =
                right.getBoundingClientRect();

            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );

            line.setAttribute(
                "x1",
                a.left +
                    a.width / 2 -
                    svgRect.left
            );

            line.setAttribute(
                "y1",
                a.top +
                    a.height / 2 -
                    svgRect.top
            );

            line.setAttribute(
                "x2",
                b.left +
                    b.width / 2 -
                    svgRect.left
            );

            line.setAttribute(
                "y2",
                b.top +
                    b.height / 2 -
                    svgRect.top
            );

            line.setAttribute(
                "class",
                "matching-line"
            );

            svg.appendChild(line);
        }

        root.querySelectorAll(
            "[data-match-left]"
        ).forEach(
            point =>
                point.classList.toggle(
                    "selected",
                    point.dataset.matchLeft ===
                    selectedLeft
                )
        );
    }
}

    ns.setupMatchingLines = setupMatchingLines;
})(window.everyLearn);
