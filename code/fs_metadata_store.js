import * as fse from 'fs-extra';
import * as path from 'path';
import deepEqual from 'deep-equal';

import { BurritoError } from './burrito_error';
import { MetadataStore } from './metadata_store';

class FSMetadataStore extends MetadataStore {
  /**
     * @param {string} sDir a path at which to use or create storage
     */
  constructor(burritoStore, sDir) {
    if (!sDir) {
      throw new BurritoError('StorageDirNotDefined');
    }
    super(burritoStore);
    this._urls = {};
    this._idServers = {};
    this.metadataDir = path.join(sDir, 'metadata');
    if (fse.existsSync(this.metadataDir)) {
      this.loadEntries();
    } else {
      fse.mkdirSync(this.metadataDir, { recursive: false });
    }
  }

  async loadEntries() {
    await this.loadEntries1();
  }


  /**
     Helper method for async method loadEntries(). This method does all the work, synchronously.
     */
  loadEntries1() {
    throw new BurritoError("foo");
    for (const [url, decodedUrl, urlDir] of
         fse.readdirSync(this.metadataDir)
         .map(i => [i, decodeURIComponent(i), path.join(this.metadataDir, i)])) {
      this._urls[decodedUrl] = {};
      for (const [entry, decodedEntry, entryDir] of
           fse.readdirSync(urlDir)
           .map(i => [i, decodeURIComponent(i), path.join(urlDir, i)])) {
        this._urls[decodedUrl][decodedEntry] = {};
        for (const [revision, decodedRevision, revisionDir]
             of fse.readdirSync(entryDir)
             .map(i => [i, decodeURIComponent(i), path.join(entryDir, i)])) {
          this._urls[decodedUrl][decodedEntry][decodedRevision] = {};
          for (const [variant, decodedVariant, variantDir] of
               fse.readdirSync(revisionDir)
               .map(i => [i, decodeURIComponent(i), path.join(revisionDir, i, 'metadata.json')])) {
            const metadata = JSON.parse(fse.readFileSync(variantDir));
            this._urls[decodedUrl][decodedEntry][decodedRevision][decodedVariant] = metadata;
            this.__updateIdServerRecordFromMetadata(metadata);
          }
        }
      }
    }
  }

  /**
     */
  __idServerKeys() {
    return Object.keys(this._urls);
  }

  /**
     */
  __idServersDetails() {
    const ret = {};
    const urlKeys = Object.keys(this._urls);
    for (const key of urlKeys) {
      ret[key] = this.__idServersDetails1(key);
    }
    return ret;
  }

  __idServersDetails1(ids) {
    if (ids in this._idServers) {
      return this._idServers[ids];
    }
    return { id: ids };
  }

  /**
     */
  __idServersEntries() {
    const ret = {};
    for (const url of Object.entries(this._urls)) {
      ret[url[0]] = Object.keys(url[1]);
    }
    return ret;
  }

  /**
     */
  __idServerEntries(idServerId) {
    if (idServerId in this._urls) {
      return Object.keys(this._urls[idServerId]);
    }
    return null;
  }

  __idServerEntriesLatestRevision(idServerId) {
    if (idServerId in this._urls) {
      const ret = {};
      for (const [entryKey, entryVal] of Object.entries(this._urls[idServerId])) {
        const revisions = Object.values(entryVal);
        const latestRevision = revisions.reduce((a, b) => {
          const variantA = 'default' in a ? a.default : Object.values(a)[0];
          const variantB = 'default' in b ? b.default : Object.values(b)[0];
          return Date(variantA.meta.dateCreated) > Date(variantB.meta.dateCreated);
        });
        const latestRevisionVariant = 'default' in latestRevision
          ? latestRevision.default : Object.values(latestRevision)[0];
        ret[entryKey] = {
          id:
                        latestRevisionVariant.identification.systemId[latestRevisionVariant.identification.idServer]
                          .revision,
          variant: latestRevisionVariant.meta.variant,
          defaultLanguage: latestRevisionVariant.meta.defaultLanguage,
          name: latestRevisionVariant.identification.name,
          description:
                        'description' in latestRevisionVariant.identification
                          ? latestRevisionVariant.identification.description
                          : null,
          abbreviation:
                        'abbreviation' in latestRevisionVariant.identification
                          ? latestRevisionVariant.identification.abbreviation
                          : null,
          languages: latestRevisionVariant.languages,
        };
      }
      return ret;
    }
    return null;
  }

