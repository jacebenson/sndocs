gs.include("PrototypeServer");

/*
 * Implements a mechanism to reliably extract a meaningful error message from whatever was thrown to a catch block.
 */
var ErrorMsg = Class.create();

ErrorMsg.prototype = {
    initialize: function(msg, error) {
        this.msg = msg;
        this.errMsg = '' + error;
        if (error instanceof Error) 
            this.errMsg = error.name + ' - ' + error.message;
    },
    
    toString: function() {
        return this.msg + this.errMsg;
    },
    
    type: 'ErrorMsg'
}