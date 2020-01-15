'use strict';

import deepEqual from 'deep-equal';

import {BurritoError} from "./burrito_error.js";
import {MetadataStore} from "./metadata_store.js";

class FSMetadataStore extends MetadataStore {
    /**
    */
    constructor(burritoStore) {
	super(burritoStore);
	this._urls = {};
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

}

export {FSMetadataStore}
