var WORKDAY_HR_WEB_SRVC_ID="e678617e9fc072003be01050a57fcfb0";
var GET_SERVER_TSTAMP_FUNC_ID ="4039a57e9fc072003be01050a57fcf7d";
var TIMESTAMP_NODE_DATA = "//wd:Server_Timestamp/wd:Server_Timestamp_Data";
var OUTBOUND_REQUEST_TYPE = "soap";

var hrIntegrationsHelper = new HRIntegrationsHelper();

var HRIntegrationsWorkdayDataRetriever = Class.create();

HRIntegrationsWorkdayDataRetriever.prototype =  Object.extendsObject(HRIntegrationDataRetriever,{
    initialize: function() {
		
    },
	
	preProcess : function(jobId, externalSourceGr){
		this.getServerTimeStamp(jobId, externalSourceGr);	
	},
	
	
	getServerTimeStamp: function(jobId ,externalSourceGr){
		var workflowVars = hrIntegrationsHelper.setWorkflowParameters(OUTBOUND_REQUEST_TYPE,WORKDAY_HR_WEB_SRVC_ID, GET_SERVER_TSTAMP_FUNC_ID, jobId, externalSourceGr, 1);
		gs.info(externalSourceGr.name + " Get Server Time Stamp parameters "+ workflowVars.input_values , hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name);
		hrIntegrationsHelper.startWorkflow(workflowVars, "Get Server Timestamp");
		return {process_type:"asynchronous"};
	},
	
	
	checkHasMoreData:function(responseDoc,svcMapping,responseType){
		var  hasMore = false;
		if(responseType=="xml"){
			var  totalPages =  parseInt(responseDoc.getNodeText(svcMapping.response_total_pages));
			var  curPage =  parseInt(responseDoc.getNodeText(svcMapping.response_current_page));
			var	 pageResults = parseInt(responseDoc.getNodeText(svcMapping.response_page_results));
			if(curPage < totalPages)
				return true;
			}
		else if(responseType=="json"){
			hasMore = new sn_hr_integrations.HRIntegrationDataRetriever().getJsonParsedValue(responseDoc,svcMapping.response_has_more_data);
			if(hasMore == "true")
				return true;
		}
		return false;
	},
	
	setWorkflowParametersForPagination : function(outboundRequestType,messageFunctionId, input_values_json,schemaMap,xmlDoc,svcMapping){
		var  curPage =  parseInt(xmlDoc.getNodeText(svcMapping.response_current_page));
		var pageNumber = curPage+1;
		var externalSource = new GlideRecord(INT_SOURCE_TABLE);
		if(externalSource.get(input_values_json.external_source_id)){
			var workflowVars = {};
			//workflowVars.use_mid_server = "false";
			workflowVars.service_endpoint = externalSource.endpoint_url;
			input_values_json.pageNumber = pageNumber;
			workflowVars.soap_message_function_id =  messageFunctionId;
			var soapMsg = new GlideRecord("sys_soap_message_function");
			soapMsg.get(messageFunctionId);
			workflowVars.soap_message_id = soapMsg.getValue("soap_message");
			workflowVars.input_values = JSON.stringify(input_values_json);
			gs.info("Input values for Pagination " + workflowVars.input_values);
			return workflowVars;
		}
	},
	
	processResponseFromWorkflow : function(activityInput){
		var responseObject =  this.processResponseInternal(activityInput.response,activityInput.request_in_values,activityInput.status,
									 activityInput.error,activityInput.target_function_id);
		gs.info(hrIntegrations.WORKDAY_SOURCE_NAME + " -  " + JSON.stringify(responseObject));
		return responseObject;
	},
	
	processResponseInternal: function(response, requestData, status, error, targetFunctionId){
		
		var request = JSON.parse(requestData);
		var LOG_PREFIX =  hrIntegrations.WORKDAY_SOURCE_NAME + "-" +request.job_id ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ hrIntegrations.WORKDAY_SOURCE_NAME;
		if(targetFunctionId == GET_SERVER_TSTAMP_FUNC_ID){
			gs.info(LOG_PREFIX+ " Server Time Stamp Response Data " + response , logSource);
			gs.info(LOG_PREFIX + " Server Time Stamp Request Input " + requestData , logSource);
			gs.info(LOG_PREFIX + " Server Time Stamp Respons Status " + status , logSource);
			gs.info(LOG_PREFIX + " Server Time Stamp Response Error " + error , logSource);
			var returnResponse = {};
			var serverTstamp = null;
			if (status == 200 && response) {
				var xmlDoc = new XMLDocument2();
				xmlDoc.parseXML(response); 
				var val = xmlDoc.getNodeText(TIMESTAMP_NODE_DATA);
				var jobId = request.job_id;
				var externalSourceId = request.external_source_id;
				if (val){
					returnResponse.status = 1;
					returnResponse.triggerEvent = "sn_hr_integrations.retrieved_server_time";
					serverTstamp = String(val.trim());
					gs.info(LOG_PREFIX + " Server Time Stamp " + serverTstamp , logSource);
				
					if(!serverTstamp)
						serverTstamp = new GlideDate().getDisplayValue();
					
					gs.info(hrIntegrations.WORKDAY_SOURCE_NAME + ' Setting current sync run date as: '+serverTstamp.substr(0,10) + " Job Id " + jobId,logSource);
					hrIntegrationsHelper.setProperty(CURRENT_SYNC_DATE, serverTstamp.substr(0,10), jobId);
					hrIntegrationsHelper.setProperty(CURRENT_EXTERNAL_SERVER_TIME, serverTstamp, jobId);
				}else{
					gs.error(hrIntegrations.WORKDAY_SOURCE_NAME +" Failed to retrieve timestamp from Workday server. Xml document from server: "+ xmlDoc, logSource);
					returnResponse.status = 0;
				}
			} else{
				returnResponse.errorReason =LOG_PREFIX +" Failed to retrieve timestamp Status: " +status + " Error: " + error;
				returnResponse.status = 0;
				gs.error(LOG_PREFIX +" Failed to retrieve timestamp from Workday Server ", logSource);
				gs.error(LOG_PREFIX +" Status: "+ status + " Error:"+ error, logSource);
				gs.error(hrIntegrations.WORKDAY_SOURCE_NAME +" Response: "+ response, logSource);
			}
			if(returnResponse.status == 0){
				//TODO
				//Update Job Status to Failure
				var jobTrackerAfter = new GlideRecord("sn_hr_integrations_job_tracker");
				var jobAfter = jobTrackerAfter.get("sys_id",request.job_id);
				jobTrackerAfter.setValue("job_ended_at",new GlideDateTime().getDisplayValue());
				jobTrackerAfter.update();
			}
			
			return returnResponse;
		}else{
			return HRIntegrationDataRetriever.prototype.processResponseInternal.call(this,response, requestData, status, error, targetFunctionId);
		}
	},
    type: 'HRIntegrationsWorkdayDataRetriever'
});