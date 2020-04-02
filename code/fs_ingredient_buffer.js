"use strict";
import * as fse from "fs-extra";
import { v4 as uuidv4 } from 'uuid';

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
        this.UuidUrls = {};
        this.uuidChecksums = {};
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
        const uuid = uuidv4();
        const uuidPath = this.bufferDir + "/" + uuid;
        fse.mkdirSync(uuidPath, { recursive: false });
        fse.copyFileSync(ingredientPath, uuidPath + "/" + encodeURIComponent(ingredientUrl));
        this.uuidUrls[uuid] = ingredientUrl;
        return uuid;
    }

    list() {
        return Object.keys(this.uuidUrls).map(decodeURIComponent);
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
