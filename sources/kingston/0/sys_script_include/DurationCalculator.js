var DurationCalculator = Class.create();
DurationCalculator.prototype = {
	
	initialize: function() {
		this.startDateTime = this._getGDT();
		this.endDateTime = this._getGDT();
		this.schedule = null;
		this.timezone = gs.getSession().getTimeZoneName();
		this.seconds = 0;
		this.totalSeconds = 0;
		this.lu = new GSLog('com.glide.relative_duration.log', this.type);
	},
	
	// for date comparisons
	DATE_IS_BEFORE: -1,
	DATE_IS_AFTER:  1,
	DATE_IS_SAME:   0,
	
	/**
 	* Set the schedule and time zone to be used for calculating the due date
 	*/
	setSchedule: function(/*String*/ schedID, /*String optional*/ timezone) {
		this.scheduleID = schedID;
		if (!schedID) {
			this.schedule = null;
			this.timezone = gs.getSession().getTimeZoneName();
			return;
		}
		
		if (!timezone)
			timezone = "";
		
		this.schedule = new GlideSchedule(schedID, timezone);
		if (!timezone)
			timezone = this.schedule.getTimeZone();
		
		this.setTimeZone(timezone);
		this.lu.logDebug('setSchedule: ' + this.schedule.getName() + ' [' + timezone + ']');
	},
	
	setTimeZone: function(/*String*/ timezone) {
		if (timezone)
			this.timezone = timezone;
		else if (this.schedule && this.schedule.getTimeZone())
			this.timezone = this.schedule.getTimeZone();
		else
			this.timezone = gs.getSession().getTimeZoneName();
	},
	
	/**
 	* Set the start date/time for the duration calculations
 	*  (expects a value in GMT)
 	*
 	* If 'start' is blank, use current date/time
 	*/
	setStartDateTime: function(/*GlideDateTime or String*/ start) {
		this.startDateTime = this._getGDT(start);
	},
	
	/**
 	* Get the this.endDateTime property that was set by calcDuration/calcRelativeDuration
 	* indicating the end date and time for the duration.
 	*/
	getEndDateTime: function() {
		return this.endDateTime;
	},
	
	/**
 	* Get the this.seconds property that was set by calcDuration/calcRelativeDuration
 	* indicating the total number of seconds of work to be performed for the duration.
 	*
 	* (Note: this is the total work time, not the total time between start and end times
 	* and may be used to determine percentages of the work time)
 	*/
	getSeconds: function() {
		return this.seconds;
	},
	
	/**
 	* Get the this.totalSeconds property that was set by calcDuration/calcRelativeDuration
 	* indicating the total number of seconds between the start and end times of the duration.
 	*/
	getTotalSeconds: function() {
		return this.totalSeconds;
	},
	
	/**
 	* Get the (actual) duration, between startTime and endTime, within the already specified schedule
 	* (and optionally overridden timezone)
 	* Sets this.endDateTime (for completeness), this.seconds, and this.totalSeconds.
 	* NB. returns 0 if endTime is before startTime
 	*/
	calcScheduleDuration: function(/* GlideDateTime or String */ startTime, /* GlideDateTime or String */ endTime) {
		// (use existing values, if not provided)
		if (endTime)
			this.endDateTime = this._getGDT(endTime);
		if (!startTime)
			startTime = this.startDateTime;
		else
			startTime = this._getGDT(startTime);
		
		this.totalSeconds = this._totalSeconds(startTime, this.endDateTime);
		if (this.schedule)
			this.seconds = this.schedule.duration(startTime, this.endDateTime, this.timezone).getNumericValue() / 1000;
		else
			this.seconds = this.totalSeconds;
		return this.seconds;
	},
	
	/**
 	* Calculate the end date and time.
 	*
 	* Upon completion this.endDateTime, this.seconds and this.totalSeconds properties
 	* will be set to indicate the results of the calculation
 	*/
	calcDuration: function(/*int*/ seconds) {
		this.seconds = parseInt(seconds, 10);
		if (isNaN(this.seconds))
			return false;
		
		// calculate the duration using seconds
		this.totalSeconds = this.seconds;
		if (!this.schedule) {
			this.lu.logDebug('calcDuration: no schedule, adding ' + this.seconds + 's to ' + this.startDateTime.getDisplayValueInternal());
			this.endDateTime = this._getGDT(this.startDateTime);
			this.endDateTime.addSeconds(this._adjustForDST(this.endDateTime,this.seconds));
			this.endDateTime.addSeconds(this.seconds);
			this.lu.logDebug('calcDuration: leaves us at ' + this.endDateTime.getDisplayValueInternal());
		} else {
			this.lu.logDebug('calcDuration: using schedule ' + this.schedule.getName() + ', adding ' + this.seconds + 's to ' + this.startDateTime.getDisplayValueInternal());
			var dur = this._getGDur(this.seconds * 1000);
			this.endDateTime = this.schedule.add(this.startDateTime, dur, this.timezone);
			this.endDateTime.addSeconds(this._adjustForDST(this.endDateTime,this.seconds));
			this.totalSeconds = this._totalSeconds(this.startDateTime, this.endDateTime);
			this.lu.logDebug('calcDuration: leaves us at ' + this.endDateTime.getDisplayValueInternal());
		}
		return true;
	},
	
	/**
 	* Calculate the duration using the specified relative duration script.
 	*
 	* Upon completion the this.endDateTime and this.seconds properties will
 	* be set to indicate the results of the calculation
 	*/
	calcRelativeDuration: function(/*String*/ relativeDurationID) {
		this.seconds = 0;
		this.totalSeconds = 0;
		this.endDateTime = this._getGDT(this.startDateTime);
		var gr = new GlideRecord('cmn_relative_duration');
		gr.addQuery('sys_id', relativeDurationID);
		gr.query();
		if (!gr.next()) {
			return false;
		}
		
		var gc = GlideController;
		gc.putGlobal('calculator', this);
		var rc = gc.evaluateString(gr.script);
		// ensure that this.totalSeconds is set even if the
		// calculation script didn't assign it
		if (!this.totalSeconds)
			this.totalSeconds = this.seconds;
		return rc;
	},
	
	/**
 	* Is 'time' of day after the time of day specified by 'dt'?
 	*
 	* if 'dt' is blank, use this.startDateTime
 	*
 	*    time is specified as hh:mm:ss
 	*/
	isAfter: function(/*GlideDateTime*/ dt, /*String hh:mm:ss*/ tm) {
		var gdt;
		if (!dt)
			gdt = new GlideDateTime(this.startDateTime);
		else
			gdt = new GlideDateTime(dt);
		
		// use GlideScheduleDateTime to get the timezone object for the timezone we're using
		var gsdt = new GlideScheduleDateTime();
		gsdt.setTimeZone(this.timezone);
		
		// Get the "tm" time string into a GlideDateTime object which will help to parse it for us
		// and set the date to be the same as that from the start date/time (dt)
		var isAfterGdt = new GlideDateTime();
		isAfterGdt.setTZ(gsdt.getTimeZone());
		isAfterGdt.setDisplayValueInternal(gdt.getLocalDate().getValue() + " " + tm);
		
		// if we didn't manage to parse it then getDate() will return null and we'll assume false
		if (isAfterGdt.getDate() === null)
			return false;
		
		// if we have a schedule and the supplied GlideDateTime is not in schedule get the next
		// date/time inside the schedule
		if (this.schedule && !this.schedule.isInSchedule(gdt))
			gdt.add(this.schedule.whenNext(gdt, this.timezone));
		
		return gdt.getNumericValue() > isAfterGdt.getNumericValue();
	},
	
	/**
 	* Called from relative duration definitions, initiated by calcRelativeDuration(), as
 	*    calculator.calcRelativeDueDate(calculator.startDateTime, days);
 	*
 	* Calculate the due date starting at 'start' and adding 'days' using the
 	* schedule and time zone.  When we find the day that the work is due on,
 	* set the time to 'endTime' of that day.
 	*
 	* If there are not enough days left in the schedule, use the last day in the schedule
 	* return false, if there were no days in the schedule
 	*
 	*    endTime is specified as "hh:mm:ss" or blank to indicate the end of
 	*    the work day
 	*
 	* Upon completion, this.endDateTime, this.seconds and this.totalSeconds properties will be set
 	* to indicate the results of the calculation.
 	*/
	calcRelativeDueDate: function(/*GlideDateTime*/ start, /*int*/ days, /*String*/ endTime) {
		// Strategy:
		//    get a chunk of days from the schedule & walk the map, counting the days as we go
		//    (get more chunks as needed)
		//    when we have all the days we need, we have our target end date
		//    if we run out of days, then use the last day in the schedule
		//
		//    if endTime is specified,
		//       convert endTime to seconds and add to our target end date
		//    else
		//       get the end time from the current entry in the time map
		//       keep looking for more entries in the time map for the same target end date
		//          using that entry's end time
		//       convert endTime to seconds and add to our target end date
		this.seconds = 0;
		this.totalSeconds = 0;
		this.endDateTime = this._getGDT(this.startDateTime);
		
		if (!this.schedule) {
			// No schedule, just add the specified number of days
			this._addDays(days, endTime); // (sets this.seconds, this.totalSeconds, this.endDateTime)
			return;
		}
		
		var startDate = new GlideDateTime(start);
		var startOfDay = this._findStartOfDay(startDate);
		var timeMap = this._timeMapNext(startOfDay, this.timezone, this.schedule);
		if (timeMap.isEmpty())
			return false;
		var daysNeeded = days + 1;
		
		var activeSpan = timeMap.next();
		var spanStart = activeSpan.getStart();
		var day = spanStart;
		
		var activeEnd = this._activeEndDate(activeSpan);
		var daysLeftInActive = day.getIntegerDate().daysDiff(activeEnd) + 1;
		if (daysLeftInActive >= daysNeeded) {
			// if we want 0 days, we must avoid going back one day
			if (daysNeeded > 0) {
				day.addDays(daysNeeded-1);
			}
			daysNeeded = 0;
		}
		else {
			daysNeeded -= daysLeftInActive;
			day.addDays(daysLeftInActive);
			daysLeftInActive = 0;
		}
		while (daysLeftInActive < daysNeeded) {
			if (!timeMap.hasNext()) {
				startDate.setDisplayValue(day.getIntegerDate().getDisplayValue());
				timeMap = this._timeMapNext(startDate, this.timezone, this.schedule);
				if (!timeMap.hasNext()) {
					// no more timespans in this schedule, so set date back to the end of the last span
					// and we're done
					this.lu.logInfo('calcRelativeDueDate: ran out of time, looking for day=' + day.getDisplayValue());
					day = activeSpan.getEnd();
					break;
				}
			}
			activeSpan = timeMap.next();
			activeEnd = this._activeEndDate(activeSpan);
			this.lu.logDebug('calcRelativeDueDate: day=' + day + '; activeSpan=' + activeSpan);
			var date = day.getIntegerDate(); // NB. day is reassigned, below
			if (date.compareTo(activeEnd) == this.DATE_IS_AFTER)
				continue;
			if (date.compareTo(activeSpan.getStart().getIntegerDate()) == this.DATE_IS_BEFORE) {
				day = activeSpan.getStart();
			}
			this.lu.logDebug('calcRelativeDueDate: day=' + day);
			daysLeftInActive = day.getIntegerDate().daysDiff(activeEnd) + 1;
			if (daysLeftInActive >= daysNeeded) {
				day.addDays(daysNeeded-1);
				daysNeeded = 0;
			}
			else {
				daysNeeded -= daysLeftInActive;
				day.addDays(daysLeftInActive);
				daysLeftInActive = 0;
			}
		}
		// day is the (ScheduleDateTime) day we were looking for
		var endDay = day;
		endDay.setBeginningOfDay();
		var endSeconds;
		if (!endTime)
			endSeconds = this._findEndOfDay(activeSpan, timeMap);
		else
			endSeconds = this._timeToSeconds(endTime);
		endDay.addSeconds(this._adjustForDST(endDay, endSeconds));
		endDay.addSeconds(endSeconds);
		this.lu.logDebug('calcRelativeDueDate: endDay=' + endDay);
		this.endDateTime = endDay.getGlideDateTime();
		var scheduleDur = this.schedule.duration(this.startDateTime, this.endDateTime, this.timezone);
		this.seconds = Math.floor(scheduleDur.getNumericValue() / 1000);
		this.totalSeconds = this._totalSeconds(this.startDateTime, this.endDateTime);
		return true;
	},
	
	_adjustForDST: function (/*GlideScheduleDateTime*/ sdt, /*String*/ secs) {
		if (!sdt || !secs)
			return 0;
		
		var dsCheck = new GlideScheduleDateTime(sdt.getGlideDateTime());
		var timeZone = dsCheck.getTimeZone();
		dsCheck.setBeginningOfDay();
		var dsAtStartOfDay = dsCheck.getGlideDateTime().isDST(); // were we in daylight savings at the start of the day
		
		dsCheck.addSeconds(secs);
		var dsForTargetDate = dsCheck.getGlideDateTime().isDST(); // is our target date in daylight savings
		
		if (dsAtStartOfDay != dsForTargetDate)// We are on the day of switch-over
			if (dsAtStartOfDay)
			return 3600;
		else
			return -3600;
		
		return 0;
	},
	
	_timeMapNext: function(gStartDate, timezone, schedule) {
		var gEndDate = new GlideDateTime(gStartDate);
		gEndDate.addDays(90); // get up to 90 days of spans, at a time
		var timeMap = schedule.getTimeMap(gStartDate, gEndDate, timezone);
		if (this.lu.debugOn())
			timeMap.dumpTimeMapTZ();
		return timeMap;
	},
	
	_activeEndDate: function(activeSpan) {
		var activeEnd = activeSpan.getEnd().getIntegerDate();
		if (activeSpan.getEnd().getIntegerTime().getIntegerTimeValue() === 0)
			activeEnd.addDays(-1); // ends at midnight, so one less day
		return activeEnd;
	},
	
	/**
 	* Add days to start time to get end time and then set seconds between start and end
 	*/
	_addDays: function(/*int*/ days, /*String*/ endTime) {
		var sdt = this._getSDT(this.startDateTime);
		sdt.setTimeZone(this.timezone);
		var cal = sdt.getCal();
		cal.add(5, days);
		sdt.setCal(cal);
		sdt.setBeginningOfDay();
		if (!endTime)
			endTime = "23:59:59";
		
		var secs = this._timeToSeconds(endTime);
		sdt.addSeconds(this._adjustForDST(sdt, secs));
		sdt.addSeconds(secs);
		this.endDateTime = sdt.getGlideDateTime();
		this.seconds = gs.dateDiff(this.startDateTime.getDisplayValue(), this.endDateTime.getDisplayValue(), true);
		this.totalSeconds = this.seconds;
	},
	
	_findStartOfDay: function(/*GlideDateTime*/ startDate) {
		var startOfDay = this._getSDT(startDate);
		startOfDay.setBeginningOfDay();
		return startOfDay.getGlideDateTime();
	},
	
	/**
 	* Find the timeMap entry that has the latest end time for the specified span
 	* and the return the time of day as seconds since midnight
 	*/
	_findEndOfDay: function(/*ScheduleDateTimeSpan*/ span, /*ScheduleTimeMap*/ timeMap) {
		var h = 23;
		var m = 59;
		var s = 59;
		var endDay = span.getStart();
		do {
			var e = span.getEnd().getIntegerDate();
			if (endDay.getIntegerDate().compareTo(e) != this.DATE_IS_SAME)
				break;
			
			var t = span.getEnd().getIntegerTime();
			h = t.getHour();
			m = t.getMinute();
			s = t.getSecond();
			span = timeMap.next();
		} while (span);
		
		return (h * 3600) + (m * 60) + s;
	},
	
	// returns 0 if endTime is before startTime
	_totalSeconds: function(/* GlideDateTime */ startTime, /* GlideDateTime */ endTime) {
		return Math.max(0, (Math.floor(endTime.getNumericValue()/1000) - Math.floor(startTime.getNumericValue()/1000) ));
	},
	
	/**
 	* Convert a string time (hh:mm:ss) to seconds since midnight
 	*/
	_timeToSeconds: function(/*String*/ tm) {
		var h = 0;
		var m = 0;
		var s = 0;
		var parts = tm.split(":");
		h = parseInt(parts[0], 10);
		if (parts.length > 1)
			m = parseInt(parts[1], 10);
		
		if (parts.length > 2)
			s = parseInt(parts[2], 10);
		
		if (isNaN(h))
			h = 0;
		if (isNaN(m))
			m = 0;
		
		if (isNaN(s))
			s = 0;
		
		return (h * 3600) + (m * 60) + s;
	},
	
	/**
 	* Create and return a GlideDateTime object
 	*/
	_getGDT: function(value) {
		if (value)
			return new GlideDateTime(value);
		else
			return new GlideDateTime();
	},
	
	/**
 	* Create and return a ScheduleDateTime object
 	*/
	_getSDT: function(/*GlideDateTime optional*/gdt) {
		var sdt;
		if (gdt)
			sdt = new GlideScheduleDateTime(gdt);
		else
			sdt = new GlideScheduleDateTime();
		
		sdt.setTimeZone(this.timezone);
		return sdt;
	},
	
	/**
 	* Create and return a GlideDuration object
 	*/
	_getGDur: function(dur) {
		if (dur)
			return new GlideDuration(dur);
		else
			return new GlideDuration(0);
	},
	
	type: 'DurationCalculator'
};