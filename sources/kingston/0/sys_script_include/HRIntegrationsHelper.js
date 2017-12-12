var HRIntegrationsHelper = Class.create();
HRIntegrationsHelper.prototype = {
    initialize: function() {
    },
	
	createIntegrationServiceTrackerEntry : function(integrationServiceId, jobId, externalSourceId){
		var tracker = new GlideRecord(hrIntegrations.SERVICE_JOB_TRACKER_TABLE);
		tracker.initialize();
		tracker.setValue("hr_integration_service", integrationServiceId);
		tracker.setValue("hr_integrations_job_tracker", jobId);
		tracker.setValue("hr_external_source", externalSourceId);
		tracker.setValue("state", "pending");
		//tracker.setValue("load_started_at", date);
		tracker.insert();
	},
	
	getIntegrationServiceTracker : function(integrationServiceId, jobId, state){
		var tracker = new GlideRecord(hrIntegrations.SERVICE_JOB_TRACKER_TABLE);
		tracker.addQuery("hr_integration_service", integrationServiceId);
		tracker.addQuery("hr_integrations_job_tracker", jobId);
		if(!gs.nil(state))
			tracker.addQuery("state", state);
		tracker.query();
		if(tracker.next())
			return tracker;
		return null;
	},
	
	updateIntegrationServiceTrackerEntry : function(integrationServiceId, jobId, externalSourceId, data){
		var tracker = new GlideRecord(hrIntegrations.SERVICE_JOB_TRACKER_TABLE);
		tracker.addQuery("hr_integration_service", integrationServiceId);
		tracker.addQuery("hr_integrations_job_tracker", jobId);
		tracker.addQuery("hr_external_source", externalSourceId);
		tracker.query();
		if(tracker.next()){
			this.setParamsForTracker(tracker, data);
			tracker.update();
		}
	
	},
	
	
	getTotalNumberOfRecords : function(integrationServiceId, jobId, externalSourceId){
		var tracker = new GlideRecord(hrIntegrations.SERVICE_JOB_TRACKER_TABLE);
		tracker.addQuery("hr_integration_service", integrationServiceId);
		tracker.addQuery("hr_integrations_job_tracker", jobId);
		tracker.addQuery("hr_external_source", externalSourceId);
		tracker.query();
		if(tracker.next())
			return tracker.total;
		else
			return 0;
	},
	
	updateTracker : function(trackerGr, data){
		this.setParamsForTracker(trackerGr, data);
		trackerGr.update();
	},
	
	setParamsForTracker: function(trackerGr, data){
		var val;
		for(var fieldName in data) {
			gs.info("FIELD NAMES >>>>>>>> " + fieldName+ "  >>>Value>>> "+ data[fieldName], hrIntegrations.HR_INT_LOADER_LOG );
			if(fieldName == 'inserts'){
				if(trackerGr.getValue(fieldName))
					val =  parseInt(data[fieldName]) +parseInt(trackerGr.getValue(fieldName));
				else
					val = parseInt(data[fieldName]);
				
				trackerGr.setValue(fieldName, val);
			}else if(fieldName == 'skipped'){

				if(trackerGr.getValue(fieldName))
					val =  parseInt(data[fieldName]) +parseInt(trackerGr.getValue(fieldName));
				else
					val = parseInt(data[fieldName]);

				trackerGr.setValue(fieldName, val);
			}else{
				trackerGr.setValue(fieldName, data[fieldName]);
			}
		}
	},
	
	getRetriever : function(externalSourceName){
		var retriever;
		if(externalSourceName == hrIntegrations.WORKDAY_SOURCE_NAME)
			retriever = new HRIntegrationsWorkdayDataRetriever();
		else if (externalSourceName == hrIntegrations.SUCCESSFACTOR_SOURCE_NAME)
			 retriever =  new HRIntegrationsSuccessFactorDataRetriever();
		else
			retriever = new HRIntegrationsDataRetriever();
		return retriever;
	},
	
	setProperty: function(column, value, id) {
		var jobTracker = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		gs.info("Setting Column Value " + column + "  " + value + "  " + id);
		if (jobTracker.get(id)) {
			jobTracker.setValue(column, value?value:'');
			jobTracker.update();
		}
	},
	
	
	getProperty: function(column,sourceId) {
		var jobTracker = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		jobTracker.addQuery('source',sourceId);
		jobTracker.orderByDesc('sys_updated_on');
		if (column == hrIntegrations.LAST_SYNC_DATE) 
			jobTracker.addNotNullQuery(column);
		jobTracker.query();
		if(jobTracker.next())
			return jobTracker.getValue(column);
		else
			return this.checkPreviousPropertyValue(column);	
	},
	
	checkPreviousPropertyValue : function(column){
		var jobTracker = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		jobTracker.addNullQuery('source');
		jobTracker.orderByDesc('sys_updated_on');
		if (column == hrIntegrations.LAST_SYNC_DATE) 
			jobTracker.addNotNullQuery(column);
		jobTracker.query();
		if(jobTracker.next())
			return jobTracker.getValue(column);
		else
			return "";
	},
	
	
	
	getSessionToken: function(jobid) {
		var jobTracker = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		jobTracker.addQuery('sys_id',jobid);
		jobTracker.orderByDesc('sys_updated_on');
		jobTracker.query();
		if(jobTracker.hasNext()){
		 jobTracker.next();
		 return jobTracker.getValue("current_external_session_token");
		}
		else
		 return '';
	},
	
	startWorkflow : function(workflowVars, intServiceName){
		var workflow = new global.Workflow();
		var gr = workflow.startFlow(hrIntegrations.INTEGRATION_WORKFLOW,null,null,workflowVars);
	},
	
	
	addAdditionalInputs : function(input_values_json,externalSourceGr){
		var addInputs = new GlideRecord(hrIntegrations.ADDITIONAL_INPUTS);
		addInputs.addQuery('source',externalSourceGr.sys_id);
		addInputs.query();
		while(addInputs.next()){
			input_values_json[addInputs.key]=addInputs.getValue('value');
			gs.info("ADDITIONAL INPUTS :: Key = "+addInputs.key+", Value = "+input_values_json[addInputs.key]);
		}
		return input_values_json;
	},
	
	setInputParameters : function(externalSourceGr, jobId, workflowVars,  input_values_json, pageNumber, serviceMappingGr, stagingTable, stagingTableSysId){
		
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		
		input_values_json.username_inbound = externalSourceGr.username_inbound.toString();
		input_values_json.username_outbound = externalSourceGr.username_outbound.toString();
		input_values_json.use_session_token = externalSourceGr.use_session_token.toString();
		input_values_json.api_version =this.getActiveSourceVersionValue(externalSourceGr.sys_id);
		input_values_json.pageNumber = pageNumber;
		input_values_json.external_source_id =externalSourceGr.sys_id.toString();
		input_values_json.change_in_functionid=false;
		input_values_json.changed_function_id="";
		input_values_json=this.addAdditionalInputs(input_values_json,externalSourceGr);
		
		
		if(serviceMappingGr){
			serviceMappingId = serviceMappingGr.sys_id.toString();
			var lastSyncDate = this.getProperty(hrIntegrations.LAST_SYNC_DATE,externalSourceGr.sys_id) ;
			var serverTS =  this.getProperty(hrIntegrations.CURRENT_EXTERNAL_SERVER_TIME,externalSourceGr.sys_id);
            
			//var stagingTable = hrIntegrations.JOB_TRACKER_TABLE;
			var source = new GlideRecord(stagingTable);
			source.get(stagingTableSysId);
			gs.info("STAGING TABLE " + stagingTable + "  " + stagingTableSysId);
			var schemaMapping = new GlideRecord("sn_hr_integrations_outbound_schema_mapping");
			schemaMapping.addQuery("service_mapping",'CONTAINS' , serviceMappingId);
			schemaMapping.addQuery("staging_table", stagingTable);
			schemaMapping.query();
			while(schemaMapping.next()){
				if(schemaMapping.getValue("use_source_script") ==true){
					gs.info("TARGet COLUMN " + schemaMapping.target_column + "  " + source.getValue("source_script"));
					var vars ={source:source, externalSourceId:externalSourceGr.sys_id.toString()};
					var evaluator = new GlideScopedEvaluator(); 
					input_values_json[schemaMapping.target_column] = evaluator.evaluateScript(schemaMapping, 'source_script',vars);
				}else{
					if(schemaMapping.source_column.indexOf(".") > -1){
						var fieldNames = schemaMapping.source_column.toString().split('.');
						var elem = source.getElement(fieldNames[0]).getRefRecord();
						input_values_json[schemaMapping.target_column] = elem.getValue(fieldNames[1]);
					}else
						input_values_json[schemaMapping.target_column] = source.getValue(schemaMapping.source_column);
				}

				if(schemaMapping.getValue("mandatory") == true  && gs.nil(input_values_json[schemaMapping.target_column])){
					workflowVars.abortAction = true;
					gs.error("Mandatory field value empty for "+ stagingTable + " Source FieldName : " + schemaMapping.source_column+ " Target Field Name "+ schemaMapping.target_column);
					return;
				}

				if(gs.nil(input_values_json[schemaMapping.target_column]))
					input_values_json[schemaMapping.target_column] = '';
			}
		}
		
		workflowVars.input_values = JSON.stringify(input_values_json);
		gs.info(LOG_PREFIX +" Input Value JSON " + input_values_json, logSource);
	},
	
	setWorkflowParameters :function(outboundRequestType,outboundMessageId, outboundMessageFunctionId, jobId, externalSourceGr, pageNumber, serviceMappingGr, stagingTable, stagingTableSysId){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		
		gs.info(LOG_PREFIX +" Setting workflow parameters", logSource);
		var workflowVars = {};
		var input_values_json = {};
		this.setInputParameters(externalSourceGr, jobId, workflowVars, input_values_json, pageNumber, serviceMappingGr, stagingTable, stagingTableSysId);
		if(!gs.nil(jobId))
			input_values_json.job_id = jobId.toString();
		if(serviceMappingGr)
			input_values_json.hr_integration_service_id = serviceMappingGr.hr_integration_service.toString();
		
		workflowVars.outbound_request_type=outboundRequestType;
		
		if(outboundRequestType=="soap"){
			workflowVars.soap_message_id = outboundMessageId;
			workflowVars.soap_message_function_id =  outboundMessageFunctionId;
			workflowVars.service_endpoint = externalSourceGr.endpoint_url;	
			}
		else if(outboundRequestType=="rest"){
			workflowVars.rest_message_id = outboundMessageId;
			workflowVars.rest_message_function_id =  outboundMessageFunctionId;
			var restMsg = new GlideRecord("sys_rest_message_fn");
			restMsg.get(outboundMessageFunctionId);
			workflowVars.service_endpoint = restMsg.getValue("rest_endpoint");
			
		}
		
		if(gs.nil(workflowVars.service_endpoint))
			workflowVars.service_endpoint = externalSourceGr.endpoint_url;	
		
		workflowVars.session_token= this.getSessionToken(jobId);
		gs.info('Job Id :'+jobId+' Session Token:'+ workflowVars.session_token);
		workflowVars.input_values = JSON.stringify(input_values_json);
		gs.info(LOG_PREFIX +" End Setting workflow parameters", logSource);
		return workflowVars;
	},
	
	jobCompleted : function(externalSourceName, jobId){
		var jobTrackerAfter = new GlideRecord(hrIntegrations.JOB_TRACKER_TABLE);
		if(jobTrackerAfter.get(jobId)){
			jobTrackerAfter.setValue("state","complete");
			jobTrackerAfter.setValue("job_ended_at",new GlideDateTime().getDisplayValue());
			jobTrackerAfter.update();
		}else
			gs.error(externalSourceName + " Invalid Job ID . Job not closed." , hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceName);
		
	},
	
	getPhoneComponents : function (phoneNumber,  fieldName) {
		
		var intl_code = fieldName+'_intl_code';
		var area_code = fieldName+'_area_code';
		var phone_number = fieldName+'_phone_number';
		
		var format = (phoneNumber.split(/[ ]+/));
		var formattedNumber = [];
		for (var i=0;i<format.length;i++) {
			var part = (format[i]);
			if (part.indexOf('+')==0)
				formattedNumber['intl_code'] = part.replace('+','');
				else if (part.indexOf('(')==0)
				formattedNumber['area_code'] = part.replace(/[()]/g, '');
				else
				formattedNumber['phone_number'] = part.replace(/[-]/g, '');
			}
		return formattedNumber;
	},
	
	getSourceProperty : function(externalSourceId, name){
		var extSourceProperties = new GlideRecord(hrIntegrations.HR_INT_SOURCE_PROPERTIES);
		extSourceProperties.addActiveQuery();
		extSourceProperties.addQuery("source",externalSourceId);
		extSourceProperties.addQuery("name", name);
		extSourceProperties.query();
		if(extSourceProperties.next())
			return extSourceProperties.getValue("value");
		return "";
	},
	
	isPushEnabled: function(externalSourceId){
		var hrIntHelper = new HRIntegrationsHelper();
		return this.getSourceProperty(externalSourceId , hrIntegrations.HR_INT_ENABLE_PUSH);
	},
	
	isDryRun: function(externalSourceId){
		var extSourceProperties = new GlideRecord(hrIntegrations.HR_INT_SOURCE_PROPERTIES);
		extSourceProperties.addActiveQuery();
		extSourceProperties.addQuery("source",externalSourceId);
		extSourceProperties.addQuery("name",hrIntegrations.HR_INT_DRY_RUN);
		extSourceProperties.query();
		var dryRun = false;
		if(extSourceProperties.next()){
			if (extSourceProperties.getValue("value") == "true") 
				dryRun = true;
		}
		gs.info("Dry Run is " + dryRun, hrIntegrations.HR_INT_LOADER_LOG);
		return dryRun;
	},

	cleanupStagingTable : function(externalSourceId){
		//
		var stagingTable = new GlideRecord("sn_hr_integrations_staging");
		stagingTable.addEncodedQuery("source="+externalSourceId+"^sys_updated_on<javascript:gs.daysAgoStart(7)");
		stagingTable.query();
		stagingTable.deleteMultiple();
	},
	
	getMatchingOutboundServices : function(glideRecord, externalSourceId){
		
		var outBoundServices = [];
		
		if(!externalSourceId)
			externalSourceId =glideRecord.source;
		
		if(!externalSourceId)
			return outBoundServices;
		
		if(glideRecord.transaction_log && glideRecord.transaction_log.changes()){
			gs.info("Update from Sync , So Ignore Pushing");
			return;
		}
		if(this.isPushEnabled(externalSourceId) == "false"){
			gs.info("Push not enable, Ignore");
			return;
		}
		
		var gr = new GlideRecord(hrIntegrations.HR_INT_OUT_SOURCE_TRIGGER);
		gr.addQuery("trigger_source", glideRecord.getTableName());
		gr.query();
		var filterConditionMet;
		while(gr.next()){
			if(outBoundServices.indexOf(gr.getValue("hr_integrations_outbound_service")) > -1)
				continue;
			var filter = gr.getValue("trigger_condition");
			if(!gs.nil(filter))
				filterConditionMet = GlideFilter.checkRecord(glideRecord, filter, true);
			else
				filterConditionMet = false;
			
			gs.info("Filter condition met status for " + gr.hr_integrations_outbound_service.name + "  " + filterConditionMet);

			if(filterConditionMet)
				outBoundServices.push(gr.getValue("hr_integrations_outbound_service"));
		}
		return outBoundServices;
	},
	
	invokeMatchingOutboundServices : function(matchingServices, sourceRecord, externalSourceId){
		var outboundServiceRecord;
		for(var i =0; i < matchingServices.length; i++){
			outboundServiceRecord = new GlideRecord(hrIntegrations.HR_INT_OUT_SOURCE);
			if(outboundServiceRecord.get(matchingServices[i])){
				if(sourceRecord.getTableName() == outboundServiceRecord.getValue("source_table"))
					this.pushDataToExternalInterface(sourceRecord, outboundServiceRecord, externalSourceId);
				else
					gs.error("Source Record is not of type "+ outboundServiceRecord.getValue("source_table") + " Source Record Type  " +sourceRecord.getTableName() );
			}
		}
	},
	
	pushDataToExternalInterface : function(glideRecord, outBoundServiceRecord, externalSourceId){
		
		
		var mapping = new GlideRecord(hrIntegrations.HR_INT_SERVICE_MAPPING);
		mapping.addActiveQuery();
		mapping.addQuery("hr_integration_outbound_service", outBoundServiceRecord.sys_id);
		if(externalSourceId)
			mapping.addQuery("hr_external_source", externalSourceId);
		mapping.query();
		if(mapping.getRowCount() < 1){
			gs.error("Mapping not found for "+outBoundServiceRecord.name );
			return;
		}
		var gr;
		while(mapping.next()){
			gr = new GlideRecord(hrIntegrations.HR_INT_EXTERNAL_INTERFACE);
			//check if the entry already exists
			gr.addQuery("hr_integration_service_mapping", mapping.getValue("sys_id"));
			gr.addQuery("source_table_name", glideRecord.getTableName());
			gr.addQuery("source_table_sys_id", glideRecord.sys_id);
			gr.addQuery("status","pending");
			gr.query();
			if(!gr.next()){
				gr.initialize();
				gr.setValue("source_table_name", glideRecord.getTableName());
				gr.setValue("source_table_sys_id", glideRecord.sys_id);
				gr.setValue("process_type", "asynchronous");
				gr.setValue("status", "pending");
				gr.setValue("hr_integration_service_mapping",mapping.getValue("sys_id"));
				gr.insert();
				gs.info("Posted "+ outBoundServiceRecord.name+ " event to external interface Profile "  +  glideRecord.sys_id);
			}
		}
	},
	
	getDataBusValue : function(data,dataValues){
		
		for(var i=0;i<dataValues.length;i++){
			try{
				if(data.get(dataValues[i]).returnResponse){
					return data.get(dataValues[i]).returnResponse;
				}
			}
			catch(err){
				continue;
			}
		}
		return data.get(8).returnResponse ;
	},
	
	getActiveSourceVersion : function(externalSourceId){
		var gr = new GlideRecord("sn_hr_integrations_source_version");
		gr.addQuery("source",externalSourceId);
		gr.addActiveQuery();
		gr.query();
		if(gr.next())
			return gr.getValue("sys_id");
		else
			return null;
	},
	
	getActiveSourceVersionValue : function(externalSourceId){
		var gr = new GlideRecord("sn_hr_integrations_source_version");
		gr.addQuery("source",externalSourceId);
		gr.addActiveQuery();
		gr.query();
		if(gr.next())
			return gr.getValue("version");
		else
			return "";
	},
	
	getActiveSourceVersionFromRecord : function(externalSourceGr){
		return this.getActiveSourceVersion(externalSourceGr.getValue("sys_id"));
	},
	
	getSchemaMap: function(svcMapping){
		var schMapping = new GlideRecord(HR_INT_SCHEMA_MAPPING);
		schMapping.addQuery('service_mapping','CONTAINS', svcMapping.getValue('sys_id'));
		var sourceVersion = this.getActiveSourceVersion(svcMapping.getValue("hr_external_source"));
		if(!gs.nil(sourceVersion))
			schMapping.addQuery("source_version",'CONTAINS', sourceVersion);
		schMapping.query();
		var schemaMap = {};
		while(schMapping.next()){
			if(!schemaMap.stagingTable)
				schemaMap.stagingTable = schMapping.getValue("staging_table");
			if(schemaMap[schMapping.getValue('staging_table_column')])
				schemaMap[schMapping.getValue('staging_table_column')].value.push(schMapping.getValue('external_entity_column_key'));
			else
				schemaMap[schMapping.getValue('staging_table_column')]= {type:schMapping.getValue("type") ,value:[schMapping.getValue('external_entity_column_key')], mandatory:schMapping.getValue("mandatory")};
		}
		return schemaMap;
	},

    type: 'HRIntegrationsHelper'
};
