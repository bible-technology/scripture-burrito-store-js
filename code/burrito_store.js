import {BurritoError} from './burrito_error.js';
import {ConfigReader} from './config_reader.js';

class BurritoStore {
    /**
    An abstract class for a Burrito Store. Subclasses should implement storage-specific methods.
    * @type module:BurritoStore
    * @require BurritoError
    */
    constructor(configJson) {
	if (new.target == BurritoStore) {
	    throw new BurritoError("CannotConstructDirectly");
	}
	this.config = new ConfigReader(configJson);
    }

    /* STATE CHANGES */
    
    /* share, receiveRevision, sendDraft, receiveDraft */

    importFromObject(metadata) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    importFromDir(path) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    importFromZip(path) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    exportToObject(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    exportToDir(entryId, revisionId, variantId, toPath) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    exportToZip(entryId, revisionId, variantId, toPath) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    /* toTemplate */

    defaultToTemplate(entryId, revisionId, templateData, filter=null) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* toNew */

    templateToNew(templateName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* toUpdate */

    defaultToUpdate(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* acceptDraft */

    newToDefault(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    updateToDefault(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* makeDerived */

    defaultToDerived(entryId, revisionId, derivativeName) {
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

    entries(requiredVariant=null) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entriesDetails(variantId="default") {
	throw new BurritoError("MethodNotYetImplemented");
    }

    entryRevisions(entryId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entryRevisionsDetails(entryId, variantId="default") {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entryRevisionVariants(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    entryRevisionVariantsDetails(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    ingredients(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    ingredientsDetails(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* Read Metadata */

    metadataContent(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* Read Ingredients */

    ingredientDetails(entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    ingredientContent(entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    ingredientLocation(entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }    

    /* Update Metadata */

    metadataForm(entryId, revisionId, variantId, filter) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    submitMetadataForm(filter, form, minValidity="catalog") {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    /* Add, Update, Remove, Cache Ingredients */

    cacheIngredient(entryId, revisionId, variantId, ingredientName, ingredientContent) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    uncacheIngredient(entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    addOrUpdateIngredient(entryId, revisionId, variantId, ingredientName, ingredientContent) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    deleteIngredient(entryId, revisionId, variantId, ingredientName) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    /* Validation */

    validateMetadata(entryId, revisionId, variantId, schema="metadata") {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    validateConvention(entryId, revisionId, variantId, conventionName) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    validateMetadataConventions(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
    /* Delete */

    deleteEntry(entryId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    deleteEntryRevision(entryId, revisionId) {
	throw new BurritoError("MethodNotYetImplemented");
    }

    deleteEntryRevisionVariant(entryId, revisionId, variantId) {
	throw new BurritoError("MethodNotYetImplemented");
    }
    
}

export {BurritoStore}
