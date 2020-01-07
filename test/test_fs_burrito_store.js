'use strict';

require = require("esm")(module/*, options*/);
const assert = require('chai').assert;
const FSBurritoStore = require('../fs_burrito_store.js').FSBurritoStore;

describe("FS Burrito Class", function() {

    it("Constructs successfully", function() {
	const b = new FSBurritoStore({});
	assert.exists(b);
    });
});
