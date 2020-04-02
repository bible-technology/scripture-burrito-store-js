"use strict";

import { BurritoError } from "./burrito_error.js";

class IngredientBuffer {
    /**
     */
    constructor(burritoStore) {
        this._burritoStore = burritoStore;
    }

    importJSBuffer(ingredientUrl, ingredientContent) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    importFilePath(ingredientUrl, ingredientPath) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    list() {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    read(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    stats(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    delete(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    deleteAll() {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

}

export { IngredientBuffer };
