var ExportSetHelper = Class.create();
ExportSetHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    /*
    * Gets the value for property sysparm_propertyName
    *
    * return 'glide.ui.export.limit' when sysparm_propertyName is not defined.
    * return 10,000 when glide.ui.export.limit is not defined.
    */
    getMaxRowProperty: function() {
        var propertyName = String(this.getParameter("sysparm_propertyName"));
        var defaultMax = gs.getProperty('glide.ui.export.limit', 10000);
        return gs.getProperty(propertyName, defaultMax);
    },
    
    /*
    * Gets sys_id of Export History record for export started by Export Set Worker
    * Used by export_set_progress_dialog.
    */
    getExportSetRunId: function() {
        var sysProgressGR = new GlideRecord("sys_progress_worker");
        sysProgressGR.get(this.getParameter('sysparm_export_set_worker_id'));
        var sysCreatedOn = sysProgressGR.getValue("sys_created_on");
        
        var exportSetRunGR = new GlideRecord("sys_export_set_run");
        exportSetRunGR.addQuery("set", this.getParameter('sysparm_export_set_id'));
        exportSetRunGR.addQuery("sys_created_on", ">=", sysCreatedOn);
        exportSetRunGR.query();
        exportSetRunGR.next();
        
        return exportSetRunGR.getValue("sys_id");
    },
    
    /*
    * Creates a Export Set Worker for export set and returns worker id.
    * Invoked from simple_progress_worker
    *
    * See : Don't change name of function.
    *      simple_progress_viewer relies on this name.
    */
    start: function() {
        var exportSetId = String(this.getParameter('sysparm_export_set_id'));
        var isExportTestMode = Boolean(this.getParameter('sysparm_export_set_test_mode'));
        var worker = new SNC.ExportSetWorker(exportSetId, isExportTestMode);
        return worker.start();
    },
    
    type: 'ExportSetHelper'
});