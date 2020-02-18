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
        this.metadataDir = sDir + "/metadata";
	if (fse.existsSync(this.metadataDir)) {
	    this.loadEntries();
	} else {
	    fse.mkdirSync(this.metadataDir, {recursive: false});
	}
	this._urls = {};
	this._idServers = {};
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
	this._urls[sysUrl] = {}
    }

    /**
       Adds an entry record
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __addEntryRecord(sysUrl, entryId) {
	this._urls[sysUrl][entryId] = {}
    }

    /**
       Adds a revision record
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
    __addRevisionRecord(sysUrl, entryId, revisionId) {
	this._urls[sysUrl][entryId][revisionId] = {}
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
	}
    }

    __updateIdServerRecordFromMetadata(metadata) {
	const idServer = metadata.identification.idServer;
	const idServerRecord = metadata.idServers[idServer];
	this._idServers[idServerRecord["id"]] = idServerRecord;
    }

}

export {FSMetadataStore}
