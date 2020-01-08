"use strict";

import {BurritoError} from "./burrito_error.js";

class ConfigReader {
    /**
       A class that is constructed from a JSON config file, checking the schema and calculating defaults in the process.

       Values of "*" mean "any".
    */
    constructor(burritoStore, configJson) {
	this.burritoStore = burritoStore;
	this.storeClass = configJson["storeClass"];
	if (!this.storeClass) {
	    throw new BurritoError("NoStoreClassInConfig");
	}
	const validationReport = burritoStore._validator.schemaValidate("config", configJson);
	if (validationReport["result"] != "accepted") {
	    throw new BurritoError("ConfigFileInvalid", validationReport["schemaErrors"]);
	}
	const standardKeys = [
	    ["acceptedVersion", "*"],
	    ["acceptedFlavors", "*"],
	    ["allowXFlavors", false],
	    ["ownedEntryIDServers", []],
	    ["acceptedIdServers", "*"],
	    ["creatableDerivedVariants", []],
	    ["acceptedDerivedVariants", "*"],
	    ["validation", "catalog"],
	    ["subclassSettings", {}]
	    ];
	standardKeys.forEach(key => {
	    if (key[0] in configJson) {
		this[key[0]] = configJson[key[0]];
	    } else {
		this[key[0]] = key[1];
	    }
	});
    }
}

export {ConfigReader}

