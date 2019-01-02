var AgentScheduleAjax = Class.create();

var AGENT_CONFIG = "agent_schedule_user_pref";
var AGENT_CONFIG_REL_TASK_CONFIG = "agent_schedule_task_config_rel_user_pref";
var TASK_CONFIG = "agent_schedule_task_config";
var PERSONAL_SCHEDULE = "agent_events";
var WORK_SCHEDULE = "agent_work_schedule";

AgentScheduleAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	initialize: function(request, responseXML, gc) {
		this.request = request;
        this.responseXML = responseXML;
        this.gc = gc;
		this.configSwitches = {};
    },
	
	updateAgentEventTime: function(){
		var result = {};
		var startDateNum = this.getParameter("sysparm_start_date");
		var endDateNum = this.getParameter("sysparm_end_date");
		var eventID = this.getParameter("sysparm_event_id");
		if(JSUtil.nil(startDateNum) && JSUtil.nil(endDateNum) && JSUtil.nil(eventID)){
			result.success = false;
			result.info = "Start Date or End Date or Event ID is not present";
		}else{
			var startDate = new GlideDateTime();
			startDate.setValue(startDateNum);
			var endDate = new GlideDateTime();
			endDate.setValue(endDateNum);
			
			var user = gs.getUserID();
			
			var agentEventGR = new GlideRecord("agent_events");
			agentEventGR.addQuery("user",user);
			agentEventGR.query();
			while(agentEventGR.next()){
				var personal_schedule = agentEventGR.getValue("personal_schedule");
				var scheduleEntryGR = new GlideRecord("cmn_schedule_span");
				scheduleEntryGR.addQuery("schedule",personal_schedule);
				scheduleEntryGR.addQuery("sys_id",eventID);
				scheduleEntryGR.query();
				if(scheduleEntryGR.getRowCount()>0){
					while(scheduleEntryGR.next()){
						scheduleEntryGR.start_date_time = startDate.getValue();
						scheduleEntryGR.end_date_time = endDate.getValue();
						scheduleEntryGR.update();
					}
					result.success = true;		
				}else{
					result.success = false;
					result.info = "Event is not found";
				}
			}
		}
		return new JSON().encode(result);
	},
	
	getAgentEvents : function(){
		var startDateNum = this.getParameter("sysparm_start_date");
		var startDate = null;
		if(!JSUtil.nil(startDateNum))
		{
			startDate = new GlideDateTime();
			startDate.setDisplayValue(startDateNum);
		}
		var endDateNum = this.getParameter("sysparm_end_date");
		var endDate = null;
		if(!JSUtil.nil(endDateNum))
		{
			endDate = new GlideDateTime();
			endDate.setDisplayValue(endDateNum);
		}
		var user = gs.getUserID();
		var agentScheduleUtil = new AgentScheduleUtil();
		var scheduleData = agentScheduleUtil.getTimeOffSpans(user, startDate, endDate);
		var timeoffSpans = [];
		for(var i =0 ;i < scheduleData.length; i++){
			var timeoffData = scheduleData[i];
			var timeOffObj = {};
			timeOffObj.name = timeoffData.name;
			timeOffObj.table_name = "cmn_schedule_span";
			timeOffObj.sys_id = timeoffData.sys_id;
			timeOffObj.event_id = timeoffData.event_id;
			timeOffObj.text = SNC.GlideHTMLSanitizer.sanitize(timeoffData.name);
			timeOffObj.start_date = timeoffData.start_date.convertTimeZone(timeoffData.timezone, GlideSession.get().getTimeZoneName());
			timeOffObj.end_date = timeoffData.end_date.convertTimeZone(timeoffData.timezone, GlideSession.get().getTimeZoneName());
			timeOffObj.color = "#d6d6d6";
			timeOffObj.textColor = "black";
			timeOffObj.type = "event";
			timeOffObj.headerLabel = gs.getMessage("Event");
			timeOffObj.headerName = gs.getMessage("Event");
			timeOffObj.selected = false;
			timeOffObj.bordercolorVal = "#848484";
			timeOffObj.backGrdcolorVal = "#d6d6d6";
			timeOffObj.theme = "Gray";
			timeoffSpans.push(timeOffObj);
		}
		
		var agentTasks = this.getAgentTasks(user, startDate, endDate);
		for( i =0 ;i < agentTasks.length; i++){
			var timeoffData = agentTasks[i];
			var timeOffObj = {};
			timeOffObj.name = timeoffData.number;
			timeOffObj.table_name = timeoffData.table;
			timeOffObj.table_name_display = timeoffData.tableName;
			timeOffObj.sys_id = timeoffData.sys_id;
			timeOffObj.event_id = timeoffData.sys_id;
			timeOffObj.text = SNC.GlideHTMLSanitizer.sanitize(timeoffData.number);
			timeOffObj.desc = timeoffData.desc;
			timeOffObj.start_date = timeoffData.start_date;
			timeOffObj.end_date = timeoffData.end_date;
			timeOffObj.theme = timeoffData.theme;
			timeOffObj.bordercolorVal = timeoffData.bordercolorVal;
			timeOffObj.backGrdcolorVal = timeoffData.backGrdcolorVal;
			timeOffObj.color = timeoffData.backGrdcolorVal;
			timeOffObj.textColor = "black";
			timeOffObj.type = "task";
			timeOffObj.headerLabel = SNC.GlideHTMLSanitizer.sanitize(timeoffData.label);
			timeOffObj.headerName = SNC.GlideHTMLSanitizer.sanitize(timeoffData.name);
			timeOffObj.read_only = true;
			timeOffObj.selected = false;
			timeoffSpans.push(timeOffObj);
		}
		
		var result = {};
		result.timeoffSpans = timeoffSpans;
		result.configSwitches = this.configSwitches;
		result.personalSchedule = {};
		
		var personalScheduleGR = agentScheduleUtil.getAgentPersonalSchedule(user);
		if(personalScheduleGR.getRowCount() == 0){
			var personalScheduleID = this.createPersonalSchedule(user);
			if(personalScheduleID){
				var agentPersonalScheduleConfigID = this.createPersonalScheduleConfig(user,personalScheduleID);
					if(agentPersonalScheduleConfigID){
						var agentEventGR = new GlideRecord("agent_events");
						agentEventGR.addQuery("user",user);
						agentEventGR.query();
						if(agentEventGR.next()){
							result.personalSchedule["name"] = agentEventGR.getDisplayValue("personal_schedule");
							result.personalSchedule["sys_id"] = agentEventGR.getValue("sys_id");
						}
					}
			}else{
				result.personalSchedule["success"] = false;
				result.personalSchedule["info"] = "Personal Schedule was not created";					  
			}	
		}else{
			personalScheduleGR.next();
			result.personalSchedule["name"] = personalScheduleGR.getDisplayValue("personal_schedule");
			result.personalSchedule["sys_id"] = personalScheduleGR.getValue("sys_id");
		}
		return new JSON().encode(result);
	},
	createPersonalSchedule:function(user){
		var personalScheduleID = "";
		if(user){
			var userGR = new GlideRecord("sys_user"); 
			userGR.addQuery('sys_id',user);
			userGR.query();
			if(userGR.next()){
				var personalScheduleGR = new GlideRecord('cmn_schedule');
				personalScheduleGR.initialize();
				personalScheduleGR.setValue('name',userGR.getValue('name')+" Personal Schedule");
				personalScheduleID = personalScheduleGR.insert();
			}
		}	
			return personalScheduleID;
	},
		
	createPersonalScheduleConfig:function(user,personalScheduleID){
		var agentPersonalScheduleConfigID = "";
		if(user && personalScheduleID){
			var agentEventGR = new GlideRecord('agent_events'); 
			agentEventGR.initialize();
			agentEventGR.setValue('user',user);
			agentEventGR.setValue('personal_schedule',personalScheduleID);
			agentPersonalScheduleConfigID = agentEventGR.insert();
		}
		return agentPersonalScheduleConfigID;
	},
	getAgentCalendarConfig : function(user) {
		var configGR = new GlideRecordSecure("agent_schedule_user_pref");
		var agentCond = configGR.addQuery("user",user);
		//agentCond.addOrCondition("user","6816f79cc0a8016401c5a33be04be441");
		configGR.query();
		
		if(configGR.getRowCount() == 0){
			var configId = this.createAgentConfig(user);
			if(configId){
				//this.createAgentConfigTaskConfigRel(configId);
				configGR = new GlideRecordSecure("agent_schedule_user_pref");
				configGR.addQuery('sys_id',configId);
				configGR.query();
			}
		}
		
		var config = {};
		while(configGR.next()){
			if(configGR.user != gs.getUserID() && configGR.getRowCount() > 1)
				continue;
			this.createAgentConfigTaskConfigRel(configGR.getValue("sys_id"));
			config.name = configGR.getValue('name');
			config.sys_id = configGR.getValue("sys_id");
			config.tasks = [];
			var configTaskGR = new GlideRecordSecure("agent_schedule_task_config_rel_user_pref");
			configTaskGR.addQuery("config", configGR.getValue("sys_id"));
			configTaskGR.query();
			while(configTaskGR.next()){
				var taskConfigRecord = new GlideRecord("agent_schedule_task_config");
				//taskConfigRecord.get(configTaskGR.getValue("task_config"));
				if(taskConfigRecord.get(configTaskGR.getValue("task_config"))){
					if((taskConfigRecord.getValue("task_table") != 'agent_work_schedule' &&  taskConfigRecord.getValue("task_table") != 'cmn_schedule_span')){
						var taskConfig = {};
						taskConfig.name = taskConfigRecord.getValue("name");
						taskConfig.user_field = taskConfigRecord.getValue("task_user_field");
						taskConfig.display_field = taskConfigRecord.getValue("display_field");
						taskConfig.table = taskConfigRecord.getValue("task_table");
						taskConfig.filter = taskConfigRecord.getValue("task_filter");
						taskConfig.start_date_field = taskConfigRecord.getValue("start_date_field");
						taskConfig.end_date_field = taskConfigRecord.getValue("end_date_field");
						taskConfig.label = taskConfigRecord.getValue("label");
						taskConfig.active = configTaskGR.getValue("active");
						taskConfig.relID = configTaskGR.getValue('sys_id');
						taskConfig.theme = taskConfigRecord.getDisplayValue('color_theme');
						taskConfig.bordercolorVal = taskConfigRecord.getValue('border_color');
						taskConfig.backGrdcolorVal = taskConfigRecord.getValue('background_color');
						config.tasks.push(taskConfig);
					}
				}
			}

			if(configGR.user == gs.getUserID())
				this.configSwitches = config;
			break;
		}
		return config;
		
	},
	
	// creating a user config should run as admin process
	createAgentConfig:function(userID){
		var configId = "";
		if(userID){
			var userGR = new GlideRecord("sys_user"); 
			userGR.addQuery('sys_id',userID);
			userGR.query();
			if(userGR.next()){
				var userConfigGR = new GlideRecord('agent_schedule_user_pref');
				userConfigGR.initialize();
				userConfigGR.setValue('name',userGR.getValue('name')+" Schedule Config");
				userConfigGR.setValue('user',userID);
				configId = userConfigGR.insert();
			}
		}
		return configId;
	},
	
	//creating a relationship entry should run as admin process
	createAgentConfigTaskConfigRel:function(configID){
		var relIDarr = [];
		if(configID){
			var taskConfigGR = new GlideRecord(TASK_CONFIG);
			taskConfigGR.query();
			while(taskConfigGR.next()){
				//check wether logged in user has access to task table in task Config
				var taskTableGR = new GlideRecordSecure(taskConfigGR.getDisplayValue('task_table'));
				
				//check TaskConfig entry for user config
				var relGREntryPresent = false;
				var relGREntry = new GlideRecord(AGENT_CONFIG_REL_TASK_CONFIG);
				relGREntry.addQuery('config',configID);
				relGREntry.addQuery('task_config',taskConfigGR.getValue('sys_id'));
				relGREntry.query();
				if(relGREntry.next()){
					relGREntryPresent = true;
				}
				
				if(taskTableGR.canRead() && !relGREntryPresent){
					var relGR = new GlideRecord(AGENT_CONFIG_REL_TASK_CONFIG);
					relGR.initialize();
					relGR.setValue('config',configID);
					relGR.setValue('task_config',taskConfigGR.getValue('sys_id'));
					var relID = relGR.insert();
					if(relID)
						relIDarr.push(relID);
				}else if(!taskTableGR.canRead() && relGREntryPresent){
					relGREntry.deleteRecord();
				}
			}
		}
		return relIDarr;
	},
	getAgentTasks : function(user, startDate, endDate) {
		var tasks = [];
		var config = this.getAgentCalendarConfig(user);
		if(!config.tasks)
			return [];
		for(var i = 0; i < config.tasks.length; i++) {
			var taskConfig = config.tasks[i];
			if(taskConfig.active == "1" && ((taskConfig.table != 'agent_work_schedule' &&  taskConfig.table != 'cmn_schedule_span'))){
				var taskGR = new GlideRecord(taskConfig.table);
				taskGR.addActiveQuery();
				var query = taskConfig.start_date_field+">=" + startDate + "^"+taskConfig.start_date_field+"<=" + endDate;
				query += "^NQ"+taskConfig.end_date_field+">=" + startDate + "^"+taskConfig.end_date_field+"<=" + endDate;
				query += "^NQ"+taskConfig.start_date_field+"<=" + startDate + "^"+taskConfig.end_date_field+">=" + endDate;
				taskGR.addEncodedQuery(query);
				taskGR.addEncodedQuery(taskConfig.user_field + "=" + user);
				taskGR.addEncodedQuery(taskConfig.filter);
				taskGR.query();
				while(taskGR.next()){
					var task = {};
					task.table = taskGR.getTableName();
					task.sys_id = taskGR.getValue("sys_id");
					task.number = taskGR.getDisplayValue(taskConfig.display_field);
					task.desc = taskGR.getDisplayValue("short_description");
					task.start_date = taskGR.getDisplayValue(taskConfig.start_date_field);
					task.end_date = taskGR.getDisplayValue(taskConfig.end_date_field);
					task.theme = taskConfig.theme;
					task.bordercolorVal = taskConfig.bordercolorVal;
					task.backGrdcolorVal = taskConfig.backGrdcolorVal;
					task.label = taskConfig.label; 
					task.name = taskConfig.name;
					tasks.push(task);
					
				}
			}	
		}
		return tasks;
	},
	getAgentWorkSchedule: function(){
		var startDateNum = this.getParameter("sysparm_start_date");
		var startDate = null;
		if(!JSUtil.nil(startDateNum))
		{
			startDate = new GlideDateTime();
			startDate.setDisplayValue(startDateNum);
		}
		var endDateNum = this.getParameter("sysparm_end_date");
		var endDate = null;
		if(!JSUtil.nil(endDateNum))
		{
			endDate = new GlideDateTime();
			endDate.setDisplayValue(endDateNum);
			endDate.addDaysUTC(1);
		}
		var user = gs.getUserID();
		if(new CSMUtil().isDebugOn())
			gs.log("getAgentWorkSchedule: " + startDate + " endDate=" + endDate + " user=" + user);
		var agentScheduleUtil = new AgentScheduleUtil();
		var scheduleData = agentScheduleUtil.getWorkSchedule(user, startDate, endDate);
		var availSpans = [];
		
		while(!JSUtil.nil(scheduleData) && scheduleData.hasNext()){
			var schedObj = {};
			var timeSpan = scheduleData.next();
			schedObj.timezone = agentScheduleUtil.getUserTZ(user);
			schedObj.startMS = timeSpan.getStart().getMS();
			schedObj.endMS = timeSpan.getEnd().getMS();
			schedObj.startDisplay = timeSpan.getStart().convertTimeZone(schedObj.timezone, GlideSession.get().getTimeZoneName());
			schedObj.endDisplay = timeSpan.getEnd().convertTimeZone(schedObj.timezone, GlideSession.get().getTimeZoneName());
			availSpans.push(schedObj);
		}
			
		return new JSON().encode(availSpans);
	},
	updateConfigFlag : function(){
		var result = {};
		var relId = this.getParameter('sysparm_rel_ID');
		var value = this.getParameter('sysparm_active_flag_value');
		var configTaskGR = new GlideRecord("agent_schedule_task_config_rel_user_pref");
			configTaskGR.addQuery("sys_id", relId);
			configTaskGR.query();
		if(configTaskGR.next()){
			configTaskGR.setValue("active",value);
			configTaskGR.update();
			result.success = true;
			result.info = "Config is updated";
		}else{
			result.success = false;
			result.info = "Config is not found";
		}
		return new JSON().encode(result);
	},
	updateNavStack : function(){
		var result = {};
		var mode = this.getParameter('sysparm_mode');
		var date = this.getParameter('sysparm_date');
		var app = this.getParameter('sysparm_app');
		var sessionObj = gs.getSession();
		var navStack = sessionObj.getStack();
		var agentScheduleUrl = navStack.pop();
		navStack.push('$'+app+'.do?sysparm_mode='+mode+'&sysparm_date='+date);
		return new JSON().encode(result);
	},
    type: 'AgentScheduleAjax'
});