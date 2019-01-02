var hr_BulkCaseUploadAJAXProcessor = Class.create();
hr_BulkCaseUploadAJAXProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    check: function() {
        var trackerGr = new GlideRecord("sys_execution_tracker");
        trackerGr.addQuery("source_table", "sn_hr_core_bulk_case_creation_data");
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
		
		var firstHeader = this.getParameter("sysparm_ajax_processor_first_header");
		var searchList = this.getParameter("sysparm_ajax_processor_search_list");
		
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Uploading file"));
        worker.setScriptIncludeName("sn_hr_core.hr_BulkCaseUpload");
		worker.setScriptIncludeMethod("uploadOperation");
		worker.putMethodArg("firstHeader", firstHeader);
		worker.putMethodArg("searchList", searchList);
        worker.setBackground(true);
        worker.start();
        return worker.getProgressID();
    },

    
    type: 'hr_BulkCaseUploadAJAXProcessor'
});