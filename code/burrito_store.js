import { BurritoError } from "./burrito_error.js";
import { ConfigReader } from "./config_reader.js";
import { BurritoValidator } from "./burrito_validator.js";
import { DBLImport } from "./dbl_metadata_import.js";

/**
   An abstract class for a Burrito Store. Subclasses should implement storage-specific methods.
   * @type module:BurritoStore
   * @require BurritoError
   */

class BurritoStore {
    /**
       Expects a configuration object, which must be valid and for the subclass that is being constructed.
       * @param {Object} configJson - A JSON object containing config options
       */
    constructor(configJson) {
        if (new.target == BurritoStore) {
            throw new BurritoError("CannotConstructDirectly");
        }
        this._validator = new BurritoValidator();
        this._config = new ConfigReader(this, configJson);
        if (this._config.storeClass != new.target.name) {
            throw new BurritoError("ConfigJsonForWrongClass");
        }
        this._metadataStore = null;
        this._ingredientsStore = null;
        this._ingredientBuffer = null;
    }

    /* Utilities */

    /**
     */
    idServerName(idServerId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* STATE CHANGES */

    /* share, receiveRevision, sendDraft, receiveDraft */

    /**
     Creates a new variant (and, if necessary, a new revision and entry) using metadata based on DBL Metadata.
     * @param {Object} dblDom - DBL 2.x metadata as DOM
     * @return {undefined}
     */
    importFromDBLMetadata(dblDom) {
        this.importFromObject(DBLImport.dblDomToSBMetadata(dblDom));
    }

    /**
       Creates a new variant (and, if necessary, a new revision and entry) using the provided metadata.
       * @param {Object} metadata - Scripture Burrito metadata as a JS object
       * @return {undefined}
       */
    importFromObject(metadata) {
        const [sysUrl, entryId, entryRevision] = this._metadataStore.idFromMetadataObject(metadata);
        if (!sysUrl) {
            throw new BurritoError("UnableToFindMetadataId");
        }
        const configCompatibleResult = this._config.metadataCompatible(metadata);
        if (configCompatibleResult.result != "accepted") {
            /* console.log(configCompatibleResult); */
            throw new BurritoError("ImportedMetadataNotConfigCompatible", configCompatibleResult.reason);
        }
        const schemaValidationResult = this._validator.schemaValidate("metadata", metadata);
        if (schemaValidationResult.result != "accepted") {
            /* console.log(schemaValidationResult.message); */
            throw new BurritoError("ImportedMetadataNotSchemaValid", schemaValidationResult.schemaErrors);
        }
        this._metadataStore.addEntryRevisionVariant(metadata, this._metadataVariant(metadata));
    }

    importFromDir(path) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    importFromZip(path) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /**
       Returns the requested variant metadata as a dictionary. It is an error for the variant not to exist.
     */
    exportToObject(idServerId, entryId, revisionId, variantId) {
        const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
        if (md) {
            return md;
        } else {
            throw new BurritoError("VariantNotFoundInStore");
        }
    }

    exportToDir(idServerId, entryId, revisionId, variantId, toPath) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    exportToZip(idServerId, entryId, revisionId, variantId, toPath) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* toTemplate */

    defaultToTemplate(idServerId, entryId, revisionId, templateData, filter = null) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* toNew */

    templateToNew(idServerId, templateName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* toUpdate */

    defaultToUpdate(idServerId, entryId, revisionId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* acceptDraft */

    newToDefault(idServerId, entryId, revisionId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    updateToDefault(idServerId, entryId, revisionId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* makeDerived */

    defaultToDerived(idServerId, entryId, revisionId, derivativeName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* ownEntry */

    importAsOwnedFromObject(metadata) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    importAsOwnedFromDir(path) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    importAsOwnedFromZip(path) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* CRUD */

    /* List */

    idServers() {
        return this._metadataStore.__idServerKeys();
    }

    idServersDetails() {
        return this._metadataStore.__idServersDetails();
    }

    idServersEntries() {
        return this._metadataStore.__idServersEntries();
    }

    entries(idServerId) {
        return this._metadataStore.__idServerEntries(idServerId);
    }

    entriesLatestRevision(idServerId) {
        return this._metadataStore.__idServerEntriesLatestRevision(idServerId);
    }

    entriesRevisions(idServerId) {
        return this._metadataStore.__idServerEntriesRevisions(idServerId);
    }

    entryRevisions(idServerId, entryId) {
        return this._metadataStore.__idServerEntryRevisions(idServerId, entryId);
    }

    entryRevisionsVariants(idServerId, entryId) {
        return this._metadataStore.__idServerEntryRevisionsVariants(idServerId, entryId);
    }

    entryRevisionVariants(idServerId, entryId, revisionId) {
        return this._metadataStore.__idServerEntryRevisionVariants(idServerId, entryId, revisionId);
    }

    entryRevisionVariantsDetails(idServerId, entryId, revisionId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    ingredients(idServerId, entryId, revisionId, variantId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    ingredientsDetails(idServerId, entryId, revisionId, variantId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Read Metadata */

    metadataContent(idServerId, entryId, revisionId, variantId) {
        const md = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
        if (md) {
            return md;
        } else {
            throw new BurritoError("VariantMetadataNotFound");
        }
    }

    /* Read Ingredients */

    ingredientDetails(idServerId, entryId, revisionId, variantId, ingredientName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    ingredientContent(idServerId, entryId, revisionId, variantId, ingredientName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    ingredientLocation(idServerId, entryId, revisionId, variantId, ingredientName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Update Metadata */

    metadataForm(idServerId, entryId, revisionId, variantId, filter) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    submitMetadataForm(filter, form, minValidity = "catalog") {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Add, Update, Remove, Cache Ingredients */

    cacheIngredient(idServerId, entryId, revisionId, variantId, ingredientName, ingredientContent) {
        const metadata = this._metadataStore.__variantMetadata(idServerId, entryId, revisionId, variantId);
        if (!metadata) {
            throw new BurritoError("VariantNotFound");
        }
        // Calculate checksum of content, compare with metadata
        // Write content (subclass dependent)
    }

    uncacheIngredient(idServerId, entryId, revisionId, variantId, ingredientName) {
        // Find metadata
        // Check ingredient is in metadata
        // Delete content (sublass dependent, no local ingredient is a no-op for cacheing)
        throw new BurritoError("MethodNotYetImplemented");
    }

    addOrUpdateIngredient(idServerId, entryId, revisionId, variantId, ingredientName, ingredientContent) {
        // Find metadata
        // Checksum ingredient
        // Add or update to metadata (subclass dependent)
        // Write content (subclass dependent)
        throw new BurritoError("MethodNotYetImplemented");
    }

    deleteIngredient(idServerId, entryId, revisionId, variantId, ingredientName) {
        // Find metadata
        // Check ingredient is in metadata
        // Delete content (sublass dependent, no local ingredient is an error)
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Validation */

    validateMetadata(idServerId, entryId, revisionId, variantId, schema = "metadata") {
        throw new BurritoError("MethodNotYetImplemented");
    }

    validateConvention(idServerId, entryId, revisionId, variantId, conventionName) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    validateMetadataConventions(idServerId, entryId, revisionId, variantId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Delete */

    deleteEntry(idServerId, entryId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    deleteEntryRevision(idServerId, entryId, revisionId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    deleteEntryRevisionVariant(idServerId, entryId, revisionId, variantId) {
        throw new BurritoError("MethodNotYetImplemented");
    }

    /* Utility methods */
    _metadataVariant(metadata) {
        if ("variant" in metadata["meta"]) {
            return metadata["meta"]["variant"];
        } else {
            return "default";
        }
    }
}

export { BurritoStore };
