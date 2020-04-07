import * as fse from "fs-extra";
import * as path from "path";
import * as xmldom from "xmldom";


import { BurritoError } from "./code/burrito_error.js";
import { BurritoStore } from "./code/burrito_store.js";
import FSMetadataStore from './code/fs_metadata_store';
import { FSIngredientsStore } from "./code/fs_ingredients_store.js";
import { FSIngredientBuffer } from "./code/fs_ingredient_buffer.js";
import { DBLImport } from "./code/dbl_metadata_import.js";

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
        this._ingredientBuffer = new FSIngredientBuffer(this, sDir);
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

    __metadataFromBundlePath(bundlePath) {
        const metadataPath = path.join(bundlePath, "metadata.json");
        return JSON.parse(fse.readFileSync(metadataPath));
    }

    __metadataFromDblBundlePath(bundlePath) {
        const metadataPath = path.join(bundlePath, "metadata.xml");
        const metadataString = fse.readFileSync(metadataPath, "utf-8");
        const metadataDom = new xmldom.DOMParser().parseFromString(
            metadataString,
            "text/xml"
        );
        return new DBLImport(metadataDom).sbMetadata;
    }

    ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName) {
        const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
        return this._ingredientsStore.__ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName, md);
    }

}

export { FSBurritoStore };
