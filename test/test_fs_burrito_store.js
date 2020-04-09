require = require('esm')(module /* , options */);
const deepcopy = require('deepcopy');
const fse = require('fs-extra');
const path = require('path');
const assert = require('chai').assert;
const expect = require('chai').expect;
const crypto = require('crypto');
const { createFSBurritoStore } = require('../fs_burrito_store.js');


describe('FS Burrito Class', () => {
  let storagePath;
  let bundleWritePath;
  let testDataDir;
  let metadataDir;
  let metadata;
  let usxPath;
  let mp3Path;

  before(async () => {
    storagePath = path.join(__dirname, 'test_temp_storage');
    bundleWritePath = path.join(__dirname, 'test_temp_bundles');
    testDataDir = path.join(__dirname, 'test_data');
    metadataDir = path.join(testDataDir, 'metadata');
    metadata = {
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
    usxPath = path.join(testDataDir, 'ingredients', 'GEN.usx');
    mp3Path = path.join(testDataDir, 'ingredients', 'GEN_001.mp3');
  });

  afterEach(async () => {
    if (fse.existsSync(storagePath)) {
      fse.removeSync(storagePath);
    }
    if (fse.existsSync(bundleWritePath)) {
      fse.removeSync(bundleWritePath);
    }
  });

  const ingredientCounts = function (store, idServer, entry, revision, variant) {
    const ingredientEntries = Object.entries(store.ingredients(idServer, entry, revision, variant));
    return [ingredientEntries.length, ingredientEntries.filter(([x, y]) => y).length];
  };

  it('Constructs successfully', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    assert.exists(b);
    assert.equal(b._config.storeClass, 'FSBurritoStore');
    assert.equal(b._config.validation, 'burrito');
    assert.equal(b._config.acceptedVersion, '*');
    assert.equal(b._config.allowXFlavors, false);
    assert.equal(b._config.subclassSettings.foo, 'baa');
  });

  it('Requires storeClass to match class', async () => {
    try {
      await createFSBurritoStore(
        {
          storeClass: 'banana',
        },
        storagePath,
      );
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'ConfigJsonForWrongClass');
    }
  });

  it('Throws error on invalid config', async () => {
    try {
      await createFSBurritoStore(
        {
          storeClass: 'FSBurrito',
          foo: 'baa',
        },
        storagePath,
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

  it('Implements importFromObject', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    b.importFromObject(metadata.validTextTranslation);
  });

  it('Imports derived variant', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        acceptedDerivedVariants: ['derived_foo'],
      },
      storagePath,
    );
    b.importFromObject(metadata.validDerivedTextTranslation);
  });

  it('Allow import of identical metadata twice', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    b.importFromObject(metadata.validTextTranslation);
    b.importFromObject(metadata.validTextTranslation);
  });

  it('Do not allow import of different metadata for existing variant', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.validTextTranslation);
      const modifiedMetadata = deepcopy(metadata.validTextTranslation);
      modifiedMetadata.meta.generator.userName = 'John Doe';
      b.importFromObject(modifiedMetadata);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'CannotModifyExistingVariant');
    }
  });

  it('Throws exception from importFromObject on multiple revisions', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.scriptureTextDupRevision);
      assert.exists(b);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'UnableToFindMetadataId');
    }
  });

  it('Throws exception from importFromObject on no revision', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
        subclassSettings: { foo: 'baa' },
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.scriptureTextNoRevision);
      assert.exists(b);
      throw Error('Too Far');
    } catch (err) {
      assert.equal(err.message, 'UnableToFindMetadataId');
    }
  });

  it('Raises exception on adding variant with unsupported version', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedVersion: '0.2',
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.obsoleteStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'RejectedVersion');
    }
  });

  it('Raises exception on adding variant with x-flavor when not configured to accept', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.xStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'RejectedFlavor');
    }
  });

  it('Accepts variant with x-flavor when configured to accept', async () => {
    /* Schema invalid because metadata is stub */
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        allowXFlavors: true,
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.xStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Raises exception on adding variant with no accepted id', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.badServerStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'NoAcceptableId');
    }
  });

  it('Accepts variant with explicit ID Server config', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      storagePath,
    );
    b.importFromObject(metadata.validTextTranslation);
    assert.exists(b);
  });

  it('Raises exception on adding unknown variant', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotConfigCompatible');
      assert.equal(err.arg, 'UnacceptableVariant');
    }
  });

  it('Accepts derived variant with * config', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
        acceptedDerivedVariants: ['*'],
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Accepts derived variant with explicit config', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        acceptedIdServers: ['https://thedigitalbiblelibrary.org'],
        acceptedDerivedVariants: ['derived_banana'],
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.bananaVariantStub);
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'ImportedMetadataNotSchemaValid');
    }
  });

  it('Implements idServers()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.equal(b.idServers().length, 0);
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(b.idServers().length, 1);
    assert.equal(b.idServers()[0], 'https://thedigitalbiblelibrary.org');
  });

  it('Implements idServersDetails()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.equal(Object.keys(b.idServersDetails()).length, 0);
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(Object.keys(b.idServersDetails()).length, 1);
    assert.equal(Object.keys(b.idServersDetails())[0], 'https://thedigitalbiblelibrary.org');
    assert.equal(
      b.idServersDetails()['https://thedigitalbiblelibrary.org'].id,
      'https://thedigitalbiblelibrary.org',
    );
  });

  it('Implements idServersEntries()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.equal(Object.keys(b.idServersEntries()).length, 0);
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(Object.keys(b.idServersEntries()).length, 1);
    assert.equal(b.idServersEntries()['https://thedigitalbiblelibrary.org'].length, 1);
  });

  it('Implements entries()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entries('https://thedigitalbiblelibrary.org'));
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(b.entries('https://thedigitalbiblelibrary.org').length, 1);
  });

  it('Implements entriesRevisions()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entriesRevisions('https://thedigitalbiblelibrary.org'));
    b.importFromObject(metadata.validTextTranslation);
    const entryKeys = Object.keys(b.entriesRevisions('https://thedigitalbiblelibrary.org'));
    assert.equal(entryKeys.length, 1);
    assert.equal(b.entriesRevisions('https://thedigitalbiblelibrary.org')[entryKeys[0]].length, 1);
  });

  it('Implements entryRevisions()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entryRevisions('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'));
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(b.entryRevisions('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce').length, 1);
  });

  it('Implements entryRevisionsVariants()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'));
    b.importFromObject(metadata.validTextTranslation);
    const revisionKeys = Object.keys(
      b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce'),
    );
    assert.equal(revisionKeys.length, 1);
    assert.equal(
      b.entryRevisionsVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce')[revisionKeys[0]].length,
      1,
    );
  });

  it('Implements entriesLatestRevision()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entriesLatestRevision('https://thedigitalbiblelibrary.org'));
    b.importFromObject(metadata.validTextTranslation);
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

  it('Implements entryRevisionVariants()', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
      },
      storagePath,
    );
    assert.isNull(b.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91'));
    b.importFromObject(metadata.validTextTranslation);
    b.importFromObject(metadata.validTextTranslation);
    assert.equal(b.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91').length, 1);
  });

  it('Implements exportToObject', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validTextTranslation);
    const md = b.exportToObject('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91', 'source');
    assert.isObject(md);
  });

  it('exportToObject raises exception if variant not found', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    try {
      b.importFromObject(metadata.validTextTranslation);
      b.exportToObject('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '99', 'source');
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'VariantNotFoundInStore');
    }
  });

  it('Implements exportToDir', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    b.exportToDir('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', bundleWritePath);
    assert.isTrue(fse.existsSync(path.join(bundleWritePath, 'metadata.json')));
    assert.isTrue(fse.existsSync(path.join(bundleWritePath, 'release', 'audio', 'GEN', 'GEN_001.mp3')));
  });

  it('Manipulates an ingredient in the ingredient buffer', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    const ingredientUuid = b.bufferIngredientFromFilePath('release/GEN.usx', usxPath);
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
    const ingredientUuid2 = b.bufferIngredientFromFilePath('release/GEN_001.mp3', mp3Path);
    const ingredientStats2 = b.bufferIngredientStats(ingredientUuid2);
    const ingredientContent2 = b.readBufferIngredient(ingredientUuid2);
    assert.equal(crypto.createHash('MD5').update(ingredientContent2).digest('hex'), ingredientStats2.checksum.md5);
    assert.equal(b.bufferIngredients().length, 1);
    b.deleteAllBufferIngredients();
    assert.equal(b.bufferIngredients().length, 0);
  });

  it('Implements cacheIngredient', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(b.bufferIngredients().length, 0);
  });

  it('Implements uncacheIngredient', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '6/1');
    b.uncacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats.url);
    assert.equal(ingredientCounts(b, 'https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source').join('/'), '6/0');
  });

  it('Implements ingredients (list)', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const ingredients = b.ingredients('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source');
  });

  it('Implements ingredientContent', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const content = b.ingredientContent('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', 'release/audio/GEN/GEN_001.mp3');
    assert.equal(crypto.createHash('MD5').update(content).digest('hex'), ingredientStats.checksum.md5);
  });

  it('Implements ingredientLocation', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validAudioTranslation);
    const ingredientUuid = b.bufferIngredientFromFilePath('release/audio/GEN/GEN_001.mp3', mp3Path);
    const ingredientStats = b.bufferIngredientStats(ingredientUuid);
    b.cacheIngredient('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', ingredientStats);
    const location = b.ingredientLocation('https://thedigitalbiblelibrary.org', '6e0d81a24efbb679', '9', 'source', 'release/audio/GEN/GEN_001.mp3');
  });

  // eslint-disable-next-line mocha/no-skipped-tests
  it('Persistant metadata storage', async () => {
    const b = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    b.importFromObject(metadata.validTextTranslation);
    const b2 = await createFSBurritoStore(
      {
        storeClass: 'FSBurritoStore',
        validation: 'burrito',
      },
      storagePath,
    );
    assert.equal(b2.entryRevisionVariants('https://thedigitalbiblelibrary.org', '2880c78491b2f8ce', '91').length, 1);
  });
});
