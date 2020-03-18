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
    }

}

export {FSIngredientsStore}
