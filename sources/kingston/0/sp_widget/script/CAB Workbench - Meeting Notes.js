(function() {
	data.meetingId = $sp.getParameter('sys_id');
	data.command = {};
	data.command.SHARE = 'share';
	data.command.CLEAR_AGENDA_DECISIONS = 'clear_agenda_decisions';
	function getMeetingGR() {
		var gr = new GlideRecord(CAB.MEETING);
		gr.get(data.meetingId);
		return gr;
	}

  // Check if we have the share command.
	if(typeof input !== 'undefined') {
		if(input.command == data.command.SHARE)
			(new CABMeeting(getMeetingGR())).shareMeetingNotes();
		else if(input.command == data.command.CLEAR_AGENDA_DECISIONS) {
			var rs = sn_change_cab.CABRuntimeState.get(data.meetingId);
			rs.clearAgendaDecisions();
		}
		return;
	}
	var cabMeetingGr = getMeetingGR();
	data.autoGenerateAgendaDecisions = cabMeetingGr.getValue("auto_add_agenda_decisions") == 1;
	data.i18n = {};
	data.i18n.msgSync = gs.getMessage("Meeting notes updated by CAB Automation");
	data.i18n.msgMeetingNotesSaved = gs.getMessage("Meeting notes saved");

})();