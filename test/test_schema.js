
require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;

describe('Schema', function() {
  before(function () {
    this.testDataDir = path.join(__dirname, 'test_data');
    this.storagePath = path.join(__dirname, 'test_temp_storage');
    const metadataDir = path.join(this.testDataDir, 'metadata');
    this.validTextTranslation = JSON.parse(
      fse.readFileSync(path.join(metadataDir, 'textTranslation.json'), 'utf8'),
    );
  });

  afterEach(function () {
    if (fse.existsSync(this.storagePath)) {
      fse.removeSync(this.storagePath);
    }
  });

  it('Accept test textTranslation document', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.validTextTranslation);
    } catch (err) {
      console.log(err.message);
      console.log(err.arg);
      assert.isTrue(false);
    }
  });
});
