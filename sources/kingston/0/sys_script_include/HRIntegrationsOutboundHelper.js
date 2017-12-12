var hrIntegrationsHelper = new HRIntegrationsHelper();
var HRIntegrationsOutboundHelper = Class.create();
HRIntegrationsOutboundHelper.prototype = {
    initialize: function() {
    },
	
	startOutboundServices : function(jobId, externalSourceGr){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		gs.info(LOG_PREFIX + " Start Outbound Process -"+ externalSourceGr.name , logSource);
		var outServices = new GlideRecord(hrIntegrations.HR_INT_OUT_SOURCE);
		outServices.addActiveQuery();
		outServices.query();
		var serviceMappingGr;
		while(outServices.next()){
			gs.info(LOG_PREFIX + " Start Outbound Service -"+ outServices.name , logSource);
			serviceMappingGr = new GlideRecord(hrIntegrations.HR_INT_SERVICE_MAPPING);
			serviceMappingGr.addQuery("hr_integration_outbound_service", outServices.getValue("sys_id"));
			serviceMappingGr.addQuery("hr_external_source", externalSourceGr.getValue("sys_id"));
			serviceMappingGr.query();
			gs.info(">>>>>>>>>>>>>########################Service Mapping Found " + serviceMappingGr.hasNext());
			if(serviceMappingGr.next()){
				//Check in external interface if any data need to be processed
				var extInt = new GlideRecord(hrIntegrations.HR_INT_EXTERNAL_INTERFACE);
				extInt.addQuery("hr_integration_service_mapping", serviceMappingGr.sys_id);
				extInt.addQuery("process_type", "asynchronous");
				extInt.addQuery("status", "pending");
				extInt.query();
				while(extInt.next()){
					this.postExternalInterfaceData(externalSourceGr, serviceMappingGr, extInt, jobId);
				}
			}else{
				gs.error(LOG_PREFIX + " Service Mapping not found for Integration Outbound Service: " + outServices.name, logSource);
			}
		}
	},
	
	
	postExternalInterfaceData : function(externalSourceGr, serviceMappingGR, externalInterfaceDataGR,  jobId){
		
		externalInterfaceDataGR.status = 'work_in_progress';
		
		externalInterfaceDataGR.processed_by = jobId;
		
		
		var outboundMessageId;
		var outboundMessageFunctionId;
		var outboundRequestType= serviceMappingGR.getValue('outbound_request_type');
		
		if(outboundRequestType=="soap"){
			outboundMessageId=serviceMappingGr.getValue("outbound_service");
			if(!this.last_sync_date && serviceMappingGR.getValue("outbound_service_function_all"))
			outboundMessageFunctionId = serviceMappingGR.getValue("outbound_service_function_all");
		    else
			outboundMessageFunctionId = serviceMappingGR.getValue("outbound_service_function");
		}
		else if(outbound_request_type=="rest"){
			outboundMessageId=serviceMappingGr.getValue("rest_outbound_service");
			if(!this.last_sync_date && serviceMappingGR.getValue("rest_outbound_service_function_all"))
			outboundMessageFunctionId = serviceMappingGR.getValue("rest_outbound_service_function_all");
		    else
			outboundMessageFunctionId = serviceMappingGR.getValue("rest_outbound_service_function");		
		}
		
		
		var workflowVars = hrIntegrationsHelper.setWorkflowParameters(outboundRequestType,outboundMessageId,outboundMessageFunctionId, jobId, externalSourceGr, 1, serviceMappingGR,externalInterfaceDataGR.getValue("source_table_name"), externalInterfaceDataGR.getValue("source_table_sys_id"));
		
		var inputValuesJson = JSON.parse(workflowVars.input_values);
		inputValuesJson.service_type = hrIntegrations.EXT_INT_SERVICE_TYPE;
		inputValuesJson.external_int_id = externalInterfaceDataGR.sys_id.toString();
		workflowVars.input_values = JSON.stringify(inputValuesJson);
		
		if(!workflowVars.abortAction){
			externalInterfaceDataGR.update();
			gs.info("Parameters for Workflow " + workflowVars.input_values + "  " + externalInterfaceDataGR.hr_integration_service_mapping.outbound_service_function.toString());
			hrIntegrationsHelper.startWorkflow(workflowVars);
		
		}else{
			gs.error("Pushing data will stop now as mandatory values are missing in schema mapping for Service mapping " + externalInterfaceDataGR.hr_integration_service_mapping.name);
			externalInterfaceDataGR.status ='error';
			externalInterfaceDataGR.error_message = "Pushing data will stop now as mandatory values are missing in schema mapping for Service mapping " + externalInterfaceDataGR.hr_integration_service_mapping.name;
			externalInterfaceDataGR.update();
		}
	},

    type: 'HRIntegrationsOutboundHelper'
};