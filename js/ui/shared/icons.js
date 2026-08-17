(function(ns){
    "use strict";
/* everyLearn — UI Icons */
const ICONS = {
    home: "home.svg",
    menu: "menu.svg",
    account: "account.svg",
    plus: "plus.svg",
    pencil: "pencil.svg",
    delete: "delete.svg",
    save: "save.svg",
    bookmark: "bookmark.svg",
    favorite: "favorite.svg",
    settings: "settings.svg",
    search: "search.svg",
    close: "close.svg"
};

function iconURL(name) {
    return `./assets/icons/ui/${ICONS[name] || ICONS.close}`;
}

function iconImage(name, {
    className = "",
    alt = ""
} = {}) {
    return `
        <img
            class="${className}"
            src="${iconURL(name)}"
            alt="${escapeAttribute(alt)}"
            ${alt ? "" : 'aria-hidden="true"'}
        >
    `;
}

function escapeAttribute(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

    ns.iconURL = iconURL;
    ns.iconImage = iconImage;
    ns.ICONS = ICONS;
})(window.everyLearn);
