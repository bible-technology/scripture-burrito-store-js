import * as xmldom from 'xmldom';
import AdmZip from 'adm-zip';

import { BurritoError } from './burrito_error.js';
import { ConfigReader } from './config_reader.js';
import { BurritoValidator } from './burrito_validator.js';
import { DBLImport } from './dbl_metadata_import.js';

/**
   An abstract class for a Burrito Store. Subclasses should implement storage-specific methods.
   * @type module:BurritoStore
   * @require BurritoError
   */

class BurritoStore {
  /**
       Expects a configuration object, which must be valid and for the subclass that is being constructed.
       * @param {Object} configJson - A JSON object containing config options
       */
  constructor(configJson) {
    if (new.target === BurritoStore) {
      throw new BurritoError('CannotConstructDirectly');
    }
    this._validator = new BurritoValidator();
    this._config = new ConfigReader(this, configJson);
    if (this._config.storeClass !== new.target.name) {
      throw new BurritoError('ConfigJsonForWrongClass');
    }
    this._metadataStore = null;
    this._ingredientsStore = null;
    this._ingredientBuffer = null;
  }

  /* Utilities */

  /** */
  idServerName(idServerId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* STATE CHANGES */

  /* share, receiveRevision, sendDraft, receiveDraft */

  /**
     Creates a new variant (and, if necessary, a new revision and entry) using metadata based on DBL Metadata.
     * @param {Object} dblDom - DBL 2.x metadata as DOM
     * @return {undefined}
     */
  importFromDBLMetadata(dblDom) {
    this.importFromObject(DBLImport.dblDomToSBMetadata(dblDom));
  }

  /**
       Creates a new variant (and, if necessary, a new revision and entry) using the provided metadata.
       * @param {Object} metadata - Scripture Burrito metadata as a JS object
       * @return [sysUrl, entryId, entryRevision, variant]
       */
  importFromObject(metadata) {
    if (!metadata) {
      throw new BurritoError('NoMetadataSupplied');
    }
    const [sysUrl, entryId, entryRevision] = this._metadataStore.idFromMetadataObject(metadata);
    if (!sysUrl) {
      throw new BurritoError('UnableToFindMetadataId');
    }
    const configCompatibleResult = this._config.metadataCompatible(metadata);
    if (configCompatibleResult.result !== 'accepted') {
      /* console.log(configCompatibleResult); */
      throw new BurritoError('ImportedMetadataNotConfigCompatible', configCompatibleResult.reason);
    }
    const schemaValidationResult = this._validator.schemaValidate('metadata', metadata);
    if (schemaValidationResult.result !== 'accepted') {
      /* console.log(schemaValidationResult.message); */
      throw new BurritoError('ImportedMetadataNotSchemaValid', schemaValidationResult.schemaErrors);
    }
    const variant = this._metadataVariant(metadata);
    this._metadataStore.addEntryRevisionVariant(metadata, variant);
    return [sysUrl, entryId, entryRevision, variant];
  }

  /**
       Needs revisiting once we start implementing the proper processing model - using cacheIngredient for now.
     */
  importFromDir(bundlePath) {
    const self = this;
    const bundleMetadata = this.__metadataFromBundlePath(bundlePath);
    const [sysUrl, entryId, entryRevision, variant] = this.importFromObject(bundleMetadata);
    for (const ingredientUrl of Object.keys(bundleMetadata.ingredients)) {
      const ingredientUuid = this._ingredientBuffer.importBundleIngredient(
        ingredientUrl,
        bundlePath,
      );
      const ingredientStats = this.bufferIngredientStats(ingredientUuid);
      self.cacheIngredient(sysUrl, entryId, entryRevision, variant, ingredientStats);
    }
    return [sysUrl, entryId, entryRevision, variant];
  }

  /**
       Needs revisiting once we start implementing the proper processing model - using cacheIngredient for now.
     */
  importFromDblDir(bundlePath) {
    const self = this;
    const bundleMetadata = this.__metadataFromDblBundlePath(bundlePath);
    const [sysUrl, entryId, entryRevision, variant] = this.importFromObject(bundleMetadata);
    for (const ingredientUrl of Object.keys(bundleMetadata.ingredients)) {
      const ingredientUuid = this._ingredientBuffer.importBundleIngredient(
        ingredientUrl,
        bundlePath,
      );
      const ingredientStats = this.bufferIngredientStats(ingredientUuid);
      self.cacheIngredient(sysUrl, entryId, entryRevision, variant, ingredientStats);
    }
    return [sysUrl, entryId, entryRevision, variant];
  }

  __metadataFromBundlePath(path) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __metadataFromDblBundlePath(path) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
     Imports a variant from a DBL-style ZIP archive, referenced by FS path, using metadata.json.
     Checks that zip contents are in metadata.
   */
  importFromZipfile(path) {
    const zipArchive = new AdmZip(path);
    const entriesLookup = {};
    for (const entry of zipArchive.getEntries()) {
      entriesLookup[entry.entryName] = entry;
    }
    const bundleMetadata = JSON.parse(zipArchive.readAsText(entriesLookup['metadata.json']));
    const [sysUrl, entryId, entryRevision, variant] = this.importFromObject(bundleMetadata);
    const metadataIngredients = Object.keys(bundleMetadata.ingredients);
    for (const entry of Object.values(entriesLookup)) {
      if (metadataIngredients.includes(entry.entryName)) {
        const ingredientUuid = this.bufferIngredientFromJSBuffer(entry.entryName, zipArchive.readFile(entry));
        const ingredientStats = this.bufferIngredientStats(ingredientUuid);
        this.cacheIngredient(sysUrl, entryId, entryRevision, variant, ingredientStats);
      }
    }
    return [sysUrl, entryId, entryRevision, variant];
  }

  /**
     Imports a variant from a DBL-style ZIP archive, referenced by FS path, using metadata.xml.
     Checks that zip contents are in metadata.
   */
  importFromDblZipfile(path) {
    const zipArchive = new AdmZip(path);
    const entriesLookup = {};
    for (const entry of zipArchive.getEntries()) {
      entriesLookup[entry.entryName] = entry;
    }
    const metadataDom = new xmldom.DOMParser().parseFromString(
      zipArchive.readAsText(entriesLookup['metadata.xml']),
      'text/xml',
    );
    const bundleMetadata = new DBLImport(metadataDom).sbMetadata;
    const [sysUrl, entryId, entryRevision, variant] = this.importFromObject(bundleMetadata);
    const metadataIngredients = Object.keys(bundleMetadata.ingredients);
    for (const entry of Object.values(entriesLookup)) {
      if (metadataIngredients.includes(entry.entryName)) {
        const ingredientUuid = this.bufferIngredientFromJSBuffer(entry.entryName, zipArchive.readFile(entry));
        const ingredientStats = this.bufferIngredientStats(ingredientUuid);
        this.cacheIngredient(sysUrl, entryId, entryRevision, variant, ingredientStats);
        this._ingredientBuffer.delete(ingredientStats.id);
      }
    }
    return [sysUrl, entryId, entryRevision, variant];
  }

  /**
       Returns the requested variant metadata as a dictionary. It is an error for the variant not to exist.
     */
  exportToObject(idServerId, entryId, revisionId, variantId) {
    const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    if (md) {
      return md;
    }
    throw new BurritoError('VariantNotFoundInStore');
  }

  exportToDir(idServerId, entryId, revisionId, variantId, toPath) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  exportToZipfile(idServerId, entryId, revisionId, variantId, toPath) {
    const zip = new AdmZip();
    zip.addFile(
      'metadata.json',
      JSON.stringify(
        this.metadataContent(idServerId, entryId, revisionId, variantId), null, 2,
      ),
    );
    zip.writeZip(toPath, (error) => {
      if (error) {
        throw new BurritoError(`Error writing zip to '${toPath}', message '${error.message}'`);
      }
    });
  }

  /* toTemplate */

  defaultToTemplate(idServerId, entryId, revisionId, templateData, filter = null) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* toNew */

  templateToNew(idServerId, templateName) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* toUpdate */

  defaultToUpdate(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* acceptDraft */

  newToDefault(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  updateToDefault(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* makeDerived */

  defaultToDerived(idServerId, entryId, revisionId, derivativeName) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* ownEntry */

  importAsOwnedFromObject(metadata) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  importAsOwnedFromDir(path) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  importAsOwnedFromZip(path) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* CRUD */

  /* List */

  idServers() {
    return this._metadataStore.__idServerKeys();
  }

  idServersDetails() {
    return this._metadataStore.__idServersDetails();
  }

  idServersEntries() {
    return this._metadataStore.__idServersEntries();
  }

  entries(idServerId) {
    return this._metadataStore.__idServerEntries(idServerId);
  }

  entriesLatestRevision(idServerId) {
    return this._metadataStore.__idServerEntriesLatestRevision(idServerId);
  }

  entriesRevisions(idServerId) {
    return this._metadataStore.__idServerEntriesRevisions(idServerId);
  }

  entryRevisions(idServerId, entryId) {
    return this._metadataStore.__idServerEntryRevisions(idServerId, entryId);
  }

  entryRevisionsVariants(idServerId, entryId) {
    return this._metadataStore.__idServerEntryRevisionsVariants(idServerId, entryId);
  }

  entryRevisionVariants(idServerId, entryId, revisionId) {
    return this._metadataStore.__idServerEntryRevisionVariants(idServerId, entryId, revisionId);
  }

  entryRevisionVariantsDetails(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /**
       Returns an object containing information about the ingredients for a variant.
     */
  ingredients(idServerId, entryId, revisionId, variantId) {
    const metadata = this.metadataContent(idServerId, entryId, revisionId, variantId);
    return this._ingredientsStore.__listIngredients(idServerId, entryId, revisionId, variantId, metadata);
  }

  /* Read Metadata */

  metadataContent(idServerId, entryId, revisionId, variantId) {
    const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    if (md) {
      return md;
    }
    throw new BurritoError('VariantMetadataNotFound');
  }

  /* Read Ingredients */

  /**
       Returns the ingredient content as a JS buffer.
     */
  ingredientContent(idServerId, entryId, revisionId, variantId, ingredientName) {
    const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    return this._ingredientsStore.__ingredientContent(idServerId, entryId, revisionId, variantId, ingredientName, md);
  }

  /**
       Returns a direct, subclass-dependent handle or location fo the ingredient.
     */
  ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* Update Metadata */

  metadataForm(idServerId, entryId, revisionId, variantId, filter) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  submitMetadataForm(filter, form, minValidity = 'catalog') {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* Ingredient Buffer */

  bufferIngredientFromFilePath(ingredientUrl, filePath) {
    return this._ingredientBuffer.importFilePath(ingredientUrl, filePath);
  }

  bufferIngredientFromJSBuffer(ingredientUrl, jsBuffer) {
    return this._ingredientBuffer.importJSBuffer(ingredientUrl, jsBuffer);
  }

  bufferIngredients() {
    return this._ingredientBuffer.list();
  }

  bufferIngredientStats(ingredientId) {
    return this._ingredientBuffer.stats(ingredientId);
  }

  readBufferIngredient(ingredientId) {
    return this._ingredientBuffer.read(ingredientId);
  }

  deleteBufferIngredient(ingredientId) {
    return this._ingredientBuffer.delete(ingredientId);
  }

  deleteAllBufferIngredients() {
    return this._ingredientBuffer.deleteAll();
  }

  /* Add, Update, Remove, Cache Ingredients */

  /**
       Adds an ingredient that is already in the metadata to the store.
     */
  cacheIngredient(idServerId, entryId, revisionId, variantId, ingredientStats) {
    const metadata = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    if (!metadata) {
      throw new BurritoError('VariantNotFound');
    }
    const ingredientMetadata = metadata.ingredients[ingredientStats.url];
    if (!ingredientMetadata) {
      throw new BurritoError('IngredientNotFoundInMetadata');
    }
    if (ingredientMetadata.checksum.md5 != ingredientStats.checksum.md5) {
      console.log(JSON.stringify(ingredientMetadata) + '/' + JSON.stringify(ingredientStats));
      throw new BurritoError('IngredientChecksumMismatch');
    }
    this._ingredientsStore.__writeIngredient(idServerId, entryId, ingredientStats);
    this._ingredientBuffer.delete(ingredientStats.id);
  }

  /**
     Adds or updates an ingredient, both in the ingredients store and in the variant metadata.
     Looks for optional mimeType, role and scope in ingredientStats.
   */
  addOrUpdateIngredient(idServerId, entryId, revisionId, variantId, ingredientStats) {
    const metadata = JSON.parse(
      JSON.stringify(
        this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId),
      ),
    );
    if (!metadata) {
      throw new BurritoError('VariantNotFound');
    }
    const ingredientMetadata = {
      checksum: ingredientStats.checksum,
      size: ingredientStats.size,
      mimeType: ingredientStats.mimeType || 'application/octet-stream',
    };
    for (const statsKey of ['role', 'scope']) {
      if (statsKey in ingredientStats) {
        ingredientMetadata[statsKey] = ingredientStats[statsKey];
      }
    }
    metadata.ingredients[ingredientStats.url] = ingredientMetadata;
    this._metadataStore.__updateVariantMetadata(idServerId, entryId, revisionId, variantId, metadata);
    this._ingredientsStore.__writeIngredient(idServerId, entryId, ingredientStats);
    this._ingredientBuffer.delete(ingredientStats.id);
  }

  /**
     Deletes an ingredient from metadata.
   */
  deleteIngredient(idServerId, entryId, revisionId, variantId, ingredientUrl) {
    const metadata = JSON.parse(
      JSON.stringify(
        this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId),
      ),
    );
    if (!metadata) {
      throw new BurritoError('VariantNotFound');
    }
    const ingredientMetadata = metadata.ingredients[ingredientUrl];
    if (ingredientMetadata) {
      delete metadata.ingredients[ingredientUrl];
      this._metadataStore.__updateVariantMetadata(idServerId, entryId, revisionId, variantId, metadata);
    }
  }

  /* Validation */

  validateMetadata(idServerId, entryId, revisionId, variantId, schema = 'metadata') {
    throw new BurritoError('MethodNotYetImplemented');
  }

  validateConvention(idServerId, entryId, revisionId, variantId, conventionName) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  validateMetadataConventions(idServerId, entryId, revisionId, variantId) {
    throw new BurritoError('MethodNotYetImplemented');
  }

  /* Delete */

  deleteEntry(idServerId, entryId) {
    this._ingredientsStore.__deleteEntry(idServerId, entryId);
    this._metadataStore.__deleteEntry(idServerId, entryId);
  }

  deleteEntryRevision(idServerId, entryId, revisionId) {
    this._ingredientsStore.__deleteEntryRevision(idServerId, entryId, revisionId);
    this._metadataStore.__deleteEntryRevision(idServerId, entryId, revisionId);
  }

  deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId) {
    this._ingredientsStore.__deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId);
    this._metadataStore.__deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId);
  }

  /* Utility methods */
  _metadataVariant(metadata) {
    if ('variant' in metadata.meta) {
      return metadata.meta.variant;
    }
    return 'default';
  }
}

export { BurritoStore };
