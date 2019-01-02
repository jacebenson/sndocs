var JOB_TRACKER_TABLE = "sn_hr_integrations_job_tracker";
var INT_SOURCE_TABLE = "sn_hr_integrations_source";
var HR_INT_SERVICE_MAPPING ='sn_hr_integrations_service_mapping';
var HR_INT_SCHEMA_MAPPING = 'sn_hr_integrations_schema_mapping';
var HR_INT_SERVICE = 'sn_hr_integrations_service';

var LAST_SYNC_DATE = "last_sync_date";
var CURRENT_SYNC_DATE = "current_sync_date";
var CURRENT_EXTERNAL_SERVER_TIME = "current_external_server_time";
var PREVIOUS_SYNC_DATE = "prev_sync_date";

var START_DATE = 'startDate';
var END_DATE = 'endDate';
var UPDATE_END_DATE = 'updateEndDate';
var ENTRY_DATE_TIME = 'entryDateTime';

var hrIntegrationUtils = new global.HRIntegrationsUtils();
var hrIntegrationsHelper = new HRIntegrationsHelper();

var HRIntegrationDataRetriever = Class.create();
HRIntegrationDataRetriever.prototype = {
	
	curr_import_set_id : null,
	last_sync_date : null,

	initialize: function() {
		//do nothing
	},

	processResponse:function(externalSourceId, stagingTableName){

	},
	
	
	preProcess : function(jobId, externalSourceGr){
		this.getServerTimeStamp(jobId, externalSourceGr);
	},
	
	getServerTimeStamp: function(jobId, externalSourceGr ){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		// Need to implement for each external source
		var currentSyncDate = new GlideDate().getDisplayValue();
		gs.info(LOG_PREFIX +' Setting current workday run date as: '+ currentSyncDate, logSource);
		hrIntegrationsHelper.setProperty(CURRENT_SYNC_DATE, currentDate, jobId);
		hrIntegrationsHelper.setProperty(CURRENT_EXTERNAL_SERVER_TIME, new GlideDateTime().getDisplayValue(), jobId);
		return {process_type:"synchronous"};
	},
	
	//Start the load of all the integration services for the external source sequentially
	startIntegrationServicesLoad : function(jobId, externalSourceGr){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		var localStartTime = new GlideDateTime();
		gs.info(LOG_PREFIX +" Sync Started at " + localStartTime , logSource);
		this.last_sync_date = hrIntegrationsHelper.getProperty(LAST_SYNC_DATE,externalSourceGr.sys_id);
		hrIntegrationsHelper.setProperty(PREVIOUS_SYNC_DATE,  this.last_sync_date, jobId);
		this.createIntegrationServiceTrackers(jobId, externalSourceGr);
		this.startPendingServices(jobId, externalSourceGr);
	},
	
	createIntegrationServiceTrackers : function(jobId,externalSourceGr){
		var intServices = new GlideRecord(HR_INT_SERVICE);
		intServices.addActiveQuery();
		intServices.orderBy("order");
		intServices.query();
		while(intServices.next()){
			if(this.checkIntegrationServiceMappingExists(intServices,externalSourceGr))
				hrIntegrationsHelper.createIntegrationServiceTrackerEntry(intServices.sys_id, jobId, externalSourceGr.sys_id );
			else{
			    var LOG_PREFIX = externalSourceGr.name + "-" +jobId ; 
				var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
				gs.error(LOG_PREFIX + " Service Mapping not found for Integration Service: " + intServices.name, logSource);
			}
		}
	},
	
	checkIntegrationServiceMappingExists: function(intServices,externalSourceGr){
		var serviceMapping = new GlideRecord(HR_INT_SERVICE_MAPPING);
		serviceMapping.addQuery("hr_integration_service", intServices.getValue("sys_id"));
		serviceMapping.addQuery("hr_external_source", externalSourceGr.getValue("sys_id"));
		serviceMapping.query();
		return serviceMapping.hasNext();
	},
	
	startPendingServices : function(jobId, externalSourceGr){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		var servicesPending = false;
		var serviceMapping;
		this.last_sync_date = hrIntegrationsHelper.getProperty(LAST_SYNC_DATE,externalSourceGr.sys_id);
		var intServices = new GlideRecord(HR_INT_SERVICE);
		intServices.addActiveQuery();
		intServices.orderBy("order");
		intServices.query();
		while(intServices.next()){
			var tracker = hrIntegrationsHelper.getIntegrationServiceTracker(intServices.sys_id,jobId,"pending");
			if(tracker){
				serviceMapping = new GlideRecord(HR_INT_SERVICE_MAPPING);
				serviceMapping.addQuery("hr_integration_service", intServices.getValue("sys_id"));
				serviceMapping.addQuery("hr_external_source", externalSourceGr.getValue("sys_id"));
				serviceMapping.query();
				if(serviceMapping.next()){
					gs.info(LOG_PREFIX +" Starting sync :" + intServices.name  , logSource);
					gs.info(LOG_PREFIX +" Set the status of tracker to loading :" + intServices.name  , logSource);
					tracker.setValue("state", "loading");
					tracker.setValue("load_started_at", new GlideDateTime().getDisplayValue());
					tracker.update();
					if(this.loadDataForIntegrationService(intServices.name ,externalSourceGr, jobId, serviceMapping, 1)){
						servicesPending = true;
						break;
					}else{
						tracker.setValue("state", "cancelled");
						tracker.setValue("error_message", "Sync cancelled as mandatory values are missing in schema mapping for Service mapping: " + serviceMapping.name);
						tracker.update();
					}
				}else{
					gs.error(LOG_PREFIX + " Service Mapping not found for Integration Service: " + intServices.name, logSource);
					tracker.setValue("state", "failed");
					tracker.setValue("error_message", "Service Mapping not found for Integration Service: " + intServices.name);
					tracker.update();
				}
			}else
				gs.info(LOG_PREFIX + " Tracker not in pending state for Integration Service: " + intServices.name, logSource);
			
		}
		if(!servicesPending){
			gs.info(LOG_PREFIX + "*******************ALL LOADING COMPLETE *********** START TRANSFORM " , logSource );
			//Start Transformation
			var transformer = new HRIntegrationsTransformer();
			transformer.startIntegrationServiceTransform(jobId, externalSourceGr.sys_id);
			gs.info(LOG_PREFIX + "*******************ALL TRANSFORMATION COMPLETE*********** " , logSource );
			//Check if all transformation Done
			// Now check Push Process 
			if(hrIntegrationsHelper.isPushEnabled(externalSourceGr.sys_id.toString()) == "true"){
				gs.info(LOG_PREFIX + "*******************STARTING PUSH PROCESS*********** " , logSource );
				var outBoundHelper = new HRIntegrationsOutboundHelper();
				outBoundHelper.startOutboundServices(jobId, externalSourceGr);
			}else
				gs.info(LOG_PREFIX + "*******************Enable Push Flag is False***********" , logSource);
			
			hrIntegrationsHelper.setProperty(LAST_SYNC_DATE, hrIntegrationsHelper.getProperty(CURRENT_EXTERNAL_SERVER_TIME,externalSourceGr.sys_id), jobId);
			//Set the Job Status to Complete
			hrIntegrationsHelper.jobCompleted(externalSourceGr.name, jobId);
			hrIntegrationsHelper.cleanupStagingTable(externalSourceGr.sys_id);
		}
	},
	
	integrationServicesLoadCompleted : function(tracker){
		
		// Update the tracker status to completed
		hrIntegrationsHelper.updateTracker(tracker, {state:"loaded",load_ended_at: new GlideDateTime().getDisplayValue()});
		var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE);
		externalSourceGr.get(tracker.hr_external_source);
		this.startPendingServices(tracker.hr_integrations_job_tracker, externalSourceGr);
	},
	
	integrationServicesLoadFailed : function(tracker, errorReason){
		hrIntegrationsHelper.updateTracker(tracker, {state:"failed",error_message: errorReason});
		var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE);
		externalSourceGr.get(tracker.hr_external_source);
		this.startPendingServices(tracker.hr_integrations_job_tracker, externalSourceGr);
	},
	
	
	
	loadDataForIntegrationService: function(intServiceName, externalSourceGr, jobId, serviceMappingGr, pageNumber){
		var LOG_PREFIX = externalSourceGr.name + "-" +jobId ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		
		var stagingTableSysId = jobId;
		var stagingTable =  hrIntegrations.JOB_TRACKER_TABLE;
		
		var outboundMessageId;
		var outboundMessageFunctionId;
		var outboundRequestType= serviceMappingGr.getValue('outbound_request_type');
		
		if(outboundRequestType=="soap"){
			outboundMessageId=serviceMappingGr.getValue("outbound_service");
			if(!this.last_sync_date && serviceMappingGr.getValue("outbound_service_function_all"))
			outboundMessageFunctionId = serviceMappingGr.getValue("outbound_service_function_all");
		    else
			outboundMessageFunctionId = serviceMappingGr.getValue("outbound_service_function");
		}
		else if(outboundRequestType=="rest"){
			outboundMessageId=serviceMappingGr.getValue("rest_outbound_service");
			if(!this.last_sync_date && serviceMappingGr.getValue("rest_outbound_service_function_all"))
			outboundMessageFunctionId = serviceMappingGr.getValue("rest_outbound_service_function_all");
		    else
			outboundMessageFunctionId = serviceMappingGr.getValue("rest_outbound_service_function");		
		}
		var workflowVars = hrIntegrationsHelper.setWorkflowParameters(outboundRequestType,outboundMessageId, outboundMessageFunctionId, jobId, externalSourceGr, pageNumber, serviceMappingGr,  stagingTable, stagingTableSysId);
		if(!workflowVars.abortAction){
			gs.info("Parameters for Workflow " + workflowVars.input_values + "  " + outboundMessageFunctionId);
			hrIntegrationsHelper.startWorkflow(workflowVars, intServiceName);
			return true;
		}else{
			gs.error(LOG_PREFIX+ "Sync will stop now as mandatory values are missing in schema mapping for Service mapping " + serviceMappingGr.name, logSource);
			return false;
		}
		
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

	processResponseFromWorkflow : function(activityInput){
		var responseObject =  this.processResponseInternal(activityInput.response,activityInput.request_in_values,activityInput.status,
									 activityInput.error,activityInput.target_function_id);
		return responseObject;
	},
	
	processResponseInternal:function(response, requestData, status, error, targetFunctionId){
		var request = JSON.parse(requestData);
		var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE);
		externalSourceGr.get(request.external_source_id);
		var LOG_PREFIX = externalSourceGr.name + "-" +request.job_id ;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		var integrationSource = externalSourceGr.name;
		var isDebug = hrIntegrationsHelper.getSourceProperty(request.external_source_id , hrIntegrations.HR_INT_DEBUG );
		
		
		gs.info(LOG_PREFIX + " Response from workflow", logSource);
		if(isDebug == "true")
			gs.debug(LOG_PREFIX + "Response Data  " + response);
		
		gs.info(LOG_PREFIX + " Request Input: " + requestData, logSource);
		gs.info(LOG_PREFIX + " Response Status:  " + status, logSource);
		gs.info(LOG_PREFIX + " Response Error:   " + error, logSource);
		gs.info(LOG_PREFIX + " Response Target Function: " +targetFunctionId, logSource); 
		
		if(error!=""){
			gs.error(LOG_PREFIX + " error "+ error, logSource);
				return {status:0, errorReason: LOG_PREFIX + " " + error};
		}
		
		
		var svcMapping = new GlideRecord(HR_INT_SERVICE_MAPPING);
		var qc =svcMapping.addQuery('outbound_service_function', targetFunctionId);
		qc.addOrCondition('outbound_service_function_all', targetFunctionId);
		qc.addOrCondition('rest_outbound_service_function', targetFunctionId);
		qc.addOrCondition('rest_outbound_service_function_all', targetFunctionId);
		svcMapping.addQuery('hr_external_source', request.external_source_id);
		svcMapping.query();
		
		
		if(request.service_type == hrIntegrations.EXT_INT_SERVICE_TYPE){
			//Process the response from Updates to Workday
			return this.processResponseForExternalInterface(response, request, status, error, targetFunctionId, svcMapping);
		}else{
			if(svcMapping.next()){
				var schemaMap = hrIntegrationsHelper.getSchemaMap(svcMapping);
				if(svcMapping.response_content_type.toString()=="xml")
				   return this.processXmlNodes(response,schemaMap, svcMapping, schemaMap.stagingTable, request, svcMapping.outbound_request_type.toString(), targetFunctionId, LOG_PREFIX, logSource,integrationSource, false);
     			else if(svcMapping.response_content_type.toString()=="json")
		    	   return this.processJsonNodes(response,schemaMap, svcMapping, schemaMap.stagingTable, request,svcMapping.outbound_request_type.toString(), targetFunctionId, LOG_PREFIX, logSource,integrationSource, false);	
			}else{
				gs.error(LOG_PREFIX + " Schema Mapping not found "+ targetFunctionId, logSource);
				return {status:0, errorReason: LOG_PREFIX + " Schema Mapping not found " + targetFunctionId};
			}
		}
		
		return {};
		
	},
	
	processResponseForExternalInterface : function(response, request, status, error, targetFunctionId, svcMapping){
		gs.info("Processing response from external Interface Push " + request.external_int_id + "  "  + status);
		gs.info("Response after processing external Interface "+response);
		var returnResponse = {};
		var externalSourceGr = new GlideRecord(hrIntegrations.HR_INT_SOURCE);
		externalSourceGr.get(request.external_source_id);
		var LOG_PREFIX = externalSourceGr.name;
		var logSource = hrIntegrations.HR_INT_LOADER_LOG +"_"+ externalSourceGr.name;
		var integrationSource = externalSourceGr.name;
		var extInterface = new GlideRecord("sn_hr_integrations_external_interface");
		if(!extInterface.get(request.external_int_id))
			return;
		if(status == "200"){
			gs.info(" Success Processing response from external Interface Push " + request.external_int_id + "  "  + status +"  "+ extInterface.getValue("status"));
			extInterface.setValue("status", "completed");
			extInterface.update();
			returnResponse.status =1;
			returnResponse.hasMoreData = false;
			
			if(svcMapping.next()){
				var schemaMap = hrIntegrationsHelper.getSchemaMap(svcMapping);
				//Set External ID as a constant
				schemaMap["external_int_id"]= {type:'constant' ,value:request.external_int_id, mandatory:'false'};
				if(svcMapping.response_content_type.toString()=="xml")
					this.processXmlNodes(response,schemaMap, svcMapping, schemaMap.stagingTable, request,svcMapping.outbound_request_type.toString(), targetFunctionId, LOG_PREFIX, logSource,integrationSource, true);
				else if(svcMapping.response_content_type.toString()=="json")
					this.processJsonNodes(response,schemaMap, svcMapping, schemaMap.stagingTable, request,svcMapping.outbound_request_type.toString(), targetFunctionId, LOG_PREFIX, logSource,integrationSource, true);
			}else{
				gs.error( " No Schema Mapping Found "+ targetFunctionId, logSource);
				return {status:0, errorReason: LOG_PREFIX + " No Schema Mapping found, ignoring the response " + targetFunctionId};
			}
			
		}else{
			gs.info(" Failure Processing response from external Interface Push " + request.external_int_id + "  "  + status +"  "+ extInterface.getValue("status"));			
			extInterface.setValue("status", "error");
			extInterface.setValue("error_message", "Status:" + status + " Response:"+ response + " Error:" + error );
			extInterface.update();
			returnResponse.status =0;
			returnResponse.hasMoreData = false;
		}
		return returnResponse;
	},
		
	processDataFromRestAPI : function(requestData, requestType, serviceMappingId, apiName, rootNodeXpath){
		var logSource = hrIntegrations.HR_INT_INBOUND_API_LOG +"_"+ apiName;
		var svcMapping = new GlideRecord(HR_INT_SERVICE_MAPPING);
		if(svcMapping.get(serviceMappingId)){
			var schemaMap = hrIntegrationsHelper.getSchemaMap(svcMapping);
			if(requestType == "XML")
				return this.processRequestXml(requestData,schemaMap, svcMapping, schemaMap.stagingTable, apiName, logSource, rootNodeXpath);
		}
		
	},
	
	processRequestXml: function(requestData,schemaMap, svcMapping, stagingTable, apiName, logSource, rootNodeXpath){
		var logPrefix = apiName;
		gs.info(apiName + "- Start of the Processing of the Post Request using mapping "+ svcMapping.name, logSource);
		var returnResponse = {};
		var xmlDoc = new XMLDocument2();
		xmlDoc.parseXML(requestData);
		if(!rootNodeXpath)
			rootNodeXpath = svcMapping.response_root;
		
		if (gs.nil(xmlDoc)){
			//returnResponse.status =0;
			//returnResponse.errorReason ="Node is empty for service " + svcMapping.name +" XPATH: "+ svcMapping.response_root;
			gs.error("Node is empty for service " + svcMapping.name , logSource);
			gs.error("Response :"+ requestData, logSource);
			return hrIntegrations.FAIL;
		}
		var colToXPathMap = schemaMap;
		var inserted = 0;
		var resultsFound = 0;
		var node = xmlDoc.getNode(rootNodeXpath);
		if(node.toString()){
			var iter= node.getChildNodeIterator();
			while(iter.hasNext()) {
				resultsFound++;
				var dataNode = iter.next();
				if (dataNode == null || dataNode.toString().trim() == "")
					continue;
				else{
					if(this.parseDatafromResponse(dataNode, schemaMap, stagingTable, requestData, logPrefix, logSource))
						inserted ++;
				}
			}
		}
		gs.info(logPrefix + " INSERTED RECORDS  " + inserted, logSource);
		return hrIntegrations.SUCCESS;
	},
	
	getJsonParsedValue: function(jsonObject,parsingKey){
		var resultValue=[];
		if(!gs.nil(parsingKey)){
			try{
			var parsingKeys = parsingKey.toString().split(".");	
			resultValue=jsonObject[parsingKeys[0]];
			if(parsingKeys.length>0){
				for(var i=1;i<parsingKeys.length;i++){
				   var temp = resultValue[parsingKeys[i]];
					resultValue = temp;
				 }
			}
			}
			catch(error){
				gs.error("Unable to parse the JSON property "+parsingKey+ " in "+JSON.stringify(jsonObject));	
			}
		}	
	 return resultValue;	
	},
	
	processJsonNodes: function(response, schemaMap, svcMapping, stagingTable, request, outboundRequestType, targetFunctionId, logPrefix, logSource,integrationSource, externalInterfaceResponse){
		gs.info(logPrefix + " Start of the Processing Json Nodes "+ svcMapping.name, logSource);
		var returnResponse = {};
		var jsonObj = JSON.parse(response);
		
		var totalPages = 0;
		var curPage =0;
		var totalResults =0;
		var pageResults=0;
		//var node = jsonObj[svcMapping.response_root];
		if (gs.nil(jsonObj)){
			returnResponse.status =0;
			returnResponse.errorReason ="Node is empty for service " + svcMapping.hr_integration_service.name +" JSON: "+ svcMapping.response_root;
			gs.error(logPrefix +" Node is empty for service " + svcMapping.hr_integration_service.name +" JSON: "+ svcMapping.response_root, logSource);
			gs.error("Response :"+ response, logSource);
			return returnResponse;
		}
		var node = this.getJsonParsedValue(jsonObj,svcMapping.response_root);
		var colToJsonMap = schemaMap;
		var iter= 0;
		var inserted = 0;
		var resultsFound = 0;
		if(node){
			for(iter=0;iter<node.length;iter++) {
				resultsFound++;
				var dataNode = node[iter];
				if(this.parseJsonDatafromResponse(dataNode, schemaMap, stagingTable, request, logPrefix, logSource))
				  inserted ++;

			}
		}
		gs.info(logPrefix + " INSERTED RECORDS  " + inserted, logSource);
		
		if(externalInterfaceResponse)
			return;
		
		pageResults = resultsFound;
		  
		totalResults= hrIntegrationsHelper.getTotalNumberOfRecords(request.hr_integration_service_id,request.job_id, request.external_source_id);
		
		totalResults = totalResults == 0 ? pageResults : (totalResults+pageResults);
		
		var dataToUpdate;
		
		if(totalResults == 0){
			gs.info(logPrefix +" Response returned no results for Integration Service " + svcMapping.hr_integration_service.name, logSource);
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = 0;
			dataToUpdate.inserts = 0;
			dataToUpdate.skipped = 0;
			dataToUpdate.load_ended_at =  new GlideDateTime().getDisplayValue();
			dataToUpdate.state ='complete';
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			gs.info(logPrefix +" Updated the tracker status to complete for Integration Service " + svcMapping.hr_integration_service.name, logSource);
			returnResponse.status =1;
			returnResponse.hasMoreData = false;
			return returnResponse;
		}

		var retriever = hrIntegrationsHelper.getRetriever(integrationSource);
		var hasMoreData=retriever.checkHasMoreData(jsonObj,svcMapping,svcMapping.response_content_type);
		gs.info("Response has more data "+hasMoreData );
		
		if(hasMoreData){
			var workflowVars = retriever.setWorkflowParametersForJsonPagination(outboundRequestType,targetFunctionId, request,schemaMap,jsonObj,svcMapping);
			returnResponse.hasMoreData = true;
			returnResponse.inputVars = workflowVars.input_values;
			gs.info(logPrefix + " Returning Response >>>>>>>>>>>>>> " + returnResponse.inputVars + "   " + returnResponse.hasMoreData, logSource);
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = totalResults;
			dataToUpdate.inserts = inserted;
			dataToUpdate.skipped = pageResults - inserted;
			
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			returnResponse.status =1;
			return returnResponse;
		}else{
			//Close the Current Import Set after all the pages are processed
			if(this.curr_import_set_id)
				this.closeCurrentImportSet();
			else{
				//Check if any Import set is created
				this.curr_import_set_id = this.checkIfImportSetExists(stagingTable);
				this.closeCurrentImportSet();
			}
			
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = totalResults;
			dataToUpdate.inserts = inserted;
			dataToUpdate.skipped = pageResults - inserted;
			dataToUpdate.load_ended_at =  new GlideDateTime().getDisplayValue();
			dataToUpdate.state ='loaded';
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			returnResponse.status =1;
		}
		returnResponse.hasMoreData = false;
		return returnResponse;
	},
	

	processXmlNodes: function(response, schemaMap, svcMapping, stagingTable, request, outboundRequestType, targetFunctionId, logPrefix, logSource,integrationSource, externalInterfaceResponse){
		gs.info(logPrefix + " Start of the Processing Xml Nodes "+ svcMapping.name, logSource);
		var returnResponse = {};
		var xmlDoc = new XMLDocument2();
		xmlDoc.parseXML(response);
		var totalPages = 0;
		var curPage =0;
		var totalResults =0;
		var pageResults=0;
		
		
		if (gs.nil(xmlDoc)){
			returnResponse.status =0;
			returnResponse.errorReason ="Node is empty for service " + svcMapping.name +" XPATH: "+ svcMapping.response_root;
			gs.error(logPrefix +" Node is empty for service " + svcMapping.name +" XPATH: "+ svcMapping.response_root, logSource);
			gs.error("Response :"+ response, logSource);
			return returnResponse;
		}
		var colToXPathMap = schemaMap;
		var inserted = 0;
		var resultsFound = 0;
		var node = xmlDoc.getNode(svcMapping.response_root);
		if(node.toString()){
			var iter= node.getChildNodeIterator();
			while(iter.hasNext()) {
				resultsFound++;
				var dataNode = iter.next();
				if (dataNode == null || dataNode.toString().trim() == "")
					continue;
				else{
					if(this.parseDatafromResponse(dataNode, schemaMap, stagingTable, request, logPrefix, logSource))
						inserted ++;
				}
			}
		}
		gs.info(logPrefix + " INSERTED RECORDS  " + inserted, logSource);
		
		if(externalInterfaceResponse)
			return;
		
		pageResults = resultsFound;
		totalResults= hrIntegrationsHelper.getTotalNumberOfRecords(request.hr_integration_service_id,request.job_id, request.external_source_id);
		totalResults = totalResults == 0 ? pageResults : (totalResults+pageResults);
		
		var dataToUpdate;
		if(totalResults == 0){
			gs.info(logPrefix +" Response returned no results for Integration Service " + svcMapping.hr_integration_service.name, logSource);
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = 0;
			dataToUpdate.inserts = 0;
			dataToUpdate.skipped = 0;
			dataToUpdate.load_ended_at =  new GlideDateTime().getDisplayValue();
			dataToUpdate.state ='complete';
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			gs.info(logPrefix +" Updated the tracker status to complete for Integration Service " + svcMapping.hr_integration_service.name, logSource);
			returnResponse.status =1;
			returnResponse.hasMoreData = false;
			return returnResponse;
		}

		var retriever = hrIntegrationsHelper.getRetriever(integrationSource);
		var hasMoreData=retriever.checkHasMoreData(xmlDoc,svcMapping,svcMapping.response_content_type);
		gs.info("Response has more data "+hasMoreData );
		
		if(hasMoreData){
			var workflowVars = retriever.setWorkflowParametersForPagination(outboundRequestType,targetFunctionId, request,schemaMap,xmlDoc,svcMapping);
			returnResponse.hasMoreData = true;
			returnResponse.inputVars = workflowVars.input_values;
			gs.info(logPrefix + " Returning Response >>>>>>>>>>>>>> " + returnResponse.inputVars + "   " + returnResponse.hasMoreData, logSource);
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = totalResults;
			dataToUpdate.inserts = inserted;
			dataToUpdate.skipped = pageResults - inserted;
			
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			returnResponse.status =1;
			return returnResponse;
		}else{
			//Close the Current Import Set after all the pages are processed
			if(this.curr_import_set_id)
				this.closeCurrentImportSet();
			else{
				//Check if any Import set is created
				this.curr_import_set_id = this.checkIfImportSetExists(stagingTable);
				this.closeCurrentImportSet();
			}
			
			dataToUpdate = {};
			dataToUpdate.set = this.curr_import_set_id;
			dataToUpdate.total = totalResults;
			dataToUpdate.inserts = inserted;
			dataToUpdate.skipped = pageResults - inserted;
			dataToUpdate.load_ended_at =  new GlideDateTime().getDisplayValue();
			dataToUpdate.state ='loaded';
			hrIntegrationsHelper.updateIntegrationServiceTrackerEntry(request.hr_integration_service_id,request.job_id, request.external_source_id, dataToUpdate);
			returnResponse.status =1;
		}
		returnResponse.hasMoreData = false;
		return returnResponse;
	},
	
	parseDatafromResponse: function(dataNode, map,stagingTable, request, logPrefix, logSource) {
		
		var gr = new GlideRecord(stagingTable);
		var insertRecord = false;
		var newSysId;
		gr.initialize();
		var glideXmlDoc = new XMLDocument2();
		glideXmlDoc.parseXML(dataNode.toString());
		// Read the entire xpath array and query the worker node for each element
		for(var colName in map) {
			var colValueObj = map[colName];
			var targetValue;
			var valFound = false;
			if(colValueObj.type == 'xpath'){
				var node;
				for(var i = 0; i < colValueObj.value.length; i++){
					node = glideXmlDoc.getNode(colValueObj.value[i]);
					if(node.toString() != null)
						break;
				}
				
				if(node.toString() != null){
					insertRecord = true;
					var val = node.getTextContent();
					if (colName === "name") {
						gs.info(logPrefix + 'FOUND::::: col = '+colName+' value = ['+val+']', logSource);
					}
					var nodeVal = String(val.trim());
					//nodeVal = nodeVal.replace(/&#xa;/g,"\n");
					/*if(colName == 'wd_primary_addr_state') {
						nodeVal = this.getState(nodeVal);
					}*/
					valFound = true;
					targetValue = nodeVal;
				}
			}
			if(colValueObj.type == 'constant'){
				valFound =true;
				insertRecord = true;
				targetValue = colValueObj.value;
			}
			
			if(colValueObj.mandatory == true && gs.nil(targetValue)){
			   insertRecord = false;
				gs.error(logPrefix + " Mandatory field value empty for "+ stagingTable + " FieldName : " + colName, logSource);
				gs.error(logPrefix + " DataNode : " + dataNode);
				break;
			}
			if(valFound)
				gr[colName] = targetValue;
		}
		
		if (insertRecord) {
			//this.preProcessRecord(gr);
			if(request.job_id)
				gr.setValue("job_run_id", request.job_id);
			if(request.external_source_id)
				gr.setValue("source", request.external_source_id);
			if(this.curr_import_set_id)
				gr.setValue("sys_import_set", this.curr_import_set_id);
			else{
				this.curr_import_set_id = this.checkIfImportSetExists(gr.getTableName());
				if(this.curr_import_set_id)
					gr.setValue("sys_import_set", this.curr_import_set_id);
			}
			newSysId = gr.insert();
			gr.get(newSysId);
			gs.info("Record Inserted " + newSysId + "   Import Set"  + gr.getValue("sys_import_set")  + " Mode:" +gr.sys_import_set.mode );
			// If we don't have the import set record id, get it.
			// This is needed when we close the import set.
			if (!this.curr_import_set_id) {
				this.curr_import_set_id =  gr.getValue("sys_import_set");
			}
			return true;
		}
		return false;
	},
	
	
	parseJsonDatafromResponse: function(dataNode,map, stagingTable, request, logPrefix, logSource) {
		var gr = new GlideRecord(stagingTable);
		var insertRecord = false;
		var newSysId;
		gr.initialize();
		var glideDoc = dataNode;
		// Read the entire xpath array and query the worker node for each element
		for(var colName in map) {
			var colValueObj = map[colName];
			var targetValue;
			var valFound = false;
			if(colValueObj.type == 'json'){
				var node =  this.getJsonParsedValue(glideDoc,colValueObj.value);
				if(node != null){
					insertRecord = true;
					var val = node;
					if (colName === "name") {
						gs.info(logPrefix + 'FOUND::::: col = '+colName+' value = ['+val+']', logSource);
					}
					var nodeVal = String(val.trim());
					//nodeVal = nodeVal.replace(/&#xa;/g,"\n");
					/*if(colName == 'wd_primary_addr_state') {
						nodeVal = this.getState(nodeVal);
					}*/
					valFound = true;
					targetValue = nodeVal;
				}
			}
			if(colValueObj.type == 'constant'){
				valFound =true;
				insertRecord = true;
				targetValue = colValueObj.value;
			}
			
			if(colValueObj.mandatory == true && gs.nil(targetValue)){
			   insertRecord = false;
				gs.error(logPrefix + " Mandatory field value empty for "+ stagingTable + " FieldName : " + colName, logSource);
				gs.error(logPrefix + " DataNode : " + dataNode);
				break;
			}
			if(valFound)
				gr[colName] = targetValue;
		}
		
		if (insertRecord) {
			//this.preProcessRecord(gr);
			if(request.job_id)
				gr.setValue("job_run_id", request.job_id);
			gr.setValue("source", request.external_source_id);
			if(this.curr_import_set_id)
				gr.setValue("sys_import_set", this.curr_import_set_id);
			else{
				this.curr_import_set_id = this.checkIfImportSetExists(gr.getTableName());
				if(this.curr_import_set_id)
					gr.setValue("sys_import_set", this.curr_import_set_id);
			}
			gs.info("Current IMport Set " + this.curr_import_set_id);
			newSysId = gr.insert();
			gr.get(newSysId);
			gs.info("Record Inserted " + newSysId + "   Import Set"  + gr.getValue("sys_import_set")  + " Mode:" +gr.sys_import_set.mode );
			// If we don't have the import set record id, get it.
			// This is needed when we close the import set.
			if (!this.curr_import_set_id) {
				this.curr_import_set_id =  gr.getValue("sys_import_set");
			}
			return true;
		}
		return false;
	},
	
	checkIfImportSetExists :  function(tableName){
		var importSetGR = new GlideRecord("sys_import_set");
		importSetGR.addQuery("state", "loading");
		importSetGR.addQuery("table_name", tableName);
		importSetGR.query();
		if(importSetGR.next())
			return importSetGR.getValue("sys_id");
		return null;
	},
	
	closeCurrentImportSet :  function(){
		gs.info("Closing the Import Set " + this.curr_import_set_id );
		hrIntegrationUtils.setImportSetState(this.curr_import_set_id, "loaded");
	},
	
	setWorkflowParametersForPagination : function(outboundRequestType,messageFunctionId, input_values_json,schemaMap,xmlDoc,svcMapping){
		var externalSource = new GlideRecord(INT_SOURCE_TABLE);
		if(externalSource.get(input_values_json.external_source_id)){
			var workflowVars = {};
			workflowVars.service_endpoint = externalSource.endpoint_url;
			if(outboundRequestType=="soap"){
				workflowVars.soap_message_function_id =  messageFunctionId;
				var soapMsg = new GlideRecord("sys_soap_message_function");
			    soapMsg.get(messageFunctionId);
			    workflowVars.soap_message_id = soapMsg.getValue("soap_message");
			}	
			else if(outboundRequestType=="rest"){
				workflowVars.rest_message_function_id =  messageFunctionId;
				var restMsg = new GlideRecord("sys_rest_message_fn");
			    restMsg.get(messageFunctionId);
			    workflowVars.rest_message_id = restMsg.getValue("rest_message");
			}
			
			workflowVars.input_values = JSON.stringify(input_values_json);
			gs.info("Input values for Pagination " + workflowVars.input_values);
			return workflowVars;
		}
	},
	
	type: 'HRIntegrationDataRetriever'
};