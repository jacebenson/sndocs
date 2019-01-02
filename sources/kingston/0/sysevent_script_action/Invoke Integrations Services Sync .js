//Invoke the Sync Helper

gs.info("Timestamp retrieved  " +  event.parm1 + "   " + event.parm2, hrIntegrations.HR_INT_LOADER_LOG);

var syncHandler = new HRIntegrationsSyncHandler();
syncHandler.startIntegrationServicesLoad(event.parm2, event.parm1);