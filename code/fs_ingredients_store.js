import * as fse from 'fs-extra';
import * as path from 'path';

import { BurritoError } from './burrito_error.js';
import { IngredientsStore } from './ingredients_store.js';

class FSIngredientsStore extends IngredientsStore {
  /**
       FS-based ingredients store.
       Dir structure is idServer/entryId/ingredientId/checksum
       * @param {string} sDir a path at which to use or create storage
       */
  constructor(burritoStore, sDir) {
    if (!sDir) {
      throw new BurritoError('StorageDirNotDefined');
    }
    super(burritoStore);
    this.ingredientsDir = path.join(sDir, 'ingredients');
    if (!fse.existsSync(this.ingredientsDir)) {
      fse.mkdirSync(this.ingredientsDir, { recursive: false });
    }
  }

  entryDir(idServerId, entryId) {
    return path.join(this.ingredientsDir, encodeURIComponent(idServerId), encodeURIComponent(entryId));
  }
  
  ingredientDir(idServerId, entryId, ingredientUrl) {
    return path.join(this.entryDir(idServerId, entryId), encodeURIComponent(ingredientUrl));
  }

  entryIngredientChecksums(idServerId, entryId) {
    const ret = {};
    const ingredients = fse.readdirSync(this.entryDir(idServerId, entryId)).map((n) => decodeURIComponent(n));
    for (const ingredient of ingredients) {
      ret[ingredient] = {};
      const checksums = fse.readdirSync(this.ingredientDir(idServerId, entryId, ingredient));
      for (const checksum of checksums) {
        ret[ingredient][checksum] = 0;
      }
    }
    return ret;
  }

  __writeIngredient(idServerId, entryId, ingredientStats) {
    const ingredientDir = this.ingredientDir(
      idServerId,
      entryId,
      ingredientStats.url,
    );
    if (!fse.existsSync(ingredientDir)) {
      fse.mkdirSync(ingredientDir, { recursive: true });
    }
    const ingredientFilePath = path.join(ingredientDir, ingredientStats.checksum.md5);
    this._burritoStore._ingredientBuffer.fsRenameIngredient(ingredientStats.id, ingredientFilePath);
  }

  __listIngredients(idServerId, entryId, revisionId, variantId, metadata) {
    const ret = {};
    for (const [url, ingredientOb] of Object.entries(metadata.ingredients)) {
      const ingredientDir = this.ingredientDir(idServerId, entryId, url);
      ret[url] = fse.existsSync(path.join(ingredientDir, ingredientOb.checksum.md5));
    }
    return ret;
  }

  __ingredientContent(idServerId, entryId, revisionId, variantId, ingredientId, metadata) {
    const ingredientChecksum = metadata.ingredients[ingredientId].checksum.md5;
    const ingredientPath = path.join(this.ingredientDir(idServerId, entryId, ingredientId), ingredientChecksum);
    return fse.readFileSync(ingredientPath);
  }

  __ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientId, metadata) {
    const ingredientChecksum = metadata.ingredients[ingredientId].checksum.md5;
    return path.join(this.ingredientDir(idServerId, entryId, ingredientId), ingredientChecksum);
  }

  __deleteEntry(idServerId, entryId) {
    fse.removeSync(this.entryDir(idServerId, entryId));
  }

  __deleteEntryRevision(idServerId, entryId, revisionId) {}

  __deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId) {}

}

export { FSIngredientsStore };
