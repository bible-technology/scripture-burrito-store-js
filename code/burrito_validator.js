/* Borrowed from Dan De Blois on Scripture Burrito, then hacked. */

'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import * as semver from 'semver';
import Ajv from 'ajv';
import schemaIndex from '../schema/sbs_index.js';
import {BurritoError} from './burrito_error.js';

/**
 * @type module:BurritoValidator
 * @requires BurritoError
 */
class BurritoValidator {
    /**
       Sets up schemas
    */
    constructor() {
	this.schemas = new Ajv({schemas: schemaIndex.schemas});
    }

    /**
       Validate against a JSON schema.
       * @param {string} schemaId - the id of the schema
       * @param {Object} data - an object containing the data to be validated
       * @return {Object}
     */
    schemaValidate(schemaId, data) {
	var validator = this.schemas.getSchema(schemaIndex.schemaIds[schemaId]);
	if (validator(data)) {
	    return {
		"schemaId": schemaId,
		"result": "accepted"
	    };
	} else {
	    console.log(JSON.stringify(validator.errors));
	    return {
		"schemaId": schemaId,
		"result": "rejected",
		"reason": "SchemaInvalid",
		"message": JSON.stringify(validator.errors),
		"schemaErrors": validator.errors
	    };
	}
    }

}

export {BurritoValidator}
