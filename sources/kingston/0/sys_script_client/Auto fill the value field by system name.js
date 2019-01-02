function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var LGSourceGR = new GlideRecord("link_generator_source");
	var sysName = "";
	if (LGSourceGR.get(newValue)) 
		sysName = LGSourceGR.system_name.toString();
	
	
	var serviceName = g_form.getValue("service_field_name");
	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		var dbNameSanitizer = new DBNameSanitizer();
		var value = dbNameSanitizer.trimName(sysName);
		g_form.setValue("value", value + "_" + serviceName);
	});   
	
}