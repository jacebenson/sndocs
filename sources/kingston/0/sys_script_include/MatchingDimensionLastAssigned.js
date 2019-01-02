var MatchingDimensionLastAssigned = Class.create();

var MS_IN_HOUR = 3600 * 1000;

MatchingDimensionLastAssigned.prototype = {
	initialize: function() {
	},
	
	process : function(task, users, taskFieldValues, args){
		var returnUsers = {};
		var userTaskStats = new GlideRecord("user_task_stats");
		userTaskStats.addQuery("userIN" + users.join());
		userTaskStats.orderBy("last_work_assigned");
		userTaskStats.query();
		var lastWorkedMax = 0;
		while(userTaskStats.next()){
			var gdt = new GlideDateTime();
			gdt.setDisplayValue(userTaskStats.getDisplayValue("last_work_assigned"));

			var ratingObj = {};
			var lastWorked = userTaskStats.last_work_assigned.getGlideObject().getNumericValue();;
			ratingObj.value = this.getDurationSinceLastAssigned(gdt, userTaskStats.user);
			if (ratingObj.value > lastWorkedMax)
				lastWorkedMax = ratingObj.value;
			ratingObj.rating = ratingObj.value;

			ratingObj.displayValue = this.getTimeAgo(gdt);
			ratingObj.detailedDisplayValue = userTaskStats.getDisplayValue("last_work_assigned");
			returnUsers[userTaskStats.user] =  ratingObj;
		}
		lastWorkedMax = lastWorkedMax * 10; //So that agent with lastWorkedMax never gets rating 1
		for(var i=0;i<users.length;i++){
			if(!returnUsers.hasOwnProperty(users[i])) {
				var ratingObj = {};
				ratingObj.rating = 1.0; 
				ratingObj.displayValue = "never assigned";
				ratingObj.detailedDisplayValue = "never assigned";
				returnUsers[users[i]] = ratingObj;
			} else {
				returnUsers[users[i]].rating = 
					returnUsers[users[i]].rating / lastWorkedMax;
				returnUsers[users[i]].lastWorkedMax = lastWorkedMax;
				
			}
		}
		return returnUsers;
	},
	
	getTimeAgo:function(glidedatetime){
		if(glidedatetime){
			var timeago = new GlideTimeAgo();
			return timeago.format(glidedatetime);
		}
		return "";
	},
	
	getDurationSinceLastAssigned : function(gdtLastWorkAssigned, agentID) {
		var gdtNow = new GlideDateTime();
		var durationSinceLastUsed = gdtNow.getNumericValue() - gdtLastWorkAssigned.getNumericValue();
		return durationSinceLastUsed / MS_IN_HOUR;
	},
	
	getDurationSinceLastAssignedPerSchedule : function(gdtLastWorkAssigned, agentID) {
		var grAgent = new GlideRecordSecure("sys_user");
		grAgent.get(agentID);
		var durationSinceLastUsed = 8; //Default
		var gdtNow = new GlideDateTime();
		var matchingDimensionUtil = new MatchingDimensionUtil();
		var schedule = matchingDimensionUtil.getAgentSchedule(agentID);
		var agentTimeZone = matchingDimensionUtil.getAgentTimeZone(agentID);

		if (schedule) {
			var sched = new GlideSchedule(schedule, agentTimeZone);
			var durationGD = sched.duration(gdtLastWorkAssigned, gdtNow, agentTimeZone);
			if (durationGD.getNumericValue())
				durationSinceLastUsed = durationGD.getNumericValue() / MS_IN_HOUR;	
		}
		if(new CSMUtil().isDebugOn())
			gs.log("MatchingDimensionLastAssigned::getDurationSinceLastUsed =" + durationSinceLastUsed +
			   " hours gdtLastWorkAssigned=" + gdtLastWorkAssigned.getDisplayValue() + " now=" + gdtNow.getDisplayValue() + 
			   " schedule=" + sched.getName() + " agentTimeZone=" + 
			   JSON.stringify(agentTimeZone) + " agent=" + grAgent.getDisplayValue() + " agentID=" + agentID);

		return durationSinceLastUsed;
	},
			
	type: 'MatchingDimensionLastAssigned'
};