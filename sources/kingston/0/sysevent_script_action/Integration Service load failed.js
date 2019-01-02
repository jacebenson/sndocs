// Need the Job Run ID and Integration Service Id
gs.info("Integrations service load failed JobID :" + event.parm1 + " Int Service ID: " + event.parm2, hrIntegrations.HR_INT_LOADER_LOG);

var parms = event.parm1.split(",");
if(parms && parms.length ==2){
	var syncHandler = new HRIntegrationsSyncHandler();
	syncHandler.integrationServicesLoadFailed(parms[0],parms[1], event.parm2);
}else if(!gs.nil(event.parm1) && !gs.nil(event.parm2)){
	//Update Job Status and Error Message
	var syncHandler = new HRIntegrationsSyncHandler();
	syncHandler.jobFailed(parms[0], event.parm2);
}else
	gs.info("No Integration service to process");


//Need to check the If anything left 