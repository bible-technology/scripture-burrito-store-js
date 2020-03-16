"use strict";

import * as semver from 'semver';
const assert = require('chai').assert;

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
	    ["acceptedFlavors", ["*"]],
	    ["allowXFlavors", false],
	    ["ownedEntryIDServers", []],
	    ["acceptedIdServers", ["*"]],
	    ["creatableDerivedVariants", []],
	    ["acceptedDerivedVariants", []],
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

    /**
       Checks that the metadata is compatible with the burrito store config
       * @param {Object} metadata - an object containing the metadata
       * @return {Object}
     */
    metadataCompatible(metadata) {
	var version, flavor, flavorType, isXType, idServers, systemIds, idServerAbbr, variant;
	try {
	    var datum = "version";
	    version = metadata["meta"]["version"];
	    assert.isString(version);
	    datum = "flavor";
	    flavor = metadata["type"]["flavorType"]["flavor"]["name"];
	    assert.isString(flavor);
	    datum = "flavorType";
	    flavorType = metadata["type"]["flavorType"]["name"];
	    assert.isString(flavorType);
	    isXType = flavor.startsWith("x-");
	    assert.isBoolean(isXType);
	    datum = "idServers";
	    idServers = {};
	    for (let [prefix, record] of Object.entries(metadata["idServers"])) {
		idServers[prefix] = record["id"];
	    };
	    assert.isObject(idServers);
	    datum = "systemIds";
	    systemIds = metadata["identification"]["systemId"];
	    assert.isObject(systemIds);
	    datum = "systemIdAbbr";
	    idServerAbbr = metadata["identification"]["idServer"];
	    datum = "variant";
	    variant = metadata["meta"]["variant"];
	    assert.isString(variant);
	} catch (err) {
	    /* console.log(err); */
	    return {"result": "rejected", "reason": "MissingMinimalData "+ datum, "message": datum}; 
	}
	if (!(this.acceptedVersion.includes("*") && semver.satisfies(version, this.acceptedVersion))) {
	    return {"result": "rejected", "reason": "RejectedVersion", "message": version + "/" + this.acceptedVersion}; 
	};
	const acceptedFlavors = this.acceptedFlavors;
	if (!(
	    (acceptedFlavors.includes("*") && !isXType) ||
	    (!acceptedFlavors && !isXType) ||
		(acceptedFlavors.includes(flavor)) ||
		(acceptedFlavors.includes(flavorType)) ||
		(isXType && this.allowXFlavors)
	)) {
	    return {"result": "rejected", "reason": "RejectedFlavor", "message": flavor}; 
	}
	try {
	    if (this.acceptedIdServers && !(this.acceptedIdServers.includes("*"))) {
		if (!this.acceptedIdServers.includes(idServers[idServerAbbr])) {
		    throw new BurritoError("NoAcceptableId");
		}
	    }
	} catch (err) {
	    return {"result": "rejected", "reason": "NoAcceptableId", "message": flavor}; 
	}
	if (!(this.acceptedDerivedVariants.includes("*"))) {
	    var acceptedVariants = ["source", "new", "update", "template"];
	    acceptedVariants = acceptedVariants.concat(this.acceptedDerivedVariants);
	    if (!(acceptedVariants.includes(variant))) {
		return {"result": "rejected", "reason": "UnacceptableVariant", "message": variant};
	    }
	}
	return {"result": "accepted"};
    }

}

export {ConfigReader}

