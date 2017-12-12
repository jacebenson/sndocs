var AgentScheduleUtil = Class.create();
AgentScheduleUtil.prototype = {
    initialize: function() {
    },
    
    getUsersTZ : function (users) {
    	var timezoneMap = {};
    	var user = new GlideRecord("sys_user");
		user.addEncodedQuery("sys_idIN" + users.join());
		user.query();
		while(user.next()) {
			var timeZone = user.getValue("time_zone");
			if(JSUtil.nil(timeZone))
			{
				timeZone = GlideUser.getSysTimeZone();
			}
			timezoneMap[user.getValue("sys_id")] = timeZone;	
		}
		return timezoneMap;
    },
	
	getUserTZ : function (userID){
		var timeZoneMap = this.getUsersTZ([userID]);
		return timeZoneMap[userID];
	},
	
	getScheduleFromUsersProfile : function(users, startDate, endDate) {
		var userGR = new GlideRecord("sys_user");
		userGR.addEncodedQuery("sys_idIN" + users.join());
		userGR.query();
		var userScheduleMap = {};
		while(userGR.next()) {
			if(!userGR.getValue("schedule")) {
				if(new CSMUtil().isDebugOn())
					gs.log("getScheduleFromUsersProfile : No schedule defined for " + userGR.getValue("name"));
				userScheduleMap[userGR.getValue("sys_id")] = null;
			}
			else{
				var workScheduleObj = {};
				var start_date = new GlideDateTime(startDate);
				workScheduleObj.from_date = start_date;
				var end_date = new GlideDateTime(endDate);
				workScheduleObj.to_date = end_date;
				workScheduleObj.work_schedule = userGR.getValue("schedule");
				userScheduleMap[userGR.getValue("sys_id")] = workScheduleObj;
			}
		}

		return userScheduleMap;
	},
	
	getScheduleFromUserProfile : function(user, startDate, endDate) {
		var scheduleMap = this.getScheduleFromUsersProfile([user], startDate, endDate);
		return scheduleMap[user];
	},
	
	_getWorkScheduleQuery : function (startDate, endDate) {
		var query = "from_date<=" + startDate + "^to_date>=" + startDate;
		query += "^NQfrom_date<=" + endDate + "^to_date>=" + endDate;
		query += "^NQfrom_date>=" + startDate + "^to_date<=" + endDate;
		
		return query;
	},
	
	getWorkSchedulesFromDBForUsers : function(users, startDate, endDate) {
		var shiftGR = new GlideRecord("agent_work_schedule");
		
		var query = this._getWorkScheduleQuery(startDate, endDate);
		
		shiftGR.addEncodedQuery(query);
		shiftGR.addEncodedQuery("userIN" + users.join());
		shiftGR.addEncodedQuery("type=0");
		shiftGR.query();
		var userSchedulesMap = {};
		var timezoneMap = this.getUsersTZ(users);
		
		while(shiftGR.next()) {
			var user = shiftGR.getValue("user");
			var userTZ = timezoneMap[user];
			var time_zone = Packages.java.util.TimeZone.getTimeZone(userTZ);
			var workScheduleObj = {};
			var start_date = new GlideDateTime();
			start_date.setTZ(time_zone);
			start_date.setDisplayValue(shiftGR.getValue("from_date"));
			if(start_date < startDate)
				start_date = startDate;
			workScheduleObj.from_date = start_date;
			var end_date = new GlideDateTime();
			end_date.setTZ(time_zone);
			end_date.setDisplayValue(shiftGR.getValue("to_date"));
			end_date.addDaysUTC(1);
			if(end_date > endDate)
				end_date = endDate;
			workScheduleObj.to_date = end_date;
			workScheduleObj.work_schedule = shiftGR.getValue("work_schedule");
			var schedules = [];
			if(userSchedulesMap.hasOwnProperty(user))
				schedules = userSchedulesMap[user];
				
			schedules.push(workScheduleObj);
			userSchedulesMap[user] = schedules;
		}	
		var noWorkSchedulesUsers = [];
		for(var i = 0;i < users.length; i++) {
			var user = users[i];
			if(!userSchedulesMap[user])
				noWorkSchedulesUsers.push(user);
		}
		if(noWorkSchedulesUsers.length > 0){
			var userProfileScheduleMap = this.getScheduleFromUsersProfile(noWorkSchedulesUsers, startDate, endDate);
			for(var i = 0;i < noWorkSchedulesUsers.length; i++) {
				var schedules = [];
				if(userProfileScheduleMap[noWorkSchedulesUsers[i]]!=null)
					schedules.push(userProfileScheduleMap[noWorkSchedulesUsers[i]]);
				userSchedulesMap[noWorkSchedulesUsers[i]] = schedules;
			}
			
		}
		return userSchedulesMap;
	},
	
	getWorkSchedulesFromDB : function(user, startDate, endDate) {
		if(new CSMUtil().isDebugOn())
			gs.log("getWorkSchedulesFromDB startDate:" + startDate + " endDate:" + endDate + " user=" + user);
		var userSchdedulesMap = this.getWorkSchedulesFromDBForUsers([user], startDate, endDate);
		return userSchdedulesMap[user];
		
	},
	
	getDurationFromTimeMap : function(timeMap, startDate, endDate){
		if (timeMap.isEmpty()) {
			return new GlideDuration(0);
		}
		
		var timeSpent = 0;
		var startTime = new GlideScheduleDateTime(startDate).getMS();
		var endTime = new GlideScheduleDateTime(endDate).getMS();		
		while (timeMap.hasNext()) {
			var span = timeMap.next();
			if (endTime < span.getStart().getMS()) 
				break; 	// all done
			
			if (startTime < span.getStart().getMS()) 
				startTime = span.getStart().getMS(); // Current start time is BEFORE the next span's start time - move it up
			
			if (startTime < span.getEnd().getMS()) {
				// We are within this span, update time spent in this span
				if (span.getEnd().getMS() <= endTime) 
					timeSpent += (span.getEnd().getMS() - startTime);
				else {
					timeSpent += (endTime - startTime);
					break;
				}
				
				startTime = span.getEnd().getMS();
			}
		}
		return new GlideDuration(timeSpent);
		
	},
	
	getDuration : function (user, startDate, endDate) {
		var userDurationMap = this.getDurationForUsers([user], startDate, endDate);
		return userDurationMap[user];
	},
	
	getDurationForUsers : function (users, startDate, endDate) {
		var userDurationMap = {};
		var userTimeMap = this.getAvailabilityMapForUsers(users, startDate, endDate);
		for(var i=0;i<users.length;i++) {
			var user = users[i];
			var timeMap = userTimeMap[user];
			if(timeMap)
			{
				var duration = this.getDurationFromTimeMap(timeMap, startDate, endDate);
				userDurationMap[user] = duration;
			}
			else
				userDurationMap[user] = null;
		}
		
		return userDurationMap;
	},
	
	getAvailabilityMapForUsers : function(users, startDate, endDate) {
		var userWorkSchedules = this.getWorkSchedulesFromDBForUsers(users, startDate, endDate);
		var userTimeOffs = this.getTimeOffSpansForUsers(users, startDate, endDate);
		var userTZMap = this.getUsersTZ(users);
		
		var userAvailabilityMap = {};
		var scheduleCache = {};
		
		for(var i=0;i<users.length;i++) {
			var user = users[i];
			var workSchedules = userWorkSchedules[user];
			var timeOffSpans = userTimeOffs[user];
			var userTZ = userTZMap[user];
			if(workSchedules.length == 0) {
				if(new CSMUtil().isDebugOn())
					gs.log("getDuration no work schedules");
				userAvailabilityMap[user] = null; //Caller should should check for the null
			}
			else {
				var timeMap = new GlideScheduleTimeMap();
				for(var j = 0; j < workSchedules.length; j++){
					var workSchedule = workSchedules[j];
					var schedule = new GlideSchedule(workSchedule.work_schedule);
					schedule.setTimeZone(userTZ);
					var schedTimeMap = schedule.getTimeMap(workSchedule.from_date, workSchedule.to_date);
					while(schedTimeMap.hasNext())
						timeMap.addInclude(schedTimeMap.next());
				}
				
				for(var k = 0; k < timeOffSpans.length; k++){
					var timeOffObj = timeOffSpans[k];
					if(timeOffObj.show_as == "busy")
						timeMap.addExclude(timeOffObj.span);
				}
				timeMap.buildMap(userTZ);
				userAvailabilityMap[user] = timeMap;
			}
		}
		return userAvailabilityMap;
	},
	
	getAvailabilityMap : function(user, startDate, endDate) {
		var availabilityMap = this.getAvailabilityMapForUsers([user], startDate, endDate);
		return availabilityMap[user];
	},
	
	getWorkSchedule : function(user, startDate, endDate) {
		if(new CSMUtil().isDebugOn())
			gs.log("getWOrkSchedule: " + startDate + " " + endDate);
		var workScheduleTimeMap = this.getWorkScheduleForUsers([user], startDate, endDate);
		return workScheduleTimeMap[user];
	},
	
	getWorkScheduleForUsers : function (users, startDate, endDate) {
		var workSchedulesMap = this.getWorkSchedulesFromDBForUsers(users, startDate, endDate);
		var workScheduleTimeMap = {};
		var timezoneMap = this.getUsersTZ(users);
		var scheduleCache = {};
		for(var i = 0; i < users.length ; i++) {
			var user = users[i];
			var workSchedules = workSchedulesMap[user];
			if(workSchedules.length == 0) {
				if(new CSMUtil().isDebugOn())
					gs.log("getWorkScheduleForUsers no work schedules for user " + user);
				workScheduleTimeMap[user] = null; //Caller should should check for the null
			}
			else {
				var timeMap = new GlideScheduleTimeMap();	
				var userTZ = timezoneMap[user];
				for(var j = 0; j < workSchedules.length; j++){
					var workSchedule = workSchedules[j];
					var schedule = new GlideSchedule(workSchedule.work_schedule);
					schedule.setTimeZone(userTZ);
					var schedTimeMap = schedule.getTimeMap(workSchedule.from_date, workSchedule.to_date);
					while (schedTimeMap.hasNext())
						timeMap.addInclude(schedTimeMap.next());
				}
				timeMap.buildMap(userTZ);
				workScheduleTimeMap[user] = timeMap;
			}
		}
		
		return workScheduleTimeMap;
	
	},

	getTimeOffAsScheduleSpans : function (user, startDate, endDate) {
		var retTimeOffSpans = [];
		var schedSpans = this.getTimeOffSpans(user, startDate, endDate);
		var userTZ = this.getUserTZ(user);
		for(var i=0;i<schedSpans.length;i++){
			if(schedSpans[i].show_as == "busy") {
				var schedDateTimeSpan = schedSpans[i].span;
				retTimeOffSpans.push(schedDateTimeSpan);
			}
		}
		return retTimeOffSpans;
	},
	
	getTimeOffSpansForUsers : function (users, startDate, endDate) {
		var userSpansMap = {};
		var scheduleUserMap = {};
		var agentEventGR =  this.getAgentsPersonalSchedule(users);
		var userTZMap = this.getUsersTZ(users);
		if(agentEventGR){
			var personalSchedules = [];
			while(agentEventGR.next()){
				var user = agentEventGR.getValue("user");
				var personal_schedule = agentEventGR.getValue("personal_schedule");
				personalSchedules.push(personal_schedule);
				scheduleUserMap[personal_schedule] = user;
				userSpansMap[user] = [];
			}
			var eventConfigGR = new GlideRecord("agent_schedule_task_config");
			eventConfigGR.get("c34d27e37fa32200c57212f44efa9162");
			var displayFiled = eventConfigGR.getValue("display_field");
			
			var scheduleEntryGR = new GlideRecord("cmn_schedule_span");
			scheduleEntryGR.addEncodedQuery("scheduleIN"+personalSchedules.join());
			scheduleEntryGR.addActiveQuery();
			scheduleEntryGR.query();
			while(scheduleEntryGR.next()){
				var schedule = scheduleEntryGR.getValue("schedule");
				var user = scheduleUserMap[schedule];
				var userTZ = userTZMap[user];
				var name = scheduleEntryGR.getDisplayValue("name");
				var text = scheduleEntryGR.getDisplayValue(displayFiled);
				var sys_id = scheduleEntryGR.getUniqueValue();
				var start_date = new GlideScheduleDateTime(startDate);
				var end_date = new GlideScheduleDateTime(endDate);
				var schedDateTimeSpan = new GlideScheduleTimeSpan(scheduleEntryGR, userTZ);
				var schedSpans = schedDateTimeSpan.getSpans(start_date, end_date);
				schedSpans = j2js(schedSpans);
				for(var i=0;i<schedSpans.length;i++){
					var timeOffObj = {};
					timeOffObj.name = name;
					timeOffObj.sys_id = sys_id;
					timeOffObj.event_id = sys_id + "_" + i;
					timeOffObj.text = text;
					timeOffObj.timezone = userTZ;
					timeOffObj.start_date = schedSpans[i].getStart();
					timeOffObj.end_date = schedSpans[i].getEnd();
					timeOffObj.origin_start_date = schedSpans[i].getActualStart();
					timeOffObj.origin_end_date = schedSpans[i].getActualEnd();
					timeOffObj.show_as = scheduleEntryGR.getValue("show_as");
					timeOffObj.span = schedSpans[i];
					userSpansMap[user].push(timeOffObj);
				}
			}
		}
		return userSpansMap;
	},
	
	getTimeOffSpans : function (user, startDate, endDate) {
		var timeOffSpanMap = this.getTimeOffSpansForUsers([user], startDate, endDate);
		return timeOffSpanMap[user];
	},
	
	getAgentsPersonalSchedule : function(users){
		var agentEventGR = "";
		var userScheduleMap = {};
		if(users){
			agentEventGR = new GlideRecord("agent_events");
			agentEventGR.addEncodedQuery("userIN"+users.join());
			agentEventGR.query();
		}
		return agentEventGR;
	},
	
	
	getAgentPersonalSchedule : function(user){
		return this.getAgentsPersonalSchedule([user]);
	},
	
	createPersonalSchedule : function(user){
		var personalScheduleID = "";
		if (user) {
			var userGR = new GlideRecord("sys_user");
			userGR.addQuery('sys_id', user);
			userGR.query();
			if (userGR.next()) {
				var personalScheduleGR = new GlideRecord('cmn_schedule');
				personalScheduleGR.initialize();
				personalScheduleGR.setValue('name', userGR.getValue('name') + " Personal Schedule");
				if(userGR.getValue('time_zone'))
					personalScheduleGR.setValue('time_zone',userGR.getValue('time_zone'));
				personalScheduleID = personalScheduleGR.insert();
				if(personalScheduleID)
					this.createPersonalScheduleConfig(user, personalScheduleID);
			}
		}
		return personalScheduleID;
	},
	
	createPersonalScheduleConfig : function (user, personalScheduleID) {
		var agentPersonalScheduleConfigID = "";
		if (user && personalScheduleID) {
			var agentEventGR = new GlideRecord('agent_events');
			agentEventGR.initialize();
			agentEventGR.setValue('user', user);
			agentEventGR.setValue('personal_schedule', personalScheduleID);
			agentPersonalScheduleConfigID = agentEventGR.insert();
		}
		return agentPersonalScheduleConfigID;
	},
	
	getloggedinAgentConfig:function(){
		var currentUserConfig = "";
		var agentConfigRecord = new GlideRecord("agent_schedule_user_pref");
		agentConfigRecord.addQuery("user",gs.getUserID());
		agentConfigRecord.query();
		if(agentConfigRecord.next()){
			currentUserConfig = agentConfigRecord.getValue("sys_id");
		}
		return currentUserConfig;
	},
	
	isReporteeEvent:function(gr){
		var answer = false;
		if(JSUtil.notNil(gr)){
			var personalSchedule = gr.getValue('schedule');
			if(personalSchedule){
				var agentEvents = new GlideRecord('agent_events');
				agentEvents.addQuery('personal_schedule',personalSchedule);
				agentEvents.setLimit(1);
				agentEvents.query();
				if(agentEvents.next()){
					var user = agentEvents.getValue('user');
					var manager = gs.getUserID();
					var memGR = new GlideRecord('sys_user_grmember');
					memGR.addQuery("group.manager", manager);
					memGR.addQuery("user",user);
					memGR.addActiveQuery();
					memGR.query();
					if(memGR.getRowCount() > 0){
						answer = true;
					}
				}
			}
		}
		return answer;
	},

    type: 'AgentScheduleUtil'
};