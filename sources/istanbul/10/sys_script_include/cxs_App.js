var cxs_App = Class.create();
cxs_App.prototype = {
	initialize: function() {
		this._log = (new GSLog("com.snc.app_wrapper.log",this.type)).setLog4J();
		this.registerScripts();
	},
	
	/**
 	* Registers a business script against a table name
 	*/
	registerBusinessScript: function(tableName, clazz) {
		this._businessClassMap[tableName+""] = clazz;
	},
	
	/**
 	* Registers a security script against a table name
 	*/
	registerSecurityScript: function(tableName, clazz) {
		this._securityClassMap[tableName+""] = clazz;
	},
	
	/**
 	* Registers an actions script against a table name
 	*/
	registerActionsScript: function(tableName, clazz) {
		this._actionsClassMap[tableName+""] = clazz;
	},
	
	/**
 	* Gets the business object for the passed in GlideRecord.  The glide record is always the first argument.
 	*/
	getBusiness: function() {
		var clazz = this._getClass(this._businessClassMap, arguments[0].getTableName());
		return this._manualInit(clazz,arguments);
	},
	
	/**
 	* Gets the security object for the passed in GlideRecord.  The glide record is always the first argument.
 	*/
	getSecurity: function() {
		var clazz = this._getClass(this._securityClassMap, arguments[0].getTableName());
		return this._manualInit(clazz,arguments);
	},
	
	/**
 	* Gets the action object for the named table.  Table name is always the first argument.
 	*/
	getActions: function() {
		var clazz = this._getClass(this._actionsClassMap, arguments[0]);
		return this._manualInit(clazz,arguments);
	},
	
	/**
 	* Looks up the class used for wrapping the given tables name in the map
 	* provided.  Will search the table hierarchy for mappings.
 	*/
	_getClass: function(classMap, tableName) {
		tableName += "";
		var parentList = (new TableUtils(tableName)).getTables();
		
		for (var i=0; i < parentList.size(); i++) {
			var clazz = classMap[parentList.get(i)+""];
			if (clazz !== "undefined") {
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[_getClass] Returning class " + clazz.prototype.type + " for table " + tableName);
				return clazz;
			}
		}
		this._log.error("[_getClass] Unknown object type for <"+tableName+">");
	},
	
	/**
 	* Manually initialises an object using args rather than constructor arguments.
 	*/
	_manualInit: function(clazz,args) {
		// Copy the initialise to somewhere else and blank initialise. Less overhead than property clone.
		clazz.prototype._manualInit = clazz.prototype.initialize;
		clazz.prototype.initialize = function() {};
		var obj = new clazz();
		obj._manualInit.apply(obj,args);
		clazz.prototype.initialize = clazz.prototype._manualInit;  //Reset initialize
		return obj;
	},
	
	_businessClassMap: {},
	
	_securityClassMap: {},
	
	_actionsClassMap: {},
	
	type: 'cxs_Factory'
};

cxs_App.getBusiness = function() {
	var fact = new cxs_App();
	return fact.getBusiness.apply(fact,arguments);
};

cxs_App.getSecurity = function() {
	var fact = new cxs_App();
	return fact.getSecurity.apply(fact,arguments);
};

cxs_App.getActions = function() {
	var fact = new cxs_App();
	return fact.getActions.apply(fact,arguments);
};

cxs_App.prototype.registerScripts = function() {
	this.registerBusinessScript("cxs_table_config", cxs_TableConfig);
	this.registerBusinessScript("cxs_table_field_config", cxs_TableFieldConfig);
	this.registerBusinessScript("cxs_table_email_config", cxs_TableEmailConfig);
	this.registerBusinessScript("cxs_rp_config", cxs_RPConfig);
	this.registerBusinessScript("cxs_context_config", cxs_ContextConfig);
	this.registerBusinessScript("cxs_search_res_config", cxs_SearchResourceConfig);
	this.registerBusinessScript("cxs_wizard_config", cxs_WizardConfig);
	
	this.registerActionsScript("cxs_TableActions", cxs_TableActions);
	this.registerActionsScript("cxs_FormatResults", cxs_FormatResults);
	
	var isActive = GlidePluginManager.isActive('com.snc.contextual_search.dynamic_filters');
   	if (isActive) {
		this.registerBusinessScript("cxs_filter_config", cxs_FilterConfig);
		this.registerBusinessScript("cxs_filter_mapping", cxs_FilterMapping);
		this.registerBusinessScript("cxs_rp_filter_config", cxs_RPFilterConfig);
		this.registerBusinessScript("cxs_rp_filter_mapping", cxs_RPFilterMapping);
		this.registerActionsScript("cxs_RPActions", cxs_RPActions);   	
   	}
	
};