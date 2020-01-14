'use strict';

import {IngredientsStore} from "./ingredients_store.js";

class FSIngredientsStore extends IngredientsStore {
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
       Adds record for sysUrl
       * @param {string} sysUrl
     */
    __addSysUrlRecord(sysUrl) {
    }

    /**
       Adds record for entryId
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __addEntryRecord(sysUrl, entryId) {
    }

}

export {FSIngredientsStore}
