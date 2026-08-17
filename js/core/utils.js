(function(ns){
    "use strict";
/*
=============================================================
everyLearn — General Utilities
=============================================================
*/

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function normalizeText(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function escapeHTML(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function deepClone(value) {
    return structuredClone(value);
}

function formatCount(count, singular, plural = `${singular}s`) {
    return `${count} ${count === 1 ? singular : plural}`;
}

function formatTime(totalSeconds) {
    const seconds = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
        remainder
    ).padStart(2, "0")}`;
}

function isEmptyString(value) {
    return String(value ?? "").trim().length === 0;
}

function now() {
    return Date.now();
}

    ns.clamp = clamp;
    ns.normalizeText = normalizeText;
    ns.escapeHTML = escapeHTML;
    ns.deepClone = deepClone;
    ns.formatCount = formatCount;
    ns.formatTime = formatTime;
    ns.isEmptyString = isEmptyString;
    ns.now = now;
})(window.everyLearn);
