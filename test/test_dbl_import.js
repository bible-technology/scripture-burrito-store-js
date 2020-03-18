'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;

describe("DBL Import", function() {

  before(function() {
    this.testDataDir = path.join(__dirname, "test_data");
    const dblMetadataDir = path.join(this.testDataDir, "dbl_metadata");
    this.dblTestEntry = fse.readFileSync(path.join(dblMetadataDir, "dbl_test_entry.xml"), "utf8");
    this.convertor = new DBLImport();
  });
    
    it("Convert DBL Test Entry", function() {
      this.convertor.dblDomToSBMetadata(this.dblTestEntry);
    });

});
