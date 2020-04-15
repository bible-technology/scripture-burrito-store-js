
import { BurritoError } from './burrito_error.js';

class IngredientsStore {
  /**
     */
  constructor(burritoStore) {
    this._burritoStore = burritoStore;
  }

  /*
    subclasses should implement their own version to call await init(sDir)
    to do any file operations to complete initialization.
    * @param {string} sDir a path at which to use or create storage
    * @return {Object} new IngredientStoreSubClass
    */
  static async create(burritoStore, sDir) {
    throw new BurritoError('MethodNotOverriddenBySubclass', burritoStore, sDir);
  }

  /*
    subclasses should call await init(sDir)
    to do any file operations to complete initialization in create().
    * @param {string} sDir a path at which to use or create storage
    */
  // eslint-disable-next-line class-methods-use-this
  async init(sDir) {
    throw new BurritoError('MethodNotOverriddenBySubclass', sDir);
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
