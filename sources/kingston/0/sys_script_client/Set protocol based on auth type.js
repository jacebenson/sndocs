function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (g_form.getValue("mutual_auth") == "true") {
		g_form.setMandatory("protocol_profile", true);
		g_form.setDisplay("protocol_profile", true);		
		
		g_form.setMandatory("protocol", false);
		g_form.setDisplay("protocol", false);			
	}
	else {
		g_form.setMandatory("protocol_profile", false);
		g_form.setDisplay("protocol_profile", false);		
		
		g_form.setMandatory("protocol",true );
		g_form.setDisplay("protocol",true );			
	}
	
}