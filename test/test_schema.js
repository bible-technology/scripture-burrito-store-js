require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const { createFSBurritoStore } = require('../fs_burrito_store.js');

describe('Schema', () => {
  let testDataDir;
  let storagePath;
  let metadataDir;
  let validTextTranslation;

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  before(async () => {
    testDataDir = path.join(__dirname, 'test_data');
    storagePath = path.join(__dirname, 'test_temp_storage');
    metadataDir = path.join(testDataDir, 'metadata');
    validTextTranslation = JSON.parse(
      fse.readFileSync(path.join(metadataDir, 'textTranslation.json'), 'utf8'),
    );
  });

  // eslint-disable-next-line mocha/no-hooks-for-single-case
  afterEach(async () => {
    if (fse.existsSync(storagePath)) {
      fse.removeSync(storagePath);
    }
  });

  it('Accept test textTranslation document', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    try {
      b.importFromObject(validTextTranslation);
    } catch (err) {
      console.log(err.message);
      console.log(err.arg);
      assert.isTrue(false);
    }
  });
});
