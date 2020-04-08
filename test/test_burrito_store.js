
require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const BurritoStore = require('../code/burrito_store.js').BurritoStore;

describe('Burrito Class', function() {
  it('Exception when constructing directly', () => {
    try {
      const b = new BurritoStore({});
      throw new Error('Too Far', {});
    } catch (err) {
      assert.equal(err.message, 'CannotConstructDirectly');
    }
  });
});
