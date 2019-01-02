(function() {			
	var gr = GlideRecord("sys_language");	

	if (gr.isValid()) {
		gr.addQuery("active", "=", "true");
		gr.query()
		data.count = gr.getRowCount();
	}

	var user = gs.getUser();
	data.current = user.getPreference("user.language");	

	if (input) {
		user.setPreference("user.language", input.value);
		user.savePreferences();	 
	}
})();