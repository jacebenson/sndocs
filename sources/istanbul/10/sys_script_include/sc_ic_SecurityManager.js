var sc_ic_SecurityManager = Class.create();
sc_ic_SecurityManager.prototype = Object.extendsObject(sc_ic_Base, {
	
	/** Returns false. Subclasses should define when creation should be allowed */
	canCreate: function() {
		return false;
	},
	
	/** Returns false. Subclasses should define when reading should be allowed */
	canRead: function() {
		return false;
	},
	
	/** Returns false. Subclasses should define when updating should be allowed */
	canUpdate: function() {
		return false;
	},
	
	/** Returns false. Subclasses should define when deleting should be allowed */
	canDelete: function() {
	    return false;
	},
	
    /*
     * Convenience method to prevent the code becoming unreadable from the useful debug statements
     */
    _logDebug: function(message) {
        if (this._log.atLevel(GSLog.DEBUG))
            this._log.debug(this._i18n(message));
    },

    type: "sc_ic_SecurityManager"
});