var CABChangeRequestSNC = Class.create();
CABChangeRequestSNC.prototype = Object.extendsObject(CAB, {

	_addDateRangeQuery: function (gr, startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		cr._addDateRangeQuery(gr, startDate, endDate);
	},

	getRelatedSchedules: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getRelatedSchedules(startDate, endDate);
	},

	getChangesWithSameAssignedTo: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesWithSameAssignedTo(startDate, endDate);
	},

	getChangesWithSameAssignmentGroup: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesWithSameAssignmentGroup(startDate, endDate);
	},

	getChangesAffectingSamePrimaryCI: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesAffectingSamePrimaryCI(startDate, endDate);
	},

	updateAttendeesForAgendaItems: function (previous) {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("state", "pending");
		agendaItemGr.query();
		
		if (!agendaItemGr.hasNext())
			return;
		
		if (!CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES)
			return;
		
		var fieldData = {};
		// Get any changes to fields we're interested in for creating attendees related to this Change
		for (var i = 0; i < CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES.length; i++) {
			var fieldName = CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES[i];
			if (this._gr[fieldName].changes()) {
				fieldData[fieldName] = {"currentValue": this._gr.getValue(fieldName)};
				if (previous)
					fieldData[fieldName]["previousValue"] = previous.getValue(fieldName);
			}
		}

		while (agendaItemGr.next())
			new CABAgendaItem(agendaItemGr).refreshAttendeesFromTaskData(fieldData);
	},
	
	updateDecisionforAgendaItem: function() {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("cab_meeting.state", "NOT IN", "complete,canceled");
		agendaItemGr.query();
		
		while (agendaItemGr.next()) {
			var agendaItem = new CABAgendaItem(agendaItemGr);
			
			if (this._gr.approval+"" == "approved") {
				if (agendaItem.isPending()) {
					agendaItem.setPreApproved();
				
					if (agendaItemGr.cab_meeting.complete_preapproved_changes == true)
						agendaItem.setComplete();
				}
				else if (agendaItem.isInProgress() || agendaItem.isPaused())
					agendaItem.setApproved();
				
				agendaItem.update();
			}
			else if (this._gr.approval+"" == "rejected") {
				var cabMeeting = new CABMeeting(agendaItemGr.cab_meeting.getRefRecord());
				if (cabMeeting.isPending() && !agendaItem.isPending())
					agendaItem.setPending();
				
				agendaItem.reject();
			}
		}
	},

    type: 'CABChangeRequestSNC'
});