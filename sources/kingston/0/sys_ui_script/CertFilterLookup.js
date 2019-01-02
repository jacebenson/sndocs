(function() {
	addLoadEvent(function() {
		// Changing reflistOpen particularly for the filter lookup so that
		// the active query will be displayed at the top (and can be
		// changed by the user
		window.reflistOpen = function(target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID){
			var url = reflistOpenUrl(target, target, elementName, refTableName, dependent, useQBE, refQualElements, additionalQual, parentID);
			// If the target was the filter field, add the active query
			if(target == 'cert_template.filter' || target == 'cert_schedule.filter')
				url += '&sysparm_query=active%3Dtrue';
			popupOpenStandard(url, "lookup");
		}
			
	});
})();