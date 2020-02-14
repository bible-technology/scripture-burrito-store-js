'use strict';
import * as fse from 'fs-extra';

import {IngredientsStore} from "./ingredients_store.js";

class FSIngredientsStore extends IngredientsStore {
    /**
       * @param {string} sDir a path at which to use or create storage
    */
    constructor(burritoStore, sDir) {
	if (!sDir) {
	    throw new BurritoError("StorageDirNotDefined");
	}
	super(burritoStore);
        this.ingredientsDir = sDir + "/ingredients";
	if (!(fse.existsSync(this.ingredientsDir))) {
	    fse.mkdirSync(this.ingredientsDir, {recursive: false});
	}
        this.ingredients = {};
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
