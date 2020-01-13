'use strict';

import {BurritoError} from './burrito_error.js';

class MetadataStore {
    /**
    */
    constructor(burritoStore) {
	this._burritoStore = burritoStore;
    }

    /** Returns [idServer, id, revision] if exactly one systemID with a revision is found, otherwise returns [null, null, null].
	* @param {Object} metadata - metadata for a Burrito
	*@return {Array}
	*/
    idFromMetadataObject(metadata) {
	try {
	    const idServers = metadata.idServers;
	    const systemIds = metadata.identification.systemId;
	    var sysUrl, entryId, revisionId = null;
	    Object.keys(systemIds).forEach(
		function(systemAbbr) {
		    const systemId = systemIds[systemAbbr];
		    if ("revision" in systemId) {
			if (sysUrl) {
			    throw new BurritoError("UnableToFindMetadataId");
			}
			entryId = systemId.id;
			revisionId = systemId.revision;
			sysUrl = idServers[systemAbbr];
		    }
		}
	    );
	    return [sysUrl, entryId, revisionId];
	} catch (err) {
	    return [null, null, null];
	}
    }

}

export {MetadataStore}