  /**
     */
  __idServerEntriesRevisions(idServerId) {
    if (idServerId in this._urls) {
      const ret = {};
      for (const entry of Object.entries(this._urls[idServerId])) {
        ret[entry[0]] = Object.keys(entry[1]);
      }
      return ret;
    }
    return null;
  }

  /**
     */
  __idServerEntryRevisions(idServerId, entryId) {
    if (idServerId in this._urls && entryId in this._urls[idServerId]) {
      return Object.keys(this._urls[idServerId][entryId]);
    }
    return null;
  }

  /**
     */
  __idServerEntryRevisionsVariants(idServerId, entryId) {
    if (idServerId in this._urls && entryId in this._urls[idServerId]) {
      const ret = {};
      for (const entry of Object.entries(this._urls[idServerId][entryId])) {
        ret[entry[0]] = Object.keys(entry[1]);
      }
      return ret;
    }
    return null;
  }

  __idServerEntryRevisionVariants(idServerId, entryId, revisionId) {
    if (
      idServerId in this._urls
            && entryId in this._urls[idServerId]
            && revisionId in this._urls[idServerId][entryId]
    ) {
      return Object.keys(this._urls[idServerId][entryId][revisionId]);
    }
    return null;
  }

  /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
  __sysUrlRecord(sysUrl) {
    if (sysUrl in this._urls) {
      return {
        idServer: { id: sysUrl },
      };
    }
    return null;
  }

  /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
  __entryRecord(sysUrl, entryId) {
    if (sysUrl in this._urls && entryId in this._urls[sysUrl]) {
      return {
        idServer: { id: sysUrl },
        entry: { id: entryId },
      };
    }
    return null;
  }

  /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
  __revisionRecord(sysUrl, entryId, revisionId) {
    if (sysUrl in this._urls && entryId in this._urls[sysUrl] && revisionId in this._urls[sysUrl][entryId]) {
      return {
        idServer: { id: sysUrl },
        entry: { id: entryId },
        revision: { id: revisionId },
      };
    }
    return null;
  }

  /**
       Returns variant metadata or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
       * @param {string} variantId
     */
  __variantMetadata(sysUrl, entryId, revisionId, variantId) {
    if (
      sysUrl in this._urls
            && entryId in this._urls[sysUrl]
            && revisionId in this._urls[sysUrl][entryId]
            && variantId in this._urls[sysUrl][entryId][revisionId]
    ) {
      return JSON.parse(JSON.stringify(this._urls[sysUrl][entryId][revisionId][variantId]));
    }
    return null;
  }

  /**
       Updates variant metadata, returns that metadata or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
       * @param {string} variantId
     */
  __updateVariantMetadata(sysUrl, entryId, revisionId, variantId, newMetadata) {
    if (
      sysUrl in this._urls
            && entryId in this._urls[sysUrl]
            && revisionId in this._urls[sysUrl][entryId]
            && variantId in this._urls[sysUrl][entryId][revisionId]
    ) {
      const schemaValidationResult = this._burritoStore._validator.schemaValidate('metadata', newMetadata);
      if (schemaValidationResult.result !== 'accepted') {
        throw new BurritoError('ImportedMetadataNotSchemaValid', schemaValidationResult.schemaErrors);
      }
      this._urls[sysUrl][entryId][revisionId][variantId] = JSON.parse(JSON.stringify(newMetadata));
      return newMetadata;
    }
    return null;
  }

  /**
       Adds a Url record
       * @param {string} sysUrl
     */
  __addSysUrlRecord(sysUrl) {
    this._urls[sysUrl] = {};
    const urlDir = path.join(this.metadataDir, encodeURIComponent(sysUrl));
    if (fse.existsSync(urlDir)) {
      throw new BurritoError('newUrlDirAlreadyExists');
    } else {
      fse.mkdirSync(urlDir, { recursive: false });
    }
  }

