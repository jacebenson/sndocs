var ScheduleDomainStructureUtil = Class.create();

ScheduleDomainStructureUtil.prototype = {

	ATTRIBUTES: "attributes",
	DOMAIN_MASTER: "domain_master",
	SYS_DOMAIN: "sys_domain",
	SYS_DOMAIN_PATH: "sys_domain_path",

    initialize: function(logProperty) {
		if (JSUtil.nil(logProperty))
			logProperty = "";

		this.log = new GSLog(logProperty, this.type);
    },

	activateDomainColumns: function(table) {
		this._toggleActiveFlag(table, this.SYS_DOMAIN, true);
		this._toggleActiveFlag(table, this.SYS_DOMAIN_PATH, true);
	},

	deactivateDomainColumns: function(table) {
		this._toggleActiveFlag(table, this.SYS_DOMAIN, false);
		this._toggleActiveFlag(table, this.SYS_DOMAIN_PATH, false);
	},

	removeDomainMasterAttribute: function(table) {
		return this._toggleDomainMasterAttribute(false, table);
	},

	addDomainMasterAttribute: function(table, field) {
		return this._toggleDomainMasterAttribute(true, table, field);
	},

	loadPluginFiles: function(pluginId, path) {
		GlidePluginManager.loadPluginData(pluginId, path);
	},

	isDomainFieldPresent: function(table) {
		if (!GlideTableDescriptor.isValid(table)) {
			this.log.warn("[isDomainFieldPresent] Invalid table name supplied.");
			return false;
		}
		return GlideTableDescriptor.get(table).isValidField(this.SYS_DOMAIN);
	},

	hasDomainConflict: function(table, masterFieldName) {
		if (!this.isDomainFieldPresent(table)) {
			this.log.warn("[hasDomainConflict] sys_domain field is not present on " + table);
			return false;
		}
		if (!GlideTableDescriptor.get(table).isValidField(masterFieldName)) {
			this.log.warn("[hasDomainConflict] Invalid master field name supplied.");
			return false;
		}

		var ga = new GlideAggregate(table);
		ga.addAggregate("COUNT");
		ga.addEncodedQuery(masterFieldName + ".sys_domainNSAMEASsys_domain");
		ga.query();
		if (ga.next())
			return parseInt(ga.getAggregate("COUNT"), 10) > 0;

		return false;
	},

	makeDomainMasterCompliant: function(table, masterTable, field, pluginId, path) {
		var result = {"domain_master": false, "domain_security": false, "domain_disabled": false};

		// Add domain_master attribute if sys_domain field is not present
		if (!this.isDomainFieldPresent(table)) {
			this.log.info("[makeDomainMasterCompliant] [STARTED] Adding domain_master attribute to the table: " + table);
			this.addDomainMasterAttribute(table, field);
			result.domain_master = true;
			this.log.info("[makeDomainMasterCompliant] [COMPLETED] Adding domain_master attribute to the table: " + table);
			return result;
		}

		this.log.info("[makeDomainMasterCompliant] Checking for records in " + table + " that have a different domain to the parent " + masterTable);
		if (this.hasDomainConflict(table, field)) {
			this.log.warn("[makeDomainMasterCompliant] There are conflicting records in the " + table + " table that have a different domain value to the " + field + " field that refers to the " + masterTable + " record.");
			return result;
		}

		this.log.info("[makeDomainMasterCompliant] [STARTED] Adding domain_master attribute to the table: " + table);
		this.addDomainMasterAttribute(table, field);
		result.domain_master = true;
		this.log.info("[makeDomainMasterCompliant] [COMPLETED] Adding domain_master attribute to the table: " + table);

		this.log.info("[makeDomainMasterCompliant] [STARTED] Loading READ ACLs for sys_domain and sys_domain_path columns on the table: " + table);
		this.loadPluginFiles(pluginId, path);
		result.domain_security = true;
		this.log.info("[makeDomainMasterCompliant] [COMPLETED] Loading READ ACLs for sys_domain and sys_domain_path columns on the table: " + table);

		this.log.info("[makeDomainMasterCompliant] [STARTED] Deactivating sys_domain and sys_domain_path columns on the table: " + table);
		this.deactivateDomainColumns(table);
		result.domain_disabled = true;
		this.log.info("[makeDomainMasterCompliant] [COMPLETED] Deactivating sys_domain and sys_domain_path columns on the table: " + table);

		return result;
	},

	_toggleActiveFlag: function(table, field, active) {
		var grDictionary = this._getDictionaryRecord(table, field);
		if (!grDictionary) {
			this.log.warn("[_toggleActiveFlag] Dictionary record for " + table + "." + field + " could not be found.");
			return false;
		}
		grDictionary.setValue("active", active);
		return grDictionary.update();
	},

	_toggleDomainMasterAttribute: function(addAttribute, table, field) {
		var grDictionary = this._getDictionaryRecord(table);
		if (!grDictionary) {
			this.log.warn("[_toggleDomainMasterAttribute] Dictionary record for " + table + " could not be found.");
			return false;
		}

		var ga = new GlideAttributes(grDictionary.getValue(this.ATTRIBUTES));
		if (addAttribute && ga.containsAttribute(this.DOMAIN_MASTER)) {
			if (field == ga.getAttribute(this.DOMAIN_MASTER))
				return true;
			this.log.warn("[_toggleDomainMasterAttribute] Attribute for domain_master already exists for " + table + ". Remove the attribute and re-run this script.");
			return false;
		}

		if (addAttribute)
			ga.setAttribute(this.DOMAIN_MASTER, field);
		else
			ga.removeAttribute(this.DOMAIN_MASTER);

		grDictionary.setValue(this.ATTRIBUTES, ga.serializeAttributes());
		if (!grDictionary.update()) {
			this.log.warn("[_toggleDomainMasterAttribute] Failed to update sys_dictionary record for " + table + ".");
			return false;
		}

		return true;
	},

	_getDictionaryRecord: function(table, field) {
		var grDictionary = new GlideRecord("sys_dictionary");
		grDictionary.addQuery("name", table);
		if (JSUtil.nil(field))
			grDictionary.addQuery("internal_type", "collection");
		else
			grDictionary.addQuery("element", field);
		grDictionary.query();

		if (!grDictionary.next())
			return null;

		return grDictionary;
	},

    type: 'ScheduleDomainStructureUtil'
};