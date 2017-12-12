(function() {
  // populate the 'data' object
  // e.g., data.table = $sp.getValue('table');
	data.maxRecords = options.maxRecords || 5;
	var sp = new SPSurveyAPI();
	options.showAll = $sp.getParameter('id') == 'my_surveys';
	if($sp.getParameter('id') != 'my_surveys'){
		if(options.widgetTitle && options.widgetTitle.length>0){
			data.widgetTitle = options.widgetTitle;
		}else{
			data.widgetTitle = gs.getMessage("My Surveys");
		}
		data.encodedWidgetTitle = encodeURIComponent(data.widgetTitle);
	}else{
		
		data.widgetTitle = $sp.getParameter('title');
	}
	
	sp.getSurveys(data.maxRecords, options.showAll, data);
	data.instances.forEach(function(instance) {
		if (!!instance.description)
			instance.description = $sp.stripHTML(instance.description);
	});

})();