(function() {
	var page_id = $sp.getParameter('id');
	var typeId = $sp.getParameter('type_id');
	var surveyId = $sp.getParameter('instance_id');
	var sp = new SPSurveyAPI();
	if (page_id == 'public_survey') {
		if(!!typeId && (!sp.isSurveyPublic(typeId) || gs.isLoggedIn()))
			data.redirectTarget = "?id=take_survey&type_id=" + typeId;
		else if(!!surveyId && (!sp.isSurveyInstancePublic(surveyId) || gs.isLoggedIn()))
			data.redirectTarget = "?id=take_survey&instance_id=" + surveyId;
	}

	sp.loadSurvey(typeId,surveyId, data);
})();