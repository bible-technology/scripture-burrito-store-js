import * as fse from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import * as md5 from 'md5-file';
import * as path from 'path';

import { BurritoError } from './burrito_error.js';
import { IngredientBuffer } from './ingredient_buffer.js';

class FSIngredientBuffer extends IngredientBuffer {
  /**
     * @param {string} sDir a path at which to use or create storage
     */
  constructor(burritoStore, sDir) {
    if (!sDir) {
      throw new BurritoError('StorageDirNotDefined');
    }
    super(burritoStore);
    this.uuidUrls = {};
    this.bufferDir = sDir + '/buffer';
    if (!fse.existsSync(this.bufferDir)) {
      fse.mkdirSync(this.bufferDir, { recursive: false });
    } else {
      this.deleteAll();
    }
  }

  importJSBuffer(ingredientUrl, ingredientContent) {
    const uuid = uuidv4();
    const uuidPath = path.join(this.bufferDir, uuid);
    fse.mkdirSync(uuidPath, { recursive: false });
    fse.writeFileSync(path.join(uuidPath, encodeURIComponent(ingredientUrl)), ingredientContent);
    this.uuidUrls[uuid] = ingredientUrl;
    return uuid;
  }

  importFilePath(ingredientUrl, ingredientPath) {
    const uuid = uuidv4();
    const uuidPath = path.join(this.bufferDir, uuid);
    fse.mkdirSync(uuidPath, { recursive: false });
    fse.copyFileSync(ingredientPath, path.join(uuidPath, encodeURIComponent(ingredientUrl)));
    this.uuidUrls[uuid] = ingredientUrl;
    return uuid;
  }

  importBundleIngredient(ingredientUrl, ingredientPath) {
    return this.importFilePath(ingredientUrl, path.join(ingredientPath, ingredientUrl));
  }

  list() {
    return Object.keys(this.uuidUrls);
  }

  read(ingredientId) {
    if (!(ingredientId in this.uuidUrls)) {
      throw new BurritoError('IngredientNotInBuffer');
    }
    const ingredientPath = path.join(this.bufferDir, ingredientId, encodeURIComponent(this.uuidUrls[ingredientId]));
    const content = fse.readFileSync(ingredientPath);
    return content;
  }

  stats(ingredientId) {
    if (!(ingredientId in this.uuidUrls)) {
      throw new BurritoError('IngredientNotInBuffer');
    }
    const ingredientPath = path.join(this.bufferDir, ingredientId, encodeURIComponent(this.uuidUrls[ingredientId]));
    const fsStats = fse.statSync(ingredientPath);
    const statsRecord = {
      id: ingredientId,
      url: this.uuidUrls[ingredientId],
      created: fsStats.birthtime,
      size: fsStats.size,
      checksum: { md5: md5.sync(ingredientPath) },
    };
    return statsRecord;
  }

  delete(ingredientId) {
    if (ingredientId in this.uuidUrls) {
      const ingredientDirPath = path.join(this.bufferDir, ingredientId);
      fse.removeSync(ingredientDirPath);
      delete this.uuidUrls[ingredientId];
    }
  }

  deleteAll() {
    fse.removeSync(this.bufferDir);
    fse.mkdirSync(this.bufferDir, { recursive: false });
    this.uuidUrls = {};
  }

  /**
       Fast, back end specific way to get a buffered ingredient into the store. FS constraints of rename apply here.
     */
  fsRenameIngredient(ingredientId, destination) {
    const ingredientPath = path.join(this.bufferDir, ingredientId, encodeURIComponent(this.uuidUrls[ingredientId]));
    fse.renameSync(ingredientPath, destination);
    delete this.uuidUrls[ingredientId];
  }
}

export { FSIngredientBuffer };
