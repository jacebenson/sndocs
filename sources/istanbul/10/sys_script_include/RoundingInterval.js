// Discovery class

/**
 * Handles all the details of rounding CPU speed and RAM size
 * 
 * Aleck Lin aleck.lin@service-now.com
 */
var RoundingInterval = Class.create();

RoundingInterval.CPU = 'cpu';
RoundingInterval.RAM = 'ram';

RoundingInterval.prototype = {
    /*
     * Initializes this instance.
     * 
     * type:   The target to round. This could be cpu or ram
     */
    initialize: function(type) {
        this.type = type;
    },
    
    /*
     * Get the value after applying the rounding interval.
     * 
     * returns: The value after rounding.
     */
    getRoundedValue: function(value) {
        if (JSUtil.nil(value))
            return;

        var ri = this._getRoundingInterval();

        return Math.round(value/ri)*ri;
    },

    _getRoundingInterval: function() {
        if (this.type == RoundingInterval.CPU)
            return gs.getProperty("glide.discovery.roundingInterval.cpu", 1)
        else if (this.type == RoundingInterval.RAM)
            return gs.getProperty("glide.discovery.roundingInterval.ram", 1);
    },
    
    type: "RoundingInterval"
}
