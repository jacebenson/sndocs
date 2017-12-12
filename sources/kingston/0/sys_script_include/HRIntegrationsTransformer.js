var hrIntegrationUtils = new global.HRIntegrationsUtils();
var HR_INT_SERVICE = 'sn_hr_integrations_service';
var hrIntegrationsHelper = new HRIntegrationsHelper();



var HRIntegrationsTransformer = Class.create();
HRIntegrationsTransformer.prototype = {
    initialize: function() {
    },
	
	startIntegrationServiceTransform : function(jobId, externalSourceId){
		var dryRun = hrIntegrationsHelper.isDryRun(externalSourceId);
		var intServices = new GlideRecord(HR_INT_SERVICE);
		intServices.addActiveQuery();
		intServices.orderBy("order");
		intServices.query();
		var serviceMapping;
		while(intServices.next()){
			var tracker = hrIntegrationsHelper.getIntegrationServiceTracker(intServices.sys_id, jobId);
			if(tracker){
				if(tracker.getValue("total") == 0 || tracker.getValue("inserts") == 0){
					gs.info("Pull didn't get any data , So Ignore");
					gs.warn("No data pulled for the service " + intServices.name);
					hrIntegrationsHelper.updateTracker(tracker, {state:"complete"});
					continue;
				}
				gs.info("**********#########Import Set ID " + tracker.getValue("set"));
				var importSetGR = new GlideRecord("sys_import_set");
				if(importSetGR.get(tracker.getValue("set")) && importSetGR.getValue('state') == "loaded"){
					//if dryrun set all the rows state to ignored
					if(dryRun){
						gs.info("Dry Run is true, hence ignoring all rows " +intServices.getValue("staging_table"));
						this.setImportSetRowsState(importSetGR.sys_id, intServices.getValue("staging_table"),"ignore");
					}
					tracker.setValue("transform_started_at" , new GlideDateTime().getDisplayValue());
					tracker.setValue("state" , "running");
					var trackerId = tracker.update();
					gs.info("Starting the transformation for " +intServices.getValue("staging_table"));
					hrIntegrationUtils.transformImportSet(importSetGR.getValue("sys_id"));
					gs.info("Completed the transformation for " +intServices.getValue("staging_table"));
					this.postProcessAllRecords(intServices.getValue("staging_table"),importSetGR.getValue("sys_id"));
					gs.info("Completed the Post Processing of all records for " +intServices.getValue("staging_table"));
					tracker.get(trackerId);
					importSetGR.get(tracker.getValue("set"));
					if(importSetGR.getValue("state") == "processed"){
						var impRun = new GlideRecord("sys_import_set_run");
						impRun.addQuery("set", importSetGR.sys_id);
						impRun.query();
						impRun.next();
						tracker.setValue("state" , impRun.getValue("state"));
					}
					tracker.setValue("transform_ended_at" , new GlideDateTime().getDisplayValue());
					//tracker.setValue("state" , "complete");
					tracker.update();
				}else{
					gs.warn("No data pulled for the service " + intServices.name);
				}
			}else{
				gs.error("*********************************#####################TRACKER NOT FOUND############################"+ intServices.name + " Job Id:  " +  jobId);
			}
		}
	},
	
	setImportSetRowsState: function(importSetId, stagingTable, state){
		var importSetRun = new GlideRecord(stagingTable);
		importSetRun.addQuery("sys_import_set", importSetId);
		importSetRun.query();
		while(importSetRun.next()){
			importSetRun.setValue("sys_import_state", state);
			importSetRun.update();
		}
	},
	
	getIntegrationServiceJobTracker : function (integrationServiceId, jobId, externalSourceId){
		var tracker = new GlideRecord(hrIntegrations.SERVICE_JOB_TRACKER_TABLE);
		tracker.addQuery("hr_integration_service", integrationServiceId);
		tracker.addQuery("hr_integrations_job_tracker", jobId);
		tracker.addQuery("hr_external_source", externalSourceId);
		tracker.query();
		tracker.next();
		return tracker;
	},
	
	postProcessAllRecords: function(importTable, importSetId){
		if(importTable == hrIntegrations.HR_WORKER_STAGING){
			var helper =new HRIntegrationsWorkerTransformHelper();
			helper.postProcessAllRecords(importSetId);
		}
	},

    type: 'HRIntegrationsTransformer'
};