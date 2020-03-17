'use strict';

import * as fse from 'fs-extra';
import deepEqual from 'deep-equal';

import {BurritoError} from "./burrito_error.js";
import {MetadataStore} from "./metadata_store.js";

class FSMetadataStore extends MetadataStore {
    /**
       * @param {string} sDir a path at which to use or create storage
    */
    constructor(burritoStore, sDir) {
	if (!sDir) {
	    throw new BurritoError("StorageDirNotDefined");
	}
	super(burritoStore);
	this._urls = {};
	this._idServers = {};
        this.metadataDir = sDir + "/metadata";
	if (fse.existsSync(this.metadataDir)) {
	    this.loadEntries();
	} else {
	    fse.mkdirSync(this.metadataDir, {recursive: false});
	}
    }

  /**
   */
  loadEntries() {
    var self = this;
    fse.readdir(
      self.metadataDir,
      function(err, urls) {
        if (err) {
          console.log(err);
          throw new BurritoError("loadEntriesUrls");
        }
        urls.forEach(
          function (url, index) {
            const decodedUrl = decodeURIComponent(url);
            self._urls[decodedUrl] = {};
            const urlDir = self.metadataDir + "/" + url;
            fse.readdir(
              urlDir,
              function(err, entries) {
                if (err) {
                  console.log(err);
                  throw new BurritoError("loadEntriesEntries");
                }
                entries.forEach(
                  function (entry, index) {
                    const decodedEntry = decodeURIComponent(entry);
                    self._urls[decodedUrl][decodedEntry] = {};
                    const entryDir = urlDir + "/" + entry;
                    fse.readdir(
                      entryDir,
                      function(err, revisions) {
                        if (err) {
                          console.log(err);
                          throw new BurritoError("loadEntriesRevisions");
                        }
                        revisions.forEach(
                          function (revision, index) {
                            const decodedRevision = decodeURIComponent(revision);
                            self._urls[decodedUrl][decodedEntry][decodedRevision] = {};
                            const revisionDir = entryDir + "/" + revision;
                            fse.readdir(
                              revisionDir,
                              function(err, variants) {
                                if (err) {
                                  console.log(err);
                                  throw new BurritoError("loadEntriesVariants");
                                }
                                variants.forEach(
                                  function (variant, index) {
                                    const decodedVariant = decodeURIComponent(variant);
                                    const variantDir = revisionDir + "/" + variant + "/metadata.json";
                                    const metadata = JSON.parse(fse.readFileSync(variantDir));
                                    self._urls[decodedUrl][decodedEntry][decodedRevision][decodedVariant] = metadata;
                                    self.__updateIdServerRecordFromMetadata(metadata);
                                  }
                                )
                              }
                            )
                          }
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        )
      }
    )
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

    __idServersDetails1 (ids) {
	if (ids in this._idServers) {
	    return this._idServers[ids];
	} else {
	    return {"id": ids};
	}
    }

    /**
     */
    __idServersEntries() {
	var ret = {};
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
	} else {
	    return null;
	}
    }

    __idServerEntriesLatestRevision(idServerId) {
	if (idServerId in this._urls) {
	    var ret = {};
	    for (const [entryKey, entryVal] of Object.entries(this._urls[idServerId])) {
		const revisions = Object.values(entryVal);
		const latestRevision = revisions.reduce(
		    function(a, b) {
			const variantA = ("default" in a) ? a["default"]: Object.values(a)[0];
			const variantB = ("default" in b) ? b["default"]: Object.values(b)[0];
			return Date(variantA.meta.dateCreated) > Date(variantB.meta.dateCreated);
		    }
		);
		const latestRevisionVariant = ("default" in latestRevision) ? latestRevision["default"] : Object.values(latestRevision)[0];
		ret[entryKey] = {
		    "id": latestRevisionVariant.identification.systemId[latestRevisionVariant.identification.idServer].revision,
		    "variant": latestRevisionVariant.meta.variant,
		    "defaultLanguage": latestRevisionVariant.meta.defaultLanguage,
		    "name": latestRevisionVariant.identification.name,
		    "description": ("description" in latestRevisionVariant.identification) ? latestRevisionVariant.identification.description : null,
		    "abbreviation": ("abbreviation" in latestRevisionVariant.identification) ? latestRevisionVariant.identification.abbreviation : null,
		    "languages": latestRevisionVariant.languages
		};
	    }
	    return ret;
	} else {
	    return null;
	}
    }

    /**
     */
    __idServerEntriesRevisions(idServerId) {
	if (idServerId in this._urls) {
	    var ret = {};
	    for (const entry of Object.entries(this._urls[idServerId])) {
		ret[entry[0]] = Object.keys(entry[1]);
	    }
	    return ret;
	} else {
	    return null;
	}
    }

    /**
     */
    __idServerEntryRevisions(idServerId, entryId) {
	if (idServerId in this._urls && entryId in this._urls[idServerId]) {
	    return Object.keys(this._urls[idServerId][entryId]);
	} else {
	    return null;
	}
    }

    /**
     */
    __idServerEntryRevisionsVariants(idServerId, entryId) {
	if (idServerId in this._urls && entryId in this._urls[idServerId]) {
	    var ret = {};
	    for (const entry of Object.entries(this._urls[idServerId][entryId])) {
		ret[entry[0]] = Object.keys(entry[1]);
	    }
	    return ret;
	} else {
	    return null;
	}
    }

    __idServerEntryRevisionVariants(idServerId, entryId, revisionId) {
	if (idServerId in this._urls && entryId in this._urls[idServerId] && revisionId in this._urls[idServerId][entryId]) {
	    return Object.keys(this._urls[idServerId][entryId][revisionId]);
	} else {
	    return null;
	}
    }
    
    /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
    __sysUrlRecord(sysUrl) {
	if (sysUrl in this._urls) {
	    return {
		"idServer": {"id": sysUrl}
	    };
	} else {
	    return null;
	}
    }

    /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __entryRecord(sysUrl, entryId) {
	if ((sysUrl in this._urls) &&
	    (entryId in this._urls[sysUrl])) {
	    return {
		"idServer": {"id": sysUrl},
		"entry": {"id": entryId}
	    }
	} else {
	    return null;
	}
    }

    /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
    __revisionRecord(sysUrl, entryId, revisionId) {
	if ((sysUrl in this._urls) &&
	    (entryId in this._urls[sysUrl]) &&
	    (revisionId in this._urls[sysUrl][entryId])) {
	    return {
		"idServer": {"id": sysUrl},
		"entry": {"id": entryId},
		"revision": {"id": revisionId}
	    }
	} else {
	    return null;
	}
    }

    /**
       Returns variant metadata or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
       * @param {string} variantId
     */
    __variantMetadata(sysUrl, entryId, revisionId, variantId) {
	if ((sysUrl in this._urls) &&
	    (entryId in this._urls[sysUrl]) &&
	    (revisionId in this._urls[sysUrl][entryId]) &&
	    (variantId in this._urls[sysUrl][entryId][revisionId])) {
		return this._urls[sysUrl][entryId][revisionId][variantId];
	} else {
	    return null;
	}
    }

    /**
       Adds a Url record
       * @param {string} sysUrl
     */
    __addSysUrlRecord(sysUrl) {
      this._urls[sysUrl] = {};
      const urlDir = this.metadataDir + "/" + encodeURIComponent(sysUrl);
      if (fse.existsSync(urlDir)) {
	throw new BurritoError("newUrlDirAlreadyExists");
      } else {
	fse.mkdirSync(urlDir, {recursive: false});
      }
    }

    /**
       Adds an entry record
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __addEntryRecord(sysUrl, entryId) {
      this._urls[sysUrl][entryId] = {};
      const entryDir = this.metadataDir + "/" + encodeURIComponent(sysUrl) + "/" + encodeURIComponent(entryId);
      if (fse.existsSync(entryDir)) {
	throw new BurritoError("newEntryDirAlreadyExists");
      } else {
	fse.mkdirSync(entryDir, {recursive: false});
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
      const revisionDir = this.metadataDir + "/" + encodeURIComponent(sysUrl) + "/" + encodeURIComponent(entryId) + "/" + encodeURIComponent(revisionId);
      if (fse.existsSync(revisionDir)) {
	throw new BurritoError("newRevisionDirAlreadyExists");
      } else {
	fse.mkdirSync(revisionDir, {recursive: false});
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
      if (!deepEqual(metadata, revisionRecord[variant], {"strict": true})) {
	throw new BurritoError("CannotModifyExistingVariant");
      }
    } else {
      this._urls[sysUrl][entryId][revisionId][variant] = metadata;
      const variantDir = this.metadataDir + "/" + encodeURIComponent(sysUrl) + "/" + encodeURIComponent(entryId) + "/" + encodeURIComponent(revisionId) + "/" + encodeURIComponent(variant);
      if (fse.existsSync(variantDir)) {
	throw new BurritoError("newRevisionDirAlreadyExists");
      } else {
	fse.mkdirSync(variantDir, {recursive: false});
        fse.writeFileSync(
          variantDir + "/metadata.json",
          JSON.stringify(metadata)
        );
      }
    }
  }

    __updateIdServerRecordFromMetadata(metadata) {
      const idServer = metadata.identification.idServer;
	const idServerRecord = metadata.idServers[idServer];
      this._idServers[idServerRecord["id"]] = idServerRecord;
    }

}

export {FSMetadataStore}
