"use strict";

require = require("esm")(module /*, options*/);
const assert = require("chai").assert;
const path = require("path");
const fse = require("fs-extra");

const SB01Import = require("../code/sb01_import.js").SB01Import;
const BurritoValidator = require("../code/burrito_validator.js").BurritoValidator;

describe("SB01 Import", function() {
    before(function() {
        this.testDataDir = path.join(__dirname, "test_data");
        const sb01MetadataDir = path.join(this.testDataDir, "sb01_metadata");
        this.glossedTextStory = JSON.parse(
            fse.readFileSync(path.join(sb01MetadataDir, "glossed_text_story.json"), "utf8")
        );
        this.versification = JSON.parse(
            fse.readFileSync(path.join(sb01MetadataDir, "peripheral_versification.json"), "utf8")
        );
        this.wordAlignment = JSON.parse(
            fse.readFileSync(path.join(sb01MetadataDir, "parascriptural_word_alignment.json"), "utf8")
        );
    });

    it("Convert Glossed Text Story", function() {
        const converted = new SB01Import(this.glossedTextStory);
        // console.log(JSON.stringify(converted.sb02Metadata, null, 2));
        const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sb02Metadata);
        // console.log(validationResult);
        assert.equal(validationResult.result, "accepted");
    });

    it("Convert Versification", function() {
        const converted = new SB01Import(this.versification);
        // console.log(JSON.stringify(converted.sb02Metadata, null, 2));
        const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sb02Metadata);
        // console.log(validationResult);
        assert.equal(validationResult.result, "accepted");
    });

    it("Convert Word Alignment", function() {
        const converted = new SB01Import(this.wordAlignment);
        // console.log(JSON.stringify(converted.sb02Metadata, null, 2));
        const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sb02Metadata);
        // console.log(validationResult);
        assert.equal(validationResult.result, "accepted");
    });
});
