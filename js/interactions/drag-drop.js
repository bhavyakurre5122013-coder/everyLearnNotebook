(function(ns){
    "use strict";
/* everyLearn — Drag and Drop */
function makeDraggable(
    element,
    {
        onDragStart,
        onDragOver,
        onDrop
    } = {}
) {
    if (!element) return;

    element.draggable = true;

    element.addEventListener(
        "dragstart",
        event => {
            onDragStart?.(event);
        }
    );

    element.addEventListener(
        "dragover",
        event => {
            event.preventDefault();
            onDragOver?.(event);
        }
    );

    element.addEventListener(
        "drop",
        event => {
            event.preventDefault();
            onDrop?.(event);
        }
    );
}

    ns.makeDraggable = makeDraggable;
})(window.everyLearn);
