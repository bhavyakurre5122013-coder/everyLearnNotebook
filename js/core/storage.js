(function(ns){
    "use strict";
    const APP = ns.APP;
/*
=============================================================
everyLearn — Storage
-------------------------------------------------------------
Purpose:
    The only module responsible for persistent localStorage
    access.

    Future account/cloud synchronization should be able to
    replace this layer without rewriting every UI component.
=============================================================
*/



function loadStoredData() {
    try {
        const raw = localStorage.getItem(APP.STORAGE_KEY);

        if (!raw) {
            return null;
        }

        return JSON.parse(raw);
    } catch (error) {
        console.error("everyLearn: failed to load storage.", error);
        return null;
    }
}

function saveStoredData(data) {
    try {
        localStorage.setItem(
            APP.STORAGE_KEY,
            JSON.stringify(data)
        );

        return true;
    } catch (error) {
        console.error("everyLearn: failed to save storage.", error);
        return false;
    }
}

function removeStoredData() {
    localStorage.removeItem(APP.STORAGE_KEY);
}

function clearAllApplicationStorage() {
    localStorage.clear();
}

function hasStoredData() {
    return localStorage.getItem(APP.STORAGE_KEY) !== null;
}

    ns.loadStoredData = loadStoredData;
    ns.saveStoredData = saveStoredData;
    ns.removeStoredData = removeStoredData;
    ns.clearAllApplicationStorage = clearAllApplicationStorage;
    ns.hasStoredData = hasStoredData;
})(window.everyLearn);
