/* eslint-disable class-methods-use-this */
import * as fse from 'fs-extra';
import * as path from 'path';
import * as xmldom from 'xmldom';


import { BurritoError } from './code/burrito_error';
import { BurritoStore } from './code/burrito_store';
import FSMetadataStore from './code/fs_metadata_store';
import { FSIngredientsStore } from './code/fs_ingredients_store';
import { FSIngredientBuffer } from './code/fs_ingredient_buffer';
import { DBLImport } from './code/dbl_metadata_import';

class FSBurritoStore extends BurritoStore {
  /**
       Class for a Filesystem-based Burrito Store.
       Metadata is loaded into working memory but cached using the filesystem.
       Ingredients are stored using the filesystem.
    */
  async initializeIngredientsAndMetadataStores(sDir) {
    if (!sDir) {
      throw new BurritoError('StorageDirNotDefined');
    }
    if (!fse.existsSync(sDir)) {
      fse.mkdirSync(sDir, { recursive: false });
    }
    this._metadataStore = new FSMetadataStore(this, sDir);
    this._ingredientsStore = new FSIngredientsStore(this, sDir);
    this._ingredientBuffer = new FSIngredientBuffer(this, sDir);
  }

  static async create(configJson, sDir) {
    const fsBurritoStore = new FSBurritoStore(configJson);
    await fsBurritoStore.initializeIngredientsAndMetadataStores(sDir);
    return fsBurritoStore;
  }

  idServerName(idServerId, nameLang) {
    const lang = nameLang || 'en';
    const idDetails = this._metadataStore._idServers[idServerId];
    if ('name' in idDetails) {
      return idDetails.name[lang];
    }
    return idDetails.id;
  }

  __metadataFromBundlePath(bundlePath) {
    const metadataPath = path.join(bundlePath, 'metadata.json');
    return JSON.parse(fse.readFileSync(metadataPath));
  }

  __metadataFromDblBundlePath(bundlePath) {
    const metadataPath = path.join(bundlePath, 'metadata.xml');
    const metadataString = fse.readFileSync(metadataPath, 'utf-8');
    const metadataDom = new xmldom.DOMParser().parseFromString(
      metadataString,
      'text/xml',
    );
    return new DBLImport(metadataDom).sbMetadata;
  }

  ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName) {
    const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    return this._ingredientsStore.__ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName, md);
  }

  exportToDir(idServerId, entryId, revisionId, variantId, toPath) {
    const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
    if (!md) {
      throw new BurritoError('VariantNotFoundInStore');
    }
    if (fse.existsSync(toPath)) {
      throw new BurritoError('ExportPathAlreadyExists');
    }
    fse.mkdirSync(toPath, { recursive: false });
    fse.writeFileSync(path.join(toPath, 'metadata.json'), JSON.stringify(md));
    for (const [ingredientUrl] of Object.entries(
      this.ingredients(
        idServerId,
        entryId,
        revisionId,
        variantId,
      ),
    ).filter(([, y]) => y)
    ) {
      const ingredientDir = path.join(toPath, path.dirname(ingredientUrl));
      if (!fse.existsSync(ingredientDir)) {
        fse.mkdirSync(ingredientDir, { recursive: true });
      }
      fse.writeFileSync(
        path.join(
          toPath,
          ingredientUrl,
        ),
        this.ingredientContent(
          idServerId,
          entryId,
          revisionId,
          variantId,
          ingredientUrl,
        ),
      );
    }
  }
}

async function createFSBurritoStore(configJson, sDir) {
  return FSBurritoStore.create(configJson, sDir);
}

export { FSBurritoStore, createFSBurritoStore };
