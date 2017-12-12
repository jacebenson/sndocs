var sc_ic_ColumnSecurityManager = Class.create();

sc_ic_ColumnSecurityManager.prototype = Object.extendsObject(sc_ic_SecurityManager, {
	
	/** Returns false. Subclasses should define when creation should be allowed */
	canCreate: function() {
		return gs.hasRole(sc_.CATALOG_ADMIN);
	},
	
	/** Returns false. Subclasses should define when reading should be allowed */
	canRead: function() {
		if (gs.hasRole(sc_.CATALOG_ADMIN))
			return true;
		
		if (JSUtil.nil(this._gr[sc_ic.SECTION]))
			return false;
		
		return sc_ic_Factory.getSecurityManager(this._gr[sc_ic.SECTION][sc_ic.ITEM_STAGING].getRefRecord()).canRead();
	},
	
	/** Returns false. Subclasses should define when updating should be allowed */
	canUpdate: function() {
		if (gs.hasRole(sc_.CATALOG_ADMIN))
			return true;
		
		return false;
	},
	
	/** Returns false. Subclasses should define when deleting should be allowed */
	canDelete: function() {
		if (gs.hasRole(sc_.CATALOG_ADMIN))
			return true;
		
		return false;
	},
		
	type: "sc_ic_ColumnSecurityManager"
});
