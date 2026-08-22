(function(ns){
    "use strict";
/* everyLearn — Color Helpers */
function colorToLight(hex) {
    const value = String(hex || "").replace("#", "");

    if (!/^[0-9a-f]{6}$/i.test(value)) {
        return "#E8F1FF";
    }

    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return `rgb(
        ${Math.round(r + (255 - r) * 0.9)},
        ${Math.round(g + (255 - g) * 0.9)},
        ${Math.round(b + (255 - b) * 0.9)}
    )`;
}

    ns.colorToLight = colorToLight;
})(window.everyLearn);
