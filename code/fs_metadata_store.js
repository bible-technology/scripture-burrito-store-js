'use strict';

import {MetadataStore} from "./metadata_store.js";

class FSMetadataStore extends MetadataStore {
    /**
    */
    constructor(burritoStore) {
	super(burritoStore);
    }
}

export {FSMetadataStore}
