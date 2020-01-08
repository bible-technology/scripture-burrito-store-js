'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;

describe("FS Burrito Class", function() {

    it("Constructs successfully", function() {
	const b = new FSBurritoStore({
	    "storeClass": "FSBurritoStore",
	    "validation": "burrito",
	    "subclassSettings": {"foo": "baa"}
	});
	assert.exists(b);
	assert.equal(b._config.storeClass, "FSBurritoStore");
	assert.equal(b._config.validation, "burrito");
	assert.equal(b._config.acceptedVersion, "*");
	assert.equal(b._config.allowXFlavors, false);
	assert.equal(b._config.subclassSettings.foo, "baa");
    });

    it("Requires storeClass to match class", function() {
	try {
	    const b = new FSBurritoStore({"storeClass": "banana"});
	    throw Error("Too Far");
	} catch (err) {
	    assert.equal(err.message, "ConfigJsonForWrongClass");
	}
    });

    it("Throws error on invalid config", function() {
	try {
	    const b = new FSBurritoStore({"storeClass": "FSBurrito", "foo": "baa"});
	    throw Error("Too Far");
	} catch (err) {
	    assert.equal(err.message, "ConfigFileInvalid");
	    const report = err.arg[0];
	    assert.isTrue("params" in report);
	    assert.isTrue("additionalProperty" in report.params);
	    assert.equal(report.params.additionalProperty, "foo");
	}
    });

});
