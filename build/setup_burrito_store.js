"use strict";

require = require("esm")(module /*, options*/);
const path = require("path");
const fse = require("fs-extra");
const xmldom = require("xmldom");

const DBLImport = require("../code/dbl_metadata_import.js").DBLImport;
const FSBurritoStore = require("../fs_burrito_store.js").FSBurritoStore;

const testDataDir = path.join(__dirname, "..", "test", "test_data");
const dblMetadataDir = path.join(testDataDir, "dbl_metadata");
const oabDataDir = path.join(dblMetadataDir, "oab");
const burritoStore = new FSBurritoStore(
    {
        storeClass: "FSBurritoStore",
        validation: "burrito"
    },
    process.argv[2]
);
fse.readdirSync(oabDataDir).forEach(function(file) {
    
    console.log(file);
    const entry = new xmldom.DOMParser().parseFromString(
        fse.readFileSync(path.join(oabDataDir, file), "utf8"),
        "text/xml"
    );
    const converted = new DBLImport(entry);
    burritoStore.importFromObject(converted.sbMetadata);

});

