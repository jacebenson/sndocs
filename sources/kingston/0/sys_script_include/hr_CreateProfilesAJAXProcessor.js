var hr_CreateProfilesAJAXProcessor = Class.create();

hr_CreateProfilesAJAXProcessor.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    check: function() {
        var trackerGr = new GlideRecord("sys_execution_tracker");
        trackerGr.addQuery("source_table", "sn_hr_core_profile");
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
        gs.info("encodedQuery::" + encodedQuery);
        gs.info("defaultValues::" + defaultValues);
        var worker = new GlideScriptedHierarchicalWorker();
        worker.setProgressName(gs.getMessage("Creating profiles"));
        worker.setScriptIncludeName("sn_hr_core.hr_UserToProfileMigration");
        worker.setScriptIncludeMethod("createProfilesFromQuery");
        worker.putMethodArg("encodedQuery", encodedQuery);
        worker.putMethodArg("defaultValues", defaultValues);
        worker.setBackground(true);
        worker.start();
        return worker.getProgressID();
    },

    type: 'hr_CreateProfilesAJAXProcessor'

});