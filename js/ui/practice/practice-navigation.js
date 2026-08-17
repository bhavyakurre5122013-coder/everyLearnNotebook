(function(ns){
    "use strict";
/* everyLearn — Practice Navigation */
function canGoPrevious(
    index
) {
    return index > 0;
}

function canGoNext(
    index,
    count
) {
    return index < count - 1;
}

    ns.canGoPrevious = canGoPrevious;
    ns.canGoNext = canGoNext;
})(window.everyLearn);
