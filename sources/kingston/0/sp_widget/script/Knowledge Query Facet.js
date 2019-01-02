(function() {
	//set instance sys_id to be used as unique id for collapse
	data.instanceid = $sp.getDisplayValue('sys_id');	
	options.min_result_count = options.min_result_count ? parseInt(options.min_result_count) : 10;
	options.min_scroll_count = options.min_scroll_count ? parseInt(options.min_scroll_count) : 10;
	options.dynamic = options.dynamic ? options.dynamic == 'true' : false;
	options.alt_url_params = options.alt_url_params || "";
	data.is_admin = gs.hasRole("admin");
	
	var facet_type = 'single_select';
		if(options.custom_template){
			var tempAry = options.custom_template.toString().split(",");
			options.custom_template = tempAry[0];

			if(tempAry[1]){
				facet_type = tempAry[1];
			}
		}
    options.facet_type = facet_type;
	//get html template from options
	options.template = options.custom_template ? options.custom_template : (options.template ? options.template : "kb_facet_query_template");
	//get the template URL/path
	data.template = options.template;//$sp.translateTemplate(options.template);
})();