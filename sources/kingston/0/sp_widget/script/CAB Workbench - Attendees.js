(function() {
	data.meetingId = $sp.getParameter("sys_id");
	data.currentUserId = gs.getUserID();
	data.ariaLabelForHosting = gs.getMessage("host meeting");
})();