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
	this.validator = this.schemas.getSchema(schemaIndex.schemaId);
    }

    schemaValidate(data) {
	if (this.validator(data)) {
	    return {"result": "accepted"};
	} else {
	    return {
		"result": "rejected",
		"reason": "SchemaInvalid",
		"message": this.validator.errors.toString(),
		"schemaErrors": this.validator.errors
	    };
	}
    }
}

export {BurritoValidator}
