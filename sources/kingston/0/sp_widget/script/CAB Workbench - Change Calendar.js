(function() {

	data.sys_id = $sp.getParameter('sys_id');
	data.allowConfig = true;
	data.timeFormat = new global.CalendarUtils().getUserTimeFormat().replace(/\W*%s/, "");
	data.dateTimeFormat = gs.getDateTimeFormat().replace(/y/g, "Y").replace(/d/g, "D");
	if (input && input.agendaId) {
		var gr = new GlideRecord('change_request');
		gr.addQuery('JOINchange_request.sys_id=mtg_agenda_item.task!sys_id=' + input.agendaId);
		gr.query();
		if (gr.next()) {
			data.canRead = gr.canRead();
			if (data.canRead) {
				data.canWrite = gr.canWrite();
				data.changeId = gr.getUniqueValue();
			}
		}
	}

})();