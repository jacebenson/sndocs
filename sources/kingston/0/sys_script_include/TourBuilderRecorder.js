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
			
		var embededTourSysId ='';
		
		if(tourURL.indexOf("?") < 0 && tourURL.indexOf(".do") >= 0)
				tourURL = tourURL.split('.do')[0];
			
		embededTourSysId = this._tbi.createGuidedTourObj(this._tbi.GUIDE_TABLE,{name : tourName, context: tourURL, roles: tourRoles});
		tourSysId = embededTourSysId;
		
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
		var embededTourStepId = "";
		
		stepObj.guidedTourStep.guide = guidedTourSysId = stepObj.tourId;
		embededTourStepId = this._tbi.createGuidedTourObj(this._tbi.STEP_TABLE,stepObj.guidedTourStep);
		
		return embededTourStepId;
	},
		
	/* saves element object **
	** input: elementObj - object with element properties 
	** returns: resultObj - object with sysId and embededTourElementId 
	**                      of the created element
	*/
	saveElement : function(elementObj) {
		var resultObj = {};
		var embededTourElementId = "";
		var elementMap = this._ELEMENT_OBJECT_TO_TABLE_MAPPING;
		var elementParams = [];
		var columnName;
		
		// Readonly refrence field ids are ends with _label
		var re = new RegExp("_label$");
		if(elementObj.guidedToursElement.type === "form" && re.test(elementObj.guidedToursElement.field)){
			var table = elementObj.guidedToursElement.table;
			var field = elementObj.guidedToursElement.field;
			var gr = new GlideRecord(table);
			
			if(!gr.isValidField(field)){
				field = field.substr(0, field.length-6); // truncate _label
				if(gr.isValidField(field))
					elementObj.guidedToursElement.field = field;
				}
		}
		
		embededTourElementId = this._tbi.createGuidedTourObj(this._tbi.ELEMENT_TABLE,elementObj.guidedToursElement);
		
		resultObj.guidedTourSysId = embededTourElementId;
					
		return resultObj;
	},
	
	/* update a tour step **
	** input: stepObj - object with step properties 
	** returns: sys_id of the updated step
	*/
	updateStep: function(stepObj){
		var stepMap = this._STEP_OBJECT_TO_TABLE_MAPPING;
		var embededTourStepId = "";
		var stepSysId = "";
		var query_params = [];
		
		query_params.push({"column":"guide","value":stepObj.tourId});
		query_params.push({"column":"order","value":stepObj.step_num});
		query_params.push({"column":"active","value":true});
		stepSysId = this._df.getObjects({"table": this._tbi.STEP_TABLE, "query_params" : query_params});
		embededTourStepId = this._tbi.updateGuidedTourObj(this._tbi.STEP_TABLE, stepObj.guidedTourStep, {'sys_id': stepSysId,'stepSysId':stepSysId});
			
		return embededTourStepId;
	},
	
	/* swap two tour steps **
	** input: tourSysId - sys_id of the tour associated to the step 
	** input: sourceStepNo - step number of source step
	** input: destStepNo - step number of destination step 
	*/
	swapSteps: function(tourSysId,sourceStepNo,destStepNo){
		var stepIds = "";
		var stepsList = [];
		var stepObject = {};
		var tableName = "";
		var stepNumField = "";
		var tourIdField = "";
		
		tableName = this._tbi.STEP_TABLE;
		stepNumField = "order";
		tourIdField = "guide";
		
		stepIds = this._df.getObjects({'table': tableName, 'query_params' : [{'column' : tourIdField, 'value' : tourSysId}, {"column":"active","value":true}], 'order_by' : stepNumField});
		stepsList = stepIds.split(',');
		if(sourceStepNo > destStepNo){
			for(var i=0;i<stepsList.length;i++){
				stepObject = this._df.getObjectData({'sys_id':stepsList[i],'table':tableName});
				var stepNumber;
				
				stepNumber = stepObject.order;
				
				if(stepNumber == sourceStepNo){
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 'update_params' : [{'column' : stepNumField,'value' : destStepNo}]});
				} else if(stepNumber >= destStepNo && stepNumber < sourceStepNo){
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 'update_params' : [{'column' : stepNumField,'value' : (parseInt(stepNumber)+1)}]});
				}
			}
		} else{
			for(var i=0;i<stepsList.length;i++){
				stepObject = this._df.getObjectData({'sys_id':stepsList[i],'table':tableName});
				
				var stepNumber = stepObject.order;
				
				if(stepNumber == sourceStepNo){
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 'update_params' : [{'column' : stepNumField,'value' : destStepNo}]});
				} else if(stepNumber > sourceStepNo && stepNumber  <= destStepNo){
					this._df.updateObject({'table' : tableName, 'sys_id' : stepsList[i], 'update_params' : [{'column' : stepNumField,'value' : (parseInt(stepNumber)-1)}]});
				}
			}
		}
	},
	
	/* delete a tour step **
	** input: tourSysId - sys_id of the tour associated to the step 
	** returns: stepNo - number of the step to be deleted
	*/
	deleteStep: function(tourSysId,stepNo){
		var stepSysId = "";
		var stepObject = {};
		var targetSysId = "";
		var steps;
		var stepsList;

			/** Delete step and corresponding elements **/
			stepSysId = this._df.getObjects({'table':this._tbi.STEP_TABLE, 'query_params' : [{'column':'guide','value':tourSysId},{'column':'order','value':stepNo},{"column":"active","value":true}]});
			stepObject = this._df.getObjectData({'sys_id':stepSysId,'table':this._tbi.STEP_TABLE,'override_columns':{'target_ref':'targetRef'}});
			targetSysId = stepObject.targetRef;
			
			this._tbi.deleteGuidedTourObj(this._tbi.STEP_TABLE,  {'guide' : tourSysId, 'order':stepNo});
			this._tbi.deleteGuidedTourObj(this._tbi.ELEMENT_TABLE,  {'sys_id' : targetSysId});
			
			/** Updating order for remaining steps **/
			steps = this._df.getObjects({'table':this._tbi.STEP_TABLE, 'query_params' : [{'column':'guide','value':tourSysId},{"column":"active","value":true}], 'order_by' : 'order'});
			
			stepsList = steps.split(',');
			for(var i=0;i<stepsList.length;i++){
				this._df.updateObject({'table' : this._tbi.STEP_TABLE, 'sys_id' : stepsList[i], 'update_params' : [{'column':'order','value':i}]});
			}
	},
	
	type: 'TourbuilderRecorder'
};