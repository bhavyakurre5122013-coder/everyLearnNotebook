(function(ns){
    "use strict";
/* everyLearn — Filter Result Helpers */
function renderFilterResultCount(
    container,
    count
) {
    if (!container) return;

    container.textContent =
        `${count} matching question${
            count === 1 ? "" : "s"
        }`;
}

    ns.renderFilterResultCount = renderFilterResultCount;
})(window.everyLearn);
