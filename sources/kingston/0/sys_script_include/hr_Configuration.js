var hr_Configuration = Class.create();
hr_Configuration.prototype = {
	initialize: function() {
	},
	
	getProperty : function(propertyName, defaultValue) {
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", propertyName);
		gr.query();
		if (gr.next())
			return gr.getValue("value");
		
		// Check if no default value is provided
		if (defaultValue != undefined)
			return defaultValue;
		
		return null;		
	},
	
	getBooleanProperty : function(propertyName, defaultValue) {
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", propertyName);
		gr.query();
		if (gr.next())
			return gr.getValue("value") == true || gr.getValue("value") == "true";
		
		// Check if no default value is provided
		if (defaultValue != undefined)
			return defaultValue;
		
		return null;		
	},
	
	getIntProperty : function(propertyName, defaultValue) {
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", propertyName);
		gr.query();
		if (gr.next() && !isNaN(gr.getValue("value")))
			return Number(gr.getValue("value"));
		
		// Check if no default value is provided
		if (defaultValue != undefined)
			return defaultValue;
		
		return null;		
	},
	
	type: 'hr_Configuration'
};

