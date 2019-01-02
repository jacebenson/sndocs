/**
 * Provides generic exception wrapping.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var GenericException = Class.create();
GenericException.prototype = {
	/**
	 * @param string errorMessage
	 * @param undefined|{} cause
	 */
	initialize: function(errorMessage, cause) {
		this._message = errorMessage;
		this._cause = ( cause !== undefined ? cause : null );
	},

	/**
	 * Retrieves the error message.
	 * @return string
	 */
	getMessage: function() {
		return this._message;
	},
	
	/**
	 * Determines whether this exception was thrown with a nested cause exception or not.
	 * @return boolean TRUE if cause is non-null, FALSE if not.
	 */
	hasCause: function() {
		return ( this_cause !== null );
	},
	
	/**
	 * Retrieves the nested cause exception.
	 * @return {}
	 */
	getCause: function() {
		return this._cause;
	},
	
	/**
	 * Retrieves the error message.
	 * @return string
	 */
	toString: function() {
		return this._message;
	},
	
	type: 'GenericException',	
};