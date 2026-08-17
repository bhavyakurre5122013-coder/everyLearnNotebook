(function(ns){
    "use strict";
/*
=============================================================
everyLearn — ID Utilities
=============================================================
*/

function createId(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

function isValidId(value) {
    return typeof value === "string" && value.trim().length > 0;
}

    ns.createId = createId;
    ns.isValidId = isValidId;
})(window.everyLearn);
