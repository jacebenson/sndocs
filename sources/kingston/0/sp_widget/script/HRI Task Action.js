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
	
	if (input && input.action === 'setTaskFinished')
		setTaskFinished(input.request);
						 
	if (input && input.action === 'setTaskSkipped')
		setTaskSkipped(input.request);
	
	if(input && input.action === 'postProcessing')
		postProcessing(input.childCaseId);
	
	getTasks(data.sys_id);
	getTaskAttachment(data.sys_id);
	
	//get the case from the task, retrieve from case whether pdf_template has a valid document revision 
	data.isPdfTemplate = false;
	data.pdfTemplateSysId = '';
	isPdfTemplate(data.sys_id);
	
	data.documentBody = '';
	if (data.task.hr_task_type == "sign_document"){
		if(data.isPdfTemplate){
			var previewPdfSysId = new sn_hr_core.hr_PdfUtils().prefillPdf(data.pdfTemplateSysId, false, data.sys_id, 'sn_hr_core_task', data.sys_id);
			var attachment = new GlideRecord('sys_attachment');
			attachment.get(previewPdfSysId);
			data.attachmentUrl = '/sys_attachment.do?view=true&sys_id=' + attachment.getUniqueValue();
		} else	
			getDocumentBody(data.sys_id);
	}
	
	if (input && input.action === 'setDocumentBody' && data.task.hr_task_type == "sign_document")
			new sn_hr_core.hr_CaseAjax().setDocumentBody(data.documentBody, 'sn_hr_core_task', data.task.sys_id, 'sn_hr_core_task', data.task.sys_id, 'false');

	if (input && input.action === 'authenticateUser')
		authenticateUser(input.request);

	function getTasks(taskID) {
		var gr = new GlideRecord('sn_hr_core_task');
		gr.addQuery('sys_id',taskID);
		gr.query();
		gr.next();
		var now = new GlideDateTime();
		var offset = now.getTZOffset();
		now = now.getNumericValue() + offset;
		var task = {};
		task.sys_id = gr.getValue("sys_id");
		task.case_id = gr.getValue("parent");
		task.short_description = gr.getValue("short_description");
		task.description = gr.getValue("description");
		task.number = gr.getValue("number");
		task.survey = gr.getValue("survey");
		task.survey_instance = gr.getValue("survey_instance");
		task.order = gr.getValue("order");
		task.state = gr.getValue("state");
		task.finished = gr.getValue("active") == "0";
		task.opened_by = gr.getValue("opened_by");
		task.assigned_to = gr.getValue("assigned_to");
		task.updated = gr.getValue("sys_updated_on");
		task.due_date = gr.getValue("due_date");
		task.closed_at = gr.getValue("closed_at");
		task.hr_task_type = gr.getValue("hr_task_type");
		task.url = gr.getDisplayValue("url");
		task.parent = gr.getValue("parent");
		task.isOverDue = now > new GlideDateTime(gr.due_date).getNumericValue();
		task.assigned_to_me = gr.getValue("assigned_to") == data.user_id;
		task.optional = isOptional(gr);
		data.task = task;

		if (gr.hr_task_type == 'hr_service' || gr.hr_task_type == 'submit_catalog_item') {
			if (gr.hr_task_type == 'submit_catalog_item')
				task.producer = gr.getValue("sc_cat_item");
			else if (gr.hr_task_type == 'hr_service')
				task.producer	= getProducerId(gr.getValue("hr_service"));
			
			if (task.producer) {
				var p = {};
				p.sys_id = task.producer;
				p.hide_header = true;
				p.hide_footer = true;
				p.page = "0dc0f3219fe312009205f7f8677fcf43"; //hri_task_details
				data.hrCatItemWidget=$sp.getWidget("widget-sc-cat-item", p);
			}
		}
		
		if (gr.hr_task_type == 'submit_order_guide') {
			task.order_guide = gr.getValue("order_guide");
			var q = {};
			q.sys_id = task.order_guide;
			q.hide_header = true;
			q.hide_footer = true;
			q.page = "0dc0f3219fe312009205f7f8677fcf43"; //hri_task_details
			data.hrCatItemWidget=$sp.getWidget("widget-sc-order-guide", q);	
		}
		
		if (gr.hr_task_type == 'upload_documents') {
			var r = {};
			r.table = gr.sys_class_name.toString();
			r.sys_id = task.sys_id;
			r.hide_header = true;
			r.hide_footer = true;
			r.record_table = gr.sys_class_name.toString();
			r.record_id = task.sys_id;
			r.check_attached_by = gr.assigned_to.user_name + '';
			data.attachmentWidget = $sp.getWidget("hri-ticket-attachments", r);
		}
		
		if (gr.hr_task_type == 'take_survey') {
			var s = {};
			s.type_id = task.survey;
			s.instance_id = task.survey_instance;
			data.takeSurveyWidget=$sp.getWidget("take-survey", s);
		}
	}
	
	/*
	* Return true if HR Task is optional
	* and is in Ready or WIP state.
	*/
	function isOptional(task) {
		var showButton = task.optional && (task.state==10 || task.state==18);
		return showButton;
	}
	
	function getProducerId(service){
		var gr = new GlideRecord("sn_hr_core_service");
		if (gr.get(service))
			return gr.getValue("producer");
		gs.addErrorMessage(gs.getMessage("Service not found"));
		return false;
	}
	
	function postProcessing(childCaseId) {
		var taskId = data.sys_id;
		var taskGr = getTask(taskId);
		var grChild;
		//Setting up the parent and initiated_from
		var gr = new GlideRecord('sn_hr_core_case');
		if (gr.get(childCaseId)) {
			grChild = gr;
			gr.setValue("parent", taskGr.parent);
			gr.setValue("initiated_from" ,taskId);
			gr.update();
		} else {
			var grTask = new GlideRecord('task');
			if (grTask.get(childCaseId)) {
				grChild = grTask;
				grTask.setValue("parent", taskGr.parent);
				grTask.update();
			}
		}
		//Adding child record to activity status
		if (new GlidePluginManager().isActive('com.sn_hr_lifecycle_events'))
			new sn_hr_le.hr_ActivitySet().registerGeneratedRecord(taskId,grChild);

		//Closing the task
		taskGr.setValue('state','3');	//Close Complete
		taskGr.update();
	}
	
	function getTask(taskId){
		var gr = new GlideRecord("sn_hr_core_task");
		if (gr.get(taskId))
			return gr;
	}
	
	function authenticateUser(request) {
		if (data.user_name == request.user_name && new GlideUser().authenticate(request.user_name, request.password))
			setTaskFinished(request);
		else {
			var result = {};
			result.status = 'error';
		  data.response = result;
		}
	}

	function setTaskFinished(request) {
		var sysId = request.sys_id;
		var userId = request.user_id;
		var result = {};
	
		if (request.sys_id != data.sys_id || request.user_id != data.user_id)
			result.status = "error";
		else {
			var gr = new GlideRecord("sn_hr_core_task");
			gr.get(sysId);
      gr.setValue("state", "3");
		  if (gr.update()) {
				result.status = "success";
				getTasks(sysId);
				if (data.acknowledgeType == "credential") // Credential
					saveAcknowlegementRecord(sysId, userId, data.acknowledgeType, data.document_revision);
			} else
				result.status = "error";
		}
		data.response = result;
	}

	function setTaskSkipped(request){
		var taskId = request.taskId;
		var gr = new GlideRecord("task");
		if (gr.get(taskId)) {
			//Setting the HR Task to skipped state
			gr.setValue("state", "9");
			gr.update(); 
		} else gs.addErrorMessage(gs.getMessage('Task not found'));	
	}

	function saveAcknowlegementRecord(task_id, user_id, acknowlege_type, document_revision) {
		var gr = new GlideRecord("sn_hr_core_document_acknowledgement");
		gr.initialize();
		gr.setValue("acknowledged", true);
		gr.setValue("table_name", "sn_hr_core_task");
		gr.setValue("table_sys_id", task_id);
		gr.setValue("user", user_id);
		gr.setValue("acknowledgement_type", acknowlege_type);
		if (document_revision != "undefined")
			gr.setValue("document_revision", document_revision);
		gr.insert();
	}

	function getTaskAttachment(sysId) {
		var task = new GlideRecord("sn_hr_core_task");
		task.get(sysId);
		var gr = new GlideRecord("dms_document_revision");
		gr.addQuery("document", task.getValue("hr_task_document"));
		gr.addQuery("stage", "published");
		gr.query();

		var attachmentInfo = {};
		if (gr.next()) {
			attachmentInfo.status = "success";
			attachmentInfo.type = task.getValue("hr_task_type");
			attachmentInfo.document_name = gr.document.name.toString();
			attachmentInfo.document_revision = gr.getUniqueValue();
			data.document_name = attachmentInfo.document_name;
			data.acknowledgeType = attachmentInfo.type;
			data.acknowledgeType = attachmentInfo.type ? attachmentInfo.type : "credential";
			data.document_revision = attachmentInfo.document_revision;
			attachmentInfo.attachment = getAttachmentInfo(gr.getUniqueValue());
			data.attachmentUrl = '/sys_attachment.do?view=true&sys_id=' + attachmentInfo.attachment;
		} else
			attachmentInfo.status = "error";
		
		data.response = attachmentInfo;
	}
	
	function getDocumentBody(taskId) {
		var hrForm = new sn_hr_core.hr_CaseAjax().documentBody('sn_hr_core_task', taskId, 'sn_hr_core_task', taskId, 'false');
		data.documentBody = hrForm.body;
	}
	
	function getAttachmentInfo(tableSysId) {
		var gr = new GlideRecord("sys_attachment");
		gr.addQuery("table_name", "dms_document_revision");
		gr.addQuery("table_sys_id", tableSysId);
		gr.query();
		if (gr.next())
			return gr.getUniqueValue();
	}
	
	function isPdfTemplate(sys_id){
		var task = new GlideRecord("sn_hr_core_task");
		task.get(sys_id);
		if(task.parent.pdf_template){
			var pdfTemplate = new GlideRecord('sn_hr_core_pdf_template');
			pdfTemplate.get(task.parent.pdf_template);
			if(pdfTemplate.document_revision){
				data.isPdfTemplate = true;
				data.pdfTemplateSysId = task.parent.pdf_template.sys_id;
			}
		}
	}
	
})();