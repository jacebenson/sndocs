var gr = GlideRecord('hr_profile');
gr.addQuery('user', gs.getUserID());
gr.query();
if (gr.next()) 
	data.ssn = gr.ssn_display+"";

