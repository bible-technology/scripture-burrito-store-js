"use strict";
import * as fse from "fs-extra";

import { BurritoError } from "./burrito_error.js";
import { IngredientsStore } from "./ingredients_store.js";

class FSIngredientsStore extends IngredientsStore {
    /**
       FS-based ingredients store.
       Dir structure is idServer/entryId/ingredientId/checksum
       * @param {string} sDir a path at which to use or create storage
       */
    constructor(burritoStore, sDir) {
        if (!sDir) {
            throw new BurritoError("StorageDirNotDefined");
        }
        super(burritoStore);
        this.ingredientsDir = sDir + "/ingredients";
        if (!fse.existsSync(this.ingredientsDir)) {
            fse.mkdirSync(this.ingredientsDir, { recursive: false });
        }
    }

    __writeIngredient(idServerId, entryId, ingredientStats) {
        const ingredientDir = this.ingredientsDir + "/" + encodeURIComponent(idServerId) + "/" + entryId + "/" + encodeURIComponent(ingredientStats["url"]);
        if (!fse.existsSync(ingredientDir)) {
            fse.mkdirSync(ingredientDir, { recursive: true });
        }
        const ingredientFilePath = ingredientDir + "/" + ingredientStats["checksum"];
        this._burritoStore._ingredientBuffer.fsRenameIngredient(ingredientStats["id"], ingredientFilePath);
    }

}

export { FSIngredientsStore };
