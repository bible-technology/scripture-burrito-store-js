
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
    this.domParser = new xmldom.DOMParser();
  });

  afterEach(function () {
    if (fse.existsSync(this.storagePath)) {
      fse.removeSync(this.storagePath);
    }
  });

  it('Import DBL Unit Test Text Entry using Stored SB Metadata', function () {
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

  it('Import DBL Unit Test Text Entry using Stored DBL Metadata', function () {
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
