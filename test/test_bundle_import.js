require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const { createFSBurritoStore } = require('../fs_burrito_store.js');
const DBLImport = require('../code/dbl_metadata_import.js').DBLImport;
const BurritoValidator = require('../code/burrito_validator.js').BurritoValidator;

describe('Bundle Import', () => {
  let storagePath;
  let testDataDir;
  let bundleDir;
  let zip;

  before(async () => {
    storagePath = path.join(__dirname, 'test_temp_storage');
    testDataDir = path.join(__dirname, 'test_data');
    bundleDir = path.join(testDataDir, 'dbl_bundles', 'dbl_unit_test_text');
    zip = path.join(testDataDir, 'zips', 'dbl_unit_test_text.zip');
  });

  afterEach(async () => {
    if (fse.existsSync(storagePath)) {
      fse.removeSync(storagePath);
    }
  });

  it('Imports DBL Unit Test Text Entry from Zipfile using metadata.json', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromZipfile(zip);
    assert.equal(Object.keys(b.ingredients(sysUrl, entryId, entryRevision, variant)).length, 8);
  });

  it('Imports DBL Unit Test Text Entry using Stored SB Metadata', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromDir(bundleDir);
    assert.equal(Object.keys(b.ingredients(sysUrl, entryId, entryRevision, variant)).length, 8);
  });

  it('Import DBL Unit Test Text Entry using Stored DBL Metadata', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    const [sysUrl, entryId, entryRevision, variant] = b.importFromDblDir(bundleDir);
  });
});
