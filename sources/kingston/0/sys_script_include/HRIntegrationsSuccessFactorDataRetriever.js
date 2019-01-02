var SUCCESSFACTOR_HR_WEB_SRVC_ID="Success Factor Compound Employee Sync";
var LOGIN_FUNCTION ="dc37eddec3100300a669d73bf3d3ae34";
var LOGIN_SESSION_DATA = "//loginResponse/result/sessionId";
var LOGIN_SESSION_EXPIRE_TIME = "//loginResponse/result/msUntilPwdExpiration";
var CURRENT_EXTERNAL_SESSION_TOKEN="current_external_session_token";
var CURRENT_EXTERNAL_SESSION_TOKEN_TIME="current_external_session_expire_time";
var LOGIN_SESSION_FAILURE_ERRORCODE = "//loginResponse/result/error/errorCode";
var LOGIN_SESSION_FAILURE_ERRORREASON = "//loginResponse/result/error/errorMessage";
var OUTBOUND_REQUEST_TYPE="soap";

var hrIntegrationsHelper = new HRIntegrationsHelper();

var HRIntegrationsSuccessFactorDataRetriever = Class.create();

HRIntegrationsSuccessFactorDataRetriever.prototype =  Object.extendsObject(HRIntegrationDataRetriever,{
    initialize: function() {
		
    },
	
	preProcess : function(jobId, externalSourceGr){
		this.getLoginSessionToken(jobId, externalSourceGr);
		var currentDate = new GlideDateTime().getDate();
		var currentTimeStamp = new GlideDateTime().getDisplayValue();
		hrIntegrationsHelper.setProperty(CURRENT_SYNC_DATE, currentDate, jobId);
		hrIntegrationsHelper.setProperty(CURRENT_EXTERNAL_SERVER_TIME, currentTimeStamp, jobId);
	},
	
	getLoginSessionToken : function(jobId,externalSourceGr){
		gs.info('SUCCESSFACTOR_HR_WEB_SRVC_ID'+SUCCESSFACTOR_HR_WEB_SRVC_ID+'LOGIN_FUNCTION'+LOGIN_FUNCTION);
		var workflowVars = hrIntegrationsHelper.setWorkflowParameters(OUTBOUND_REQUEST_TYPE,SUCCESSFACTOR_HR_WEB_SRVC_ID, LOGIN_FUNCTION, jobId, externalSourceGr, 1);
		gs.info(externalSourceGr.name + " Get Server Time Stamp parameters "+ workflowVars.input_values , hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name);
		hrIntegrationsHelper.startWorkflow(workflowVars, "Get Login Session Token");
		return {process_type:"asynchronous"};
	},
	
	checkHasMoreData:function(responseDoc,svcMapping,responseType){
		var  hasMore = false;
		if(responseType=="xml"){
		hasMore= responseDoc.getNodeText(svcMapping.response_has_more_data);
		if(hasMore=="true")
			return true;
		}
		else if(responseType=="json"){
		hasMore = new sn_hr_integrations.HRIntegrationDataRetriever().getJsonParsedValue(responseDoc,svcMapping.response_has_more_data);
		if(hasMore == "true")
			return true;
		}
		return false;	
	},
	
	
	
	setWorkflowParametersForJsonPagination : function(outboundRequestType,messageFunctionId, input_values_json,schemaMap,jsonObj,svcMapping){
		var  service_endpoint =  new sn_hr_integrations.HRIntegrationDataRetriever().getJsonParsedValue(jsonObj,svcMapping.response_has_more_data);
	
		var externalSource = new GlideRecord(INT_SOURCE_TABLE);
		if(externalSource.get(input_values_json.external_source_id)){
			var workflowVars = {};
			workflowVars.service_endpoint = service_endpoint;
			input_values_json.querySessionId = "";
			input_values_json.change_in_functionid=false;
			input_values_json.changed_function_id=messageFunctionId;
			workflowVars.rest_message_function_id =  messageFunctionId;
			var restMsg = new GlideRecord("sys_rest_message_fn");
			restMsg.get(messageFunctionId);
			workflowVars.rest_message_id = restMsg.getValue("rest_message");
			workflowVars.session_token= hrIntegrationsHelper.getSessionToken(input_values_json.external_source_id);
			workflowVars.input_values = JSON.stringify(input_values_json);
			gs.info("Input values for Pagination " + workflowVars.input_values);
			return workflowVars;
		}
	},
	
	
	
	setWorkflowParametersForPagination : function(outboundRequestType,messageFunctionId, input_values_json,schemaMap,xmlDoc,svcMapping){
		var  queryMoreSessionId =  xmlDoc.getNodeText("//result/querySessionId");
		gs.info("queryMoreSessionId"+queryMoreSessionId);
		messageFunctionId = "d437eddec3100300a669d73bf3d3ae4a";
		
		var externalSource = new GlideRecord(INT_SOURCE_TABLE);
		if(externalSource.get(input_values_json.external_source_id)){
			var workflowVars = {};
			workflowVars.service_endpoint = externalSource.endpoint_url;
			input_values_json.querySessionId = queryMoreSessionId;
			input_values_json.change_in_functionid=true;
			input_values_json.changed_function_id=messageFunctionId;
			workflowVars.soap_message_function_id =  messageFunctionId;
			var soapMsg = new GlideRecord("sys_soap_message_function");
			soapMsg.get(messageFunctionId);
			workflowVars.soap_message_id = soapMsg.getValue("soap_message");
			workflowVars.session_token= hrIntegrationsHelper.getSessionToken(input_values_json.external_source_id);
			workflowVars.input_values = JSON.stringify(input_values_json);
			gs.info("Input values for Pagination " + workflowVars.input_values);
			return workflowVars;
		}
	},
	
	getServerTimeStamp: function(jobId ,externalSourceGr){
		
		var workflowVars = hrIntegrationsHelper.setWorkflowParameters(OUTBOUND_REQUEST_TYPE,WORKDAY_HR_WEB_SRVC_ID, GET_SERVER_TSTAMP_FUNC_ID, jobId, externalSourceGr, 1);
		gs.info(externalSourceGr.name + " Get Server Time Stamp parameters "+ workflowVars.input_values , hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name);
		hrIntegrationsHelper.startWorkflow(workflowVars, "Get Server Timestamp");
		return {process_type:"asynchronous"};
	},
	
	processResponseFromWorkflow : function(activityInput){
		var responseObject =  this.processResponseInternal(activityInput.response,activityInput.request_in_values,activityInput.status,
									 activityInput.error,activityInput.target_function_id);
		gs.info(hrIntegrations.SUCCESSFACTOR_SOURCE_NAME + " -  " + JSON.stringify(responseObject));
		return responseObject;
	},
	
	processResponseInternal: function(response, requestData, status, error, targetFunctionId){
		gs.info('In processResponseInternal');
		var request = JSON.parse(requestData);
		var LOG_PREFIX =  hrIntegrations.SUCCESSFACTOR_SOURCE_NAME + "-" +request.job_id ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ hrIntegrations.SUCCESSFACTOR_SOURCE_NAME;
		if(targetFunctionId == LOGIN_FUNCTION&&response){
			gs.info(LOG_PREFIX+ " Login Function Response Data " + response , logSource);
			gs.info(LOG_PREFIX + " Login Function Request Input " + requestData , logSource);
			gs.info(LOG_PREFIX + " Login Function Respons Status " + status , logSource);
			gs.info(LOG_PREFIX + " Login Function Response Error " + error , logSource);
			var returnResponse = {};
			var loginSessionToken = null;
			var loginSessionTokenExpireTime = null;
			
			var xmlDoc = new XMLDocument2();
				xmlDoc.parseXML(response); 
				var errorCode=xmlDoc.getNodeText(LOGIN_SESSION_FAILURE_ERRORCODE);
				var errorMessage = xmlDoc.getNodeText(LOGIN_SESSION_FAILURE_ERRORREASON);
			
			if (status == 200  && gs.nil(errorCode)) {
				var val = xmlDoc.getNodeText(LOGIN_SESSION_DATA);
				var tokenTime = xmlDoc.getNodeText(LOGIN_SESSION_EXPIRE_TIME);
				var jobId = request.job_id;
				var externalSourceId = request.external_source_id;
				if (val&&tokenTime){
					returnResponse.status = 1;
					returnResponse.triggerEvent = "sn_hr_integrations.retrieved_session_tok";
					loginSessionToken = String(val.trim());
					loginSessionTokenExpireTime = String(tokenTime.trim());
					gs.info(LOG_PREFIX + " Login Session Token " + loginSessionToken +" Token Expiration Time "+ loginSessionTokenExpireTime+" for the source "+logSource);
					hrIntegrationsHelper.setProperty(CURRENT_EXTERNAL_SESSION_TOKEN, loginSessionToken, jobId);
					hrIntegrationsHelper.setProperty(CURRENT_EXTERNAL_SESSION_TOKEN_TIME, loginSessionTokenExpireTime, jobId);
				}else{
					gs.error(hrIntegrations.SUCCESSFACTOR_SOURCE_NAME +" Failed to retrieve login session token from SuccessFactor server. Xml document from server: "+ xmlDoc, logSource);
					returnResponse.status = 0;
				}
			} else{
				returnResponse.errorReason =LOG_PREFIX +" Failed to retrieve login session token from SuccessFactor: " +errorCode + " Error: " + errorMessage;
				returnResponse.status = 0;
				gs.error(LOG_PREFIX +" Failed to retrieve login session token from SuccessFactor ", logSource);
				gs.error(LOG_PREFIX +" Status: "+ status + " Error:"+ error, logSource);
				gs.error(hrIntegrations.SUCCESSFACTOR_SOURCE_NAME +" Response: "+ response, logSource);
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
			gs.info('Parsing the Service');
			return HRIntegrationDataRetriever.prototype.processResponseInternal.call(this,response, requestData, status, error, targetFunctionId);
		}
	},
    type: 'HRIntegrationsSuccessFactorDataRetriever'
});