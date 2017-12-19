// Discovery class

/*
 * Simple container class for the result of a CI Identifier.  An instance of this class has the following initialized fields:
 * 
 * explore: a boolean, true if this CI should be further explored.
 * sys_id: a String containing an existing CI's sys_id, or null if no existing CI could be found.
 */
var IDResult = Class.create();

IDResult.prototype = {
    initialize: function(explore, sys_id) {
        this.explore = explore;
        this.sys_id = sys_id;
    },
    
    type: 'IDResult'
}
