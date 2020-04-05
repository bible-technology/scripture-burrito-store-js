"use strict";

require = require("esm")(module /*, options*/);
const assert = require("chai").assert;
const path = require("path");
const fse = require("fs-extra");
const xmldom = require("xmldom");

const DBLImport = require("../code/dbl_metadata_import.js").DBLImport;
const BurritoValidator = require("../code/burrito_validator.js").BurritoValidator;

describe("DBL Open Access Burrito Metadata Import", function() {
    before(function() {});

    const self = this;
    const testDataDir = path.join(__dirname, "test_data");
    const dblMetadataDir = path.join(testDataDir, "dbl_metadata");
    const oabDataDir = path.join(dblMetadataDir, "oab");
    fse.readdirSync(oabDataDir).forEach(function(file) {
        it("Convert DBL Open Access Entry" + " " + file, function() {
            const entry = new xmldom.DOMParser().parseFromString(
                fse.readFileSync(path.join(oabDataDir, file), "utf8"),
                "text/xml"
            );
            const converted = new DBLImport(entry);
            // console.log(JSON.stringify(converted.sbMetadata.meta, null, 2));
            const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
            // console.log(validationResult);
            assert.equal(validationResult.result, "accepted");
        });
    });
});
