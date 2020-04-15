
import { BurritoError } from './burrito_error.js';

class IngredientBuffer {
  /**
       A class that provides a back end independent signature for first contact with ingredients.

       Subclasses should override all methods here, and may also provide back end specific methods.
     */
  constructor(burritoStore) {
    this._burritoStore = burritoStore;
  }

  /*
    subclasses should implement their own version to call await init(sDir)
    to do any file operations to complete initialization.
    * @param {string} sDir a path at which to use or create storage
    * @return {Object} new IngredientBufferSubClass
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
       Imports a buffer as an ingredient, tagged with the ingredient URL.
     */
  importJSBuffer(ingredientUrl, ingredientContent) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Imports a file as an ingredient, tagged with the ingredient URL.
     */
  importFilePath(ingredientUrl, ingredientPath) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Imports an ingredient from a bundle, given a subclass-dependent bundle path and the ingredient URL.
     */
  importBundleIngredient(ingredientUrl, ingredientPath) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Lists the uuids of ingredients.
     */
  list() {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns a buffer containing the ingredient contents.
     */
  read(ingredientId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       Returns a JSON object containing information about the ingredient.
     */
  stats(ingredientId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       deletes an ingredient.
     */
  delete(ingredientId) {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }

  /**
       deletes all ingredients.
     */
  deleteAll() {
    throw new BurritoError('MethodNotOverriddenBySubclass');
  }
}

export { IngredientBuffer };
