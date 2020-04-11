
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

  __deleteEntry(idServerId, entryId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __deleteEntryRevision(idServerId, entryId, revisionId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  __deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }
}

export { IngredientsStore };
