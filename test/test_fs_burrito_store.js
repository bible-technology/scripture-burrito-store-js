require = require('esm')(module /* , options */);
const deepcopy = require('deepcopy');
const fse = require('fs-extra');
const path = require('path');
const assert = require('chai').assert;
const expect = require('chai').expect;
const crypto = require('crypto');
const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;


// eslint-disable-next-line mocha/no-mocha-arrows
describe('FS Burrito Class', () => {
  before(function () {
    this.storagePath = path.join(__dirname, 'test_temp_storage');
    this.bundleWritePath = path.join(__dirname, 'test_temp_bundles');
    this.testDataDir = path.join(__dirname, 'test_data');
    const metadataDir = path.join(this.testDataDir, 'metadata');
    this.metadata = {
      validTextTranslation: JSON.parse(fse.readFileSync(path.join(metadataDir, 'textTranslation.json'), 'utf8')),
      validAudioTranslation: JSON.parse(fse.readFileSync(path.join(metadataDir, 'audioTranslation.json'), 'utf8')),
      validDerivedTextTranslation: JSON.parse(
        fse.readFileSync(path.join(metadataDir, 'textTranslation_derived.json'), 'utf8'),
      ),
      scriptureTextNoRevision: JSON.parse(
        fse.readFileSync(path.join(metadataDir, 'scriptureTextNoRevision.json'), 'utf8'),
      ),
      scriptureTextDupRevision: JSON.parse(
        fse.readFileSync(path.join(metadataDir, 'scriptureTextDupRevision.json'), 'utf8'),
      ),
      validScriptureTextStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'stub.json'), 'utf8')),
      emptyStub: {},
      obsoleteStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'obsolete_stub.json'), 'utf8')),
      audioStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'audio_stub.json'), 'utf8')),
      xStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'x_stub.json'), 'utf8')),
      badServerStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'bad_server_stub.json'), 'utf8')),
      bananaVariantStub: JSON.parse(fse.readFileSync(path.join(metadataDir, 'banana_variant.json'), 'utf8')),
    };
    this.usxPath = path.join(this.testDataDir, 'ingredients', 'GEN.usx');
    this.mp3Path = path.join(this.testDataDir, 'ingredients', 'GEN_001.mp3');
    this.jhn3Mp3Paths = [
      path.join(this.testDataDir, 'ingredients', 'JHN_003_gnt.mp3'),
      path.join(this.testDataDir, 'ingredients', 'JHN_003_kjv.mp3')
      ];
  });

  afterEach(function () {
    if (fse.existsSync(this.storagePath)) {
      fse.removeSync(this.storagePath);
    }
    if (fse.existsSync(this.bundleWritePath)) {
      fse.removeSync(this.bundleWritePath);
    }
  });

  const ingredientCounts = function (store, idServer, entry, revision, variant) {
    const ingredientEntries = Object.entries(store.ingredients(idServer, entry, revision, variant));
    return [ingredientEntries.length, ingredientEntries.filter(([x, y]) => y).length];
  };

  it('Constructs successfully', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    assert.exists(b);
    assert.equal(b._config.storeClass, 'FSBurritoStore');
    assert.equal(b._config.validation, 'burrito');
    assert.equal(b._config.acceptedVersion, '*');
    assert.equal(b._config.allowXFlavors, false);
    assert.equal(b._config.subclassSettings.foo, 'baa');
  });

  it('Requires storeClass to match class', function () {
    try {
      const b = new FSBurritoStore(
        {
          storeClass: 'banana',
        },
        this.storagePath,
      );
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'ConfigJsonForWrongClass');
    }
  });

  it('Throws error on invalid config', function () {
    try {
      const b = new FSBurritoStore(
        {
          storeClass: 'FSBurrito',
          foo: 'baa',
        },
        this.storagePath,
      );
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'ConfigFileInvalid');
      const report = err.arg[0];
      assert.isTrue('params' in report);
      assert.isTrue('additionalProperty' in report.params);
      assert.equal(report.params.additionalProperty, 'foo');
    }
  });

  it('Implements importFromObject', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
  });

  it('Imports derived variant', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        acceptedDerivedVariants: ['derived_foo'],
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validDerivedTextTranslation);
  });

  it('Allow import of identical metadata twice', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
    b.importFromObject(this.metadata.validTextTranslation);
  });

  it('Do not allow import of different metadata for existing variant', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.validTextTranslation);
      const modifiedMetadata = deepcopy(this.metadata.validTextTranslation);
      modifiedMetadata.meta.generator.userName = 'John Doe';
      b.importFromObject(modifiedMetadata);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'CannotModifyExistingVariant');
    }
  });

  it('Throws exception from importFromObject on multiple revisions', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.scriptureTextDupRevision);
      assert.exists(b);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'UnableToFindMetadataId');
    }
  });

  it('Throws exception from importFromObject on no revision', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.scriptureTextNoRevision);
      assert.exists(b);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'UnableToFindMetadataId');
    }
  });

  it('Raises exception on adding variant with unsupported version', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedVersion: '0.2',
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.obsoleteStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'RejectedVersion');
    }
  });

  it('Raises exception on adding variant with x-flavor when not configured to accept', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.xStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'RejectedFlavor');
    }
  });

  it('Accepts variant with x-flavor when configured to accept', function () {
    /* Schema invalid because metadata is stub */
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        allowXFlavors: true,
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.xStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Raises exception on adding variant with no accepted id', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.badServerStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'NoAcceptableId');
    }
  });

  it('Accepts variant with explicit ID Server config', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
    assert.exists(b);
  });

  it('Raises exception on adding unknown variant', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'UnacceptableVariant');
    }
  });

  it('Accepts derived variant with * config', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
        acceptedDerivedVariants: ['*'],
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Accepts derived variant with explicit config', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
        acceptedDerivedVariants: ['derived_banana'],
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Implements idServers()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.equal(b.idServers().length, 0);
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(b.idServers().length, 1);
    assert.equal(b.idServers()[0], 'https://thedigitalbiblelibrary.org');
  });

  it('Implements idServersDetails()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.equal(Object.keys(b.idServersDetails()).length, 0);
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(Object.keys(b.idServersDetails()).length, 1);
    assert.equal(Object.keys(b.idServersDetails())[0], 'https://thedigitalbiblelibrary.org');
    assert.equal(
      b.idServersDetails()['https://thedigitalbiblelibrary.org'].id,
      'https://thedigitalbiblelibrary.org',
    );
  });

  it('Implements idServersEntries()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.equal(Object.keys(b.idServersEntries()).length, 0);
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(Object.keys(b.idServersEntries()).length, 1);
    assert.equal(b.idServersEntries()['https://thedigitalbiblelibrary.org'].length, 1);
  });

  it('Implements entries()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entries('https://thedigitalbiblelibrary.org'));
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 1);
  });

  it('Implements entriesRevisions()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entriesRevisions('https://thedigitalbiblelibrary.org'));
    b.importFromObject(this.metadata.validTextTranslation);
    const entryKeys = Object.keys(b.entriesRevisions('https://thedigitalbiblelibrary.org'));
    assert.equal(entryKeys.length, 1);
    assert.equal(b.entriesRevisions('https://thedigitalbiblelibrary.org')[entryKeys[0]].length, 1);
  });

  it('Implements entryRevisions()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entryRevisions('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'));
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(b.entryRevisions('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce').length, 1);
  });

  it('Implements entryRevisionsVariants()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'));
    b.importFromObject(this.metadata.validTextTranslation);
    const revisionKeys = Object.keys(
      b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'),
    );
    assert.equal(revisionKeys.length, 1);
    assert.equal(
      b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce')[revisionKeys[0]].length,
      1,
    );
  });

  it('Implements entriesLatestRevision()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entriesLatestRevision('https://thedigitalbiblelibrary.org'));
    b.importFromObject(this.metadata.validTextTranslation);
    const entryRecord = b.entriesLatestRevision('https://thedigitalbiblelibrary.org')['2880c78491b2f8ce'];
    expect(entryRecord).to.have.keys(
      'abbreviation',
      'defaultLanguage',
      'description',
      'id',
      'languages',
      'name',
      'variant',
    );
  });

  it('Implements entryRevisionVariants()', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      this.storagePath,
    );
    assert.isNull(b.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91'));
    b.importFromObject(this.metadata.validTextTranslation);
    b.importFromObject(this.metadata.validTextTranslation);
    assert.equal(b.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91').length, 1);
  });

  it('Implements exportToObject', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
    const md = b.exportToObject('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source');
    assert.isObject(md);
  });

  it('exportToObject raises exception if variant not found', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    try {
      b.importFromObject(this.metadata.validTextTranslation);
      const md = b.exportToObject('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '99', 'source');
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'VariantNotFoundInStore');
    }
  });

  it('Implements exportToDir', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    b.exportToDir('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', this.bundleWritePath);
    assert.isTrue(fse.existsSync(path.join(this.bundleWritePath, 'metadata.json')));
    assert.isTrue(fse.existsSync(path.join(this.bundleWritePath, 'release', 'audio', 'GEN', 'GEN_001.mp3')));
  });

  it('Manipulates an ingredient in the ingredient buffer', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    const ingredientUuid = b.bufferIngredientFromFilePath('release/GEN.usx', this.usxPath);
    const ingredients = b.bufferIngredients();
    assert.equal(ingredients.length, 1);
    assert.equal(ingredients[0], ingredientUuid);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    assert.equal(ingredientStats.id, ingredientUuid);
    assert.equal(ingredientStats.url, 'release/GEN.usx');
    const ingredientContent = b.readBufferIngredient(ingredientUuid);
    assert.equal(crypto.createHash('MD5').update(ingredientContent).digest('hex'), ingredientStats.checksum.md5);
    b.deleteBufferIngredient(ingredientUuid);
    assert.equal(b.bufferIngredients().length, 0);
    const ingredientUuid2 = b.bufferIngredientFromFilePath('release/GEN_001.mp3', this.mp3Path);
    const ingredientStats2 = b.bufferIngredientStats(ingredientUuid2);
    const ingredientContent2 = b.readBufferIngredient(ingredientUuid2);
    assert.equal(crypto.createHash('MD5').update(ingredientContent2).digest('hex'), ingredientStats2.checksum.md5);
    assert.equal(b.bufferIngredients().length, 1);
    b.deleteAllBufferIngredients();
    assert.equal(b.bufferIngredients().length, 0);
    const ingredientUuid3 = b.bufferIngredientFromJSBuffer('release/GEN_001.mp3', fse.readFileSync(this.mp3Path));
    const ingredientStats3 = b.bufferIngredientStats(ingredientUuid3);
    const ingredientContent3 = b.readBufferIngredient(ingredientUuid3);
    assert.equal(crypto.createHash('MD5').update(ingredientContent3).digest('hex'), ingredientStats3.checksum.md5);
  });

  it('Implements cacheIngredient', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '6/0');
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(b.bufferIngredients().length, 0);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '6/1');
  });

  it('Implements addOrUpdateIngredient', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
    var ingredientUrl = 'release/audio/GEN/GEN_001.mp3';
    var ingredientUuid = b.bufferIngredientFromFilePath(ingredientUrl, this.mp3Path);
    var ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.addOrUpdateIngredient('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source', ingredientStats);
    assert.equal(b.bufferIngredients().length, 0);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source').join('/'), '179/1');
    var md = b.metadataContent('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source');
    assert.equal(md.ingredients[ingredientUrl]["mimeType"], "application/octet-stream");
    ingredientUuid = b.bufferIngredientFromFilePath(ingredientUrl, this.mp3Path);
    ingredientStats = b.bufferIngredientStats(ingredientUuid);
    ingredientStats["mimeType"] = "audio/mpeg";
    ingredientStats["scope"] = {"GEN": ["1"]};
    b.addOrUpdateIngredient('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source', ingredientStats);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source').join('/'), '179/1');
    md = b.metadataContent('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source');
    assert.equal(md.ingredients[ingredientUrl]["mimeType"], "audio/mpeg");
    assert.equal(md.ingredients[ingredientUrl]["scope"]["GEN"][0], "1");
  });

  it('Implements deleteIngredient', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '6/1');
    b.deleteIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats.url);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '5/0');
  });

  it('Implements ingredients (list)', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const ingredients = b.ingredients('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source');
  });

  it('Implements ingredientContent', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const content = b.ingredientContent('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', 'release/audio/GEN/GEN_001.mp3');
    assert.equal(crypto.createHash('MD5').update(content).digest('hex'), ingredientStats.checksum.md5);
  });

  it('Implements ingredientLocation', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const location = b.ingredientLocation('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', 'release/audio/GEN/GEN_001.mp3');
  });

  it('Implements deleteEntryRevisionVariant', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 1);
    b.deleteEntryRevisionVariant('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source');
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 0);
  });

  it('Implements deleteEntryRevision', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 1);
    b.deleteEntryRevision('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9');
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 0);
  });

  it('Implements deleteEntry', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 1);
    b.deleteEntry('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679');
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 0);
  });

  // Tests for persistant stores only (currently fs_burrito_store)

  it('Implements Garbage Collection for One Entry', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    this.jhn3Mp3Paths.forEach(function (jhn3path) {
      var ingredientUuid = b.bufferIngredientFromFilePath('release/audio/JHN/JHN_003.mp3', jhn3path);
      var ingredientStats = b.bufferIngredientStats(ingredientUuid);
      b.addOrUpdateIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    });
    var jhn3Report = b.gcMark('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679')["release/audio/JHN/JHN_003.mp3"];
    assert.equal(Object.keys(jhn3Report).length, 2);
    b.gc('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679');
    jhn3Report = b.gcMark('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679')["release/audio/JHN/JHN_003.mp3"];
    assert.equal(Object.keys(jhn3Report).length, 1);
  });
  
  
  it('Implements Garbage Collection for Whole Store', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', this.mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    this.jhn3Mp3Paths.forEach(function (jhn3path) {
      var ingredientUuid = b.bufferIngredientFromFilePath('release/audio/JHN/JHN_003.mp3', jhn3path);
      var ingredientStats = b.bufferIngredientStats(ingredientUuid);
      b.addOrUpdateIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    });
    var jhn3Report = b.gcMark('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679')["release/audio/JHN/JHN_003.mp3"];
    assert.equal(Object.keys(jhn3Report).length, 2);
    b.gcAll();
    jhn3Report = b.gcMark('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679')["release/audio/JHN/JHN_003.mp3"];
    assert.equal(Object.keys(jhn3Report).length, 1);
  });
  
  
  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('Persistant metadata storage', function () {
    const b = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    b.importFromObject(this.metadata.validTextTranslation);
    const b2 = new FSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      this.storagePath,
    );
    assert.equal(b2.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91').length, 1);
  });
});
