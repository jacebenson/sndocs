var CABMeetingAjax = Class.create();
CABMeetingAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    createSpan: function() {
		var start = this.getParameter('sysparm_start');
		var end = this.getParameter('sysparm_end');
		var meetingId = this.getParameter('sysparm_meeting');
		
		if (!meetingId || !start || !end)
			return;
		
		var startGdt = new GlideDateTime();
		startGdt.setDisplayValue(start);
		var endGdt = new GlideDateTime();
		endGdt.setDisplayValue(end);
		
		if (!startGdt.isValid() || !endGdt.isValid())
			return;
		
		var meetingGr = new GlideRecord('cab_meeting');
		if (meetingGr.get(meetingId)) {
			var cabDefinition = new CABDefinition(meetingGr.cab_definition.getRefRecord());
			// Check if this meeting already has an exclude span and if there is one remove it
			if (!meetingGr.cmn_schedule_span_exclude.nil()) {
				var spanGr = meetingGr.cmn_schedule_span_exclude.getRefRecord();
				spanGr.deleteRecord();
			}
			
			var spanId = cabDefinition.createNewSpan(startGdt, endGdt, 'excluded', meetingGr.getValue('name'));
			
			meetingGr.setValue('cmn_schedule_span_exclude', spanId);
			meetingGr.update();
		}

		return;
	},
	
	getPortalURL: function() {
		var meetingId = this.getParameter('sysparm_meeting');
		if (!meetingId)
			return null;
		
		var cabMeetingGr = new GlideRecord(CAB.MEETING);
		if (!cabMeetingGr.get(meetingId))
			return null;
		
		return new CABMeeting(cabMeetingGr).getPortalURL();
	},
	
	orderAgenda: function() {
		var orderBy = this.getParameter('sysparm_orderby');	
		var meetingId = this.getParameter('sysparm_meeting');
		var orderIndex = 0;
		
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery('cab_meeting', meetingId);
		agendaItemGr.addEncodedQuery(orderBy);
		
		agendaItemGr.query();
		while (agendaItemGr.next()) {
			agendaItemGr.setValue('order', orderIndex+=10);
			agendaItemGr.update();
		}
	},
	
	type: 'CABMeetingAjax'
});