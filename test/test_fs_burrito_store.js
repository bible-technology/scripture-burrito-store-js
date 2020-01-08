'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;

describe("FS Burrito Class", function() {

    it("Constructs successfully", function() {
	const b = new FSBurritoStore({
	    "storeClass": "FSBurritoStore",
	    "validation": "burrito",
	    "FSBurritoStoreSettings": {"foo": "baa"}
	});
	assert.exists(b);
	assert.equal(b._config.storeClass, "FSBurritoStore");
	assert.equal(b._config.validation, "burrito");
	assert.equal(b._config.acceptedVersion, "*");
	assert.equal(b._config.allowXFlavors, false);
	assert.equal(b._config.FSBurritoStoreSettings.foo, "baa");
    });

    it("Requires storeClass to match class", function() {
	try {
	    const b = new FSBurritoStore({"storeClass": "banana"});
	    throw Error("Too Far");
	} catch (err) {
	    assert.equal(err.message, "ConfigJsonForWrongClass");
	}
    });

});
