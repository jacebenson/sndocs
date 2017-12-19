var TourBuilderRecorder = Class.create();
TourBuilderRecorder.prototype = {
	
	_tbutil : new TourBuilderUtility(),
	_df : new TourBuilderGenericDataFactory(),
	_tbi: new TourBuilderIntegration(),
	
	_STEP_OBJECT_TO_TABLE_MAPPING : {
		//Mapping for fields in step object that have different names than in table
		'next_button':'show_next_button',
		'pageLoaded_in_between_steps':'wait_for_page_load'
	},
	
	_ELEMENT_OBJECT_TO_TABLE_MAPPING : {
		//Mapping for fields in element object that have different names than in table
	},
	
	initialize: function() {
	},
	
	/* create a tour with given parameters **
	** input: tourName - name of the tour
	** input: tourURL - url of the tour 
	** returns: sys_id's of objects in comma separated string
	*/
	createTour : function(tourName,tourURL,tourRoles){
		var status = "";
		var message = "";
		var tourSysId = "";
		var result = {};
			
		tourName = tourName.trim();
		tourURL = tourURL.trim();
			
		if(tourName == ''){
			message += "tour_error:";
			message += gs.getMessage("Tour name cannot be empty.");
		}else if(this._tbutil.tourNameExists(tourName)){
			message += "tour_error:";
			message += gs.getMessage("Another tour with the name {0} already exists. Choose a different name.",tourName);
		}
			
		if(tourURL == ''){
			message += "page_error:";
			message += gs.getMessage("Application Page name cannot be empty.");
		}else if(tourURL.match(/(nav_to|navpage)/i)){
			message += "page_error:";
			message += gs.getMessage("Application Page name should not contain nav_to or navpage.");
		}else if(!this._tbutil.isValidTourUrl(tourURL)){
			message += "page_error:";
			message += gs.getMessage("The Application page name you entered is not valid. Enter a valid page name.");
		}
			
		if(message !== ""){
			result.status = "error";
			result.message = message;
			result.tourID = null;
				
			return result;
		}
			
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var embededTourSysId ='';
			
		if(guidedToursIntegrationEnabled == "true"){
			
			if(tourURL.indexOf("?") < 0 && tourURL.indexOf(".do") >= 0)
				tourURL = tourURL.split('.do')[0];
			
			embededTourSysId = this._tbi.createGuidedTourObj(this._tbi.GUIDE_TABLE,{name : tourName, context: tourURL, roles: tourRoles});
			tourSysId = embededTourSysId;
		}
			
		if(gtbRecordingDisabled != "true"){
			var tourParams = [];
			tourParams.push({"column" : "name", "value" : tourName });
			tourParams.push({"column" : "start_url", "value" : tourURL });
			tourParams.push({"column" : "roles", "value" : tourRoles });
			tourParams.push({"column" : "embedded_help_reference", "value" : embededTourSysId });
			
			tourSysId = this._df.createObject({'table':'tour_builder_guide', 'object_params':tourParams});
		}
		
		if(tourSysId !== ""){
			result.status = "success";
			result.message = "success";
			result.tourID = tourSysId;
		} else{
			result.status = "error";
			result.message = message;
			result.tourID = null;
		}
			
		return result;
	},
		
	/* saves step object **
	** input: stepObj - object with step properties 
	** returns: sys_id of created step
	*/
	saveStep: function(stepObj){
		var stepSysId = "";
		var tourSysId = "";
		var guidedTourSysId = "";
		var stepMap = this._STEP_OBJECT_TO_TABLE_MAPPING;
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
			
		if(gtbRecordingDisabled == "false"){
			tourSysId = stepObj.tourId;
			var tourRecord = this._df.getObjectData({'sys_id':stepObj.tourId, 'table':'tour_builder_guide'});
			stepObj.guidedTourStep.guide = guidedTourSysId = tourRecord.embeddedHelpReference;
		} else{
			stepObj.guidedTourStep.guide = guidedTourSysId = stepObj.tourId;
		}
				
		var embededTourStepId = "";
				
		if(guidedToursIntegrationEnabled == "true")
			embededTourStepId = this._tbi.createGuidedTourObj(this._tbi.STEP_TABLE,stepObj.guidedTourStep);
				
		if(gtbRecordingDisabled == "false"){
			var stepParams = [];
			var columnName; 
			
			try{
				stepParams.push({"column" : "embedded_help_reference", "value" : embededTourStepId });
				
				for(var field in stepObj){
					if(stepMap.hasOwnProperty(field))
						columnName = stepMap[field];
					else
						columnName = field;
					
					if(field === 'title'){
						stepParams.push({"column" : "name", "value" : stepObj[field] });
						stepParams.push({"column" : columnName, "value" : stepObj[field] });
					} else if(field === 'pageLoaded_in_between_steps'){
						stepParams.push({"column" : columnName, "value" : (stepObj.pageLoaded_in_between_steps == true) });
					} else{
						stepParams.push({"column" : columnName, "value" : stepObj[field]});
					}
				}
						
				stepParams.push({"column" : "tour_id", "value" : tourSysId });
				
				stepSysId = this._df.createObject({'table':'tour_builder_step', 'object_params':stepParams});
						
				return stepSysId;
			}
			catch (e){
				gs.error('Error : Exception occured inside saveStep method. ' + e);
			}
		}
	},
		
	/* saves element object **
	** input: elementObj - object with element properties 
	** returns: resultObj - object with sysId and embededTourElementId 
	**                      of the created element
	*/
	saveElement : function(elementObj) {
		var resultObj = {};
		var elementSysid = "";
		var embededTourElementId = "";
		var elementMap = this._ELEMENT_OBJECT_TO_TABLE_MAPPING;
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
		
		var elementParams = [];
		var columnName;
		
		if(guidedToursIntegrationEnabled == "true")
			embededTourElementId = this._tbi.createGuidedTourObj(this._tbi.ELEMENT_TABLE,elementObj.guidedToursElement);
					
		if(gtbRecordingDisabled == "false"){
			if(embededTourElementId !== "")
				elementParams.push({"column" : "embedded_help_reference", "value" : embededTourElementId });
			
			for(var field in elementObj){
				if(elementMap.hasOwnProperty(field))
					columnName = elementMap[field];
				else
					columnName = field;
					
				elementParams.push({"column" : columnName, "value" : elementObj[field]});
			}
			
			elementSysid = this._df.createObject({'table':'tour_builder_element', 'object_params':elementParams});
		}
					
		resultObj.gtbSysId = elementSysid;
		resultObj.guidedTourSysId = embededTourElementId;
					
		return resultObj;
	},
	
	/* update a tour step **
	** input: stepObj - object with step properties 
	** returns: sys_id of the updated step
	*/
	updateStep: function(stepObj){
		var stepMap = this._STEP_OBJECT_TO_TABLE_MAPPING;
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
		var tourSysId = "";
		var embededTourStepId = "";
		var stepSysId = "";
		var query_params;
		
		if(gtbRecordingDisabled == "true"){
			query_params = [];
			query_params.push({"column":"guide","value":stepObj.tourId});
			query_params.push({"column":"order","value":stepObj.step_num});
			stepSysId = this._df.getObjects({"table": this._tbi.STEP_TABLE, "query_params" : query_params});
			embededTourStepId = this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, stepObj.guidedTourStep, {'sys_id': stepSysId,'stepSysId':stepSysId});
			
			return embededTourStepId;
		}
		
		query_params = [];
		query_params.push({"column":"tour_id","value":stepObj.tourId});
		query_params.push({"column":"step_no","value":stepObj.step_num});
		stepSysId = this._df.getObjects({"table": "tour_builder_step", "query_params" : query_params});
			
		if(guidedToursIntegrationEnabled == "true"){
			var stepObject = this._df.getObjectData({'sys_id':stepSysId,'table': "tour_builder_step",
													 'override_columns':{'embedded_help_reference':'embeddedHelpReference'}});
			
			embededTourStepId = this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, stepObj.guidedTourStep, 
															  {'sys_id': stepObject.embeddedHelpReference || stepSysId});
		}
		
		var update_params = [];
		var columnName;
		
		for(var field in stepObj){
			if(stepMap.hasOwnProperty(field))
				columnName = stepMap[field];
			else
				columnName = field;
			
			if(field === 'next_button')
				update_params.push({"column" : "action", "value" : stepObj[field]});
			else
				update_params.push({"column" : columnName, "value" : stepObj[field]});
		}
		
		var stepUpdated = this._df.updateObject({"table" : "tour_builder_step", 'sys_id' : stepSysId, 'update_params' : update_params});
		
		return stepSysId;	
	},
	
	/* swap two tour steps **
	** input: tourSysId - sys_id of the tour associated to the step 
	** input: sourceStepNo - step number of source step
	** input: destStepNo - step number of destination step 
	*/
	swapSteps: function(tourSysId,sourceStepNo,destStepNo){
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
		var stepSysId = "";
		var stepIds = "";
		var stepsList = [];
		var stepObject = {};
		var tableName = "";
		var stepNumField = "";
		var tourIdField = "";
		
		if(gtbRecordingDisabled == "true"){
			tableName = this._tbi.STEP_TABLE;
			stepNumField = "order";
			tourIdField = "guide";
		} else{
			tableName = "tour_builder_step";
			stepNumField = "step_no";
			tourIdField = "tour_id";
		}
		
		stepIds = this._df.getObjects({'table': tableName, 'query_params' : [{'column' : tourIdField, 'value' : tourSysId}], 'order_by' : stepNumField});
		stepsList = stepIds.split(',');
		
		if(sourceStepNo > destStepNo){
			for(var i=0;i<stepsList.length;i++){
				stepObject = this._df.getObjectData({'sys_id':stepsList[i],'table':tableName});
				
				var stepNumber;
				if(tableName === "tour_builder_step")
					stepNumber = stepObject.stepNo;
				else
					stepNumber = stepObject.order;
				
				if(stepNumber == sourceStepNo){
					if(guidedToursIntegrationEnabled == "true" && stepObject.embeddedHelpReference)
						this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, {'order' : stepNumber}, {'sys_id' : stepObject.embeddedHelpReference || tourSysId});
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 
										   'update_params' : [{'column' : stepNumField,'value' : destStepNo}]});
				} else if(stepNumber >= destStepNo && stepNumber < sourceStepNo){
					if(guidedToursIntegrationEnabled == "true" && stepObject.embeddedHelpReference)
						this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, {'order' : stepNumber}, {'sys_id' : stepObject.embeddedHelpReference});
					
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 
										   'update_params' : [{'column' : stepNumField,'value' : (parseInt(stepNumber)+1)}]});
				}
			}
		} else{
			for(var i=0;i<stepsList.length;i++){
				stepObject = this._df.getObjectData({'sys_id':stepsList[i],'table':tableName});
				
				var stepNumber;
				if(tableName === "tour_builder_step")
					stepNumber = stepObject.stepNo;
				else
					stepNumber = stepObject.order;
				
				if(stepNumber == sourceStepNo){
					if(guidedToursIntegrationEnabled == "true" && stepObject.embeddedHelpReference)
						this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, {'order' : stepNumber}, {'sys_id' : stepObject.embeddedHelpReference});
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 
										   'update_params' : [{'column' : stepNumField,'value' : destStepNo}]});
				} else if(stepNumber > sourceStepNo && stepNumber  <= destStepNo){
					if(guidedToursIntegrationEnabled == "true" && stepObject.embeddedHelpReference)
						this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, {'order' : stepNumber}, {'sys_id' : stepObject.embeddedHelpReference});
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 
										   'update_params' : [{'column' : stepNumField,'value' : (parseInt(stepNumber)-1)}]});
				}
			}
		}
	},
	
	/* delete a tour step **
	** input: tourSysId - sys_id of the tour associated to the step 
	** returns: stepNo - number of the step to be deleted
	*/
	deleteStep: function(tourSysId,stepNo){
		var gtbRecordingDisabled = gs.getProperty('sn_tourbuilder.gtb.disable.gtb.recording','true');
		var guidedToursIntegrationEnabled = gs.getProperty('sn_tourbuilder.gtb.enable.guidedTours.recording','true');
		var stepSysId = "";
		var stepObject = {};
		var targetSysId = "";
		var steps;
		var stepsList;

		if(gtbRecordingDisabled == "true"){
			/** Delete step and corresponding elements **/
			stepSysId = this._df.getObjects({'table':this._tbi.STEP_TABLE, 'query_params' : [{'column':'guide','value':tourSysId},{'column':'order','value':stepNo}]});
			stepObject = this._df.getObjectData({'sys_id':stepSysId,'table':this._tbi.STEP_TABLE,'override_columns':{'target_ref':'targetRef'}});
			targetSysId = stepObject.targetRef;
			
			this._tbi.deleteGuidedTourObj(this._tbi.STEP_TABLE,  {'guide' : tourSysId, 'order':stepNo});
			this._tbi.deleteGuidedTourObj(this._tbi.ELEMENT_TABLE,  {'sys_id' : targetSysId});
			
			/** Updating order for remaining steps **/
			steps = this._df.getObjects({'table':this._tbi.STEP_TABLE, 'query_params' : [{'column':'guide','value':tourSysId}], 'order_by' : 'order'});
			
			stepsList = steps.split(',');
			for(var i=0;i<stepsList.length;i++){
				this._df.updateObject({'table' : this._tbi.STEP_TABLE, 'sys_id' : stepsList[i], 'update_params' : [{'column':'order','value':i}]});
			}
			
			return;
		} else{
			/** Delete step and corresponding elements **/
			var query_params = [];
				query_params.push({'column':'tour_id','value':tourSysId});
				query_params.push({'column':'step_no','value':stepNo});
			stepSysId = this._df.getObjects({'table':'tour_builder_step', 'query_params' : query_params});
			stepObject = this._df.getObjectData({'sys_id':stepSysId,'table':'tour_builder_step',
												 'override_columns':{'embedded_help_reference':'embeddedHelpReference','target_ref':'targetRef'}});
			
			if(guidedToursIntegrationEnabled == "true" && stepObject.embeddedHelpReference){
				var embeddedStepObject = this._df.getObjectData({'sys_id':stepSysId, 'table':this._tbi.STEP_TABLE, 'override_columns':{'target_ref':'targetRef'}});
				targetSysId = embeddedStepObject.targetRef;
				
				this._tbi.deleteGuidedTourObj(this._tbi.STEP_TABLE,  {'sys_id' : stepObject.embeddedHelpReference});
				this._tbi.deleteGuidedTourObj(this._tbi.ELEMENT_TABLE,  {'sys_id' : targetSysId});
			}
			
			if(stepObject.targetRef)
				this._df.deleteObjects({'table' :'tour_builder_element', 'query_params' : [{'column':'sys_id','value':stepObject.targetRef}]});
			
			this._df.deleteObjects({'table' :'tour_builder_step', 'query_params' : [{'column':'sys_id','value': stepSysId}]});
			
			/** Updating order for remaining steps **/
			steps = this._df.getObjects({'table':'tour_builder_step', 'query_params' : [{'column':'tour_id','value':tourSysId}], 'order_by' : 'step_no'});
			stepsList = steps.split(',');
			for(var i=0;i<stepsList.length;i++){
				this._df.updateObject({'table' : this._tbi.STEP_TABLE, 'sys_id' : stepsList[i], 'update_params' : [{'column':'order','value':i}]});
				
				if(guidedToursIntegrationEnabled == "true"){
					var stepDetail = this._df.getObjectData({
										'sys_id':stepsList[i],
										'table':'tour_builder_step',
										'override_columns':{'step_no':'stepNo','embedded_help_reference':'embeddedHelpReference'}});
					this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE,{'order':stepDetail.stepNo},{'sys_id':stepDetail.embeddedHelpReference});
				}
			}
			return;
		}
	},
	
	type: 'TourbuilderRecorder'
};