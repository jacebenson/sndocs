var InteractiveFilterDefaults = Class.create();
InteractiveFilterDefaults.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	setDefaultValue: function(canvasSysId,defaultValue){
		var userId = gs.getUserID();
		var grCanvasPreferences = new GlideRecord('sys_canvas_preferences');
		grCanvasPreferences.addQuery('canvas_page',canvasSysId);
		grCanvasPreferences.addQuery('user',userId);
		grCanvasPreferences.addQuery('widget_id',defaultValue.id);
		grCanvasPreferences.addQuery('name',defaultValue.name);
		grCanvasPreferences.query();

		if(grCanvasPreferences.hasNext()){
			while(grCanvasPreferences.next()){
				grCanvasPreferences.canvas_page = canvasSysId;
				grCanvasPreferences.user = userId;
				grCanvasPreferences.widget_id = defaultValue.id;
				grCanvasPreferences.name = defaultValue.name;
				grCanvasPreferences.value =  JSON.stringify(defaultValue.filter);
				grCanvasPreferences.update();
			}
		}else{
			grCanvasPreferences.initialize();
			grCanvasPreferences.canvas_page = canvasSysId;
			grCanvasPreferences.user = userId;
			grCanvasPreferences.widget_id = defaultValue.id;
			grCanvasPreferences.name = defaultValue.name;
			grCanvasPreferences.value = JSON.stringify(defaultValue.filter);
			grCanvasPreferences.insert();
		}
		return {status:"ok"};

	},
	removeDefaultValue: function(canvasSysId,widgetId){
		var userId = gs.getUserID();
		var grCanvasPreferences = new GlideRecord('sys_canvas_preferences');
		grCanvasPreferences.addQuery('canvas_page',canvasSysId);
		grCanvasPreferences.addQuery('user',userId);
		grCanvasPreferences.addQuery('widget_id',widgetId);
		grCanvasPreferences.addQuery('name',"default_value");
		grCanvasPreferences.query();
		grCanvasPreferences.next();
		grCanvasPreferences.deleteRecord();
		return {status:"ok"};

	},
	removeAllDefaultValue: function(canvasSysId){
		var userId = gs.getUserID();
		var grCanvasPreferences = new GlideRecord('sys_canvas_preferences');
		grCanvasPreferences.addQuery('canvas_page',canvasSysId);
		grCanvasPreferences.addQuery('user',userId);
		grCanvasPreferences.addQuery('name',"default_value");
		grCanvasPreferences.deleteMultiple();
		return {status:"ok"};

	},
	saveDefaultValue: function(){
		var sysId = this.getParameter('sysparm_canvas_id');
		var defaultFilter = JSON.parse(this.getParameter('sysparm_default_filter'));
		return this.setDefaultValue(sysId,defaultFilter);
	},
	deleteDefaultValue: function(){
		var sysId = this.getParameter('sysparm_canvas_id');
		var widgetId = this.getParameter('sysparm_default_filter_id');
		return this.removeDefaultValue(sysId,widgetId);
	},
	deleteAllDefaultValue: function(){
		var sysId = this.getParameter('sysparm_canvas_id');
		return this.removeAllDefaultValue(sysId);
	},
	getDefaultValues: function(canvasSysId){
		var canvasId = canvasSysId ? canvasSysId : this.getParameter('sysparm_canvas_id');
		var userId = gs.getUserID();
		var grCanvasPreferences = new GlideRecord('sys_canvas_preferences');
		var defaultFilters = [];
		grCanvasPreferences.addQuery('canvas_page',canvasId);
		grCanvasPreferences.addQuery('user',userId);
		grCanvasPreferences.addQuery('name','default_value');
		grCanvasPreferences.query();
		while(grCanvasPreferences.next()){
			defaultFilters.push(this.getFilterJSON(grCanvasPreferences));
		}
		var result = this.newItem("result");
        result.setAttribute("filters", JSON.stringify(defaultFilters));
		return JSON.stringify(defaultFilters);
	},
	getFilterJSON: function(grCanvasPreference){
		var defaultFilter = {};
		defaultFilter.id = grCanvasPreference.getValue("widget_id");
		defaultFilter.name = grCanvasPreference.getValue("name");
		defaultFilter.filters = JSON.parse(grCanvasPreference.getValue("value"));
		defaultFilter.queryParts =this.getQueryParts(grCanvasPreference.getValue("value"));
		return defaultFilter;
	},
	getQueryParts: function(conditions){
	  var self = this;
	  var queryConditions =  JSON.parse(conditions);
	  var queryParts = queryConditions.map(self.getQueryPart);
	  return queryParts;
	},
	getQueryPart: function(condition){
		var queryPart = new SNC.InteractiveFilterUtils().getQueryPartForFilter(JSON.stringify(condition));
		return JSON.parse(queryPart);
	},
	getFilterJSONForQueryParts: function(key,filters){
		var defaultFilter = {};
		defaultFilter.id = key;
		defaultFilter.filters = filters;
		defaultFilter.queryParts =this.getQueryParts(filters);
		return defaultFilter;
	},
	addQueryPartsToHomePageFilters: function(filter){
	  var result = this.newItem("result");
	  var filterParam = this.getParameter('sysparm_homepage_filters');
      var homepageFilter =  new SNC.InteractiveFilterUtils().getQueryPartsForFilter(filterParam);
      result.setAttribute("filters",homepageFilter);
	  return homepageFilter;
	},
	type: 'InteractiveFilterDefaults'
});