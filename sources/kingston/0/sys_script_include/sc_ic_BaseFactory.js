var sc_ic_BaseFactory = Class.create();
sc_ic_BaseFactory.prototype = {
	initialize: function() {
		this._log = (new GSLog(sc_ic.FACTORY_LOG_LEVEL,this.type)).setLog4J();

		// Default Class Registrations
		this.registerClass(sc_.REQUESTED_ITEM, sc_ic_RequestedItem);
		this.registerClass(sc_.CATALOG_ITEM, sc_ic_CatalogItem);
		this.registerClass(sc_.CATALOG_ITEM_PRODUCER, sc_ic_CatalogItemRecordProducer);
		this.registerClass(sc_.CATALOG_ITEM_PRODUCER_SERVICE, sc_ic_CatalogItemRecordProducerService);
		this.registerClass(sc_.ITEM_OPTION,sc_ic_CatalogItemVariable);
		this.registerClass(sc_.QUESTION_CHOICE, sc_ic_CatalogItemVariableChoice);
		this.registerClass(sc_ic.ITEM_STAGING, sc_ic_Item);
		this.registerClass(sc_ic.APRVL_DEFN, sc_ic_ApprovalDefn);
		this.registerClass(sc_ic.APRVL_DEFN_STAGING, sc_ic_ApprovalDefnStaging);
		this.registerClass(sc_ic.APRVL_TYPE_DEFN, sc_ic_ApprovalTypeDefn);
		this.registerClass(sc_ic.APRVL_TYPE_DEFN_STAGING, sc_ic_ApprovalTypeDefnStaging);
		this.registerClass(sc_ic.REQ_ITEM_APRVL_DEFN, sc_ic_ReqItemApprovalDefn);
		this.registerClass(sc_ic.QUESTION, sc_ic_Question);
		this.registerClass(sc_ic.QUESTION_CHOICE, sc_ic_QuestionChoice);
		this.registerClass(sc_ic.QUESTION_CLASS, sc_ic_QuestionClass);
		this.registerClass(sc_ic.QUESTION_TYPE, sc_ic_QuestionType);
		this.registerClass(sc_ic.SECTION, sc_ic_Section);
		this.registerClass(sc_ic.COLUMN, sc_ic_Column);
		this.registerClass(sc_ic.TASK_ASSIGN_DEFN_STAGING, sc_ic_TaskAssignDefnStaging);
		this.registerClass(sc_ic.TASK_ASSIGN_DEFN, sc_ic_TaskAssignDefn);
		this.registerClass(sc_ic.TASK_DEFN_STAGING, sc_ic_TaskDefnStaging);
		this.registerClass(sc_ic.TASK_DEFN, sc_ic_TaskDefn);
		this.registerClass(sc_ic.REQ_ITEM_TASK_DEFN, sc_ic_ReqItemTaskDefn);
		this.registerClass(sc_ic.CATEGORY_REQUEST, sc_ic_CategoryRequest);
		this.registerClass(sc_.TASK,sc_ic_CatalogTask);

		this.registerSecurityClass(sc_ic.ITEM_STAGING, sc_ic_ItemStagingSecurityManager);
		this.registerSecurityClass(sc_ic.SECTION, sc_ic_SectionSecurityManager);
		this.registerSecurityClass(sc_ic.COLUMN, sc_ic_ColumnSecurityManager);
		this.registerSecurityClass(sc_ic.QUESTION, sc_ic_QuestionSecurityManager);
		this.registerSecurityClass(sc_ic.QUESTION_CHOICE, sc_ic_QuestionChoiceSecurityManager);
		this.registerSecurityClass(sc_ic.APRVL_DEFN_STAGING, sc_ic_ApprovalDefnStagingSecurityManager);
		this.registerSecurityClass(sc_ic.TASK_DEFN_STAGING, sc_ic_TaskDefnStagingSecurityManager);
	},
	
	/**
	 * Registers a class against a table name
	 */
	registerClass: function(tableName, clazz) {
		this._classMap[tableName+""] = clazz;
	},
	
	/**
	 * Registers a security class against a table name
	 */
	registerSecurityClass: function(tableName, clazz) {
		this._securityClassMap[tableName+""] = clazz;
	},
	
	/**
	 * Wraps the provided GlideRecord in the defined wrapper class.  Also passes through any other parameters
	 */
	wrap: function() {
	    // For this to work we need to get rid of the automatic boostrap for the object
	    // clone everything else, then create the object and call the constructor manually
	    var cln = function() {};
	    cln.prototype = {};
	    var source = this.getWrapperClass(arguments[0].getTableName());
	    for (var property in source.prototype)
		    cln.prototype[property] = source.prototype[property];
	    var wrapped = new cln();
	    wrapped.initialize.apply(wrapped,arguments);
	    return wrapped;
	},
	
	/**
	 * Manages the defererencing of wrapper classes based on table name
	 */
	getWrapperClass: function(tableName) {
		tableName += "";
		
		var parentList = (new TableUtils(tableName)).getTables();
		
		for (var i=0; i < parentList.size(); i++) {
		    var clazz = this._classMap[parentList.get(i)+""];
			if (clazz !== "undefined") {
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[getWrapperClass] Returning class " + clazz.prototype.type + " for table " + tableName);
				return clazz;
			}
		}

        this._log.error("[getWrapperClass] Unknown object type for <"+tableName+">");
	    throw new sc_FactoryException("[getWrapperClass] Unknown object type for <"+tableName+">");
    },
		
	/**
	 * Returns the SecurityManager class based on table name
	 */
	getSecurityManager: function(_gr, _gs) {
		var tableName = _gr.getTableName();
		
		var parentList = (new TableUtils(tableName)).getTables();
		
		for (var i=0; i < parentList.size(); i++) {
		    var clazz = this._securityClassMap[parentList.get(i)+""];
			if (clazz !== "undefined") {
				if (this._log.atLevel(GSLog.DEBUG))
					this._log.debug("[getSecurityManager] Returning class " + clazz.prototype.type + "SecurityManager for table " + tableName);
				return new clazz(_gr,_gs);
			}
		}

        this._log.error("[getSecurityManager] Unknown object type for <"+tableName+">");
	    throw new sc_FactoryException("[getSecurityManager] Unknown object type for <"+tableName+">");
    },

	_classMap: {},
	
	_securityClassMap: {},

	type: 'sc_ic_BaseFactory'
};

// Namespaced methods for wrap and getWrapperClass.
sc_ic_BaseFactory.wrap = function() {
	var fact = new sc_ic_BaseFactory();
	return fact.wrap.apply(fact,arguments);
};

sc_ic_BaseFactory.getWrapperClass = function() {
	var fact = new sc_ic_BaseFactory();
	return fact.getWrapperClass.apply(fact,arguments);
};

sc_ic_BaseFactory.getSecurityManager = function() {
	var fact = new sc_ic_BaseFactory();
	return fact.getSecurityManager.apply(fact,arguments);
};
