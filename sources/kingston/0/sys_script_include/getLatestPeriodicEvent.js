function getLatestPeriodicEvent() {
	var gr = new GlideRecord('sys_performance_event');
	gr.addQuery('event_type', 'time');
	gr.orderByDesc('sys_created_on');
	gr.query();
	if (gr.next())
		return gr.sys_id;
	
	return '';
}