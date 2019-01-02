var DownloadICS = Class.create();
DownloadICS.prototype = {
    initialize: function(request, response, processor) {
		this.processor = processor;
		this.request = request;
		this.response = response;
		this.type = this.request.getParameter("sysparm_type");
		if(this.type == "holiday"){
			this.year = this.request.getParameter("sysparm_year");
			this.calendar = this.request.getParameter("sysparm_calendar");
		}else{
			this.sys_id = this.request.getParameter("sysparm_sys_id");
		}
		this.isFirefox = this.request.getParameter("sysparm_browserid");
		var icsString=" ";
		this.events = [];
    },
	
	process: function(){
		if(this.type == "holiday"){
			this._downloadHolidayICS(this.year,this.calendar);
			this.response.setContentType("text/calendar; charset=UTF-8");
			if(this.isFirefox == "true")
				this.response.setHeader("Content-Disposition", "inline; filename=Holidays_"+this.year+".ics");
			else
				this.response.setHeader("Content-Disposition", "inline; filename=Holidays "+this.year+".ics");
			this.processor.writeOutput(this.icsString);
			return;
		}else if(this.sys_id == "null"){
			this._downloadEventICS(this.sys_id);
			this.response.setContentType("text/calendar; charset=UTF-8");
			if(this.isFirefox == "true")
				this.response.setHeader("Content-Disposition", "inline; filename=All_Upcoming_Events.ics");
			else
				this.response.setHeader("Content-Disposition", "inline; filename=All Upcoming Events.ics");
			this.processor.writeOutput(this.icsString);
			return;
		}else{
			this._downloadEventICS(this.sys_id);
			this.response.setContentType("text/calendar; charset=UTF-8");
			if(this.isFirefox == "true"){
				var eventName = this.events[0].name.replace(/ /g,"_")+".ics";
				this.response.setHeader("Content-Disposition", "inline; filename="+eventName);
			}
			else	
				this.response.setHeader("Content-Disposition", "inline; filename="+this.events[0].name+".ics");
			this.processor.writeOutput(this.icsString);
		}
		
	},

	_downloadHolidayICS: function (year,calendarId) { 
		var gdt = new GlideDateTime();	
		var calendars = [];											 
		var allCalendars = sn_hr_sp.hr_PortalContent.getAllCalendars(); 								 
		for(var i = 0 ; i < allCalendars.links.length; i++){
			if(calendarId == allCalendars.links[i].document.toString()){
				calendars.push(allCalendars.links[i]);
			}
		}											 
													 
													 
		var yearItems = [];
													
		if (calendars.length > 0) {
			var firstCalendar = calendars[0];
			var gr = new GlideRecord(firstCalendar.table);
			if (gr.get(firstCalendar.document)) {
				if (year == gdt.getYearUTC().toString()) {
					var start = new GlideDateTime();
					var end = new GlideDateTime();
					end.setMonthLocalTime(12);
					end.setDayOfMonthLocalTime(31); // end of this year
					this._calculateSpans(yearItems, gr, start, end);
				}
				else { 
					var start = new GlideDateTime();
					var end = new GlideDateTime();
					end.setMonthLocalTime(12);
					end.setDayOfMonthLocalTime(31);
					start.addYearsLocalTime(1);
					start.setMonthLocalTime(1);
					start.setDayOfMonthLocalTime(1); // Jan 1st next year
					end.addYearsLocalTime(1); // end of next year
					yearItems = end.getYearLocalTime();
					this._calculateSpans(yearItems, gr, start, end);
				}
			}
		}
	},
	
	_calculateSpans:function(items, schedule, start, end) {
		var timeSpan = new GlideRecord('cmn_schedule_span');
		timeSpan.addQuery('schedule', schedule.sys_id);
		timeSpan.query();
		while (timeSpan.next()) {
			var timeSpans = new global.HRSecurityUtilsAjax().getScheduleTimeSpans(timeSpan, start, end);
			for (var i = 0; i < timeSpans.length; i++) {
				var dateTime = timeSpans[i].start;
				var calDateTime = new global.HRSecurityUtilsAjax().getCalendarDateTime(dateTime);
				var calEventTime ="T"+calDateTime.toString().split("T")[1];
				this.events.push({
					name: timeSpans[i].name,
					calStartTime: calEventTime,
					calEndTime:calEventTime
				});
			}
		}
		this._createEventDownload(this.events);
	},
	
	_downloadEventICS : function(sysID){
		var links = sn_hr_sp.hr_PortalContent.getHRLinksByContentType(sn_hr_sp.hr_PortalContent.EVENT_CONTENT_TYPE,sn_hr_sp.hr_PortalContent.EVENT_WIDGET_NAME);
		if(sysID != "null"){
		for (var i = 0; i < links.length; i++) {
			if(sysID == links[i].sys_id){
				var startDateTime = new GlideDateTime(links[i]['event_start']); 
				var calStartTime = new global.HRSecurityUtilsAjax().getCalendarDateTime(startDateTime);
				var endDateTime = new GlideDateTime(links[i]['event_end']);
				var calEndTime = new global.HRSecurityUtilsAjax().getCalendarDateTime(endDateTime);
				var title = links[i]['title'];
				var regex = /(<([^>]+)>)/ig;
				var result = links[i]['rich_text'].replace(regex, "\\n");
				result = result.replace(/&nbsp;/g,'');
				result = result.replace(/(?:\r\n|\r|\n)/g, '');
				var cleanEventText = result;
				this.events.push({
					calStartTime : calStartTime,
					calEndTime : calEndTime,
					name : title,
					sysID : links[i].sys_id,
					event_details:cleanEventText
				});
				this._createEventDownload(this.events);
				}
			}
		}else{
				for (var i = 0; i < links.length; i++){
					var startDateTime = new GlideDateTime(links[i]['event_start']); 
					var calStartTime = new global.HRSecurityUtilsAjax().getCalendarDateTime(startDateTime);
					var endDateTime = new GlideDateTime(links[i]['event_end']);
					var calEndTime = new global.HRSecurityUtilsAjax().getCalendarDateTime(endDateTime);
					var title = links[i]['title'];
					var regex = /(<([^>]+)>)/ig;
					var result = links[i]['rich_text'].replace(regex, "\\n");
					result = result.replace(/&nbsp;/g,'');
					result = result.replace(/(?:\r\n|\r|\n)/g, '');
					var cleanEventText = result;
					
					this.events.push({
						calStartTime : calStartTime,
						calEndTime : calEndTime,
						name : title,
						event_details:cleanEventText
				});
				}
				this._createEventDownload(this.events);
			}
		},
	
	_createEventDownload : function(events){

		this.icsString = "BEGIN:VCALENDAR\n"+
		"VERSION:2.0\n"+
		"CALSCALE:GREGORIAN\n";
		
		for(var i = 0 ; i < this.events.length ; i++){
			var event =
			"BEGIN:VEVENT\n"+
			"SUMMARY:" + this.events[i].name+ "\n"+
			"DTSTART;"+this.events[i].calStartTime+"\n"+
			"DTEND;"+this.events[i].calEndTime+"\n"+
			"DESCRIPTION:" + this.events[i].event_details+ "\n"+
			"STATUS:CONFIRMED\n"+
			"SEQUENCE:3\n"+
			"BEGIN:VALARM\n"+
			"TRIGGER:-PT10M\n"+
			"DESCRIPTION:Pickup Reminder\n"+
			"ACTION:DISPLAY\n"+
			"END:VALARM\n"+
			"END:VEVENT\n";

			this.icsString +=event;
		}

		this.icsString += "END:VCALENDAR";
	},

    type: 'DownloadICS'
};
