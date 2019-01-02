var CatalogMobileLayoutSync = Class.create();
CatalogMobileLayoutSync.prototype = {
	CATALOG_VIEW_DEFAULT: "catalog_default",
	
	// Log level property
	GLIDE_SC_MOBILE_LAYOUT_SYNC_LOG_LEVEL: "glide.sc.mobile_layout_sync.log", 
	 
	initialize: function(mobileLayoutGr) {
		this.mobileLayoutGr = mobileLayoutGr;
		this.catalogView = null;
		this.catalog = this.mobileLayoutGr.sc_catalog;
		
		var gr = new GlideRecord("sc_catalog_view_mtom");
		gr.addQuery("sc_catalog", this.catalog);
		gr.addQuery("default", true);
		gr.query();
		if (gr.next()) {
            var portalPageGr = new GlideRecord("sys_portal_page");
    		portalPageGr.addQuery("sys_id", gr.sys_portal_page);
	    	portalPageGr.query();
		    if (portalPageGr.next())
			    this.catalogView = portalPageGr.getValue("view");
		}
		this.lu = new GSLog(this.GLIDE_SC_MOBILE_LAYOUT_SYNC_LOG_LEVEL, 'CatalogMobileLayoutSync');
		this.categoryIds = [];
	},
	
	updateCategories: function() {
		this.lu.logDebug("Updating Mobile Layout categories for " + this.mobileLayoutGr.sc_catalog + " / " + this.catalogView);
		if (!this.mobileLayoutGr) {
			this._reportError("Failed to update categories - no Mobile Layout record specified", true);
			return;
		}
		
		if (!this.catalogView) {
			this._reportError("Failed to update categories. No default view found in sc_catalog_view_mtom for catalog: " + this.catalog + " see Upgrading_to_Multiple_Service_Catalogs in wiki", true);
			return;
		}
		
		var homePage = this._getHomePage();
		if (homePage == null) {
			this._reportError("Failed to update categories - no matching home page for view \"" + this.catalogView + "\"", true);
			return;
  	  }
		
		var homePageSections = this._getPortalSections(homePage.getUniqueValue());
		while (homePageSections.next()) {
			this._getCategoryFromSection(homePageSections.getUniqueValue());
		}
		
		if (this.categoryIds.length == 0) {
			this._reportError("Failed to update Categories - no categories found in desktop Catalog home page " + homePage.title + " / " + homePage.view, true);
			return;		
	    }
		
		this._removeExistingCategories();
		this._addNewCategories();
	},
	
	_getHomePage: function() {
		this.lu.logDebug("Searching for catalog home page with view name \"" + this.catalogView + "\"");
		var gr = new GlideRecord('sys_portal_page');
		if (gr.get('view', this.catalogView))
			return gr;
		
		return null;
	},
	
	_getPortalSections: function(pageId) {
		if (JSUtil.nil(pageId))
			return null;
		
		var gr = new GlideRecord('sys_portal');
		gr.addQuery('page', pageId);
		gr.orderBy('offset');
		gr.orderBy('dropzone');
		gr.query();
		
		return gr;
	},
	
	_getCategoryFromSection: function(sectionId) {
		if (JSUtil.nil(sectionId))
			return;
		
		var portalPrefs = {};
		var gr = new GlideRecord('sys_portal_preferences');
		gr.addQuery('portal_section',sectionId);
		gr.addQuery('name','IN','renderer,type,sys_id');
		gr.query();
		while (gr.next())
			portalPrefs[gr.getValue('name')] = gr.getValue('value');
							
		if (portalPrefs.type == "category" && portalPrefs.renderer == "com.glideapp.servicecatalog.RenderCategory" && !JSUtil.nil(portalPrefs.sys_id)) {
			this.lu.logDebug("Found category with sys_id of \"" + portalPrefs.sys_id + "\" in desktop catalog home page");
			this.categoryIds.push(portalPrefs.sys_id);
		}
	},
	
	_removeExistingCategories: function() {
		this.lu.logDebug("Removing existing categories from Mobile Layout");
		var gr = new GlideRecord('sc_mobile_layout_cats_mtom');
		gr.addQuery('mobile_layout', this.mobileLayoutGr.getValue('sys_id'));
		gr.deleteMultiple();		
	},
	
	_addNewCategories: function() {
		var gr = new GlideRecord('sc_mobile_layout_cats_mtom');
		var order = 0;
		
		for (var i = 0; i < this.categoryIds.length; i++ ) {
			order += 10;
			gr.initialize();
			gr.mobile_layout = this.mobileLayoutGr.sys_id;
			gr.category = this.categoryIds[i];
			gr.order = order;
			gr.insert();
			this.lu.logDebug("Added category " + gr.category.getDisplayValue() + " at order " + gr.order);
		}
	},
	
	_reportError: function(errorMsg,showOnUI) {
		if (JSUtil.nil(errorMsg))
			return;
		
		this.lu.logError(errorMsg);
		if (gs.getSession().isInteractive() && showOnUI == true)
			gs.addErrorMessage(errorMsg);
	},
	
	type: 'CatalogMobileLayoutSync'
}