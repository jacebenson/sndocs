var MatchingDimensionAvailability = Class.create();
var MS_IN_HOUR = 3600 * 1000;
var maxAvailability = 0;
	
MatchingDimensionAvailability.prototype = {
	initialize: function() {
	},
	
	getUsersTZ : function(users) {
		var planningUtil = new AgentScheduleUtil();
		return planningUtil.getUsersTZ(users);
	},
	
	process : function(task, users, taskFieldValues, args){
		var returnUsers = {};
		var tasktimezone = null;
		if(JSUtil.nil(taskFieldValues) || taskFieldValues.length == 0)
			tasktimezone = task.location.time_zone;
		else
			tasktimezone = taskFieldValues[0];
		
		if(JSUtil.nil(tasktimezone))
			tasktimezone = GlideUser.getSysTimeZone();
		
		var taskTZOffset = this.getTimezoneOffset(tasktimezone);
		var availabilityData = this.getAllAgentsAvailability(users, taskTZOffset);
		
		for(var i=0;i<users.length;i++){
			var availability = {};
			var newRating = 0;
			if (maxAvailability)
				newRating = availabilityData[users[i]].rating / maxAvailability;
			availability.rating = newRating.toFixed(2);
			availability.value = availabilityData[users[i]].value;
			availability.displayValue = availabilityData[users[i]].displayValue;
			availability.detailedDisplayValue = availabilityData[users[i]].detailedDisplayValue;
			availability.maxAvailability = maxAvailability;
			returnUsers[users[i]] = availability;
			if(new CSMUtil().isDebugOn())
				gs.log(" MatchingDimensionAvailability = " + JSON.stringify(returnUsers[users[i]]));
		}		
		return returnUsers;
	},
	
	getAllAgentsAvailability : function (users, taskTZOffset) {
		var availabilityMap = {};
		
		var gdtNow = new GlideDateTime();
		var gdtEnd = this.getGlideEndTime();
		var userTZMap = this.getUsersTZ(users);
		
		var planningUtil = new AgentScheduleUtil();
		var durationMap = planningUtil.getDurationForUsers(users, gdtNow, gdtEnd);
		for(var i=0;i<users.length;i++) {
			var user = users[i];
			var availability = {};
			var durationGD = durationMap[user];
			if(new CSMUtil().isDebugOn()) {
				var grAgent = new GlideRecordSecure("sys_user");
				grAgent.get(user); //bruno.smith
			}
			
			if (durationGD) {
				availability.rating = durationGD.getNumericValue();
				availability.displayValue = Math.floor(durationGD.getNumericValue()/ MS_IN_HOUR);
				availability.detailedDisplayValue = durationGD.getDisplayValue();
				if(new CSMUtil().isDebugOn())
					gs.log(grAgent.getDisplayValue() + " getAgentAvailability=" + JSON.stringify(availability)
				+ " now = " + gdtNow.getDisplayValue() + " end =" + gdtEnd.getDisplayValue());
			} else {
				var agentTimeZone = userTZMap[user];
				var userTZOffset = this.getTimezoneOffset(agentTimeZone);
				availability.rating = Math.abs(taskTZOffset - userTZOffset);
				if( availability.rating == 0) {
					availability.displayValue = 0;
					availability.detailedDisplayValue = "No availability as no overlap with task timezone";
				}
				else {
					availability.displayValue = availability.rating / MS_IN_HOUR;
					var detailedHourTag = availability.displayValue == 1 ? "Hour" : "Hours";
					availability.detailedDisplayValue = availability.displayValue + " " + detailedHourTag;
				}
			}
			availability.value = availability.rating / MS_IN_HOUR;
			if (maxAvailability < availability.rating)
				maxAvailability = availability.rating;
			var hourTag = availability.displayValue == 1 ? "hour" : "hours";
			availability.displayValue += " " + hourTag;
			if(new CSMUtil().isDebugOn())
				gs.log(grAgent.getDisplayValue() + " getAgentAvailability::availability=" + JSON.stringify(availability));
			
			availabilityMap[user] = availability;
		}
		return availabilityMap;
	},
	
	getGlideEndTime : function() {
		var gdt = new GlideDateTime();
		var gsdt = new GlideScheduleDateTime();
		gsdt.setEndOfDay();
		return gsdt.getGlideDateTime();
	},
	
	getTimezoneOffset : function(timezone) {
		var gsdt = new GlideScheduleDateTime();
		gsdt.setTimeZone(timezone);
		var gdt = new GlideDateTime();
		gdt.setTZ(gsdt.getTimeZone());
		var value = gdt.getTZOffset();
		if(new CSMUtil().isDebugOn())
			gs.log("getTimezoneOffset= " + value + " timezone=" + timezone);
		return value;
	},
	
	type: 'MatchingDimensionAvailability'
};