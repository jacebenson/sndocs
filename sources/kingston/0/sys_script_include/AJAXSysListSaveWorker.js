var AJAXSysListSaveWorker = Class.create();
AJAXSysListSaveWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	start: function() {
		// Setup background worker
		var worker = new GlideSysListSaverWorker();
		worker.setListID(this.getParameter('sysparm_ajax_processor_list_id'));
		worker.setViewName(this.getParameter("sysparm_ajax_processor_view_name"));
		worker.setFieldsSelected(this.getParameter("sysparm_ajax_processor_fields_selected"));
		worker.setProgressName("Saving Form List");
			
		// Start worker in the background
		worker.setBackground(true);
		worker.start();
		
		// Return worker progress ID to caller
		var progressId = worker.getProgressID();
		return progressId;
    },

    type: 'AJAXSysListSaveWorker'
});