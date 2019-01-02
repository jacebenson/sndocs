var HRIntegrationsUtils = Class.create();
HRIntegrationsUtils.prototype = {
    initialize: function() {
    },
	
	setImportSetAsynchronous : function(importSetId){
		var gr = new GlideRecord("sys_import_set");
		gr.get(importSetId);
		if(gr.getValue("mode") == "synchronous"){
			gr.setValue("mode","asynchronous");
			gr.setValue("short_description", "Asynchronous Transformation for HR Integrations");
			gr.update();
		}
	},
	
	setImportSetState : function(importSetId, state){
		if(!importSetId)
			return;
		var importSetGR = new GlideRecord("sys_import_set");
		importSetGR.get(importSetId);
		importSetGR.setValue("state", state);
		if(state == "loaded");
			importSetGR.setDisplayValue("load_completed", gs.nowDateTime());
		importSetGR.update();
	},
	
	createImportSetAsynchronous: function(current){
		setImportSetSysId();
		setImportSetRow();

		function setImportSetSysId() {
			if (!current.sys_import_set.nil()) {
				return;
			}
			var it = new GlideImportSet(current.getTableName());
			it.setSynchronous(false);
			current.sys_import_set = it.create();
		}

		// set the import set row number if it is blank
		function setImportSetRow() {
			if (!current.sys_import_row.nil()) {
				return;
			}

			var rgr = new GlideRecord(current.getTableName());
			rgr.orderByDesc("sys_import_row");
			rgr.setLimit(1);

			rgr.query();
			if (rgr.next()) {
				gs.log(rgr.sys_import_row);
				current.sys_import_row = rgr.sys_import_row + 1;
			} else {
				current.sys_import_row = 0;
			}
		}
	},
	
	transformImportSet : function(importSetId){
		gs.info("Invoking transformation for import set " + importSetId);
		if(!importSetId)
			return;
		var importSetGr = new GlideRecord("sys_import_set");
		importSetGr.get(importSetId);
		//var importSetId = importSetGr.getUniqueValue();
		var importSetRun = new GlideImportSetRun(importSetId);
		var importLog = new GlideImportLog(importSetRun, "HR Integrations Transform");
		var ist = new GlideImportSetTransformer();
		ist.setLogger(importLog);
		ist.setImportSetRun(importSetRun);
		ist.setImportSetID(importSetId);
		ist.setSyncImport(true);
		ist.transformAllMaps(importSetGr);
		gs.info("Completed transformation for import set " + importSetId);
	},

    type: 'HRIntegrationsUtils'
};