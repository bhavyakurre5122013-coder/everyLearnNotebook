(function(ns){
    "use strict";
    const clearAllApplicationStorage = (...args) => ns.clearAllApplicationStorage(...args);
/* everyLearn — Cache Service */


async function clearApplicationCache({
    includeBrowserCaches = true
} = {}) {
    clearAllApplicationStorage();

    if (
        includeBrowserCaches &&
        "caches" in window
    ) {
        const names = await caches.keys();
        await Promise.all(
            names.map(name => caches.delete(name))
        );
    }
}

    ns.clearApplicationCache = clearApplicationCache;
})(window.everyLearn);
