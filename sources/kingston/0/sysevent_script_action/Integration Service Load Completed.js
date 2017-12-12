// Need the Job Run ID and Integration Service Id
gs.info("Integrations service load completed JobID :" + event.parm1 + " Int Service ID: " + event.parm2, hrIntegrations.HR_INT_LOADER_LOG);
if(!gs.nil(event.parm1) && !gs.nil(event.parm2)){
	var syncHandler = new HRIntegrationsSyncHandler();
	syncHandler.integrationServicesLoadCompleted(event.parm1, event.parm2);
}else{
	//Nothing to do
	gs.info("No Integration service to process");
}

//Need to check the If anything left 