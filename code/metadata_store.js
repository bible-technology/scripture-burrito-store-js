
import { BurritoError } from './burrito_error.js';

class MetadataStore {
  /**
     */
  constructor(burritoStore) {
    this._burritoStore = burritoStore;
  }

  /** Returns [idServer, id, revision] if exactly one systemID with a revision is found, otherwise returns [null, null, null].
     * @param {Object} metadata - metadata for a Burrito
     *@return {Array}
     */
  idFromMetadataObject(metadata) {
    try {
      const idServers = metadata.idServers;
      const systemIds = metadata.identification.systemId;
      let sysUrl;
      let entryId;
      let revisionId = null;
      Object.keys(systemIds).forEach((systemAbbr) => {
        const systemId = systemIds[systemAbbr];
        if ('revision' in systemId) {
          if (sysUrl) {
            throw new BurritoError('UnableToFindMetadataId');
          }
          entryId = systemId.id;
          revisionId = systemId.revision;
          sysUrl = idServers[systemAbbr].id;
        }
      });
      return [sysUrl, entryId, revisionId];
    } catch (err) {
      return [null, null, null];
    }
  }

  /**
       Adds a variant to an entry revision. If the variant exists and has the same metadata checksum,
       this is a no-op. It is an error to add a variant that is already present and which has a different
       checksum.
       * @param {Object} metadata
       */
  addEntryRevisionVariant(metadata, variant) {
    const [sysUrl, entryId, revisionId] = this.idFromMetadataObject(metadata);
    if (!sysUrl) {
      throw new BurritoError('UnableToFindMetadataId');
    }
    this.touchEntryRevision(sysUrl, entryId, revisionId);
    this.__addEntryRevisionVariant(sysUrl, entryId, revisionId, variant, metadata);
    this.__updateIdServerRecordFromMetadata(metadata);
  }

  __updateIdServerRecordFromMetadata(metadata) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Creates a record for sysUrl, entryId and revisionId if these records do not exist.
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
  touchEntryRevision(sysUrl, entryId, revisionId) {
    if (!this.__sysUrlRecord(sysUrl)) {
      this.__addSysUrlRecord(sysUrl);
    }
    if (!this.__entryRecord(sysUrl, entryId)) {
      this.__addEntryRecord(sysUrl, entryId);
    }
    if (!this.__revisionRecord(sysUrl, entryId, revisionId)) {
      this.__addRevisionRecord(sysUrl, entryId, revisionId);
    }
  }

  /**
     */
  __idServerKeys() {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
     */
  __idServersDetails() {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServersEntries() {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntries(idServerId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntriesLatestRevision(idServerId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntriesRevisions(idServerId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntryRevisions(idServerId, entryId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntryRevisionsVariants(idServerId, entryId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __idServerEntryRevisionVariants(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
  __sysUrlRecord(sysUrl) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
  __entryRecord(sysUrl, entryId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
  __revisionRecord(sysUrl, entryId, revisionId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __variantMetadata(sysUrl, entryId, revisionId, variantId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __updateVariantMetadata(sysUrl, entryId, revisionId, variantId, newMetadata) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
  __addSysUrlRecord(sysUrl) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
  __addEntryRecord(sysUrl, entryId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
  __addRevisionRecord(sysUrl, entryId, revisionId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
     * @param {string} sysUrl
     * @param {string} entryId
     * @param {string} revisionId
     * @param {string} metadata
     */
  __addEntryRevisionVariant(sysUrl, entryId, revisionId, metadata) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }
}

export { MetadataStore };
