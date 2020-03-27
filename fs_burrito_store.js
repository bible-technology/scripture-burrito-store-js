import * as fse from "fs-extra";

import { BurritoError } from "./code/burrito_error.js";
import { BurritoStore } from "./code/burrito_store.js";
import { FSMetadataStore } from "./code/fs_metadata_store.js";
import { FSIngredientsStore } from "./code/fs_ingredients_store.js";

class FSBurritoStore extends BurritoStore {
    /**
       Class for a Filesystem-based Burrito Store.
       Metadata is loaded into working memory but cached using the filesystem.
       Ingredients are stored using the filesystem.
    */
    constructor(configJson, sDir) {
        if (!sDir) {
            throw new BurritoError("StorageDirNotDefined");
        }
        super(configJson);
        if (!fse.existsSync(sDir)) {
            fse.mkdirSync(sDir, { recursive: false });
        }
        this._metadataStore = new FSMetadataStore(this, sDir);
        this._ingredientsStore = new FSIngredientsStore(this, sDir);
    }

    idServerName(idServerId, nameLang) {
        const lang = nameLang ? nameLang : "en";
        const idDetails = this._metadataStore._idServers[idServerId];
        if ("name" in idDetails) {
            return idDetails["name"][lang];
        } else {
            return idDetails["id"];
        }
    }
}

export { FSBurritoStore };
