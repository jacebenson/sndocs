(function() {
	
	var gr = new GlideRecord('x_pisn_guii_session');
	gr.addQuery('user', gs.getUserID());
	gr.addQuery('state', 'in_progress');
	gr.query();
	
	data.sessions = [];
	
	while (gr.next()) {
		data.sessions.push({
			id: gr.getUniqueValue(),
			flow: gr.getDisplayValue('flow'),
			state: gr.getDisplayValue('state')
		});
	}

})();