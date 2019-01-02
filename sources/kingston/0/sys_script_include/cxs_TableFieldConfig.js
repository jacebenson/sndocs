var cxs_TableFieldConfig = Class.create();

cxs_TableFieldConfig.prototype = {
    initialize: function(gr) {
        this._gr = gr;
    },

    isDefault: function() {
        return this._gr.default_config;
    },

    setDefault: function(value) {
        this._gr.default_config = value;
    },

    makeDefault: function() {
        var siblingsGr = new GlideRecord("cxs_table_field_config");
        siblingsGr.addQuery("cxs_table_config", this._gr.cxs_table_config);
        siblingsGr.addQuery("sys_id", "!=", this._gr.sys_id);
        siblingsGr.query();

        // Get out if this isn't the first record and default config didn't change to true
        if (siblingsGr.hasNext() && !this._gr.default_config.changesTo(true))
            return false;

        while (siblingsGr.next()) {
            if (!siblingsGr.default_config)
                continue;

            siblingsGr.default_config = false;
            siblingsGr.setWorkflow(false);
            siblingsGr.update();
        }

        // At this point we've either manually set the default flag or we need to as this is the first record
        this._gr.default_config = true;

        gs.addInfoMessage(gs.getMessage("{0} is now the default search field", this._gr.name));

        return true;
    },

    setName: function(fieldConfigName) {
        if (!this._gr)
            return false;

        if (fieldConfigName) {
            this._gr.name = fieldConfigName;
            return true;
        }

        if (!this._gr.getValue("cxs_table_config") || !this._gr.getValue("field"))
            return false;

        this._gr.name = new GlideRecord(this._gr.cxs_table_config.table).getElement(this._gr.field).getLabel() + " [" + this._gr.field + "]";

        return true;
    },
	
    setOrder: function() {
        if (!this._gr)
            return false;

        if (JSUtil.notNil(this._gr.order))
            return false;

        this._gr.order = new cxs_App.getBusiness(this._gr.cxs_table_config.getRefRecord()).nextFieldOrderNumber();

        return true;
    },

    getFieldChoices: function() {
        var tableConfigGr = new GlideRecord("cxs_table_config");
        if (!tableConfigGr.get(this._gr.getValue("cxs_table_config")))
            return false;

        var includeFields = {};
        includeFields[this._gr.getValue("field")] = true;
        var fieldsObj = cxs_App.getBusiness(tableConfigGr).getAvailableFields(includeFields);

        var fieldLabels = [];
        for (fieldLabel in fieldsObj)
            fieldLabels.push(fieldLabel);

        fieldLabels.sort();

        for ( var i = 0; i < fieldLabels.length; i++)
            answer.add(fieldsObj[fieldLabels[i]], fieldLabels[i]);

        return true;
    },

    type: 'cxs_TableFieldConfig'
}
