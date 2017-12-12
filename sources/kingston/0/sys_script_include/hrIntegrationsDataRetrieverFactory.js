var hrIntegrationsDataRetrieverFactory = Class.create();

hrIntegrationsDataRetrieverFactory.getDataRetriever= function(sourceId){
	var externalSource = new GlideRecord(hrIntegrations.HR_INT_SOURCE);
	if(externalSource.get(sourceId)){
		if(externalSource.getValue("name") == hrIntegrations.WORKDAY_SOURCE_NAME)
			return new HRIntegrationsWorkdayDataRetriever();
		else if (externalSource.getValue("name") == hrIntegrations.SUCCESSFACTOR_SOURCE_NAME)
			return new HRIntegrationsSuccessFactorDataRetriever();
	}
	return new HRIntegrationDataRetriever();
	
};