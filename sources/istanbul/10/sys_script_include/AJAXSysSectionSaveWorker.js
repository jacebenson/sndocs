var AJAXSysSectionSaveWorker = Class.create();
AJAXSysSectionSaveWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    start: function() {
		// Setup background worker
		var worker = new GlideSysSectionSaverWorker();
		worker.setSectionID(this.getParameter('sysparm_ajax_processor_section_id'));
		worker.setViewName(this.getParameter("sysparm_ajax_processor_view_name"));
		worker.setSectionOrder(this.getParameter("sysparm_ajax_processor_section_order"));
		worker.setFieldsSelected(this.getParameter("sysparm_ajax_processor_fields_selected"));
		worker.setProgressName("Saving form section");
			
		// Start worker in the background
		worker.setBackground(true);
		worker.start();
		
		// Return worker progress ID to caller
		var progressId = worker.getProgressID();
		return progressId;
    },

    type: 'AJAXSysSectionSaveWorker'
});