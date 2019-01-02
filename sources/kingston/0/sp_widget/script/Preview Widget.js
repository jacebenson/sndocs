(function() {	
	data.sys_id = (input) ? input.sys_id : $sp.getParameter('sys_id');	
	var gr = new GlideRecordSecure('sp_widget');
	var q = gr.addQuery('sys_id', data.sys_id);
	gr.query();

	if (!gr.next()) {
		gs.addErrorMessage("cannot find widget " + data.sys_id);
		return;
	}


	var demo_data = null;
	var params = null;

	if (gr.getValue("demo_data")) {		
		try {			
			demo_data = JSON.parse(gr.getValue("demo_data"));
			params = (demo_data.options) ? demo_data.options : null;
		} catch(e) {
			$sp.log(e);
		}

	}

	data.widget = $sp.getWidget(data.sys_id, params);
	
	if (demo_data !== null) {
		Object.keys(demo_data).forEach(function(key) {
			data.widget[key] = demo_data[key];
		});
	}
	
})();