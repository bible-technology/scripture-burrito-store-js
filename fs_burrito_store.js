import * as fse from 'fs-extra';
import * as path from 'path';
import * as xmldom from 'xmldom';


import { BurritoError } from './code/burrito_error.js';
import { BurritoStore } from './code/burrito_store.js';
import FSMetadataStore from './code/fs_metadata_store';
import { FSIngredientsStore } from './code/fs_ingredients_store.js';
import { FSIngredientBuffer } from './code/fs_ingredient_buffer.js';
import { DBLImport } from './code/dbl_metadata_import.js';

class FSBurritoStore extends BurritoStore {
  /**
       Class for a Filesystem-based Burrito Store.
       Metadata is loaded into working memory but cached using the filesystem.
       Ingredients are stored using the filesystem.
    */
  constructor(configJson, sDir) {
    if (!sDir) {
      throw new BurritoError('StorageDirNotDefined');
    }
    super(configJson);
    if (!fse.existsSync(sDir)) {
      fse.mkdirSync(sDir, { recursive: false });
    }
    this._metadataStore = new FSMetadataStore(this, sDir);
    this._ingredientsStore = new FSIngredientsStore(this, sDir);
    this._ingredientBuffer = new FSIngredientBuffer(this, sDir);
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
    for (const [ingredientUrl, _] of Object.entries(
      this.ingredients(
        idServerId,
        entryId,
        revisionId,
        variantId,
      ),
    ).filter(([x, y]) => y)
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

  gcMark(idServerId, entryId) {
    const ingredientChecksumCounts = this._ingredientsStore.entryIngredientChecksums(idServerId, entryId);
    const revisionsVariants = this._metadataStore.__idServerEntryRevisionsVariants(idServerId, entryId);
    for (const revisionId of Object.keys(revisionsVariants)) {
      for (const variantId of revisionsVariants[revisionId]) {
        for (
          let [ingredientUrl, ingredientProps] of
          Object.entries(this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId).ingredients)
        ) {
          if (ingredientUrl in ingredientChecksumCounts) {
            const ingredientChecksum = ingredientProps.checksum.md5;
            if (ingredientChecksum in ingredientChecksumCounts[ingredientUrl]) {
              ingredientChecksumCounts[ingredientUrl][ingredientChecksum] += 1;
            }
          }
        }
      }
    }
    return ingredientChecksumCounts;
  }

  gc(idServer, entry) {
    const markReport = this.gcMark(idServer, entry);
    for (const [ingredient, checksums] of Object.entries(markReport)) {
      const ingredientPath = this._ingredientsStore.ingredientDir(idServer, entry, ingredient);
      for (const [checksum, markCount] of Object.entries(checksums)) {
        if (markCount == 0) {
          const checksumPath = path.join(ingredientPath, encodeURIComponent(checksum));
          fse.removeSync(checksumPath);
        }
      }
      if (fse.readdirSync(ingredientPath).length == 0) {
        fse.removeSync(ingredientPath);
      }
    }
  }

  gcAll() {
    for (const [idServer, entries] of Object.entries(this._metadataStore.__idServersEntries())) {
      for (const entry of entries) {
        this.gc(idServer, entry);
      }
    }
  }
}

export { FSBurritoStore };
