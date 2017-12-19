var cxs_TableConfig = Class.create();

cxs_TableConfig.prototype = {
    EXCLUDE_FIELDS_FROM_OBJECT: {
        "sys_created_by": true,
        "sys_created_on": true,
        "sys_domain": true,
        "sys_id": true,
        "sys_mod_count": true,
        "sys_updated_by": true,
        "sys_updated_on": true,
		"search_as_script": true
    },

    initialize: function(gr) {
        this._gr = gr;
        this._gru = new GlideRecordUtil();
    },

    setName: function(configName) {
        if (!this._gr)
            return false;

        if (configName) {
            this._gr.name = configName;
            return true;
        }

        if (!this._gr.getValue("table"))
            return false;

        this._gr.name = new GlideRecord(this._gr.table).getClassDisplayValue() + " [" + this._gr.table + "]";

        return true;
    },

    deleteSearchFields: function() {
        if (!this._gr || !this._gr.getUniqueValue())
            return false;

        var fieldConfigGr = new GlideRecord("cxs_table_field_config");
        fieldConfigGr.addQuery("cxs_table_config", this._gr.getUniqueValue());
        fieldConfigGr.deleteMultiple();

        fieldConfigGr = new GlideRecord("cxs_table_email_config");
        fieldConfigGr.addQuery("cxs_table_config", this._gr.getUniqueValue());
        fieldConfigGr.deleteMultiple();

        return true;
    },

    isDuplicate: function() {
        if (!this._gr)
            return false;

        // If this record is being updated and sc_cat_item has not changed
        // we don't need to check if we're creating a duplicate
        if (!this._gr.isNewRecord() && (!this._gr.table.changes() && !this._gr.active.changes()))
            return false;

        // Search for an existing record that matches the one we're trying to create/update
        var tableConfigGr = new GlideRecord("cxs_table_config");
        tableConfigGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
        tableConfigGr.addQuery("table", this._gr.table);
		tableConfigGr.addActiveQuery();
        tableConfigGr.query();

        return tableConfigGr.hasNext();
    },

    getAvailableFields: function(forceFieldNames) {
        var fieldNames = {};

        if (!forceFieldNames)
            forceFieldNames = {};

        if (!this._gr)
            return fieldNames;

        var existingFields = {};
        this._getSearchFields(function(fieldObj) {
            existingFields[fieldObj.field] = true;
        });

        var targetTableGr = new GlideRecord(this._gr.table);
        targetTableGr.initialize();

        var fields = targetTableGr.getFields();
        var types = new cxs_TableFieldTypes();

        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            if (!types.isValid(field.getED().getInternalType()))
                continue;

            if (!existingFields[field.getName()] || forceFieldNames[field.getName()])
                fieldNames[field.getLabel() + " [" + field.getName() + "]"] = field.getName();
        }

        return fieldNames;
    },
	
    getTableConfigObject: function() {
        var fields = [];
        this._getSearchFields(function(fieldObj) {
            fields.push(fieldObj);
        });

        var tableConfig = {};
        this._gru.populateFromGR(tableConfig, this._gr, this.EXCLUDE_FIELDS_FROM_OBJECT);
		tableConfig.result_action_label = this._gr.getDisplayValue("result_action_label"); 
        tableConfig.resultsHeaderText = this._gr.getDisplayValue("results_header_text");
        tableConfig.configURL = this._gr.getLink(true);
        tableConfig.configDisplayValue = this._gr.getDisplayValue();
        tableConfig.search_fields = fields;
		tableConfig.search_as_results_msg = (this._gr.search_as_results_msg.nil() ? "" : this._gr.getDisplayValue("search_as_results_msg"));
		tableConfig.search_as_script_ok = true;
		
		if (tableConfig.search_as_field)
			tableConfig.search_as_field_label = GlideMetaData.getTableFieldLabel(tableConfig.table, tableConfig.search_as_field);
		
		//Run the condition script if there is one
		var script = this._gr.getValue("search_as_script");
		if (!JSUtil.nil(script))
			tableConfig.search_as_script_ok = !!GlideEvaluator.evaluateString(script);

        return tableConfig;
    },

    matchesCondition: function(recordSysId) {
        var matchCondition = this._gr.getValue("match_condition");
        if (!matchCondition)
            return true;

        if (!recordSysId)
            return true;

        var recordGr = new GlideRecord(this._gr.getValue("table"));
        if (!recordGr.isValid())
            return true;

		// pass sys_id as first parameter so we don't log
		// confusing and unhelpful Warning on new records
        if (!recordGr.get("sys_id", recordSysId))
            return true;

		// compare condition against the record with match all conditions true and case sensitive false
        return SNC.Filter.checkRecord(recordGr, matchCondition, true, false);
    },

    getDefaultSearchField: function() {
        var defaultSearchField = {};

        if (!this._gr || !this._gr.getUniqueValue())
            return defaultSearchField;

        var fieldConfigGr = new GlideRecord("cxs_table_field_config");
        fieldConfigGr.addQuery("cxs_table_config", this._gr.getUniqueValue());
        fieldConfigGr.addQuery("default_config", true);
        fieldConfigGr.query();

        if (fieldConfigGr.next())
            this._gru.populateFromGR(defaultSearchField, fieldConfigGr, this.EXCLUDE_FIELDS_FROM_OBJECT);

        return defaultSearchField;
    },

    createDefaultSearchField: function() {
        var fieldName = gs.getProperty("com.snc.contextual_search.widget.form.default_field");
        if (!fieldName)
            return;

        var targetTableGr = new GlideRecord(this._gr.table);
        var field = targetTableGr.getElement(fieldName);

        if (field === null)
            return false;

        var types = new cxs_TableFieldTypes();
        if (types.isValid(field.getED().getInternalType())) {
            var fieldGr = new GlideRecord("cxs_table_field_config");
            fieldGr.cxs_table_config = this._gr.sys_id;
            fieldGr.field = fieldName;
            fieldGr.insert();
            return true;
        }

        return false;
    },
    
    nextFieldOrderNumber: function() {
		if (!this._gr)
			return 100;
		
		var configFieldGr = new GlideAggregate("cxs_table_field_config");
		configFieldGr.addAggregate("MAX", "order");
		configFieldGr.addQuery("cxs_table_config", this._gr.getUniqueValue());
		configFieldGr.groupBy("cxs_table_config");
		configFieldGr.query();
		
		if (configFieldGr.next()) {
			var returnOrder = "" + (100 + parseInt(configFieldGr.getAggregate("MAX", "order"), 10));
			
			if (returnOrder != "NaN")
				return returnOrder;
		}
		
		return 100;
	},
    

    _getSearchFields: function(handler) {
        if (!this._gr || !this._gr.getUniqueValue())
            return;

        var fieldConfigGr = new GlideRecord("cxs_table_field_config");
        fieldConfigGr.addQuery("cxs_table_config", this._gr.getUniqueValue());
		fieldConfigGr.orderBy('order');
		fieldConfigGr.orderBy('name');
        fieldConfigGr.query();

        while (fieldConfigGr.next()) {
            var fieldObj = {};
            this._gru.populateFromGR(fieldObj, fieldConfigGr, this.EXCLUDE_FIELDS_FROM_OBJECT);
            handler.call(this, fieldObj);
        }
    },
	
    type: 'cxs_TableConfig'
};