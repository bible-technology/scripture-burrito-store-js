class BurritoError extends Error {
    /**
    A subclass of the standard JS Error class, with support for an optional arg.
    * @type module:BurritoError
    * @require Error
    */
    constructor(msg, arg) {
	super(msg);
	if (arg) {
	    this.arg = arg;
	}
    }
}

export {BurritoError}
