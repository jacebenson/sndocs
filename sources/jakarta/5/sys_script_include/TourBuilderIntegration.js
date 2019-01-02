var TourBuilderIntegration = Class.create();
TourBuilderIntegration.prototype = {
	_df : new TourBuilderGenericDataFactory(),
	
    initialize: function() {
    },
    
	
	isValidGuidedTourObjSysId: function(tableName, sysId){
		var guidedTourObj =  this._df.getObjects({"table": tableName, "query_params" : [{"column": "sys_id", "value" : sysId}]});
		if(guidedTourObj!=="")
			return true;
		return false;
	},
	
	createGuidedTourObj: function(tableName, inputObj){
		var tourParams = [];
		
		for(var col in inputObj)
			if(!this._isSpecialCaseFormSection(col,inputObj[col],inputObj))
				tourParams.push({"column" : col, "value" : inputObj[col] });
			else
				tourParams.push({"column" : col, "value" : this._getFormSectionId(inputObj["tableNameForFormSection"], inputObj["sectionIdForFormSection"], inputObj["viewForFormSection"]) });
		
		var tourSysId = this._df.createObject({'table' : tableName, 'object_params' : tourParams});
		
		return tourSysId;
	},
	
	updateGuidedTourObj: function(tableName, inputObj, queryParams){
		var updateParams = [];
		
		var objectSysId = this._df.getObjects({"table": tableName, "query_params" : queryParams});
		
		for(var col in inputObj)
			if(!this._isSpecialCaseFormSection(col,inputObj[col],inputObj))
				updateParams.push({"column" : col, "value" : inputObj[col] });
			else
				updateParams.push({"column" : col, "value" : this._getFormSectionId(inputObj["tableNameForFormSection"], inputObj["sectionIdForFormSection"], inputObj["viewForFormSection"]) });
		
		var objectUpdated = this._df.updateObject({"table" : tableName, 'sys_id' : (queryParams.stepSysId || objectSysId ), 'update_params' : updateParams});
		
		return objectUpdated;
	},
	
	deleteGuidedTourObj: function(tableName,  queryParams){
		var query_params_array = [];
		
		for(var param in queryParams){
			query_params_array.push({"column" : param, "value" : queryParams[param] });
		}
				
		this._df.deleteObjects({'table' : tableName, 'query_params' : query_params_array});
	},
	
	_isSpecialCaseFormSection:function(column, value, inputObj){
		if(column == "form_section" && inputObj["form_element"] == "form_section" || inputObj["form_element"] == "form_section_tab_only")
			return true;
		return false;
	},
	
	_getFormSectionId:function(tableName, sectionId, viewName){
		var queryParams = [];
		queryParams.push({"column" : "sys_ui_section", "value" : sectionId});
		queryParams.push({"column" : "sys_ui_form.name", "value" : tableName});
		//queryParams.push({"column" : "sys_ui_form.view", "value" : viewName});
		
		var formSectionId = this._df.getObjects({"table": "sys_ui_form_section", "query_params" : queryParams});
		
		return formSectionId;
	},
	
	GUIDE_TABLE       : 'sys_embedded_tour_guide',
	STEP_TABLE        : 'sys_embedded_tour_step',
	ELEMENT_TABLE     : 'sys_embedded_tour_element',
    type: 'TourBuilderIntegration'
};