"use strict";

import * as semver from 'semver';

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
	var version, flavor, flavorType, isXType, idServers, systemIds;
	try {
	    var datum = "version";
	    version = metadata["meta"]["version"];
	    datum = "flavor";
	    flavor = metadata["type"]["flavor"];
	    datum = "flavorType";
	    flavorType = metadata["type"]["flavorType"];
	    isXType = flavor.startsWith("x-");
	    datum = "idServers";
	    idServers = metadata["idServers"];
	    datum = "systemIds";
	    systemIds = metadata["identification"]["systemId"];
	} catch (err) {
	    return {"result": "rejected", "reason": "MissingMinimalData", "message": datum}; 
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
		const acceptedIdServers = this.acceptedIdServers;
		var acceptedIdAbbreviations = [];
		for (const abbr of Object.keys(idServers)) {
		    if (acceptedIdServers.includes(idServers[abbr])) {
			acceptedIdAbbreviations.push(abbr);
		    }
		}
		var foundId = false;
		for (const abbr of Object.keys(systemIds)) {
		    if (acceptedIdAbbreviations.includes(abbr)) {
			foundId = true;
		    }
		}
		if (!foundId) {
		    throw new BurritoError("NoAcceptableId");
		}
	    }
	} catch (err) {
	    return {"result": "rejected", "reason": "NoAcceptableId", "message": flavor}; 
	}
	return {"result": "accepted"};
    }

}

export {ConfigReader}

