/**
* @type module:BurritoError
*/
class BurritoError extends Error {
    constructor(msg, arg) {
	super(msg);
	if (arg) {
	    this.arg = arg;
	}
    }
}

export {BurritoError}
