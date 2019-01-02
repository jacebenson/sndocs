var AJAXPluginManagerWorker = Class.create();


AJAXPluginManagerWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	start: function() {

		var plugin_id = this.getParameter('sysparm_ajax_processor_plugin_id');
		var progress_name = this.getParameter('sysparm_ajax_processor_progress_name');
		var demo_data_only = this.getParameter('sysparm_ajax_processor_load_demo_data_only');
		var load_demo = this.getParameter('sysparm_ajax_processor_load_demo');
		gs.log("AJAXPluginManagerWorker: plugin_id = " + plugin_id);
		gs.log("AJAXPluginManagerWorker: progress_name = " + progress_name);
		gs.log("AJAXPluginManagerWorker: demo_data_only = " + demo_data_only);
		gs.log("AJAXPluginManagerWorker: load_demo = " + load_demo);
		
		var worker = new GlidePluginManagerWorker();

		worker.setProgressName(progress_name);
		worker.setPluginId(plugin_id);		
		worker.setBackground(true);

		if (typeof demo_data_only != "undefined" && demo_data_only == "true")
  	  	    worker.setLoadDemoDataOnly(true);
		
		if (typeof load_demo != "undefined" && load_demo == "true")
			worker.setIncludeDemoData(true);

		worker.start();
		
		gs.log("AJAXPluginManagerWorker: getProgressID = " + worker.getProgressID());
		
		return worker.getProgressID();
	}
});

