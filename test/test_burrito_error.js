
require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const BurritoError = require('../code/burrito_error.js').BurritoError;

describe('Burrito Error Class', function() {
  it('Constructs successfully', () => {
    const b = new BurritoError('banana', 'split');
    assert.exists(b);
    assert.equal(b.message, 'banana');
    assert.equal(b.arg, 'split');
  });
});
