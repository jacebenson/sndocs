var MatchingDimensionProcessor = Class.create();

var MAX_AGENTS_PER_GROUP = 1000; //just to protect against big data 
var ERROR_MESSAGE_NO_GROUP = gs.getMessage("Selected Group has no agents");

MatchingDimensionProcessor.prototype = Object.extendsObject(AbstractAjaxProcessor,{
	initialize: function(request, responseXML, gc) {
		this.request = request;
        this.responseXML = responseXML;
        this.gc = gc;
		this.users = [];
	},
	
	processDimensions : function(task, taskTableName, dimensions, users) {
		this.users = [];
		var taskRecord;
		if(task instanceof GlideRecord || task instanceof GlideRecordSecure){
			taskRecord = task;
		}else{
			taskRecord = new GlideRecord(taskTableName);
			taskRecord.get(task);
		}
		var overallReturn = {};
		overallReturn.info = [];
		if (!JSUtil.nil(task) && !taskRecord.active){
			overallReturn.msg = gs.getMessage("The record is read-only!");
			return overallReturn;
		}
		if(JSUtil.nil(task) || JSUtil.nil(dimensions) || dimensions.length == 0) {
			var infoObj = {};
			infoObj.type = "WARNING";
			infoObj.msg = "Insufficient data for the request";
			var reason;
			if (JSUtil.nil(task))
				reason = "invalid task";
			if (JSUtil.nil(dimensions) || dimensions.length)
				reason = "invalid dimensions";
			infoObj.msg = infoObj.msg + ", reason=" + reason;			
			overallReturn.info.push(infoObj);
			overallReturn.msg = gs.getMessage("No criteria or task to be processed");
			overallReturn.result = "failure";
			return overallReturn;
		}

		if(!JSUtil.nil(users)){
			var userDataObj = {};
			var userGR = new GlideRecord("sys_user");
			userGR.addEncodedQuery("sys_idIN" + users.join());
			userGR.setLimit(MAX_AGENTS_PER_GROUP + 1);
			userGR.addActiveQuery();
			userGR.query();
			if(new CSMUtil().isDebugOn())
				gs.log("MatchingDimensionProcessor::processDimensions user count=" + userGR.getRowCount());
			if(userGR.getRowCount() > 0){
				if (userGR.getRowCount() > MAX_AGENTS_PER_GROUP) {
					//We are throwing some data due to max limit so report it in the info
					var infoObj = {};
					infoObj.type = "WARNING";
					infoObj.msg = "Got more than maximum supported agents = " + MAX_AGENTS_PER_GROUP;		
					overallReturn.info.push(infoObj);
				}

				while(userGR.next()) {
					this.users.push(userGR.getValue("sys_id"));
					var userObj = {};
					userObj["displayValue"] = userGR.getValue("name");
					userObj["value"] = userGR.getValue("sys_id");
					userObj["userId"] = userGR.getValue("sys_id");
					userDataObj[userGR.getValue("sys_id")+""] = userObj;
				}


				var dimensionResults = {};
				var totalWeight = 0.0;
				for (var dimension_sys_id in dimensions){
					var dimensionResult = {};
					
					if (this._isDimensionForRanking(dimensions[dimension_sys_id]))
						totalWeight += Number(dimensions[dimension_sys_id].weight);
					else if(new CSMUtil().isDebugOn()){
						gs.log("processDimensions::Not using for the total weight " + dimension_sys_id);
					} 
					
					dimensionResult.dimension = dimension_sys_id;					
					var dimRecord = new GlideRecord("matching_dimension");
					dimRecord.get(dimension_sys_id);
					if(dimRecord) {
						var sysId = dimRecord.getValue("sys_id");
						if(!("loadDefaults" in dimensions[sysId]))
							dimensions[sysId].loadDefaults = true;
						if(dimensions[sysId].loadDefaults && (!dimensions[sysId].taskFieldValues || dimensions[sysId].taskFieldValues.length == 0)){
							//var taskGR = new GlideRecordSecure(taskTableName);
							//taskGR.addQuery('sys_id',task);
							//taskGR.query();
							var taskGR = taskRecord ;
							//if(taskGR.next()){
							var field = "default_field_value";
							if(dimRecord.dimension_type == "simple"){
								field = "applies_to_field";
							}
							var defaultValues = taskGR.getValue(dimRecord.getValue(field));
								if(!JSUtil.nil(defaultValues)){
									var fieldType = this._getInternalFieldType(taskGR, dimRecord.getValue(field));
									if(!JSUtil.nil(fieldType)) {
										if(fieldType == "glide_list")
											dimensions[sysId].taskFieldValues = defaultValues.split(",");
										else{
											dimensions[sysId].taskFieldValues = [];
											dimensions[sysId].taskFieldValues.push(defaultValues);
										}
									}
								}
								else
									dimensions[sysId].taskFieldValues = [];		
							//}
						}
						if(dimRecord.getValue("use_reference")== true){
							var selectedValues = [];
							var sysId = dimRecord.getValue("sys_id");
							if(dimensions[sysId].taskFieldValues && dimensions[sysId].taskFieldValues.length>0 ){
								var selectedSkillIDs = dimensions[sysId].taskFieldValues;
								var grSkill1 = new GlideRecord(dimRecord.getValue("reference_table"));
									grSkill1.addQuery("sys_id","IN",selectedSkillIDs.toString());
									grSkill1.query();
									while(grSkill1.next()){
										selectedValues.push({"value":grSkill1.getValue('sys_id'),"displayValue":grSkill1.getValue('name')});
									}
							}
							dimensionResult.selectedValues = selectedValues;
						}
					}
					dimensionResult.dimension_type = dimensions[dimension_sys_id].dimension_type;
					dimensionResult.weight = dimensions[dimension_sys_id].weight;
					dimensionResult.name = dimRecord.getDisplayValue();
					dimensionResult.result = this.processDimension(dimension_sys_id, dimensions[dimension_sys_id], taskRecord);
					dimensionResults[dimension_sys_id]=dimensionResult;
					
				}
				overallReturn.overallRating = this.getOverallRating(dimensionResults, totalWeight);
				overallReturn.dimensionResults = dimensionResults;
				overallReturn.users = this.users;
				if(JSUtil.nil(this.users) || overallReturn.users.length < 1){
					overallReturn.msg = gs.getMessage("No agents available");
				}
				overallReturn.userDataObj = userDataObj;
				overallReturn.result = "success";
			}else{
				overallReturn.result = "failure";
				overallReturn.msg = gs.getMessage("No agents available");
			}
		}else{
			overallReturn.result = "failure";
			overallReturn.msg = gs.getMessage("No agents available");
		}
		return overallReturn;
	},
	
	_getInternalFieldType : function (taskGR, fieldName){
		if(taskGR.getElement(fieldName))
			return taskGR.getElement(fieldName) && taskGR.getElement(fieldName).getED().getInternalType();
	},
	
	_isDimensionForRanking : function(dimension) {
		return (dimension.dimension_type == "ranking" || dimension.dimension_type == "ranking_no_display");
	},
	
	getOverallRating : function(dimensionResults, totalWeight){
		var overallMap = {};
		if(totalWeight <= 0)
			totalWeight = 1;
		//for(var i = 0;i < dimensionResults.length; i++)
		for(var dimensionResult in dimensionResults){			
			var dimension = dimensionResults[dimensionResult];
			if (!this._isDimensionForRanking(dimension)) {
				if(new CSMUtil().isDebugOn())
					gs.log("getOverallRating skipping for overall calculation " + JSON.stringify(dimension));
				continue;
			}
				
			for(var idx in this.users){
				var user = this.users[idx];
				var overallRating = overallMap[user] ? overallMap[user] : 0;
				if (totalWeight && !isNaN(dimension.result[user].rating)) {
					//overallMap[user] = overallRating + Number((dimension.weight / totalWeight) * dimension.result[user].rating);
					overallMap[user] = overallRating + Number((dimension.weight / totalWeight) * dimension.result[user].rating);
				}
				else 
					overallMap[user] = 0;
			}
		}
		
		for(var i=0;i< this.users.length;i++){
			if(!overallMap.hasOwnProperty(this.users[i])) {
				overallMap[this.users[i]] = 0;
			}	
		}
		return overallMap;
	},
	
	processScriptedDimension : function(dimensionRecord, dimension, task) {
		var map = {};
		map.task = task;
		map.users = this.users;
		map.taskFieldValues = dimension.taskFieldValues;
		//map.initialLoad = dimension.initialLoad;
		map.args = dimension.args;
		var evaluator = new GlideScopedEvaluator();
		var dimensionResult = evaluator.evaluateScript(dimensionRecord, "script", map);

		if(new CSMUtil().isDebugOn())
			gs.log("MatchingDimensionProcessor::processScriptedDimension " + dimensionRecord.getDisplayValue() + " dimensionResult=" + JSON.stringify(dimensionResult));
		
		for(var idx in this.users){
			var user = this.users[idx];
			var result = dimensionResult[user];
			/*if(!result){
				result = {};
				result.value = 0;
				result.displayValue = "NA";
				result.detailedDisplayValue =  "User not ranked";
				dimensionResult[user] = result;
			}
			else{
				if(dimension["ranking_method"]=="less is better")
					result.rating = 1 - result.rating;
			}*/
			if(result) {
				if(dimension["ranking_method"]=="less is better")
					result.rating = 1 - result.rating;
			}
				
		}
		
		return dimensionResult;
	},
	
	processSimpleDimension : function(dimensionRecord, dimension, task) {
		var contextTableToMatchOn = dimensionRecord.applies_to_table;
		var contextFieldToMatch = dimensionRecord.applies_to_field;
		var resourceTable = dimensionRecord.resource_table;
		var resourceFieldToMatch = dimensionRecord.resource_matching_field;
		var resourceFieldToReturn = dimensionRecord.resource_field;
		
		var taskGR = new GlideRecord(contextTableToMatchOn);
		taskGR.get(task.getValue("sys_id"));
		var taskMatchUserMap = {};
		if(taskGR.isValidRecord()) {
			//var taskValueToMatch = taskGR.getValue(contextFieldToMatch);
			var taskValueToMatch = dimension.taskFieldValues;
			var userGR = new GlideRecord(resourceTable);
			userGR.addEncodedQuery(resourceFieldToMatch+"IN"+taskValueToMatch.join());
			userGR.addEncodedQuery(resourceFieldToReturn+"IN"+this.users.join());
			userGR.query();
			while(userGR.next()){
				var user = userGR.getValue(resourceFieldToReturn);
				taskMatchUserMap[user] = 1;
			}
		}
		var userMap = {};
		for(var idx in this.users){
			var user = this.users[idx];
			var result = {};
			result.rating = !taskMatchUserMap[user] ? 0 : 1;
			result.value = !taskMatchUserMap[user] ? 0 : 1;
			result.displayValue = !taskMatchUserMap[user] ? "No Match" : "Match";
			result.detailedDisplayValue =  result.displayValue;
			userMap[user] = result;
		}
		return userMap;
	},
	
	processAggregateDimension : function(dimensionRecord, dimension, task) {
		var aggregate_table = dimensionRecord.aggregate_table;
		var aggregate_filter = dimensionRecord.aggregate_filter;
		var aggregate_field = dimensionRecord.aggregate_field;
		
		if(new CSMUtil().isDebugOn())
			gs.log("processAggregateDimension aggregate_table=" + aggregate_table + " aggregate_filter=" +
		aggregate_filter + " aggregate_field=" + aggregate_field);
		
		if(JSUtil.nil(aggregate_table) || JSUtil.nil(aggregate_field))
			return {};
		
		var taskGR = new GlideAggregate(aggregate_table);
		taskGR.addEncodedQuery(aggregate_filter);
		taskGR.addEncodedQuery(aggregate_field + "IN" + this.users.join());
		taskGR.addAggregate("COUNT",aggregate_field);
		taskGR.addAggregate("MIN", aggregate_field + ".sys_id");
		taskGR.groupBy(aggregate_field);
		taskGR.query();
		var userMap = {};
		var totalCount = 0;
		while(taskGR.next()){
			var count = Number(taskGR.getAggregate("COUNT",aggregate_field));
			var user = taskGR.getAggregate("MIN", aggregate_field + ".sys_id");
			userMap[user] = count;
			totalCount += count;
		}
		
		for(var idx in this.users){
			var user = this.users[idx];
			var result = {};
			result.rating = 0;
			if (!userMap[user])
				userMap[user] = 0;
			if (totalCount){
				if(dimension["ranking_method"]=="less is better")
					result.rating = 1 - (userMap[user] / totalCount); //TODO : Do based on the flag
				else
					result.rating = (userMap[user] / totalCount);
			}
			result.value = userMap[user];
			result.displayValue = "" + userMap[user];
			result.detailedDisplayValue =  userMap[user];
			userMap[user] = result;
		}
		return userMap;
	},
	
	
	processDimension : function (dimension_sys_id, dimension, task){
		var result = {};
		var dimensionRecord = new GlideRecord("matching_dimension");
		dimensionRecord.get(dimension_sys_id);
		if(dimensionRecord.dimension_type == "script") {
			result = this.processScriptedDimension(dimensionRecord, dimension, task);
		} else if(dimensionRecord.dimension_type == "aggregate"){			
			result = this.processAggregateDimension(dimensionRecord, dimension, task);
		} else if(dimensionRecord.dimension_type == "simple"){
			result = this.processSimpleDimension(dimensionRecord, dimension, task);
		}
		this.users = Object.keys(result);
		this.dropAgentsPerThreshhold(dimensionRecord, dimension, result);
		return result;
	},
	
	dropAgentsPerThreshhold : function(dimensionRecord, dimension, result){
		//Based on the below/above the set threshold values, drop the agent
		if(new CSMUtil().isDebugOn())
			gs.log("------ " + dimensionRecord.getDisplayValue() + ":" + dimensionRecord.sys_id + " dropAgentsPerThreshhold threshold=" + dimension.threshold);
		if (JSUtil.nil(dimension.threshold))
			return;
		var idx = 0;
		while (idx < this.users.length) {
			var user = this.users[idx];
			var userResult = result[user];
			if ((dimension.ranking_method == "more is better" && userResult.value < dimension.threshold) ||
				   (dimension.ranking_method == "less is better" && userResult.value > dimension.threshold)) {
				 delete result[user];
				 this.users.splice(idx,1);
			} else {
				idx++;
			}
		}
		return result;
	},
	
	logResults : function(results) {
		var headerStr1 = "\t  User\t\tOverall\t";
		var headerStr2="";
		for(var i in results.dimensionResults) {
			var grDimension = new GlideRecord("matching_dimension");
			grDimension.get( results.dimensionResults[i].dimension);
			//var dimensionResult = results.dimensionResults[i].result;
			headerStr2 += grDimension.getDisplayValue("name") + ":[Rating    Value   Display   Detailed_Display]";
		}
		
		for(var userIdx in results.users) {
			var user = results.users[userIdx];	
			var gr = new GlideRecord("sys_user");
			gr.get(user);
			var userName = ("             " + gr.getDisplayValue()).slice(-14);
			var overAll = ("      " + results.overallRating[user].toFixed(2)).slice(-7);
			var rowStr2 = "";
			for(var i in results.dimensionResults) {
				var grDimension = new GlideRecord("matching_dimension");
				grDimension.get( results.dimensionResults[i].dimension);
				var dimensionResult = results.dimensionResults[i].result;
				var userDimensionResult = dimensionResult[user];
				var rating = ("\t" + userDimensionResult.rating).slice(-7);
				var value = ("      " + userDimensionResult.value).slice(-12);
				var display = ("      " + userDimensionResult.displayValue).slice(-12);
				var detailedDisplay = ("  " + userDimensionResult.detailedDisplayValue).slice(-45);
				rowStr2 += rating + "  " + value + "  " + display + "   " + detailedDisplay + " ";
				//rowStr2 = rating + "  " + value ;
			}
		}
	},
	
	getAWDataFromDimension:function(){
		var sw = new GlideStopWatch();
		var tableName = this.getParameter("sysparm_taskTableName");
		var taskId = this.getParameter("sysparm_taskSysID");
		var selectedDimensions  = new JSON().decode(this.getParameter("sysparm_selDimension"));
		var selectedDimValues = new JSON().decode(this.getParameter("sysparm_selDimValues"));
		var taskGrp = this.getParameter("sysparm_taskGrp");
		var assignmentWorkbenchID = this.getParameter("sysparm_assignmentWorkbenchID");
		var initialLoad = this.getParameter("sysparm_initialLoad");
		var dimensions = {};
		var gr = new GlideRecordSecure("matching_dimension_for_assignment");
		gr.addQuery('dimension','IN',selectedDimensions.toString());
		
		if(assignmentWorkbenchID){
			gr.addQuery('matching_rule',assignmentWorkbenchID);
		}
		gr.orderBy("order");
		gr.query();
		while(gr.next()){
			var taskFieldValues = [];
			if(selectedDimValues && selectedDimValues[gr.getValue("dimension")]){
				var valArr = selectedDimValues[gr.getValue("dimension")];
				if(valArr && valArr.length > 0){
					for(var j = 0;j<valArr.length;j++)
					taskFieldValues.push(valArr[j]);
				}
			}
			var initial_load = (initialLoad == "true");
			
			dimensions[gr.getValue("dimension")] = 
				{
					"dimension_type":gr.getValue("dimension_type"), 
					"weight":gr.getValue("weight"),
					"threshold":gr.getValue("threshold"),
					"ranking_method":gr.getValue("ranking_method"),
					"initialLoad":initial_load,
					"loadDefaults" : initial_load,
					"taskFieldValues":taskFieldValues,
					"args":{}
				};
		}
		var awData = {};
		awData.info = [];
		var assignmentGroup = taskGrp;
		if(JSUtil.nil(taskGrp)){
			var infoObj = {};
			infoObj.type = "WARNING";
			infoObj.msg = "Insufficient data for the request";
			var reason = "no group";
			infoObj.msg = infoObj.msg + ", reason=" + reason;			
			awData.info.push(infoObj);
			awData.msg = gs.getMessage("Select group to show Recommendation");
			awData.result = "failure";
		}	
		else{
			var grpRecord = new GlideRecordSecure('sys_user_group');
			grpRecord.addQuery('sys_id',assignmentGroup);
		    grpRecord.query();
		    if(grpRecord.next()){
		    	var assignmentGrpObj = {};
				assignmentGrpObj['grpName'] = grpRecord.getValue("name");
				assignmentGrpObj['grpId'] = assignmentGroup;
				var userDataObj = {};
				var userGR = new GlideRecordSecure("sys_user");
				var groupGR = userGR.addJoinQuery("sys_user_grmember","sys_id","user");
				userGR.setLimit(MAX_AGENTS_PER_GROUP + 1);
				userGR.addActiveQuery();
				groupGR.addCondition("group", assignmentGroup);
				userGR.query();
				
				if(new CSMUtil().isDebugOn())
					gs.log("MatchingDimensionProcessor::getAWDataFromDimension user count=" + userGR.getRowCount());
				
				var users = [];
				while(userGR.next()) {
					users.push(userGR.getValue("sys_id"));
				}
				awData = this.processDimensions(taskId,tableName,dimensions,users);
				awData.grpObj = assignmentGrpObj;
		    }
		    else{
		    	awData.result = "failure";
				awData.msg = gs.getMessage("Invalid group selection");
		    }
		}
		var response = new JSON().encode(awData);
		if(new CSMUtil().isDebugOn())
			sw.log("MatchingDimensionProcessor::getAWDataFromDimension");
		return response;
	},

	getAWConfig:function(){
		var tableName = this.getParameter("sysparm_taskTableName");
		var taskId = this.getParameter("sysparm_taskSysID");
		var grpName = this.getParameter("sysparm_taskGrpName");
		var taskData = {};
		taskData['tableName'] = tableName;
		taskData['taskId'] = taskId;
		taskData['grpName'] = grpName;
		var awConfig = MatchingRuleForAssignment.getConfigData(taskData);
		return new JSON().encode(awConfig);
	},
	
	getFilterValues:function(){
		var groupSysId = this.getParameter("sysparm_groupSysId");
		var criteriaSysId = this.getParameter("sysparm_criteriaSysId");
		var filterName = this.getParameter('sysparm_filterName');
		var filterParam = {};
		filterParam['group_sys_id'] = groupSysId;
		filterParam['criteria_sys_id'] = criteriaSysId;
		var filterData = new MatchingDimensionFilterProcessor().getFilterData(filterParam);
		return new JSON().encode(filterData);
	},
	// get all the dimensions for matching rule
	getConditions : function (table, id) {
		var conditions = [];
		var gr = new GlideRecord("matching_dimension_for_assignment");
		gr.addQuery('assignment_workbench',id);
		gr.query();
		while (gr.next()) {
			conditions.push(gr.getValue("sys_id"));
		}
		return conditions;
	},
	
	_performAssignment: function (taskID, taskTableName, agentID, groupID){
		var taskGR = new GlideRecordSecure(taskTableName);
		taskGR.addQuery('sys_id',taskID);
		taskGR.query();
		if(taskGR.next()){
			taskGR.setValue("assigned_to", agentID);
			taskGR.setValue("assignment_group", groupID);
			taskGR.update();
		}
	},

	handleAssign:function(){
		var taskSysID = this.getParameter("sysparm_taskSysID");
		var taskTableName = this.getParameter("sysparm_taskTableName");
		var selectedAgentID = this.getParameter("sysparm_selectedUserID");
		var grpId = this.getParameter("sysparm_grpId");
		
		//perform the assignment
		this._performAssignment(taskSysID, taskTableName, selectedAgentID, grpId);
		
		
		var grpName = this.getParameter("sysparm_grpName");
		var picked_recommended = this.getParameter("sysparm_picked_recommended");
		var selection = this.getParameter("sysparm_selection");
		var firstAgent = this.getParameter("sysparm_firstAgent");
		var fetchTime = this.getParameter("sysparm_fetchTime");
		var renderTime = this.getParameter("sysparm_renderTime");
		var reportData = {};
		reportData['event.type'] = 'agent.selection';
		reportData['selectionType'] = 'manual_assignment';
		reportData['taskSysID'] = taskSysID;
		reportData['taskTableName'] = taskTableName;
		reportData['grpId'] = grpId;
		reportData['grpName'] = grpName;
		reportData['picked_recommended'] = picked_recommended;
		reportData['selection'] = selection;
		reportData['firstAgent'] = firstAgent;
		reportData['fetchTime'] = fetchTime;
		reportData['renderTime'] = renderTime;
		var matchingDimensionUtil = new MatchingDimensionUtil();
		matchingDimensionUtil.logAnalytics(reportData);
		var result = {};
		result.success = true;
		return new JSON().encode(result);
	},
	
	type: 'MatchingDimensionProcessor'
});