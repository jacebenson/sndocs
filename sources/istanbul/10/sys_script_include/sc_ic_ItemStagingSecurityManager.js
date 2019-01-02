var sc_ic_ItemStagingSecurityManager = Class.create();

sc_ic_ItemStagingSecurityManager.prototype = Object.extendsObject(sc_ic_SecurityManager,{
	initialize: function(_gr,_gs) {
		sc_ic_SecurityManager.prototype.initialize.call(this,_gr,_gs);
	},

	canCreate: function() {
		return gs.hasRole(sc_.CATALOG_ADMIN) || gs.hasRole(sc_ic.CATALOG_MANAGER) || gs.hasRole(sc_ic.CATALOG_EDITOR);;
	},
	
	canRead: function() {
		var item = sc_ic_Factory.wrap(this._gr);
		
		if (item.isAdmin())
			return true;

		if (!gs.hasRole(sc_ic.CATALOG_MANAGER) && !gs.hasRole(sc_ic.CATALOG_EDITOR)) {
			return false;
		}
			
		if (this._gr.isNewRecord())
			return true;
		
		if (item.createdFromServiceCreator())
			return true;
		
		var itemCategories = this._gr[sc_ic.CATEGORIES] + "";
		if (JSUtil.nil(itemCategories))
			return false;
		
		var itemCategoriesArr = itemCategories.split(",");
		
		var availableCategoryIds = item.getUsersAvailableCategories();
		var availableCategoriesObj = {};
		for (var i = 0; i < availableCategoryIds.length; i++)
			availableCategoriesObj[availableCategoryIds[i]] = true;
		
		for (var i = 0; i < itemCategoriesArr.length; i++)
			if (availableCategoriesObj[itemCategoriesArr[i]])
				return true;
		
		return false;
	},
	
	canUpdate: function() {
		return this.canRead();
	},
	
	canPublish: function() {
		if(!this._gr.isInSelectedScope())
			return false;
			
		if(!this._gr.isInGlobalScope()) {
			if(!gs.hasRole("admin")) {
				gs.warn(gs.getMessage("Only admin can publish the service '{0}' because its in the scoped application '{1}'", [this._gr.name.toString(), this._gr.sys_scope.name.toString()]));
				return false;
			}
		}
	
		var item = sc_ic_Factory.wrap(this._gr);
		if (item.createdFromServiceCreator()) {
			var roles = gs.getProperty("glide.service_creator.publish_roles", "admin,catalog_admin,catalog_manager");
			if (!gs.hasRole(roles))
				return false;
		}
		
		return this.canUpdate();
	},
	
	canDelete: function() {
	    return gs.hasRole("admin");
	},
	
	type: 'sc_ic_ItemStagingSecurityManager'
});