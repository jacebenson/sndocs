var CalendarRESTHelper = Class.create();
CalendarRESTHelper.prototype = {

    initialize: function() {
        this.response =  {};
        this.EVENT_CONFIG_TABLE = "agent_schedule_task_config";
        this.USER_AND_EVENT_CONFIG_REL_TABLE = "agent_schedule_task_config_rel_user_pref";
        this.USER_CONFIG_TABLE = "agent_schedule_user_pref";
        this.GRP_MEMBER_TABLE = "sys_user_grmember";
        this.USER_MAX_EVENTS = 100;
		this.USER_TABLE = "sys_user";
		this.VISIBLE_EXTERNALLY = "8201666b0b7003004502ab5c37673adb";
		this.VISIBLE_INTERNALLY = "a6a0666b0b7003004502ab5c37673aef";
    },
	
	getUserInfo: function(user){
		var userInfo = {};
		var personalScheduleId = this.getUserSchedule(user);
		if(personalScheduleId)
			userInfo['personal_schedule_id'] = personalScheduleId;
		return userInfo;
	},
	
	getUserSchedule : function(user) {
		var personalScheduleId = "";
		if (JSUtil.nil(user)){
			user = gs.getUserID();
		}	
		var agentScheduleUtil = new AgentScheduleUtil();
		var personalScheduleGR = agentScheduleUtil.getAgentPersonalSchedule(user);
		if (personalScheduleGR && personalScheduleGR.hasNext()) {
			personalScheduleGR.next();
			personalScheduleId = personalScheduleGR.getValue("personal_schedule"); 
		} else {
			personalScheduleId = agentScheduleUtil.createPersonalSchedule(user);
		}
		return personalScheduleId;
	},
	getGroups:function(user){
		var enable = gs.getProperty("team_calendar.enable_for_grpmember");
		if (JSUtil.nil(user)) 
			user = gs.getUserID();
        var gr = new GlideAggregate(this.GRP_MEMBER_TABLE);
		var queryString = "group.manager=" + user;
		if (enable=="true") {
			queryString += "^NQgroup.typeLIKE" + this.VISIBLE_EXTERNALLY;
			queryString += "^NQgroup.typeLIKE" + this.VISIBLE_INTERNALLY;
			queryString += "^user=" + user;
		}
		gr.orderBy("group.name");
		gr.groupBy("group");
		gr.addActiveQuery();
		gr.addEncodedQuery(queryString);
		gr.chooseWindow(0,99);
		 // maximum 100 Groups are supported;
		gr.query();
		var groupIds=[];
		
		while(gr.next()){
 			//var sys_id = gr.group.sys_id;
			var groupObj = {
							'id':gr.group.sys_id,
							'name': gr.group.name
						   };
			groupIds.push(groupObj);
		}
		return groupIds;
	},
	
	getGroupEvents: function (groupIdsString, startDateNum, endDateNum, userStart, userEnd) {
		var teamMembersObj = this.getTeamMembers(groupIdsString, userStart, userEnd);
		var result = {};
		result["users"] = {};
		if ( JSUtil.notNil(teamMembersObj) && JSUtil.notNil(teamMembersObj.users) ) {
			result["users"] = teamMembersObj.users;
			var eventsObj = {};
			var usersObj = teamMembersObj.users;
			for (var user in usersObj) {
				events = this.getUserEvents(startDateNum, endDateNum, user, gs.getUserID());
				eventsObj[user] = {'events': events};
			}
			this.response['events'] = eventsObj;
		} else {
			this.response['events'] = {};
		}
		return this.response;
	},
	
	getTeamMembers: function(groupIdsString, userStart, userEnd) {
		var users = {};
		var groupDetails = {};
		var userDetails = {};
		var memGR = new GlideRecordSecure(this.GRP_MEMBER_TABLE);
		
		if (userStart && userEnd)
			memGR.chooseWindow(userStart, userEnd, false);
		memGR.addQuery("group","IN",groupIdsString);
		memGR.orderBy("user.name");
		memGR.addActiveQuery();
		memGR.setLimit(35); //Maximum 35 users are supported. Should improve by including pagination
		memGR.query();
		
		while(memGR.next()){
			if (memGR.user && users[memGR.user.sys_id]) {
				groupDetails = {};
				groupDetails.id = memGR.group.sys_id;
				groupDetails.name = memGR.group.name;
				users[memGR.user.sys_id].groups.push(groupDetails);
			} else {
				userDetails = {};
				groupDetails = {};
				userDetails.name = memGR.user.name;
				userDetails.initials =  this.getUserInitials(memGR.user.name);
				userDetails.isLoaded = true;
				userDetails.userId = memGR.user.sys_id;
				userDetails.userImage = memGR.user.photo.getDisplayValue();
				if (userDetails.userImage) {
					userDetails.userImage = userDetails.userImage + "?t=small";
				}
				userDetails.path = this.USER_TABLE + ".do?sys_id=" + memGR.user.sys_id;
				groupDetails.id = memGR.group.sys_id;
				groupDetails.name = memGR.group.name;
				userDetails.groups = [];
				userDetails.groups.push(groupDetails);
				users[memGR.user.sys_id] = userDetails;
				
			}
		}
        this.response["users"] = users;
        return this.response;
    },
	
	getUserInitials:function(name){
		if (!name)
			return "--";

		var initials = name.split(" ").map(function(word) {
			return word.toUpperCase();
		}).filter(function(word) {
			return word.match(/^[A-Z]/);
		}).map(function(word) {
			return word.substring(0,1);
		}).join("");
		return (initials.length > 3)? initials.substr(0, 3): initials;
	},
	
     getConfigurations: function(user) {
        var userConfig = this.getUserConfigurations(user);
        var configurations = [];
        for (var i in userConfig.records) {
            var configObj = userConfig.records[i];
            var calendarConfig = {};
            calendarConfig["id"] = configObj.relID;
            calendarConfig["active"] = configObj.active;
            calendarConfig["name"] = configObj.name;
            calendarConfig["label"] = configObj.label;
            calendarConfig["border_color"] = configObj.bordercolorVal;
            calendarConfig["background_color"] = configObj.backGrdcolorVal;
            calendarConfig["target_table"] = configObj.table;
            calendarConfig["can_edit_events"] = configObj.can_edit_events;
            calendarConfig["can_create_events"] = configObj.can_create_events;
            calendarConfig["can_toggle_active"] = configObj.can_toggle_active;
            calendarConfig["hidden"] = configObj.hidden;
            calendarConfig["text_color"] = "black";
            calendarConfig["are_background_events"] = configObj.are_background_events;
			calendarConfig["sysparm_query"] = configObj.sysparm_query;
			calendarConfig["view"] = configObj.view;
			calendarConfig["start_date_field"] = configObj.start_date_field;
			calendarConfig["end_date_field"] = configObj.end_date_field;
            configurations.push(calendarConfig);
        }
        this.response["configurations"] = configurations;
        return this.response;
    },

    updateConfiguration: function(id, value){
        var result = {};
        var configTaskGR = new GlideRecord(this.USER_AND_EVENT_CONFIG_REL_TABLE);
        if(configTaskGR.get(id)){
            configTaskGR.setValue("active", value);
            configTaskGR.update();
            return true;
        }else
            return false;
    },

    getEvents: function(startDateNum, endDateNum, users) {
        var events = [];
        var userArray = [];

        if(typeof users === "object")
            users = users[0];

        if (JSUtil.notNil(users)) {
            userArray = users.split(",");
            if (userArray.length > 0) {
                for(var i in userArray) {
					var user = userArray[i];
                    events = this.getUserEvents(startDateNum, endDateNum, user, gs.getUserID());
                    var result = {"events": events};
                    this.response[user] = result;
                }
            }
        } else {
			 events = this.getUserEvents(startDateNum, endDateNum, gs.getUserID());
             this.response["events"] = events;
		}
        return this.response;
    },

    getUsers: function(tableName, encodedQuery, userFieldName) {
        var gr = new GlideRecordSecure(tableName);
        gr.addEncodedQuery(encodedQuery);
        gr.query();
        var users = "";

        while (gr.next()) {
            var user = gr.getElement(userFieldName);
            users = users + user.sys_id + ",";
         }
    },

    updateEvent: function(eventID, startDateNum, endDateNum, user){
        var startDate = new GlideDateTime();
        startDate.setDisplayValue(startDateNum);
        var endDate = new GlideDateTime();
        endDate.setDisplayValue(endDateNum);
        var userEventGR = new GlideRecord("agent_events");
        userEventGR.addQuery("user",user);
        userEventGR.query();
        if(userEventGR.next()){
            var personal_schedule = userEventGR.getValue("personal_schedule");
            var scheduleEntryGR = new GlideRecord("cmn_schedule_span");
            scheduleEntryGR.addQuery("schedule",personal_schedule);
            scheduleEntryGR.addQuery("sys_id",eventID);
            scheduleEntryGR.query();
            if(scheduleEntryGR.getRowCount()>0){
                while(scheduleEntryGR.next()){
                    scheduleEntryGR.start_date_time = startDate.getDisplayValue();
                    scheduleEntryGR.end_date_time = endDate.getDisplayValue();
                    scheduleEntryGR.update();
                }
                return true;
            }
            return false;
        }
    },

    getUserConfig: function (user) {
        var configGR = new GlideRecordSecure(this.USER_CONFIG_TABLE);
        configGR.addQuery("user",user);
        configGR.query();
        if(configGR.getRowCount() == 0){
            var configId = this.createUserConfig(user);
            if(configId){
                configGR = new GlideRecordSecure(this.USER_CONFIG_TABLE);
                configGR.addQuery("sys_id",configId);
                configGR.query();
            }
        }
        return configGR;
    },

    getUserConfigurations : function(user) {
        var configGR = this.getUserConfig(user);
        var config = {};
        if(configGR.next()){
            this.createUserAndEventConfigRel(configGR.getValue("sys_id"));
            config.name = configGR.getValue("name");
            config.sys_id = configGR.getValue("sys_id");
            config.records = [];
            var configTaskGR = new GlideRecordSecure(this.USER_AND_EVENT_CONFIG_REL_TABLE);
            configTaskGR.addQuery("config", configGR.getValue("sys_id"));
            configTaskGR.query();
            while(configTaskGR.next()){
                var taskConfigRecord = new GlideRecord(this.EVENT_CONFIG_TABLE);
                if(taskConfigRecord.get(configTaskGR.getValue("task_config")) && taskConfigRecord.active){
                    var taskConfig = {};
                    taskConfig["name"] = taskConfigRecord.getDisplayValue("name");
                    taskConfig["user_field"] = taskConfigRecord.getValue("task_user_field");
                    taskConfig["display_field"] = taskConfigRecord.getValue("display_field");
                    taskConfig["table"] = taskConfigRecord.getValue("task_table");
                    taskConfig["filter"] = taskConfigRecord.getValue("task_filter");
                    taskConfig["start_date_field"] = taskConfigRecord.getValue("start_date_field");
                    taskConfig["end_date_field"] = taskConfigRecord.getValue("end_date_field");
                    taskConfig["label"] = taskConfigRecord.getDisplayValue("label");
					var val = (configTaskGR.getValue("active") == "1");
                    taskConfig["active"] = val;
                    taskConfig["relID"] = configTaskGR.getValue("sys_id");
                    taskConfig["theme"] = taskConfigRecord.getDisplayValue("color_theme");
                    taskConfig["bordercolorVal"] = taskConfigRecord.getValue("border_color");
                    taskConfig["backGrdcolorVal"] = taskConfigRecord.getValue("background_color");
                    taskConfig["can_edit_events"] = taskConfigRecord.can_edit_events;
                    taskConfig["can_create_events"] = taskConfigRecord.can_create_events;
                    taskConfig["can_toggle_active"] = taskConfigRecord.can_toggle_active;
                    taskConfig["hidden"] = taskConfigRecord.hidden;
                    taskConfig["sys_id"] = taskConfigRecord.getValue("sys_id");
                    taskConfig["setup_options"] = taskConfigRecord.setup_options;
                    taskConfig["are_background_events"] = taskConfigRecord.are_background_events;
					//for personal event add sysparm_query to personal schedule
					if (taskConfigRecord.getValue("sys_id") == 'c34d27e37fa32200c57212f44efa9162') {
						var personalschedule = this.getUserSchedule(user);
						if (personalschedule) {
							taskConfig["sysparm_query"] = "schedule="+personalschedule;
						} else {
							taskConfig["sysparm_query"] = "";
						}
						taskConfig["view"] = "Mobile_FSM";
					} else {
						taskConfig["view"] = "";
						taskConfig["sysparm_query"] = "";
					}
						
                    config.records.push(taskConfig);
                }
            }
        }
        return config;

    },

    getUserEvents : function(startDateNum, endDateNum, user, managerUser){
        var timeoffSpans = [];
        var startDate = null, endDate = null;

        if (!user) {
            user = gs.getUserID();
        }

        if(!JSUtil.nil(startDateNum))
        {
            startDate = new GlideDateTime();
            startDate.setDisplayValue(startDateNum);
        }
        if(!JSUtil.nil(endDateNum))
        {
            endDate = new GlideDateTime();
            endDate.setDisplayValue(endDateNum);
            //endDate.addDaysUTC(1);
        }

        //Restrict to a month
        var maxEndDate = new GlideDateTime();
        maxEndDate.setDisplayValue(startDate.getDisplayValue());
        maxEndDate.addMonthsLocalTime(1);
        if(endDate.compareTo(maxEndDate) > 0) {
            endDate.setDisplayValue(maxEndDate.getDisplayValue());
        }

        var events = this.computeEvents(startDate, endDate, user, managerUser);
        for( i =0 ;i < events.length; i++){
            var timeoffData = events[i];
            var timeOffObj = {};

            timeOffObj.start_date = timeoffData.start_date;
            timeOffObj.end_date = timeoffData.end_date;
            timeOffObj.start_date_display = timeoffData.start_date_display;
            timeOffObj.end_date_display = timeoffData.end_date_display;
            timeOffObj["quick_view"] = [];
            timeOffObj["quick_view"].push({"label": "Name", "value": timeoffData.number});
            if (!JSUtil.nil(timeoffData.label))
                timeOffObj["quick_view"].push({"label": "Type", "value": timeoffData.label});
            else
                timeOffObj["quick_view"].push({"label": "Type", "value": timeoffData.label});
            timeOffObj["quick_view"].push({"label": "When", "value": timeOffObj.start_date_display + " - " + timeOffObj.end_date_display});
            timeOffObj.text = SNC.GlideHTMLSanitizer.sanitize(timeoffData.number);
            timeOffObj["target_record"] = {};
            timeOffObj.target_record["sys_id"] = timeoffData.sys_id;
            timeOffObj.target_record["path"] = timeoffData.table + ".do?sys_id=" + timeoffData.sys_id;
            timeOffObj.target_record["table"] = timeoffData.table;
            timeOffObj.configuration_id = timeoffData.relID;
            timeOffObj.id = timeoffData.relID + '_' + timeoffData.sys_id;
			timeOffObj.parent_id = timeoffData.relID + '_' + timeoffData.sys_id;

            timeoffSpans.push(timeOffObj);
        }
        return timeoffSpans;
        //this.response["events"] = timeoffSpans;
        //return this.response;
    },

    computeEvents : function(startDate, endDate, user, managerUser) {
        var events = [];
        var records = [];
        var event = {};
		var eventCount = 0;
		var config;
		var value;
		if (managerUser) {
			config = this.getUserConfigurations(managerUser);
		} else 
			config = this.getUserConfigurations(user);
		
        if(!config.records)
            return [];
        for(var i in config.records) {
            var eventConfig = config.records[i];
            if(eventConfig.active && eventConfig.setup_options == "simple" ) {
                var eventGR = new GlideRecord(eventConfig.table);

				
                var query = eventConfig.start_date_field+">=" + startDate + "^"+eventConfig.start_date_field+"<=" + endDate;
                query += "^NQ"+eventConfig.end_date_field+">=" + startDate + "^"+eventConfig.end_date_field+"<=" + endDate;
                query += "^NQ"+eventConfig.start_date_field+"<=" + startDate + "^"+eventConfig.end_date_field+">=" + endDate;
                eventGR.addEncodedQuery(query);
                eventGR.addEncodedQuery(eventConfig.user_field + "=" + user);
                eventGR.addEncodedQuery(eventConfig.filter);
 				 //maximum of 100 events are supported
				eventGR.addActiveQuery();
 				eventGR.chooseWindow(0,100,false);
                eventGR.query();
                while(eventGR.next()){
                    event = {};
                    event.table = eventConfig.table;
                    event.sys_id = eventGR.getValue("sys_id");
                    event.number = eventGR.getDisplayValue(eventConfig.display_field);
                    event.desc = eventGR.getDisplayValue("short_description");
                    event.start_date_display = eventGR.getDisplayValue(eventConfig.start_date_field);
                    event.end_date_display = eventGR.getDisplayValue(eventConfig.end_date_field);
                    event.start_date = eventGR.getValue(eventConfig.start_date_field);
                    event.end_date = eventGR.getValue(eventConfig.end_date_field);
                    event.theme = eventConfig.theme;
                    event.bordercolorVal = eventConfig.bordercolorVal;
                    event.backGrdcolorVal = eventConfig.backGrdcolorVal;
                    event.label = eventConfig.label;
                    event.name = eventConfig.name;
                    event.relID = eventConfig.relID;
					event.user = eventGR.getValue(eventConfig.user_field);
                    events.push(event);
					eventCount ++;
					if(parseInt(eventCount) >= parseInt(this.USER_MAX_EVENTS))
						 return events;
                }
            } else if (eventConfig.active && eventConfig.setup_options == "script") {
                var evaluator = new GlideScopedEvaluator();
                evaluator.putVariable("users", [user]);
                evaluator.putVariable("startDate", startDate);
                evaluator.putVariable("endDate", endDate);
				evaluator.putVariable("configId",eventConfig.sys_id);
                evaluator.putVariable("result", []);

                // Now retrieve the result
                gr = new GlideRecord(this.EVENT_CONFIG_TABLE);
                if (gr.get(eventConfig.sys_id)) {
                    evaluator.evaluateScript(gr, "script", null);
                    records = evaluator.getVariable("result");
                }

                for (var j in records) {
                    event = {};
                    var record = records[j];
                    event.table = eventConfig.table;
                    event.desc = eventConfig.name;
                    event.theme = eventConfig.theme;
                    event.bordercolorVal = eventConfig.bordercolorVal;
                    event.backGrdcolorVal = eventConfig.backGrdcolorVal;
                    event.label = eventConfig.label;
                    event.name = eventConfig.name;
                    event.relID = eventConfig.relID;
                    event.sys_id = record.sys_id ? record.sys_id: "";
                    event.number = record.number ? record.number: eventConfig.name;
                    event.start_date = record.start_date ? record.start_date: "";
                    event.end_date = record.end_date ? record.end_date: "";
                    event.start_date_display = record.start_date_display ? record.start_date_display: "";
                    event.end_date_display = record.end_date_display ? record.end_date_display: "";
					event.origin_start_date = record.origin_start_date ? record.origin_start_date : "";
					event.origin_end_date = record.origin_end_date ? record.origin_end_date : "";
					event.user = record.user ? record.end_date_display : "";
                    events.push(event);
					eventCount++;
					if(parseInt(eventCount) >= parseInt(this.USER_MAX_EVENTS))
						 return events;
                }
            } 
        }
        return events;
    },

    createUserConfig:function(userID){
        if(userID){
            var userGR = new GlideRecord("sys_user");
            if(userGR.get(userID)){
                var userConfigGR = new GlideRecord(this.USER_CONFIG_TABLE);
                userConfigGR.initialize();
                userConfigGR.setValue("name", userGR.name+ " Schedule Config");
                userConfigGR.setValue("user", userID);
                return userConfigGR.insert();
            }
        }
        return "";
    },

    createUserAndEventConfigRel: function(configID){
        var relIDarr = [];
        if(configID){
            var taskConfigGR = new GlideRecord(this.EVENT_CONFIG_TABLE);
            taskConfigGR.query();
			//gs.log('Calendar Log - event config count ' + taskConfigGR.getRowCount());
            while(taskConfigGR.next()){
                //check wether logged in user has access to task table in task Config
                var taskTableGR = new GlideRecordSecure(taskConfigGR.getDisplayValue("task_table"));
				taskTableGR.newRecord();

                //check TaskConfig entry for user config
                var relGREntryPresent = false;
                var relGREntry = new GlideRecord(this.USER_AND_EVENT_CONFIG_REL_TABLE);
                relGREntry.addQuery("config",configID);
                relGREntry.addQuery("task_config",taskConfigGR.getValue("sys_id"));
                relGREntry.query();
                if(relGREntry.getRowCount() > 0 && relGREntry.next()){
                    relGREntryPresent = true;
                }

                if(taskTableGR.canRead() && !relGREntryPresent){
                    var relGR = new GlideRecord(this.USER_AND_EVENT_CONFIG_REL_TABLE);
                    relGR.initialize();
                    relGR.setValue("config",configID);
                    relGR.setValue("task_config",taskConfigGR.getValue("sys_id"));
                    var relID = relGR.insert();
                    if(relID)
                        relIDarr.push(relID);
                }else if(!taskTableGR.canRead() && relGREntryPresent){
					//gs.log(taskConfigGR.getDisplayValue("task_table") +' cannot read ' + !taskTableGR.canRead());
                    relGREntry.deleteRecord();
                } else {
					//gs.log("Calendar Log - " + ' taskTableGR.canRead() ' + taskTableGR.canRead() + ' relGREntryPresent ' + relGREntryPresent + ' User ' + relGREntry.config.user.name);
				}
            }
        }
        return relIDarr;
    },

    type: "CalendarRESTHelper"
};