  /**
       Adds an entry record
       * @param {string} sysUrl
       * @param {string} entryId
     */
  __addEntryRecord(sysUrl, entryId) {
    this._urls[sysUrl][entryId] = {};
    const entryDir = path.join(this.metadataDir, encodeURIComponent(sysUrl), encodeURIComponent(entryId));
    if (fse.existsSync(entryDir)) {
      throw new BurritoError('newEntryDirAlreadyExists');
    } else {
      fse.mkdirSync(entryDir, { recursive: false });
    }
  }

  /**
       Adds a revision record
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
  __addRevisionRecord(sysUrl, entryId, revisionId) {
    this._urls[sysUrl][entryId][revisionId] = {};
    const revisionDir = this.metadataDir
      + '/'
      + encodeURIComponent(sysUrl)
      + '/'
      + encodeURIComponent(entryId)
      + '/'
      + encodeURIComponent(revisionId);
    if (fse.existsSync(revisionDir)) {
      throw new BurritoError('newRevisionDirAlreadyExists');
    } else {
      fse.mkdirSync(revisionDir, { recursive: false });
    }
  }

  /**
     * @param {string} sysUrl
     * @param {string} entryId
     * @param {string} revisionId
     * @param {string} metadata
     */
  __addEntryRevisionVariant(sysUrl, entryId, revisionId, variant, metadata) {
    const revisionRecord = this._urls[sysUrl][entryId][revisionId];
    if (variant in revisionRecord) {
      if (!deepEqual(metadata, revisionRecord[variant], { strict: true })) {
        throw new BurritoError('CannotModifyExistingVariant');
      }
    } else {
      this._urls[sysUrl][entryId][revisionId][variant] = JSON.parse(JSON.stringify(metadata));
      const variantDir = path.join(
        this.metadataDir,
        encodeURIComponent(sysUrl),
        encodeURIComponent(entryId),
        encodeURIComponent(revisionId),
        encodeURIComponent(variant),
      );
      if (fse.existsSync(variantDir)) {
        throw new BurritoError('newRevisionDirAlreadyExists');
      } else {
        fse.mkdirSync(variantDir, { recursive: false });
        fse.writeFileSync(path.join(variantDir, 'metadata.json'), JSON.stringify(metadata));
      }
    }
  }

  __updateIdServerRecordFromMetadata(metadata) {
    const { idServer } = metadata.identification;
    const idServerRecord = metadata.idServers[idServer];
    this._idServers[idServerRecord.id] = idServerRecord;
  }

  __deleteEntry(idServerId, entryId) {
    delete this._urls[idServerId][entryId];
    const entryDir = path.join(
      this.metadataDir,
      encodeURIComponent(idServerId),
      encodeURIComponent(entryId),
    );
    fse.remove(entryDir);
  }

  __deleteEntryRevision(idServerId, entryId, revisionId) {
    delete this._urls[idServerId][entryId][revisionId];
    const revisionDir = path.join(
      this.metadataDir,
      encodeURIComponent(idServerId),
      encodeURIComponent(entryId),
      encodeURIComponent(revisionId),
    );
    fse.remove(revisionDir);
    if (Object.keys(this._urls[idServerId][entryId]).length === 0) {
      this.__deleteEntry(idServerId, entryId);
    }
  }

  __deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId) {
    delete this._urls[idServerId][entryId][revisionId][variantId];
    const variantDir = path.join(
      this.metadataDir,
      encodeURIComponent(idServerId),
      encodeURIComponent(entryId),
      encodeURIComponent(revisionId),
      encodeURIComponent(variantId),
    );
    fse.remove(variantDir);
    if (Object.keys(this._urls[idServerId][entryId][revisionId]).length === 0) {
      this.__deleteEntryRevision(idServerId, entryId, revisionId);
    }
  }
}

export { FSMetadataStore as default };
