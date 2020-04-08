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

    ingredientDir(idServerId, entryId, ingredientUrl) {
        return this.ingredientsDir + "/" + encodeURIComponent(idServerId) + "/" + entryId + "/" + encodeURIComponent(ingredientUrl);
    }

    __writeIngredient(idServerId, entryId, ingredientStats) {
        const ingredientDir = this.ingredientDir(
            idServerId,
            entryId,
            ingredientStats["url"]
        );
        if (!fse.existsSync(ingredientDir)) {
            fse.mkdirSync(ingredientDir, { recursive: true });
        }
        const ingredientFilePath = ingredientDir + "/" + ingredientStats["checksum"]["md5"];
        this._burritoStore._ingredientBuffer.fsRenameIngredient(ingredientStats["id"], ingredientFilePath);
    }

    __listIngredients(idServerId, entryId, revisionId, variantId, metadata) {
        const ret = {};
        for (let [url, ingredientOb] of Object.entries(metadata.ingredients)) {
            const ingredientDir = this.ingredientDir(idServerId, entryId, url);
            ret[url] = fse.existsSync(ingredientDir + "/" + ingredientOb["checksum"]["md5"]);
        }
        return ret;
    }

    __ingredientContent(idServerId, entryId, revisionId, variantId, ingredientId, metadata) {
        const ingredientChecksum = metadata.ingredients[ingredientId]["checksum"]["md5"];
        const ingredientPath = this.ingredientDir(idServerId, entryId, ingredientId) + "/" + ingredientChecksum;
        return fse.readFileSync(ingredientPath);
    }

    __ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientId, metadata) {
        const ingredientChecksum = metadata.ingredients[ingredientId]["checksum"]["md5"];
        return this.ingredientDir(idServerId, entryId, ingredientId) + "/" + ingredientChecksum;
    }

  __deleteIngredientContent(idServerId, entryId, ingredientUrl) {
        const ingredientDir = this.ingredientDir(
            idServerId,
            entryId,
            ingredientUrl
        );
        if (fse.existsSync(ingredientDir)) {
            fse.removeSync(ingredientDir);
        }
  }
  
}

export { FSIngredientsStore };
