(function(ns){
    "use strict";
    const goHome = (...args) => ns.goHome(...args);
/* everyLearn — Ribbon */


function initRibbon() {
    document.getElementById("homeButton")?.addEventListener(
        "click",
        () => {
            goHome();
            document.dispatchEvent(
                new Event("everylearn:render")
            );
        }
    );
}

    ns.initRibbon = initRibbon;
})(window.everyLearn);
