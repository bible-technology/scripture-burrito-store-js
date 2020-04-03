"use strict";

import { BurritoError } from "./burrito_error.js";

class IngredientsStore {
    /**
     */
    constructor(burritoStore) {
        this._burritoStore = burritoStore;
    }

    /**
       Writes an ingredient.
     */
    __writeIngredient(idServerId, entryId, ingredientStats) {
        throw new BurritoError("MethodNotOverriddenBySubclass");
    }


}

export { IngredientsStore };
