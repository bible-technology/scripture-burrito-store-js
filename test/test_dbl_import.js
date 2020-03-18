'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');
const xmldom = require('xmldom');

const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;

describe("DBL Import", function() {

  before(function() {
    this.testDataDir = path.join(__dirname, "test_data");
    const dblMetadataDir = path.join(this.testDataDir, "dbl_metadata");
    this.domParser = new xmldom.DOMParser();
    this.dblTestEntry = this.domParser.parseFromString(
      fse.readFileSync(path.join(dblMetadataDir, "dbl_test_entry.xml"), "utf8"),
      'text/xml'
    );
  });
    
    it("Convert DBL Test Entry", function() {
      const converted = new DBLImport(this.dblTestEntry);
      console.log(JSON.stringify(converted.sbMetadata, null, 2));
    });

});
