/* This package is a utility package for adding/updating/deleting monitoring
records in the usageanalytics_count_cfg table. Record entries in that table
are used by the Usage Analytics qouta functionality for monitoring record counts.
This package was initially developed as helper code for business rules
associated with Public Catalog.
 */
var UATableMonitoringUtils = Class.create();

var ua_cf_table = 'usageanalytics_count_cfg';
var search_type = 'PublicCatalog';

UATableMonitoringUtils.prototype = {
	initialize: function() {
	},
	// for the specified table name check to see if an monitoring entry exists in usage analytics config
	checkforMonitoredTable : function(table_name){
		//if (gs.tableExists('priority_lookup'))
		var list = new GlideRecord(ua_cf_table);
		list.addQuery("name", "=", table_name);
		list.addQuery('count_type', '=', search_type);
		list.query();
		return (list.getRowCount()>0);
	},
	
	// add a monitoring entry in usage analytics config
	addMonitorforTable : function(/*string*/table_name, /*string*/query, /*boolean*/in_report, /*string*/descrip) {
		var gr = new GlideRecord(ua_cf_table);
		gr.name = table_name;
		gr.active = true;
		gr.count_type = search_type
		gr.description = descrip;
		gr.query=query;
		gr.reportable = in_report;
		gr.insert();
	},
	
	// modify a monitoring entry in usage analytics config
	updateMonitorforTable : function(/*string*/table_name, /*string*/query, /*boolean*/in_report, /*string*/descrip) {
		//update record
		var gr = new GlideRecord(ua_cf_table);
		gr.addQuery('name', '=', table_name);
		gr.addQuery('count_type', '=', search_type);
		gr.query();
		if (gr.next()) {
			gr.query = query;
			gr.reportable = in_report;
			gr.description = descrip;
			gr.update();
		}
	},
	
	// modify a monitoring entry in usage analytics (but this is for a table change)
	updateMonitorforTableName : function(/*string*/table_to_update, /*string*/ new_table_name, /*string*/query, /*boolean*/in_report, /*string*/descrip) {
		//update record
		var gr = new GlideRecord(ua_cf_table);
		gr.addQuery('name', '=', table_to_update);
		gr.addQuery('count_type', '=', search_type);
		gr.query();
		if (gr.next()) {
			gr.name = new_table_name;
			gr.query = query;
			gr.reportable = in_report;
			gr.description = descrip;
			gr.update();
		}
	},
	
	// remove a monitoring entry in usage analytics
	removeMonitorforTable: function(/*string*/table_name) {
		var gr = new GlideRecord(ua_cf_table);
		gr.addQuery('name', '=', table_name);
		gr.addQuery('count_type', '=', search_type);
		gr.query();
		if (gr.next()) {
			gr.deleteRecord();
		}
	},
	
	// find the table label (text) given a sys_id
	findTableNameBySysId: function(find_sys_id) {
		var sysdb = new GlideRecord('sys_db_object');
		sysdb.addQuery("sys_id", "=", find_sys_id);
		sysdb.query();
		sysdb.next();
		return sysdb.name;
	},
	
	// set the comment text
	setSearchType: function(search_type_text) {
		search_type = search_type_text;
	},
	
	type: 'UATableMonitoringUtils'
};