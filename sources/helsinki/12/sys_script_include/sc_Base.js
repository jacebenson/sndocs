/**
 * sc_Base
 *
 * Base class used for the creation of components of the Service Catalog.
 *
 * This class should never be instanciated directly.  It should only be extended.
 *
 * @author Chris Henson <chris.henson@service-now.com>
 */
var sc_Base = Class.create();

sc_Base.prototype = {
    initialize: function(_gr,_gs) {
        this._log = (new GSLog(sc_.LOG_LEVEL,this.type)).setLog4J();
		this._gr = (typeof _gr !== "undefined" ? _gr : current);  // Assume current if not defined
		this._gs = (typeof _gs !== "undefined" ? _gs : gs); // Assume gs if not defined
		
        if (this.type == "sc_Base")
            this._log.error("[initialise] You shouldn't be instanciating objects of type sc_Base");
    },

    /**
     * get_gr(): Returns the GlideRecord that this object wraps
     */
    get_gr: function() {
        return this._gr;
    },
	
	get_gs: function() {
		return this._gs;
	},
	
	convertToJSONString: function(anObj){
		if (GlideStringUtil.nil(anObj))
			return "{}";
		
		var myJSON = new JSON();
		return myJSON.encode(anObj);
	},	

    type: "sc_Base"
};