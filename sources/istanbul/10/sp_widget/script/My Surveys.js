(function() {
  // populate the 'data' object
  // e.g., data.table = $sp.getValue('table');
	data.maxRecords = options.maxRecords || 5;
	var sp = new SPSurveyAPI();
	options.showAll = $sp.getParameter('id') == 'my_surveys';
	sp.getSurveys(data.maxRecords, options.showAll, data);
	data.instances.forEach(function(instance) {
		if (!!instance.description)
			instance.description = $sp.stripHTML(instance.description);
	});

})();