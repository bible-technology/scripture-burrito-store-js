import {BurritoStore} from "./code/burrito_store.js";

class FSBurritoStore extends BurritoStore {
    /**
       Class for a Filesystem-based Burrito Store. Metadata is loaded into working memory but cached using the filesystem. Ingredients are stored using the filesystem.
    */
    constructor(configJson) {
	super(configJson);
    }
}

export {FSBurritoStore}
