var MatchingRuleProcessor = Class.create();
MatchingRuleProcessor.prototype = {
    initialize: function() {
    },
	getUsersInSchedule : function (candidates){
		var inScheduleCandidates = [];
		var notInScheduleCandidates = [];
		var arrayUtil = new global.ArrayUtil();

		var agents = new GlideRecord("sys_user");
		agents.addEncodedQuery("sys_idIN"+candidates.join());
		agents.addActiveQuery();
		agents.query();
		var tzScheduleMap = {};
		while(agents.next()){
			var schedule = agents.getValue("schedule");
			var currentTime = new GlideDateTime();

			if(schedule){
				var sched = new GlideSchedule(schedule, agents.getValue("time_zone"));
				var time_zone = agents.getValue("time_zone") ? agents.getValue("time_zone") : sched.getTimeZone();
				var isInSchedule = false;
				var key = schedule+"--"+time_zone;
				if(tzScheduleMap.hasOwnProperty(key)){
					isInSchedule = tzScheduleMap[key];
				}
				else{
					isInSchedule = sched.isInSchedule(currentTime,time_zone);
					tzScheduleMap[key] = isInSchedule;
				}
				if(isInSchedule)
					inScheduleCandidates.push(agents.getValue("sys_id"));
				else
					notInScheduleCandidates.push(agents.getValue("sys_id"));
			}
		}
		var finalCandidates = arrayUtil.diff(candidates, notInScheduleCandidates);
		return finalCandidates;
	},

	isRecordMatchingConditions : function(taskRecord, matching_table, matching_conditions){
		if (JSUtil.nil(matching_conditions)) //if no conditions then return true
			return true;
		if(taskRecord.getTableName() == matching_table){
			var filter = new GlideFilter(matching_conditions, "rule-condition");
			filter.setCaseSensitive(true);
			var match = filter.match(taskRecord, true);
			return match;
		}
		return false;
	},

	getUserFromMatchingRule: function(supply_table, supply_condition, supply_field_name, rule_sys_id, taskRecord){
		var candidates = [];
		var candidatesMap = {};
		var supplyGR = new GlideRecord(supply_table);
		supplyGR.addEncodedQuery(supply_condition);
		//supplyGR.groupBy(supply_field_name);
		supplyGR.query();
		while(supplyGR.next()){
			var candidate = supplyGR.getValue(supply_field_name);
			if(!candidatesMap.hasOwnProperty(candidate))
			{
				candidatesMap[candidate] = true;
				candidates.push(candidate);
			}
		}
		
		return candidates;
	},
	
	rankDimensionResultsAndGetCandidates : function(dimensionResults){
		if(!dimensionResults || !dimensionResults.overallRating)
			return [];
		var overallMap = dimensionResults.overallRating;
		
		var tuples = [];
		for (var user in overallMap){
			tuples.push([user, overallMap[user]]);
		}
		tuples.sort(function(a, b) {
		    a = a[1];
		    b = b[1];
		
		    return a < b ? 1 : (a > b ? -1 : 0);
		});
		var returnUsers = [];
		for (var i = 0; i < tuples.length; i++) {
		    var key = tuples[i][0];
		    var value = tuples[i][1];
			returnUsers.push(key);
		}
		return returnUsers;
	},
	
	processDimensions: function(candidates, rule_sys_id, taskRecord, args){
		var returnUsers = [];
		var dimensions = new GlideRecord("matching_dimension_for_assignment");
		dimensions.addQuery("matching_rule", rule_sys_id);
		dimensions.addQuery("selected", true);
		dimensions.orderBy("order");
		dimensions.query();
		if(dimensions.getRowCount() == 0)
			return candidates;
		var dimensionsObj = {};
		while(dimensions.next())
		{
			var dimensionObj = {
				"dimension_type":dimensions.getValue("dimension_type"), 
				"weight":dimensions.getValue("weight"),
				"threshold":dimensions.getValue("threshold"),
				"ranking_method":dimensions.getValue("ranking_method"),
				"taskFieldValues":[],
				"args":args
			};
			dimensionsObj[dimensions.getValue("dimension")] = dimensionObj;
		}
		var dimensionResults = new MatchingDimensionProcessor().processDimensions(taskRecord, taskRecord.getTableName(), dimensionsObj, candidates);
		this.dimensionResults = dimensionResults;
		returnUsers = this.rankDimensionResultsAndGetCandidates(dimensionResults);
		return returnUsers;
	},
	
	getDimensionResults : function() {
		return this.dimensionResults;
	},

	getUserFromMatchingRuleScript: function(rule, taskRecord, args){
		var candidates = [];
		var map = {};
		map.taskRecord = taskRecord;
		map.current = taskRecord;
		map.contextRecord = taskRecord;
		map.args = args;
		var evaluator = new GlideScopedEvaluator();
		candidates = evaluator.evaluateScript(rule, "script", map);
		
		return candidates;
	},
	
	processAndGetResources : function (contextRecord, userLimit, resource_table, filterArray){
		var matchingRuleRecord = this.getMatchingRuleForContext(contextRecord, contextRecord.getTableName(), resource_table);
		while(matchingRuleRecord.next()){
			var contextMatch = this.isRecordMatchingConditions(contextRecord, matchingRuleRecord.getValue("table"), matchingRuleRecord.getValue('condition'));
			if(contextMatch){
				var candidates = this.processRuleRecord(contextRecord, matchingRuleRecord, userLimit, filterArray);
				if(candidates.length > 0) {
					return candidates;
				}
			}
		}
		return [];
	},
	
	getMatchingRuleForContext : function (contextRecord, tableName, resource_table, query, sys_class_name){
		if(JSUtil.nil(resource_table) || resource_table.length == 0)
			resource_table = "sys_user";
		if(JSUtil.nil(sys_class_name))
			sys_class_name = "matching_rule";	
		var matchingRuleRecord = new GlideRecord(sys_class_name);
		matchingRuleRecord.addActiveQuery();
		matchingRuleRecord.addQuery("table", tableName);
		if(query)
			matchingRuleRecord.addEncodedQuery(query);
		if(resource_table == "sys_user")
			matchingRuleRecord.addEncodedQuery("resource_type_table="+resource_table+"^ORresource_type_tableISEMPTY");
		else
			matchingRuleRecord.addQuery("resource_type_table", resource_table);
		matchingRuleRecord.orderBy("order");
		matchingRuleRecord.query();
		return matchingRuleRecord;
	},

	processRule : function(taskRecord, matchingRule, userLimit){
		var matchingRuleRecord = new GlideRecord("matching_rule");
		matchingRuleRecord.addQuery("sys_id",matchingRule);
		matchingRuleRecord.addActiveQuery();
		matchingRuleRecord.query();
		if(matchingRuleRecord.next())
			return this.processRuleRecord(taskRecord,matchingRuleRecord,userLimit);
	},
	
	_checkIfMatchingRuleIsForUsers : function (matchingRuleRecord) {
		
		return (matchingRuleRecord.getValue("resource_type_table") == "sys_user");
	},
	
	_checkIfMatchingRuleHasDimensions : function (matchingRuleRecord) {
		var dimensions = new GlideRecord("matching_dimension_for_assignment");
		dimensions.addQuery("rule", matchingRuleRecord.getValue("sys_id"));
		dimensions.addQuery("selected", true);;
		dimensions.query();
		if(dimensions.getRowCount() > 0)
			return true;
		return false;
	},

	processRuleRecord : function(taskRecord, matchingRuleRecord, userLimit, filterArray, args){
		var arrayUtil = new global.ArrayUtil();
		if(!userLimit)
			userLimit = 1;
		if(!args)
			args = {};
		var candidates = [];
		var matching_options = matchingRuleRecord.getValue("matching_options");
		if(matching_options == "simple"){
			candidates.push(matchingRuleRecord.getValue("user"));
		}
		else if(matching_options == "dynamic"){
			var fieldName = matchingRuleRecord.getValue("supply_user_field_name");
			if(!fieldName)
				fieldName = "sys_id";
			candidates = this.getUserFromMatchingRule(matchingRuleRecord.getValue("supply_user_table"), matchingRuleRecord.getValue('supply_user_condition'), fieldName, matchingRuleRecord.getValue("sys_id"), taskRecord);
		}
		else if(matching_options == "script"){
			candidates = this.getUserFromMatchingRuleScript(matchingRuleRecord, taskRecord, args);
		}
		else if(matching_options == "recommendation criteria" && this._checkIfMatchingRuleIsForUsers(matchingRuleRecord) && this._checkIfMatchingRuleHasDimensions(matchingRuleRecord)) {
			if(candidates.length == 0)
				candidates = filterArray;
			candidates = this.processDimensions(candidates, matchingRuleRecord.getValue("sys_id"), taskRecord, args);
		}
		
		var shouldUseSchedule = matchingRuleRecord.getValue("schedule_filter");
		if(shouldUseSchedule > 0 && this._checkIfMatchingRuleIsForUsers(matchingRuleRecord) && !this._checkIfMatchingRuleHasDimensions(matchingRuleRecord)){
			candidates = this.getUsersInSchedule(candidates);
		}
		
		
		
		if(!JSUtil.nil(filterArray))
			candidates = arrayUtil.intersect(candidates,filterArray);
		
		var finalCandidates = candidates;
		if(finalCandidates)
			finalCandidates = finalCandidates.slice(0, userLimit);
		return finalCandidates;
	},

	processAndGetCandidates: function(taskRecord, userLimit, tableName, mode, all_match, filterArray, argsForDimensions, sys_class_name,matching_rule_filter) {
		var arrayUtil = new global.ArrayUtil();
		var finalCandidates = [];
        var matching_rule_query = false;
		if(JSUtil.nil(mode))
			mode = "forward";

		if(JSUtil.nil(all_match))
			all_match = false;

		if(JSUtil.nil(tableName))
			tableName = taskRecord.getTableName();
		if(!JSUtil.nil(matching_rule_filter))
	        matching_rule_query = matching_rule_filter;
		var matchingRuleRecord = this.getMatchingRuleForContext(taskRecord, tableName, "sys_user", matching_rule_query, sys_class_name);
		while(matchingRuleRecord.next()){
			var ruleCandidates = [];
			if(mode == "reverse"){
				var userRecord = taskRecord;
				var candidates = this.processRuleRecord(userRecord, matchingRuleRecord, 999999);
				var index = arrayUtil.indexOf(candidates, userRecord.getValue("sys_id"), 0);
				if(index >= 0)
				{
					var tasks = new GlideRecord(tableName);
					tasks.addEncodedQuery(matchingRuleRecord.getValue('condition'));
					
					if(!JSUtil.nil(filterArray))
						tasks.addEncodedQuery("sys_idIN"+filterArray.join());
					
					tasks.query();
					while(tasks.next()){
						ruleCandidates.push(tasks.getValue("sys_id"));
					}
					
					if(!JSUtil.nil(filterArray))
						ruleCandidates = arrayUtil.intersect(filterArray,ruleCandidates);
				}	
			}
			else
			{
				var taskMatch = this.isRecordMatchingConditions(taskRecord, matchingRuleRecord.getValue("table"), matchingRuleRecord.getValue('condition'));
				if(taskMatch){
					ruleCandidates = this.processRuleRecord(taskRecord, matchingRuleRecord, userLimit, filterArray, argsForDimensions);
					
				}
			}

			if(ruleCandidates.length > 0){
				finalCandidates = arrayUtil.concat(finalCandidates,ruleCandidates);
				if(!all_match)
					break;
			}
			
		}
		var candidateMap = {};
		var uniqueCandidates = [];
		for (var i = 0; i < finalCandidates.length; i++) {
			var candidate = finalCandidates[i];
			if(!candidateMap.hasOwnProperty(candidate))
			{
				candidateMap[candidate] = true;
				uniqueCandidates.push(candidate);
			}
		};
		return uniqueCandidates;
	},

    type: 'MatchingRuleProcessor'
}