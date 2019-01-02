var SCDataForClientScriptDebug = Class.create();
SCDataForClientScriptDebug.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getValues: function() {
		var itemId = this.getParameter('sysparm_item_id');
		var variableId = this.getParameter('sysparm_variable_id');
		var result = this.newItem("result");
		var itemGr = new GlideRecord("sc_cat_item");
		itemGr.get(itemId);
		result.setAttribute("item", itemGr.getDisplayValue());
		var variableGr = new GlideRecord("item_option_new");
		variableGr.get(variableId);
		result.setAttribute("variable", variableGr.getDisplayValue());
		// 8: Reference , 18: Lookup Select Box, 21: List Collector, 22: Lookup Multiple Choice
		if (variableGr.getValue("type") === '8') {
		    result.setAttribute("reference", variableGr.getDisplayValue("reference"));
		}
		if (variableGr.getValue("type") === '18' || variableGr.getValue("type") === '22') {
		    result.setAttribute("reference", variableGr.getDisplayValue("lookup_table"));
		}
		if (variableGr.getValue("type") === '21') {
		    result.setAttribute("reference", variableGr.getDisplayValue("list_table"));
		}
		result.setAttribute("reference_qual", variableGr.getValue("reference_qual"));
		result.setAttribute("attributes", variableGr.getValue("attributes"));
		result.setAttribute("type", variableGr.getDisplayValue("type"));
		result.setAttribute("type_value", variableGr.getValue("type"));
		result.setAttribute("read_roles", variableGr.getValue("read_roles"));
		result.setAttribute("create_roles", variableGr.getValue("create_roles"));
		result.setAttribute("write_roles", variableGr.getValue("write_roles"));
		result.setAttribute("delete_roles", variableGr.getValue("delete_roles"));
	},
    type: 'SCDataForClientScriptDebug'
});