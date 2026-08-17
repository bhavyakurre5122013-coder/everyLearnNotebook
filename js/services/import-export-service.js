(function(ns){
    "use strict";
    const state = ns.state;
    const saveStoredData = (...args) => ns.saveStoredData(...args);
    const migrateData = (...args) => ns.migrateData(...args);
/* everyLearn — Import / Export */




function exportApplicationData() {
    const blob = new Blob(
        [JSON.stringify(state.data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download =
        `everyLearn-${new Date().toISOString().slice(0, 10)}.json`;

    anchor.click();
    URL.revokeObjectURL(url);
}

function importApplicationData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            try {
                state.data = migrateData(
                    JSON.parse(reader.result)
                );

                saveStoredData(state.data);
                resolve(state.data);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () =>
            reject(
                reader.error ||
                new Error("Import failed.")
            );

        reader.readAsText(file);
    });
}

    ns.exportApplicationData = exportApplicationData;
    ns.importApplicationData = importApplicationData;
})(window.everyLearn);
