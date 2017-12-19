/**
 * Provides exception wrapping for illegal arguments specified.
 * @author Roy Laurie <roy.laurie@service-now.com> RAL
 */
var IllegalArgumentException = Class.create();
IllegalArgumentException.prototype = Object.extendsObject(GenericException);