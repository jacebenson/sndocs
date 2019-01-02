var cxs_RPConfig = Class.create();

cxs_RPConfig.prototype = {
    EXCLUDE_FIELDS_FROM_OBJECT: {
        "sys_created_by": true,
        "sys_created_on": true,
        "sys_domain": true,
        "sys_mod_count": true,
        "sys_updated_by": true,
        "sys_updated_on": true,
        "sys_package": true,
        "sys_update_name": true
    },

    RP_MACRO: "cxs_rp_search",

    initialize: function(gr) {
        this._gr = gr;
        this._gru = new GlideRecordUtil();
    },

    setName: function(configName) {
        if (!this._gr || !this._gr.getUniqueValue())
            return false;

        if (configName) {
            this._gr.name = configName;
            return true;
        }

        this._gr.name = this._gr.sc_cat_item.getDisplayValue();

        return true;
    },

    isDuplicate: function() {
        if (!this._gr)
            return false;

        // If this record is being updated and sc_cat_item has not changed
        // we don't need to check if we're creating a duplicate
        if (!this._gr.isNewRecord() && (!this._gr.sc_cat_item.changes() && !this._gr.active.changes()))
            return false;

        // Search for an existing record that matches the one we're trying to create/update
        var rpConfigGr = new GlideRecord("cxs_rp_config");
        rpConfigGr.addQuery("sys_id", "!=", this._gr.getUniqueValue());
        rpConfigGr.addQuery("sc_cat_item", this._gr.sc_cat_item);
		rpConfigGr.addActiveQuery();
        rpConfigGr.query();

        return rpConfigGr.hasNext();
    },

    getVariableIds: function() {
        var sysIds = [];

        if (!this._gr)
            return sysIds;

        var variableGr = new GlideRecord("item_option_new");
        variableGr.addQuery("sys_id", "IN", this.getCatItemVariableIds());
        variableGr.query();

        while (variableGr.next())
            sysIds.push(variableGr.getUniqueValue());

        return sysIds;
    },

    getCatItemVariableIds: function() {
        var sysIds = [];

        if (!this._gr)
            return sysIds;

        var catItemId = this._gr.sc_cat_item + "";
        if (!catItemId)
            return sysIds;

        var catItemGr = new GlideRecord("sc_cat_item");
        if (!catItemGr.get(catItemId))
            return sysIds;

        var searchableTypes = new cxs_RPVarTypes().getTypeMap();

        var catItemObj = GlideappCatalogItem.get(catItemId);
        var varsGr = catItemObj.getStandaloneVariables();
        while (varsGr.next())
            if (searchableTypes[varsGr.type])
                sysIds.push(varsGr.getUniqueValue());

        return sysIds;
    },

    getRPConfigObject: function() {
        var rpConfig = {};
        this._gru.populateFromGR(rpConfig, this._gr, this.EXCLUDE_FIELDS_FROM_OBJECT);
        rpConfig.result_action_label = this._gr.getDisplayValue("result_action_label");
        rpConfig.resultsHeaderText = this._gr.getDisplayValue("results_header_text");
        rpConfig.configURL = this._gr.getLink(true);
        rpConfig.configDisplayValue = this._gr.getDisplayValue();
        rpConfig.search_field = {};
        this._gru.populateFromGR(rpConfig.search_field, this._gr.search_variable.getRefRecord(), this.EXCLUDE_FIELDS_FROM_OBJECT);

        return rpConfig;
    },

    isOnRecordProducer: function() {
        var varGr = new GlideRecord("item_option_new");
        varGr.addQuery("cat_item", this._gr.sc_cat_item);
        varGr.addQuery("macro.name", this.RP_MACRO);
        varGr.query();

        return varGr.hasNext();
    },

    addToRecordProducer: function() {
        if (this.isOnRecordProducer())
            return false;
    
        var maxVarOrderGa = new GlideAggregate("item_option_new");
        maxVarOrderGa.addQuery("cat_item", this._gr.sc_cat_item);
        maxVarOrderGa.addAggregate("MAX", "order");
        maxVarOrderGa.groupBy("cat_item");
        maxVarOrderGa.query();

        var order = 100;
        if (maxVarOrderGa.next())
            order = (maxVarOrderGa.getAggregate("MAX", "order") - 0) + 100;

        var varGr = new GlideRecord("item_option_new");
        varGr.type = 14 // Macro;
        varGr.cat_item = this._gr.sc_cat_item;
        varGr.macro.setDisplayValue(this.RP_MACRO);
        varGr.display_title = false;
        varGr.question_text = "Contextual Search Results";
        varGr.name = "contextual_search_results";
        varGr.order = order;
        varGr.insert();

        return true;
    },

    removeFromRecordProducer: function() {
        if (!this.isOnRecordProducer())
            return false;
    
        var varGr = new GlideRecord("item_option_new");
        varGr.addQuery("cat_item", this._gr.sc_cat_item);
        varGr.addQuery("macro.name", this.RP_MACRO);
        varGr.query();

        if (varGr.next())
            return varGr.deleteRecord();

        return false;
    },
	
	deleteFilterConfigs: function() {
		var isActive = GlidePluginManager.isActive('com.snc.contextual_search.dynamic_filters');
        if (!isActive || !this._gr || !this._gr.getUniqueValue())
            return false;

        var filterConfigGr = new GlideRecord("cxs_rp_filter_config");
        filterConfigGr.addQuery("cxs_rp_config", this._gr.getUniqueValue());
        filterConfigGr.deleteMultiple();
        return true;
    },
	
    type: 'cxs_RPConfig'
}