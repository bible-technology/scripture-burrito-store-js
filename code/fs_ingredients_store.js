'use strict';

import {IngredientsStore} from "./ingredients_store.js";

class FSIngredientsStore extends IngredientsStore {
    /**
    */
    constructor(burritoStore) {
	super(burritoStore);
    }
}

export {FSIngredientsStore}
