import {BurritoError} from './burrito_error.js';
import {ConfigReader} from './config_reader.js';
import {BurritoValidator} from './burrito_validator.js';

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
    }

    /* STATE CHANGES */
    
    /* share, receiveRevision, sendDraft, receiveDraft */

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
	    /* console.log(schemaValidationResult); */
	    throw new BurritoError("ImportedMetadataNotSchemaValid", schemaValidationResult.schemaErrors);
	}
	this._metadataStore.addEntryRevisionVariant(metadata, "default");
	this._ingredientsStore.touchEntry(sysUrl, entryId);
    }

    importFromDir(path) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    importFromZip(path) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    exportToObject(idServerId, entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    exportToDir(idServerId, entryId, revisionId, variantId, toPath) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    exportToZip(idServerId, entryId, revisionId, variantId, toPath) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    /* toTemplate */

    defaultToTemplate(idServerId, entryId, revisionId, templateData, filter=null) {
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

    entries(idServerId, requiredVariant=null) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entriesDetails(idServerId, variantId="default") {
	throw new BurritoError("MethodNotYetImplemented");
    }

    entryRevisions(idServerId, entryId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entryRevisionsDetails(idServerId, entryId, variantId="default") {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entryRevisionVariants(idServerId, entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
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
	throw new BurritoError("MethodNotYetImplemented");
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
    
    submitMetadataForm(filter, form, minValidity="catalog") {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    /* Add, Update, Remove, Cache Ingredients */

    cacheIngredient(idServerId, entryId, revisionId, variantId, ingredientName, ingredientContent) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    uncacheIngredient(idServerId, entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    addOrUpdateIngredient(idServerId, entryId, revisionId, variantId, ingredientName, ingredientContent) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    deleteIngredient(idServerId, entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* Validation */

    validateMetadata(idServerId, entryId, revisionId, variantId, schema="metadata") {
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
    
}

export {BurritoStore}
