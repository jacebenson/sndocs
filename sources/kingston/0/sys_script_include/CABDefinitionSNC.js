var CABDefinitionSNC = Class.create();
CABDefinitionSNC.prototype = Object.extendsObject(CABAbstractDefMeet, {
	DEFAULT_DAYS: 7776000000, // 90 days in millis
	ONE_DAY: 86400000, // 1 day in millis
	
	// Fields to copy from def to meeting.  Included here to allow override.
	COPY_FIELDS: CAB.COPY_FIELDS,
	
	initialize: function(_gr, _gs) {
		CABAbstractDefMeet.prototype.initialize.apply(this, arguments);
		
		if (!this._gr.create_meetings_for.nil())
			this._createFor = new GlideDuration((this._gr.create_meetings_for - 0) * this.ONE_DAY).getDurationValue();
        else
            this._createFor = new GlideDuration(this.DEFAULT_DAYS).getDurationValue();
	},
	
	/**
	 * Refresh the exisitng meetings in line with the cab def and spans and create any new meetings for the duration
	 */
	refreshMeetings: function() {
		// Get the latest Board members and Delegates into arrays as we'll need these
		// when creating/updating the meeetings
		var cabManager = [this.getManager()]; // Get this into an array as it helps when determining what changes we need to make
		var cabBoard = this.getAllBoardMembers();

		// Update existing meetings
		var spansStart = new GlideDateTime();
		var spansEnd = this._getLastMeetingEnd();
		
		// Grab all the future meetings, update if this is active, remove otherwise.
		if (spansEnd.after(spansStart)) {
			if (this._gr.active) {
				this._updateMeetingsBetween(spansStart, spansEnd, cabManager, cabBoard);
			} else {
				this._removeMeetingsBetween(spansStart, spansEnd);
				return;  // No need to generate anything if it's inactive.
			}
		}
		
		// Generate meetings for the duration
		spansStart = this._getLastMeetingEnd();
		spansStart.add(1000);
		spansEnd = new GlideDateTime();
		spansEnd.add(new GlideDuration(this._createFor));
		
		// Generate future meetings.
		if (spansEnd.after(spansStart))
			this._generateMeetingsBetween(spansStart, spansEnd, cabManager, cabBoard);
	},
	
    getNextMeeting: function() {
		return this.getNextMeetingStartingAfter(new GlideDateTime());
	},
	
	getNextMeetingStartingAfter: function(startsAfter) {
		if (!this._gr || !this._gr.getUniqueValue())
			return null;
		
		var cabMeetingGr = new GlideRecord(CAB.MEETING);
		cabMeetingGr.addActiveQuery();
		cabMeetingGr.addQuery(CAB.DEFINITION, this._gr.getUniqueValue());
		if (startsAfter && startsAfter instanceof GlideDateTime)
			cabMeetingGr.addQuery("start", ">", startsAfter.getValue());
		cabMeetingGr.orderBy("start");
		cabMeetingGr.query();
		
		if (!cabMeetingGr.next())
			return null;
		
		return cabMeetingGr;
	},

	/**
	 * Find all the meetings for this definition between the star tand end
	 */
	_findMeetingsBetween: function (spansStart, spansEnd) {
		var meeting = new GlideRecord(CAB.MEETING);
		if (!spansStart || !spansEnd)
			return meeting;
		
		meeting.addQuery("start",">=", spansStart);
		meeting.addQuery("start","<=", spansEnd);
		meeting.addQuery("start", ">", new GlideDateTime());
		meeting.addQuery("cab_definition", this._gr.getUniqueValue());
		meeting.addNotNullQuery("cmn_schedule_span_origin");
		meeting.orderBy("start");
		meeting.query();
		
		return meeting;
	},
	
	/**
	 * Remove all meetings between the given dates.
	 */
	_removeMeetingsBetween: function(spansStart, spansEnd) {
		if (!spansStart || !spansEnd)
			return;
		
		var meeting = this._findMeetingsBetween(spansStart, spansEnd);
		
		var cabMeeting = new CABMeeting(meeting);
		while (meeting.next())
			meeting.deleteRecord();
	},
	
	_updateMeetingsBetween: function(spansStart, spansEnd) {
		if (!spansStart || !spansEnd)
			return;
		
		var now = new GlideDateTime();
		var meeting = this._findMeetingsBetween(spansStart, spansEnd);
		
		if (meeting.getRowCount() == 0)
			return;
		
		if (this._log.atLevel() == global.GSLog.DEBUG) this._log.debug("[_updateMeetingsBetween] Meeting count: " + meeting.getRowCount());
		
		var schedule = this._getSchedule();
		var timeMap = schedule.getTimeMap(spansStart, spansEnd);
		timeMap.buildMap(schedule.getTimeZone());
		
		// Skip the first element in the timeMap if it spans now 
		if (schedule.isInSchedule(now) && timeMap.hasNext())
			timeMap.next();

		var cabMeeting = new CABMeeting(meeting);
		while (meeting.next()) {
			if (this._log.atLevel() == global.GSLog.DEBUG) this._log.debug("[_updateMeetingsBetween] Working on: " + meeting.getUniqueValue());
		
			// If there are no more entries in the time map delete any further meetings.
			if (!timeMap.hasNext()) {
				meeting.deleteRecord();
				continue;
			}
			
			var timeSpan = timeMap.next();
			if (!timeMap.hasNext()) {
				var lastSpan = this._getCompleteSpan(timeSpan);
				if (lastSpan)
					timeSpan = lastSpan;
			}
			
			if (!cabMeeting.isDisconnected())
				cabMeeting.refresh(this, timeSpan);
			else
				cabMeeting.refresh(this, null);
		}

		this._updateChangeRangeOnMeetings();
	},
	
	_generateMeetingsBetween: function(spansStart, spansEnd, cabManager, cabBoard) {
		if (!spansStart || !spansEnd)
			return;
		
		var schedule = this._getSchedule();
		var timeMap = schedule.getTimeMap(spansStart, spansEnd);
		timeMap.buildMap(schedule.getTimeZone());
		
		// Skip the first element in the timeMap if it spans now 
		if (schedule.isInSchedule(new GlideDateTime()) && timeMap.hasNext())
			timeMap.next();
				
		var timeSpan;
		while (timeMap.hasNext()) {
			timeSpan = timeMap.next();

			/* If this is our last span we need to do a little extra work to make sure we have a complete span
			   This is to cater for when we refreshing meetings during the scheduled meeting time in which case
			   we may have a partial span */
			if (!timeMap.hasNext()) {
				var lastSpan = this._getCompleteSpan(timeSpan);
				if (lastSpan)
					timeSpan = lastSpan;
			}

			this._cabDomUtil.runInRecordsDomain((function(){
				var cabMeeting = CABMeeting.newMeeting(this, timeSpan);
				cabMeeting.insertUpdate();
			}).bind(this));
		}
		
		this._updateChangeRangeOnMeetings();
	},
	
	_updateChangeRangeOnMeetings: function() {
		var meetingGr = new GlideRecord(CAB.MEETING);
		meetingGr.addQuery("state", "pending");
		meetingGr.addQuery("cab_definition", this._gr.getUniqueValue());
		meetingGr.addQuery("start", ">", new GlideDateTime());
		meetingGr.addNotNullQuery("cmn_schedule_span_origin");
		meetingGr.query();
		
		while (meetingGr.next()) {
			var cabMeeting = new CABMeeting(meetingGr);
			var modifiedFields = cabMeeting._getModifiedFields();
			if (modifiedFields["change_range_start"] ||
			    modifiedFields["change_range_end"] ||
			    modifiedFields["ignore_change_date_range"])
				continue;
			
			cabMeeting.setChangeRangeDates();
			cabMeeting.ignoreModifiedFields();
			cabMeeting.update();
		}		
	},
	
	_getCompleteSpan: function(span) {
		if (!span)
			return null;
		
		// Get the start time of our the span...
		var spanStart = span.getStart().getGlideDateTime();
		/* ...and create a new date which is 30 days ahead of the start time
		   which should ensure we get a complete span - no one will have a 30 day meeting... */
		var futureDate = new GlideDateTime(spanStart);
		futureDate.addDaysUTC(30);
		
		var schedule = this._getSchedule();
		var timeMap = schedule.getTimeMap(spanStart, futureDate);
		timeMap.buildMap(schedule.getTimeZone());
		
		return timeMap.next();
	},
	
	/**
	 * Returns the schedule for this cab definition
	 */
	_schedCache: {},
	_getSchedule: function() {
		var id = this._gr.getUniqueValue()+"";
		if (this._schedCache[id])
			return this._schedCache[id];
		else
			this._schedCache = {};
		
		this._schedCache[id] = new GlideSchedule(id);
		return this._schedCache[id];
	},
	
	/**
	 * Returns the end time of the last generated, unmodified meeting.
	 */
	_getLastMeetingEnd: function() {
		var cmGa = new GlideAggregate(CAB.MEETING);
		cmGa.addAggregate("MAX", "end");
		cmGa.addNotNullQuery("cmn_schedule_span_origin");
		cmGa.addQuery("cab_definition", this._gr.getUniqueValue());
		cmGa.orderByDesc("end");
		cmGa.query();
		
		// If there isn't one, just use now.
		if (!cmGa.next())
			return new GlideDateTime();
		
		return new GlideDateTime(cmGa.getAggregate("MAX", "end"));
	},
		
	/*
	 * Create a new span for a start and end time for a specified type
	 */
	createNewSpan: function (startTime, endTime, type, spanName) {
		var startSDT = new GlideScheduleDateTime(new GlideDateTime(startTime));
		var endSDT = new GlideScheduleDateTime(new GlideDateTime(endTime));

		startSDT.setTimeZone(this._gr.getValue('time_zone'));
		endSDT.setTimeZone(this._gr.getValue('time_zone'));

		var span = new GlideRecord('cmn_schedule_span');
		span.setValue('name', spanName);

		span.setValue('start_date_time', startSDT.getValue());
		span.setValue('end_date_time', endSDT.getValue());
		span.setValue('type', type);
		span.setValue('schedule', this._gr.getUniqueValue());
		return span.insert();	
	},
	
	type: 'CABDefinitionSNC'
});