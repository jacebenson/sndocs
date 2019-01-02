(function() {
	data.meetingId = $sp.getParameter("sys_id");
	data.userId = gs.getUserID();

	data.i18n = {};
	data.i18n.agendaAriaLabel = {
		pending: gs.getMessage('Change {0} is pending'),
		current: gs.getMessage('Change {0} is currently the active agenda'),
		paused: gs.getMessage('Change {0} is paused'),
		completeApproved: gs.getMessage('Change {0} is approved'),
		completePreapproved: gs.getMessage('Change {0} is pre-approved'),
		completeRejected: gs.getMessage('Change {0} is rejected'),
		noDecision: gs.getMessage('For Change {0} no decision could be reached'),
		permissionDenied: gs.getMessage('You are not allowed to view this Agenda Item')
	};
	data.i18n.viewAgendaItemAriaLabel = gs.getMessage('Select agenda item for Change {0}');
	data.i18n.notifyAriaLabel = gs.getMessage('Notify me when Change {0} is due');
	data.i18n.promoteAriaLabel = gs.getMessage('Promote Change {0}');
	data.i18n.donutAriaLabel = gs.getMessage('Agenda item {0}');
	data.i18n.donutAriaLabelNotKnown = gs.getMessage('Unknown Agenda item');
	data.i18n.agendaSelectOptions = [{display: gs.getMessage('Pending Agenda Items'), value: 'pending' },
										{display: gs.getMessage('All Agenda Items'), value: 'all' },
										{display: gs.getMessage('My Agenda Items'), value: 'mine' },
										{display: gs.getMessage('Approved Agenda Items'), value: 'approved' }];
	data.i18n.notifyMe = gs.getMessage("Notify me");
	data.i18n.dontNotifyMe = gs.getMessage("Don't notify me");
})();