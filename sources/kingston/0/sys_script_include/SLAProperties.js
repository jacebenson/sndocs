var SLAProperties = Class.create();

SLAProperties.APPLICATION_NAME = "service_level_management";
SLAProperties.ENGINE_PROPERTIES_HELP = "http://docs.servicenow.com/?context=CSHelp:SLA-Engine-Properties";
SLAProperties.MOVING_TO_2011_HELP = "http://docs.servicenow.com/?context=CSHelp:Move-From-2010-To-2011-Engine";

SLAProperties.MODULES_AND_CATEGORIES_2010 = {
	"activeModules": {"SLA Engine": true,
					  "SLA Logging": false,
					  "SLA Repair": false},
	
	"propertyCategories": {"Service Level Management" : {
		                       "title" : gs.getMessage('{0}You are using the 2010 SLA engine and the configurable properties for this engine are displayed below{1}It is recommended that you move to the 2011 SLA Engine.  Click {2}Move from 2010 Engine to the 2011 engine{3}here{4} to view the instructions to move.{5}', ['<p><em><font size="4">', '</font></em></p><p><em><font size="3">', '<a title="','" href="' + SLAProperties.MOVING_TO_2011_HELP + '" target="_blank" rel="nofollow">','</a>','</em></p><hr/>']),
							   "sys_properties" : ["com.snc.sla.engine.version",
												   "glide.sla.calculate_on_display",
												   "com.snc.sla.calculation.percentage"]
							  }
						  }
};

SLAProperties.MODULES_AND_CATEGORIES_2011 = {
	"activeModules": {"SLA Engine": true,
					  "SLA Logging": true,
					  "SLA Repair": true},
	
	"propertyCategories": {"Service Level Management" : {
		                       "title" : gs.getMessage('{0}You are using the 2011 SLA engine and the configurable properties for this engine are displayed below{1}Click {2}SLA Engine Properties{3}here{4} to view the online help{5}', ['<p><em><font size="4">', '</font></em></p><p><em><font size="3">','<a title="','" href="' + SLAProperties.ENGINE_PROPERTIES_HELP + '" target="_blank" rel="nofollow">','</a>','</em></p><hr/>']),
							   "sys_properties" : ["com.snc.sla.calculation.percentage",
												   "com.snc.sla.engine.async",
												   "com.snc.sla.compatibility.breach",
												   "com.snc.sla.default_conditionclass",	
												   "com.snc.sla.workflow.run_for_breached",
												   "com.snc.sla.calculate_planned_end_time_after_breach",
												   "com.snc.sla.calculation.use_time_left",
												   "glide.sla.calculate_on_display",
												   "com.snc.sla.always_populate_business_fields",
												   "com.snc.sla.condition.case_sensitive"],

							   "sys_properties_legacy" : ["com.snc.sla.calculate_planned_end_time_after_breach"]
							   }
						  }									   
};

SLAProperties.updatePropertiesModules = function(engineVersion) {
	if (JSUtil.nil(engineVersion))
		engineVersion = "2010";
	
	var modulesAndCats = SLAProperties["MODULES_AND_CATEGORIES_" + engineVersion];
	var activeModules = modulesAndCats["activeModules"];
	for (var moduleName in activeModules) {
		if (JSUtil.nil(moduleName))
			continue;
		
        var modulesGr = new GlideRecord("sys_app_module");
        modulesGr.setWorkflow(false);
        modulesGr.addQuery("application.name", SLAProperties.APPLICATION_NAME);
        modulesGr.addQuery("title", moduleName);
        modulesGr.query();

        if (modulesGr.next()) {
			modulesGr.active = activeModules[moduleName];
			modulesGr.update();
		}
	}

	var hideSlaEnginePropertiesInUI = [];
	var hideFromUI = function (prop) {
		return hideSlaEnginePropertiesInUI.indexOf(prop) < 0;
	};

	var propertyCategories = modulesAndCats["propertyCategories"];
	for (var categoryName in propertyCategories) {
		var propertyCategoryGr = new GlideRecord("sys_properties_category");
		if (propertyCategoryGr.get("name", categoryName)) {
			var propertyCategory = propertyCategories[categoryName];
			if (propertyCategory.hasOwnProperty("title")) {
				propertyCategoryGr.title = propertyCategory.title;
				propertyCategoryGr.update();
			}
			
			if (propertyCategory.hasOwnProperty("sys_properties")) {
				var propertyCategoryId = propertyCategoryGr.sys_id + "";
				hideSlaEnginePropertiesInUI = this._getPropertiesToHide(propertyCategoryId, propertyCategory.sys_properties_legacy);
				var propertyCategoryM2MGr = new GlideRecord("sys_properties_category_m2m");
				propertyCategoryM2MGr.addQuery("category", propertyCategoryId);
				propertyCategoryM2MGr.deleteMultiple();
				var properties = propertyCategory.sys_properties.filter(hideFromUI);
				for (var i = 0; i <= properties.length; i++) {
					var propertyName = properties[i];
					var sysPropertiesGr = new GlideRecord("sys_properties");
					if (sysPropertiesGr.get("name", propertyName)) {
						propertyCategoryM2MGr.initialize();
						propertyCategoryM2MGr.category = propertyCategoryId;
						propertyCategoryM2MGr.property = sysPropertiesGr.sys_id + "";
						propertyCategoryM2MGr.order = (i + 1) * 100;
						propertyCategoryM2MGr.insert();
					}
				}
			}
		}
	}
	
	
	if (gs.isInteractive()) {
	    // Refresh the navigator
		var notification = new UINotification("system_event");
		notification.setAttribute("event", "refresh_nav");
		notification.send();
	}
};

// legacy properties are hidden from the UI provided they were not there before (upgraded instances)
SLAProperties._getPropertiesToHide = function(propertyCategoryId, legacyProperties) {
	var propertiesToHide = [];
	var propertyCategoryM2MGr = new GlideRecord("sys_properties_category_m2m");
	for (var i = 0; i< legacyProperties.length; i++) {
		var propertyName = legacyProperties[i];
		propertyCategoryM2MGr.addQuery("category", propertyCategoryId);
		propertyCategoryM2MGr.addQuery("property.name", propertyName);
		propertyCategoryM2MGr.query();
		if (!propertyCategoryM2MGr.hasNext())
			propertiesToHide.push(propertyName);
	}
	return propertiesToHide;
};

SLAProperties.setBreachCompat = function(value) {
	value = (value) ? 'true' : 'false'; // ensure 'true' or 'false' is set
	gs.setProperty('com.snc.sla.compatibility.breach', value, gs.getMessage('{0}Enable compatibility with 2010 \'breached\' stage for SLAs{1}Set to yes to set a Task SLA\'s stage field to {2}breached{3} when it exceeds the breach time{4}{5}Note: {6}this is legacy behaviour as the 2011 engine sets the {5}Has breached{6} field to indicate that a Task SLA has exceeded the breach time', ['<span style="font-weight:bold;font-size: larger">', '<br/></span>','<b>','</b>','<br/>', '<b>', '</b>']));
};

SLAProperties.isBreachCompatOn = function() {
	// default: enabled (if not set)
	return (gs.getProperty('com.snc.sla.compatibility.breach', 'true') == 'true');
};

SLAProperties.isBreachCompatOff = function() {
	return !SLAProperties.isBreachCompatOn();
};

SLAProperties.isEngineVersion = function(version) {
	// default: 2010 (if not set)
	return (gs.getProperty('com.snc.sla.engine.version', '2010') == version);
};

SLAProperties.prototype = {
	initialize: function() {
	},
	
	type: 'SLAProperties'
};