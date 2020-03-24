'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');
const xmldom = require('xmldom');

const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;
const BurritoValidator = require('../code/burrito_validator.js').BurritoValidator;

describe("DBL Import", function() {

  before(function() {
    this.testDataDir = path.join(__dirname, "test_data");
    const dblMetadataDir = path.join(this.testDataDir, "dbl_metadata");
    this.domParser = new xmldom.DOMParser();
    this.dblTextTestEntry = this.domParser.parseFromString(
      fse.readFileSync(path.join(dblMetadataDir, "dbl_test_text_entry.xml"), "utf8"),
      'text/xml'
    );
    this.dblAudioTestEntry = this.domParser.parseFromString(
      fse.readFileSync(path.join(dblMetadataDir, "dbl_test_audio_entry.xml"), "utf8"),
      'text/xml'
    );
    this.dblPrintTestEntry = this.domParser.parseFromString(
      fse.readFileSync(path.join(dblMetadataDir, "dbl_test_print_entry.xml"), "utf8"),
      'text/xml'
    );
  });
    
    it("Convert DBL Test Text Entry", function() {
      const converted = new DBLImport(this.dblTextTestEntry);
      // console.log(JSON.stringify(converted.sbMetadata.type, null, 2));
      const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
      // console.log(validationResult);
      assert.equal(validationResult.result, "accepted");
    });

    it("Convert DBL Test Audio Entry", function() {
      const converted = new DBLImport(this.dblAudioTestEntry);
      // console.log(JSON.stringify(converted.sbMetadata.type, null, 2));
      const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
      // console.log(validationResult);
      assert.equal(validationResult.result, "accepted");
    });

    it("Convert DBL Test Print Entry", function() {
      const converted = new DBLImport(this.dblPrintTestEntry);
      // console.log(JSON.stringify(converted.sbMetadata.type, null, 2));
      const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
      // console.log(validationResult);
      assert.equal(validationResult.result, "accepted");
    });

  /*
  const oabDataDir = path.join(__dirname, "test_data", "dbl_metadata", "oab");
  const self = this;
  fse.readdirSync(oabDataDir).forEach(
    function (file) {
      it("Convert DBL Open Access Entry" + " " + file, function() {
        const entry = new xmldom.DOMParser().parseFromString(
          fse.readFileSync(
            path.join(oabDataDir, file),
            "utf8"
          ),
          'text/xml'
        );
        const converted = new DBLImport(entry);
        // console.log(JSON.stringify(converted.sbMetadata.meta, null, 2));
        const validationResult = new BurritoValidator().schemaValidate("metadata", converted.sbMetadata);
        // console.log(validationResult);
        assert.equal(validationResult.result, "accepted");
      }
        )
    }
  )*/

});
