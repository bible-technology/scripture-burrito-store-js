
import { BurritoError } from './burrito_error.js';

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
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns an object of ingredient urls, where the boolean value is set if the ingredient is present locally.
     */
  __listIngredients(idServerId, entryId, revisionId, variantId, metadata) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns a JS buffer containing the file content.
     */
  __ingredientContent(idServerId, entryId, revisionId, variantId, ingredientId, metadata) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __deleteIngredientContent(idServerId, entryId, ingredientUrl) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }
}

export { IngredientsStore };
