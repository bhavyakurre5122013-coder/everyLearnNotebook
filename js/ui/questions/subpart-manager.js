(function(ns){
    "use strict";
/* everyLearn — Subpart Helpers */
function ensureSubpartHints(subpart) {
    subpart.hints =
        Array.isArray(subpart.hints)
            ? subpart.hints.slice(0, 2)
            : [];
    return subpart;
}

function addSubpart(
    collection,
    subpart
) {
    collection.push(subpart);
    return subpart;
}

function removeSubpart(
    collection,
    id
) {
    const index =
        collection.findIndex(
            item => item.id === id
        );

    if (index < 0) return false;

    collection.splice(index, 1);
    return true;
}

    ns.ensureSubpartHints = ensureSubpartHints;
    ns.addSubpart = addSubpart;
    ns.removeSubpart = removeSubpart;
})(window.everyLearn);
