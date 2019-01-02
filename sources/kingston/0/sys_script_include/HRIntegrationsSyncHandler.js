var hrIntegrationsHelper = new HRIntegrationsHelper();

var HRIntegrationsSyncHandler = Class.create();
HRIntegrationsSyncHandler.prototype = {
    initialize: function() {
		
    },
	
	startSync : function(externalSourceName, jobId){
		var LOG_PREFIX = externalSourceName + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceName;
		var localStartTime = new GlideDateTime();
		gs.info(LOG_PREFIX + " - Sync Started at" + localStartTime , logSource);
		var externalSource = new GlideRecord(hrIntegrations.HR_INT_SOURCE );
		externalSource.addActiveQuery();
		externalSource.addQuery("name", externalSourceName);
		externalSource.query();
		var retriever;
		if(externalSource.next()){
			retriever = hrIntegrationsHelper.getRetriever(externalSourceName);
			retriever = retriever.preProcess(jobId,externalSource);		
		}else{
			gs.error(LOG_PREFIX + " Invalid source name" ,logSource);
			hrIntegrationsHelper.jobCompleted(externalSourceName, jobId);
		}
	},
	
	startIntegrationServicesLoad : function(externalSourceId, jobId){
		var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE );
		externalSourceGr.get(externalSourceId);
		
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		
		gs.info(LOG_PREFIX + " Start Integration Service Load" , logSource);
		var retriever =  hrIntegrationsHelper.getRetriever(externalSourceGr.name);
		retriever.startIntegrationServicesLoad(jobId, externalSourceGr);
	},
	
	integrationServicesLoadCompleted : function(jobId, intServiceId){
		var tracker = hrIntegrationsHelper.getIntegrationServiceTracker(intServiceId, jobId);
		gs.info("************TRACKER********* " + tracker.sys_id + " " + tracker.hr_external_source.name);
		var externalSourceName = tracker.hr_external_source.name;
		var LOG_PREFIX = externalSourceName + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceName;
		
		gs.info(LOG_PREFIX +" Integration service load completed for " +  tracker.hr_integration_service.name , logSource);
		//Check if any other services are 
		//var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE );
		//externalSourceGr.get(tracker.hr_external_source);
		var retriever =  hrIntegrationsHelper.getRetriever(tracker.hr_external_source.name);
		retriever.integrationServicesLoadCompleted(tracker);
	},
	
	integrationServicesLoadFailed : function(jobId, intServiceId, errorReason){
		var tracker = hrIntegrationsHelper.getIntegrationServiceTracker(intServiceId, jobId);
		var externalSourceName = tracker.hr_external_source.name;
		var LOG_PREFIX = externalSourceName + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceName;
		
		gs.error(LOG_PREFIX +" Integration service load failed for " +  tracker.hr_integration_service.name+ " " + errorReason , logSource);
		
		//Check if any other services are 
		//var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE );
		//externalSourceGr.get(tracker.hr_external_source);
		var retriever =  hrIntegrationsHelper.getRetriever(tracker.hr_external_source.name);
		retriever.integrationServicesLoadFailed(tracker, errorReason);
	},
	
	jobFailed :  function(jobId, errorReason){
		var jobTrackerAfter = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		if(jobTrackerAfter.get(jobId)){
			jobTrackerAfter.setValue("state","failed");
			jobTrackerAfter.setValue("error_message",errorReason);
			jobTrackerAfter.setValue("job_ended_at",new GlideDateTime().getDisplayValue());
			jobTrackerAfter.update();
		}else
			gs.error( "Invalid Job ID "+ jobId , hrIntegrations.HR_INT_LOADER_LOG );
		
	},
	
    type: 'HRIntegrationsSyncHandler'
};