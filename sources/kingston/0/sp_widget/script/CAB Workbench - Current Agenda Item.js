(function() {
	data.meeting_id = $sp.getParameter('sys_id');
	data.i18n = {};
	data.i18n.currentAgendaAriaLabel = gs.getMessage('Current Agenda Change {0}');
	data.i18n.ariaScheduledTime = gs.getMessage('Scheduled {0} minutes');
})();