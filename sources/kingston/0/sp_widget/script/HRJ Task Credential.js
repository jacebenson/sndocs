(function() {
	data.task = {};
	data.user_id = gs.getUserID();
	data.user_name = gs.getUserName();
	data.title = $sp.getValue("title");
	data.short_description = $sp.getValue("short_description");

	if (input)
		data.sys_id = input.sys_id;
	else if (options)
		data.sys_id = options.sys_id;
	else
		data.sys_id = $sp.getValue("sys_id");

	var hrtt = new sn_hr_sp.hr_TaskTicket(); 

	data.task = hrtt.getTasks(data.sys_id);
	
	if (!data.task.assigned_to_me) {
		if (data.task.finished)
			data.completed_by = data.task.assigned_to.name;
		else {
			if (gs.nil(data.task.assigned_to.name))
				data.caption = gs.getMessage("Task is unassigned");
			else
				data.caption = gs.getMessage("Task assigned to {0}",data.task.assigned_to.name);
		}
	}
	
	data.attachmentInfo = hrtt.getTaskAttachment(data.sys_id, 'credential');

	if (input && input.action === 'setTaskSkipped') 
		hrtt.setTaskSkipped(input.request);
	if (input && input.action === 'authenticateUser')
		data.response = authenticateUser(data.user_name, input.request);

	function authenticateUser(user_name, request) {
		if (user_name == request.user_name && new GlideUser().authenticate(request.user_name, request.password)) {
			if(data.hasOwnProperty('attachmentInfo'))
				hrtt.saveDocumentAcknowlegement(data.sys_id, data.user_id, 
																				data.attachmentInfo.acknowledgeType, 
																				data.attachmentInfo.document_revision);
			data.task.finished = true;
			return hrtt.setTaskFinished(request);
		} else {
			var result = {};
			result.status = 'error';
			return result;
		}
	}
})();
