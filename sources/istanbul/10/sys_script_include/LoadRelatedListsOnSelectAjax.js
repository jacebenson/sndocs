var LoadRelatedListsOnSelectAjax = Class.create();
LoadRelatedListsOnSelectAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getRelatedLists: function() {
		var tableName = this.getParameter('jvar_table');
		var gr = new GlideRecord('sys_ui_related_list');
		var queryString = 'name=' + tableName + '^view=Default view';
		gr.addEncodedQuery(queryString);
		gr.query();
		
		if (gr.next()) {
			var gr2 = new GlideRecord('sys_ui_related_list_entry');
			gr2.addQuery('list_id', gr.sys_id);
			gr2.orderBy('position');
			gr2.query();

			while (gr2.next()) {
				var listEntry = gr2.getValue('related_list');
				var result = this.newItem("result");
				result.setAttribute("related_list_key", listEntry);

				if (listEntry.startsWith('REL:')) {	
					result.setAttribute("related_list_value", this.getRelationshipName(listEntry));
				}
				else {
					result.setAttribute("related_list_value", this.getDisplayValue(tableName, listEntry));
				}
			}
		}
		else {
			var result = this.newItem("result");
			result.setAttribute("related_list_key", '');
			result.setAttribute("related_list_value", 'No Available Related Lists');
		}
	},
	
	getDisplayValue: function(tableName, listEntry) {
		var gr = new GlideRecord(tableName);
		var listKeys = gr.getRelatedLists().keySet().toArray();
		var listValues = gr.getRelatedLists().values().toArray();
		
		for (var i = 0; i < listKeys.length; ++i) {
			if (listEntry == listKeys[i]) {
				return listValues[i];
			}
		}
		return "";
	},
	
	getRelationshipName: function(relatedList) {
		var gr = new GlideRecord('sys_relationship');
		var sysId = relatedList.split('REL:')[1];
		
		if (gr.get(sysId)) {
			return gr.name;
		}
		return "";
	},
	
    type: 'LoadRelatedListsOnSelectAjax'
});