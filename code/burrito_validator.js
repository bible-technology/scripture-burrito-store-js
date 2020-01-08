/* Borrowed from Dan De Blois on Scripture Burrito, then hacked. */

'use strict';

import * as fse from 'fs-extra';
import * as path from 'path';
import * as semver from 'semver';
import Ajv from 'ajv';
import schemaIndex from '../schema';
import {BurritoError} from './burrito_error.js';

/**
* @type module:BurritoValidator
* @requires BurritoError
*/
class BurritoValidator {
    constructor() {
	this.schemas = new Ajv({schemas: schemaIndex.schemas});
    }

    schemaValidate(schemaId, data) {
	var validator = this.schemas.getSchema(schemaIndex.schemaIds[schemaId]);
	if (validator(data)) {
	    return {
		"schemaId": schemaId,
		"result": "accepted"
	    };
	} else {
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
