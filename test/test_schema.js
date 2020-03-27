"use strict";

require = require("esm")(module /*, options*/);
const assert = require("chai").assert;
const path = require("path");
const fse = require("fs-extra");

const FSBurritoStore = require("../fs_burrito_store.js").FSBurritoStore;

describe("Schema", function() {
    before(function() {
        this.testDataDir = path.join(__dirname, "test_data");
        const metadataDir = path.join(this.testDataDir, "metadata");
        this.validTextTranslation = JSON.parse(
            fse.readFileSync(path.join(metadataDir, "TextTranslation.json"), "utf8")
        );
    });

    it("Accept test textTranslation document", function() {
        const b = new FSBurritoStore({
            storeClass: "FSBurritoStore"
        });
        try {
            b.importFromObject(this.validTextTranslation);
        } catch (err) {
            console.log(err.message);
            console.log(err.arg);
            assert.isTrue(false);
        }
    });
});
