'use strict';

import {MetadataStore} from "./metadata_store.js";

class FSMetadataStore extends MetadataStore {
    /**
    */
    constructor(burritoStore) {
	super(burritoStore);
    }

    /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
    __sysUrlRecord(sysUrl) {
	return {"sysUrl": sysUrl};
    }

    /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __entryRecord(sysUrl, entryId) {
	return {"sysUrl": sysUrl, "entryId": entryId};
    }

    /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
    __revisionRecord(sysUrl, entryId, revisionId) {
	return {"sysUrl": sysUrl, "entryId": entryId, "revisionId": revisionId};
    }

    /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
    __addSysUrlRecord(sysUrl) {
    }

    /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __addEntryRecord(sysUrl, entryId) {

    }

    /**
       Returns record for revisionId or null
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
     */
    __addRevisionRecord(sysUrl, entryId, revisionId) {
    }

    /**
       * @param {string} sysUrl
       * @param {string} entryId
       * @param {string} revisionId
       * @param {string} metadata
     */
    __addEntryRevisionVariant(sysUrl, entryId, revisionId, metadata) {
    }

}

export {FSMetadataStore}
