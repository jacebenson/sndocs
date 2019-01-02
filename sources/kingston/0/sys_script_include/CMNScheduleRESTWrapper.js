var CMNScheduleRESTWrapper = Class.create();
CMNScheduleRESTWrapper.prototype = Object.extendsObject(AbstractSchedulePageRESTWrapper, {
	type: 'CMNScheduleRESTWrapper',

	TABLE_CMN_SCHEDULE_SPAN: 'cmn_schedule_span',
	TABLE_SYS_CHOICE: 'sys_choice',
	SCHEDULE_SPAN_TYPE_EXCLUDE: 'exclude',

	ATTR_REPEAT_TYPE: 'repeat_type',
	ATTR_START_DATE_TIME: 'start_date_time',
	ATTR_END_DATE_TIME: 'end_date_time',
	ATTR_LABEL: 'label',
	ATTR_NAME: 'name',
	ATTR_ELEMENT: 'element',
	ATTR_VALUE: 'value',
	ATTR_INACTIVE: 'inactive',
	ATTR_OVERRIDE_START_DATE: 'override_start_date',
	ATTR_SCHEDULE: 'schedule',
	ATTR_SHOW_AS: 'show_as',
	ATTR_TYPE: 'type',
	ATTR_LANGUAGE: 'language',

	NULL_OVERRIDE: 'NULL_OVERRIDE',
	TZ_UTC: 'Etc/UTC',

	restGetPermissions: function (params) {
		var scheduleId = params.sys_id;
		var g = new GlideRecord(this.TABLE_CMN_SCHEDULE_SPAN);
		return {
			create: g.canCreate(),
			write: g.canWrite()
		};
	},

	getSupportedFormats: function () {
		return [this.FORMAT_TYPE.DHTMLX];
	},

	getEvents: function(params) {
		var event, events = [], result = {}, recordMap = {};

		var scheduleId = params.sys_id;
		var startDate = params.start_date;
		var endDate = params.end_date;
		var format = params.format;

		if (!scheduleId)
			return this.returnApiError('Schedule ID has not been provided');

		if (format == this.FORMAT_TYPE.DHTMLX) {
			var gSchedule = new GlideSchedule(scheduleId);
			var mapEvents = gSchedule.fetchTimeMapWithExcludes(startDate, endDate, null, false);
			while (mapEvents.hasNext()) {
				event = mapEvents.next();
				if (event)
					events.push(this._getFormattedEvent(event, recordMap));
			}
			result.events = events;
		}

		return result;
	},

	updateEvent: function(params) {
		var eventId = params.event_id;
		var actionedSysId = '';

		if (!eventId)
			return this.returnApiError('Event ID has not been provided.');

		var gr = new GlideRecord(this.TABLE_CMN_SCHEDULE_SPAN);
		if (gr.get(eventId)) {
			if (gr.canWrite()) {
				var newStartDate;
				var newEndDate;
				var updateSingleOccurrence = params.update_single_occurrence;
				if (!(gr.getValue(this.ATTR_REPEAT_TYPE)) || updateSingleOccurrence) {
					if (gr.schedule && gr.schedule.time_zone) {
						newStartDate = this._toScheduleDateTime(params.new_start_date);
						newEndDate = this._toScheduleDateTime(params.new_end_date);
					} else {
						newStartDate = this._toScheduleDateTimeNoTZ(params.new_start_date);
						newEndDate = this._toScheduleDateTimeNoTZ(params.new_end_date);
					}
					if (!newStartDate)
						return this.returnApiError(gs.getMessage('new_start_date not provided or format is incorrect. Expected is {0}. Got: {0}', this.INTERNAL_DATE_TIME_FORMAT, params.new_start_date));
					if (!newEndDate)
						return this.returnApiError(gs.getMessage('new_end_date not provided or format is incorrect. Expected is {0}. Got: {0}', this.INTERNAL_DATE_TIME_FORMAT, params.end_start_date));
				}

				if (!gr.getValue(this.ATTR_REPEAT_TYPE)) {
					gr.setValue(this.ATTR_START_DATE_TIME,  newStartDate.getValueInternal());
					gr.setValue(this.ATTR_END_DATE_TIME, newEndDate.getValueInternal());
					actionedSysId = gr.update();
				} else {
					if (updateSingleOccurrence) {
						var currStartDateTime = this.getValidatedGlideDateTime(params.current_start_date);
						if (!currStartDateTime)
							return this.returnApiError(gs.getMessage('current_start_date not provided or format is incorrect. Expected is {0}. Got: {0}', this.INTERNAL_DATE_TIME_FORMAT, params.current_start_date));
						var currStartDateStr = new GlideScheduleDateTime(currStartDateTime).getGlideDateTime().getDate().getValue();
						var currStartDateIntegerDateFormat = currStartDateStr.replace(new RegExp('-', 'g'), '')
						var overrideGr = new GlideRecord(this.TABLE_CMN_SCHEDULE_SPAN);
						overrideGr.setValue(this.ATTR_SCHEDULE, gr.getValue(this.ATTR_SCHEDULE));
						overrideGr.setValue(this.ATTR_SHOW_AS, gr.getValue(this.ATTR_SHOW_AS));
						overrideGr.setValue(this.ATTR_NAME, gr.getValue(this.ATTR_NAME))
						overrideGr.setValue(this.ATTR_REPEAT_TYPE, '');
						overrideGr.setValue(this.ATTR_START_DATE_TIME,  newStartDate.getValueInternal());
						overrideGr.setValue(this.ATTR_END_DATE_TIME, newEndDate.getValueInternal());
						overrideGr.parent = gr.getUniqueValue();
						overrideGr.setValue(this.ATTR_OVERRIDE_START_DATE, currStartDateIntegerDateFormat);
						overrideGr.setValue(this.ATTR_TYPE, gr.getValue(this.ATTR_TYPE));
						actionedSysId = overrideGr.insert();
					} else {
						/* Update all occurrences */
						if (!params.time_diff)
							return this.returnApiError('Time difference has not been provided');
						var grStart = new GlideScheduleDateTime(gr.getDisplayValue(this.ATTR_START_DATE_TIME));
						var newStartInMS = grStart.getMS() + params.time_diff * 1;
						grStart.setMS(newStartInMS);
						var grEnd = new GlideScheduleDateTime(gr.getDisplayValue(this.ATTR_END_DATE_TIME));
						var newEndInMS = grEnd.getMS() + params.time_diff * 1;
						grEnd.setMS(newEndInMS);
						gr.setValue('start_date_time', grStart.getValueInternal());
						gr.setValue('end_date_time', grEnd.getValueInternal());
						actionedSysId = gr.update();
					}
				}
				if (actionedSysId)
					return {'updated' : true};
				else {
					gs.addErrorMessage(gs.getMessage('Event update was not successful'));
					return this.returnApiError('Event update was not successful');
				}
			} else {
				gs.addErrorMessage(gs.getMessage('Security constraints do not allow the updation of this event'));
				return this.returnApiError('Security constraints do not allow the user to update this event.');
			}
		} else {
			gs.addErrorMessage(gs.getMessage('A valid Schedule Entry id was not found for update.'));
			return this.returnApiError('A valid Schedule Entry id was not found for update.');
		}
	},

	_toScheduleDateTime: function(dateTimeStrInternalFormat) {
		var gdt = this.getValidatedGlideDateTime(dateTimeStrInternalFormat);
		if (!gdt)
			return;
		var sdt =  new GlideScheduleDateTime(gdt.getDisplayValue());

		//start with user's time zone, setter adjusts time. Set to UTC
		sdt.setTimeZone(gs.getSession().getTimeZoneName());
		sdt.setTimeZone(this.TZ_UTC);

		return sdt;
	},

	_toScheduleDateTimeNoTZ: function(dateTimeStrInternalFormat) {
		var gdt = this.getValidatedGlideDateTime(dateTimeStrInternalFormat);
		if (!gdt)
			return;
		var sdt =  new GlideScheduleDateTime(gdt.getDisplayValue());
		var timeZone = gs.getSession().getTimeZoneName();
		sdt.setTimeZone(timeZone);
		return sdt;
	},

	_getFormattedEvent: function(event, recordMap) {
		if (!event)
			return null;

		var eventObj = {};
		var originSpan = event.getOriginTimeSpan();
		eventObj.sys_id = originSpan.getID();
		eventObj[this.EVENT_ATTR.TIMELINE_GROUPING_KEY] = eventObj.sys_id;
		eventObj[this.EVENT_ATTR.GROUP] = this.TABLE_CMN_SCHEDULE_SPAN;
		eventObj.text = originSpan.getName();
		eventObj.type = originSpan.getType();
		eventObj[this.EVENT_ATTR.START_DATE] = event.getStart().getGlideDateTime().getDisplayValueInternal();
		if (originSpan.getAllDay())
			event.getEnd().addSeconds(-1);
		eventObj[this.EVENT_ATTR.END_DATE] = event.getEnd().getGlideDateTime().getDisplayValueInternal();
		if (eventObj.type == this.SCHEDULE_SPAN_TYPE_EXCLUDE)
			eventObj[this.EVENT_ATTR.CSS_CLASS] = this.EVENT_CSS_CLASSES.DARK_GREY_BACKGROUND;

		var gr = new GlideRecord(this.TABLE_CMN_SCHEDULE_SPAN);
		var fieldList = ['name','show_as','repeat_type'];
		if (recordMap && recordMap[eventObj.sys_id])
			eventObj.record = recordMap[eventObj.sys_id];
		else if (gr.get(eventObj.sys_id)) {
			eventObj.record = this.grToJsObj(gr, true, true, fieldList);
			//For repeat_type = NULL, update display value = 'Does not repeat'
			if (eventObj.record.repeat_type && !eventObj.record.repeat_type.value) {
				var choiceGr = new GlideRecord(this.TABLE_SYS_CHOICE);
				choiceGr.addQuery(this.ATTR_NAME, this.TABLE_CMN_SCHEDULE_SPAN);
				choiceGr.addQuery(this.ATTR_ELEMENT, this.ATTR_REPEAT_TYPE);
				choiceGr.addQuery(this.ATTR_VALUE, this.NULL_OVERRIDE);
				var qc = choiceGr.addNullQuery(this.ATTR_INACTIVE);
				qc.addOrCondition(this.ATTR_INACTIVE, 'false');
				choiceGr.addQuery(this.ATTR_LANGUAGE, gs.getSession().getLanguage());
				choiceGr.query();
				if (choiceGr.next())
					eventObj.record.repeat_type.display_value = choiceGr.getValue(this.ATTR_LABEL);
			}
			recordMap[eventObj.sys_id] = eventObj.record;
		}

		if (eventObj.record && eventObj.record.parent && eventObj.record.parent.value && eventObj.record.override_start_date && eventObj.record.override_start_date.value)
			eventObj[this.EVENT_ATTR.TIMELINE_GROUPING_KEY] = eventObj.record.parent.value;

		return eventObj;
	}
});