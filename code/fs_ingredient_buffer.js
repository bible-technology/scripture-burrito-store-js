"use strict";
import * as fse from "fs-extra";

import { IngredientBuffer } from "./ingredient_buffer.js";

class FSIngredientBuffer extends IngredientBuffer {
    /**
     * @param {string} sDir a path at which to use or create storage
     */
    constructor(burritoStore, sDir) {
        if (!sDir) {
            throw new BurritoError("StorageDirNotDefined");
        }
        super(burritoStore);
        this.bufferDir = sDir + "/buffer";
        if (!fse.existsSync(this.bufferDir)) {
            fse.mkdirSync(this.bufferDir, { recursive: false });
        } else {
            this.deleteAll();
        }
    }

    importJSBuffer(ingredientUrl, ingredientContent) {
    }

    importFilePath(ingredientUrl, ingredientPath) {
    }

    list() {
    }

    read(ingredientId) {
    }

    stats(ingredientId) {
    }

    delete(ingredientId) {
    }

    deleteAll() {
    }

}

export { FSIngredientBuffer };
