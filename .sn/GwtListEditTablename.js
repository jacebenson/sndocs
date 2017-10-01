/*! RESOURCE: /scripts/GwtListEditTablename.js */
var GwtListEditTablename = Class.create(GwtListEditSelect, {
    addOptions: function() {
        var ga = new GlideAjax('AjaxClientHelper');
        this.editor.selectedOnly = this.editor.tableElement.getNamedAttribute("selected_only") == "true";
        ga.addParam('sysparm_name', this.getName());
        ga.addParam('sysparm_noViews', this.getNoViews());
        ga.addParam('sysparm_noSystemTables', this.editor.tableElement.getNamedAttribute("no_system_tables") == "true");
        ga.addParam('sysparm_currentTableName', this.editor.tableElement.tableName);
        if (this.editor.selectedOnly) {
            ga.addParam('sysparm_selectedOnly', true);
            ga.addParam('sysparm_selectedField', this.editor.fields[0]);
            ga.addParam('sysparm_selected', this._getSelected());
            ga.addParam('sysparm_forceSelected', this.editor.tableElement.getNamedAttribute("force_selected") == "true")
        }
        ga.getXML(this._createOptions.bind(this));
    },
    getName: function() {
        return "generateChoiceTable";
    },
    getNoViews: function() {
        return this.editor.tableElement.getNamedAttribute("no_views") == "true";
    },
    _getSelected: function() {
        var selected = this.editor.getValue(this.editor.fields[0]);
        var selectedOnlyOverride = this.editor.tableElement.getNamedAttribute("selected_only_list_override");
        if ((selected == null || selected.length == 0) && selectedOnlyOverride != null) {
            if (selectedOnlyOverride.indexOf('javascript:') == 0) {
                var script = selectedOnlyOverride.substring(11, selectedOnlyOverride.length);
                var response;
                try {
                    response = eval(script);
                } catch (e) {
                    return selected;
                }
                if (typeof response == 'undefined') {
                    return selected;
                } else {
                    return response == null || response.length == 0 ?
                        'empty_c460fe18-371f-4315-a61b-c7bf21c82786' : response;
                }
            } else {
                return selectedOnlyOverride;
            }
        }
        return selected;
    },
    toString: function() {
        return "GwtListEditTablename";
    }
});;