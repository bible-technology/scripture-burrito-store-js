
require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');
const xmldom = require('xmldom');

const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;
const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;
const BurritoValidator = require('../code/burrito_validator.js').BurritoValidator;

describe('Bundle Import', function() {
  before(function () {
    this.storagePath = path.join(__dirname, 'test_temp_storage');
    this.testDataDir = path.join(__dirname, 'test_data');
    this.bundleDir = path.join(this.testDataDir, 'dbl_bundles', 'dbl_unit_test_text');
    this.zip = path.join(this.testDataDir, 'zips', 'dbl_unit_test_text.zip');
    this.domParser = new xmldom.DOMParser();
  });

  afterEach(function () {
    if (fse.existsSync(this.storagePath)) {
      fse.removeSync(this.storagePath);
    }
  });

  it('Imports DBL Unit Test Text Entry using Stored SB Metadata', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromDir(this.bundleDir);
    assert.equal(Object.keys(b.ingredients(sysUrl, entryId, entryRevision, variant)).length, 8);
  });

  it('Imports DBL Unit Test Text Entry from Zipfile using metadata.json', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromZipfile(this.zip);
    assert.equal(Object.keys(b.ingredients(sysUrl, entryId, entryRevision, variant)).length, 8);
  });

  it('Imports DBL Unit Test Text Entry from Zipfile using metadata.xml', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromDblZipfile(this.zip);
    assert.equal(Object.keys(b.ingredients(sysUrl, entryId, entryRevision, variant)).length, 8);
  });

  it('Imports DBL Unit Test Text Entry using Stored DBL Metadata', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromDblDir(this.bundleDir);
  });
});
