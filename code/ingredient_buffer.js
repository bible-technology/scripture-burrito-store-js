"use strict";

import { BurritoError } from "./burrito_error.js";

class IngredientBuffer {
    /**
       A class that provides a back end independent signature for first contact with ingredients.

       Subclasses should override all methods here, and may also provide back end specific methods.
     */
    constructor(burritoStore) {
        this._burritoStore = burritoStore;
    }

    /**
       Imports a buffer as an ingredient, tagged with the ingredient URL.
     */
    importJSBuffer(ingredientUrl, ingredientContent) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Imports a file as an ingredient, tagged with the ingredient URL.
     */
    importFilePath(ingredientUrl, ingredientPath) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Lists the uuids of ingredients.
     */
    list() {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Returns a buffer containing the ingredient contents.
     */
    read(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       Returns a JSON object containing information about the ingredient.
     */
    stats(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       deletes an ingredient.
     */
    delete(ingredientId) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

    /**
       deletes all ingredients.
     */
    deleteAll() {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }

}

export { IngredientBuffer };
