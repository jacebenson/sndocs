var MatchingDimensionUtil = Class.create();
MatchingDimensionUtil.prototype = {
    initialize: function() {
    },

	getUsersInSchedule : function (candidates){
		var inScheduleCandidates = [];
		var notInScheduleCandidates = [];
		var arrayUtil = new global.ArrayUtil();

		var agents = new GlideRecord("sys_user");
		agents.addEncodedQuery("sys_idIN"+candidates.join());
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
		
		var candidatePerSchedule = {};
		candidatePerSchedule.inScheduleCandidates = inScheduleCandidates;
		candidatePerSchedule.notInScheduleCandidates = notInScheduleCandidates;
		//var finalCandidates = arrayUtil.diff(candidates, notInScheduleCandidates);
		return candidatePerSchedule;
	},
	
	getAgentTimeZone : function(agentID) {
		var user = new GlideRecord("sys_user");
		user.get(agentID);
		var timeZone = user.getValue("time_zone");
		if(JSUtil.nil(timeZone)) {
			timeZone = GlideUser.getSysTimeZone();
		}
		return timeZone;
	},

	getAgentSchedule : function(agentID) {
		var user = new GlideRecord("sys_user");
		user.get(agentID);
		var schedule = user.getValue("schedule");
		if (JSUtil.nil(schedule)) {
			schedule = "08fcd0830a0a0b2600079f56b1adb9ae"; //8-5 weekdays
		}
		return schedule;
	},
	
	logAnalytics: function(data) {
		if(AnalyticsFramework.isDisabled())
			return;		
		var streamId = "com.snc.assignment_workbench";
		var obfuscationList = [];
		data["app.name"] = "assignment_workbench";
		status = AnalyticsFramework.open(streamId);
		if (status === 0) {
			status = AnalyticsFramework.sendJSON(streamId, obfuscationList, JSON.stringify(data));
			status = AnalyticsFramework.close(streamId);
		}
		if(new CSMUtil().isDebugOn())
			gs.log("logAnalytics streamId=" + streamId + " data=" + JSON.stringify(data));
	},
	
    type: 'MatchingDimensionUtil'
};