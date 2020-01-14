'use strict';

import {BurritoError} from './burrito_error.js';

class IngredientsStore {
    /**
    */
    constructor(burritoStore) {
	this._burritoStore = burritoStore;
    }

    /**
       Creates a record for sysUrl and entryId if these records do not exist.
       * @param {string} sysUrl
       * @param {string} entryId
     */
    touchEntry(sysUrl, entryId) {
	if (!this.__sysUrlRecord(sysUrl)) {
	    this.__addsysUrlRecord(sysUrl);
	}
	if (!this.__entryRecord(entryId)) {
	    this.__addEntryRecord(sysUrl);
	}
    }

    /**
       Returns record for sysUrl or null
       * @param {string} sysUrl
     */
    __sysUrlRecord(sysUrl) {
	throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Returns record for entryId or null
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __entryRecord(sysUrl, entryId) {
	throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Adds record for sysUrl
       * @param {string} sysUrl
     */
    __addSysUrlRecord(sysUrl) {
	throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Adds record for entryId
       * @param {string} sysUrl
       * @param {string} entryId
     */
    __addEntryRecord(sysUrl, entryId) {
	throw new BurritoError("MethodNotOverriddenBySubclass");
    }

}

export {IngredientsStore}
