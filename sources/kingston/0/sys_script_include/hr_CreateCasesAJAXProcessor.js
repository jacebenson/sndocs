var hr_CreateCasesAJAXProcessor = Class.create();
hr_CreateCasesAJAXProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    check: function() {
        var trackerGr = new GlideRecord("sys_execution_tracker");
        trackerGr.addQuery("source_table", "sn_hr_core_case");
        trackerGr.addQuery("state", "IN", "0,1");
        trackerGr.query();
        if (trackerGr.next())
            return trackerGr.getUniqueValue();
        return "";
    },

    /**
     * Start the Scripted Hierarchical Worker if one does not already exist
     */
    start: function() {
        var trackerId = this.check();
        if (trackerId)
            return trackerId;
        var encodedQuery = this.getParameter("sysparm_ajax_processor_encoded_query");
        var defaultValues = this.getParameter("sysparm_ajax_processor_default_values");
		var haveParent = this.getParameter("sysparm_ajax_processor_have_parent");
		var countProfile = this.getParameter("sysparm_ajax_processor_count_profile");
		var hrSelectionType = this.getParameter("sysparm_ajax_processor_selection_type");
        gs.info("encodedQuery::" + encodedQuery);
        gs.info("defaultValues::" + defaultValues);
		gs.info("haveParent::" + haveParent);
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Creating cases"));
        worker.setScriptIncludeName("sn_hr_core.hr_BulkCaseCreation");
        worker.setScriptIncludeMethod("createCasesFromQuery");
        worker.putMethodArg("encodedQuery", encodedQuery);
        worker.putMethodArg("defaultValues", defaultValues);
		worker.putMethodArg("haveParent", haveParent);
		worker.putMethodArg("countProfile", countProfile);
		worker.putMethodArg("hrSelectionType", hrSelectionType);
        worker.setBackground(true);
        worker.start();
        return worker.getProgressID();
    },
	
	saveBulkCaseRequest : function(){//createCasesFromQuery 
		var encodedQuery = this.getParameter("sysparm_user_selection_query");
        var defaultValues = this.getParameter("sysparm_default_values");
		var haveParent = this.getParameter("sysparm_hasParent");
		var countProfile = this.getParameter("sysparm_selected_user_count");
		var hrSelectionType = this.getParameter("sysparm_user_selection_type");
		var insertedCase = new sn_hr_core.hr_BulkCaseCreation().insertCasesFromQuery(encodedQuery ,defaultValues ,haveParent,countProfile,hrSelectionType);
		return insertedCase;
		
	},

    
    type: 'hr_CreateCasesAJAXProcessor'
});