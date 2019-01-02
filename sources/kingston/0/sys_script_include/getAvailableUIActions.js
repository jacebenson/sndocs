// policyTableName is the name of the table the UI Policy
// applies to
function getAvailableUIActions(tableName, type, typeElement) {
	
	//recursive function to create query that includes extended tables
	var getExtendedTableQuery = function(tableName) {
		var gr = new GlideRecord('sys_db_object');
		gr.addQuery('name', tableName);
		gr.query();
		if (gr.next()) {
			if (gr.super_class != '') {
				return '^ORtable=' + gr.super_class.name + getExtendedTableQuery(gr.super_class.name);
			}
			return '';
		}
		return '';
	};
	
	var uiActionIDs = [];
	var gr = new GlideRecord('sys_ui_action');
	
	var queryString = "";
	if (type == "form") {
		if (typeElement == "related_links") {
			queryString = "table="+ tableName + getExtendedTableQuery(tableName) + "^ORtable=global^form_action=true^active=true^form_link=true";
		}
		else if (type == "form" && typeElement == "related_list") {
			queryString = "table="+ tableName + getExtendedTableQuery(tableName) + "^ORtable=global^list_action=true^list_banner_button=true";
		} 
		else {
			queryString = "table="+ tableName + getExtendedTableQuery(tableName) + "^ORtable=global^form_action=true^active=true^form_button=true";
		}
	}
	else if (type == "list") {
		if (typeElement == "related_links") {
			queryString = "table="+ tableName + getExtendedTableQuery(tableName) + "^ORtable=global^list_action=true^list_link=true";
		}
		else {
		queryString = "table="+ tableName + getExtendedTableQuery(tableName) + "^ORtable=global^list_action=true^list_banner_button=true^ORlist_button=true";
		}
	}
	
	gr.addEncodedQuery(queryString);
	gr.query();
	while (gr.next()) {
		uiActionIDs.push(gr.sys_id.toString());

	}

	return uiActionIDs;
}