var sc_Exception = Class.create();
sc_Exception.prototype = Object.extendsObject(GenericException, {
	
	type: 'sc_Exception'
});