var hr_Task = Class.create();

hr_Task.prototype = {
    initialize : function(_gr, _gs) {
	    //this._log = new GSLog(hr.LOG, this.type).setLog4J();
	    this._gr = _gr;
	    this._gs = _gs || gs;

    },

    isClosed : function(record) {
	    return (record.state == 3) || (record.state == 4) || (record.state == 7);
    },

	clearDependencies : function(taskRecord) {
			// TODO: clear dependencies
	},

    /**
	* Return true if:
    *   the user has case writer role
    *   the task status is assigned or ready
	*   the task isn't already assigned to the user
    *   if there is an assignment group, the user is in the assignment group
	* @return boolean user can assign the task to self
	*/
	canAssignToSelf : function() {
		if (!this._gr)
			return false;

		if (this._gr.assigned_to == gs.getUserID())
			return false; // already assigned to user so return false

		var assignableState = this._gr.state == hr_Constants.TASK_ASSIGNED || this._gr.state == hr_Constants.TASK_PENDING_DISPATCH;
		if (!assignableState)
			return false;

	    var hasRole = this._gs.hasRole("sn_hr_core.case_writer");
		if (!hasRole)
			return false;

		if (this._gr.assignment_group.nil()) // no longer requiring an assignment group to be set
			return true;

		var user_group = new GlideRecord("sys_user_grmember");
		user_group.addQuery("user", this._gs.getUserID());
		user_group.addQuery("group", this._gr.assignment_group.toString());
		user_group.query();
		var userIsAgentForGroup = user_group.hasNext();

		return userIsAgentForGroup;
 	},

    // helper method for read/write ACLs
    canEditTask : function() {
		var user = this._gs.getUser();
	    var roles = user.getRoles();
	    if (roles.indexOf(hr.ROLE_HR_CASE_WRITER) > -1)
		    return true;

	    // Check if it's the user who opened the case
		var userId = this._gs.getUserID();
	    if (!gs.nil(this._gr.parent) && this._gr.parent.opened_by == userId)
		    return true;

	    // Check if it's the user the case is opened for
	    if (!gs.nil(this._gr.parent) && this._gr.parent.opened_for == userId)
		    return true;

	    // Check if the user belongs to the assignment group
	    if (!gs.nil(this._gr.assignment_group) && user.isMemberOf(this._gr.assignment_group.toString()))
		    return true;

	    if (!gs.nil(this._gr.parent.assignment_group) && user.isMemberOf(this._gr.parent.assignment_group.toString()))
		    return true;

	    // Check if the task or the parent case is assigned to the user
	    if (!gs.nil(this._gr.assigned_to) && this._gr.assigned_to == userId)
		    return true;

	    if (!gs.nil(this._gr.parent.assigned_to) && this._gr.parent.assigned_to == userId)
		    return true;

	    // Check if it's a user in the watch list field
	    if (!gs.nil(this._gr.watch_list) && this._gr.watch_list.indexOf(userId) > -1)
		    return true;

	    return false;
    },

    updateAttachments : function(current) {
		var results = new GlideSysAttachment().copy(current.sys_class_name, current.sys_id, current.parent.sys_class_name, current.parent.sys_id);

		if(results.length > 0){
			current.comments = gs.getMessage('File attachment was successful.');
			current.update();
		}
	},

    canSignDocument : function() {
	    //Task must be active, assigned to user, and e_signature type
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active || this._gr.hr_task_type != 'e_signature')
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

		//There must be a published Document Revision
	    var docRev = new GlideRecord('dms_document_revision');
	    docRev.addQuery('document', this._gr.hr_task_document);
	    docRev.addQuery('stage', 'published');
	    docRev.addActiveQuery();
	    docRev.query();

	    return docRev.hasNext();
    },

	canSignGeneratedDocument : function() {
	 	//Task must be active, assigned to user, and has the proper type
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active || this._gr.hr_task_type != 'sign_document')
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

		//The task must have a PDF template
		if (this._gr.parent.ref_sn_hr_core_case.pdf_template == '')
			return false;

		//Task must have an associated Pdf_draft or draft_document
		if(!this.hasDraftDocument())
			return false;

		return true;
    },

	hasDraftDocument: function() {
		var hasDraftDocument = new GeneralHRForm().hasDraftDocument(this._gr.sys_class_name, this._gr.getUniqueValue());
        var hasDraftPDF = new hr_PdfUtils().isValidPdfTemplate(this._gr.sys_class_name, this._gr.getUniqueValue());
		return (hasDraftPDF || hasDraftDocument);
	},

    canAuthenticate : function() {
	    //Task must be active, assigned to user, and credential type
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active || this._gr.hr_task_type != 'credential')
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

	    //There must be a published Document Revision
	    var docRev = new GlideRecord('dms_document_revision');
	    docRev.addQuery('document', this._gr.hr_task_document);
	    docRev.addQuery('stage', 'published');
	    docRev.addActiveQuery();
	    docRev.query();

	    return docRev.hasNext();
    },

    canCompleteURLTask : function() {
	    //Task must be active and assigned to user
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active)
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

	    //The URL must be defined
	    return this._gr.url != '';
    },

	canCompleteSurveyTask : function() {
	    //Task must be active and assigned to user
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active)
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

	    //The Survey Instance must be defined
	    return this._gr.survey_instance != '';
    },

	canCompleteAttachmentTask : function() {
	    //Task must be active, assigned to user, and URL type
	    if (this._gr.assigned_to != this._gs.getUserID() || !this._gr.active || this._gr.hr_task_type != 'upload_documents')
		    return false;

	    //State must be Ready or Work In Progress
	    if (this._gr.state != 10 && this._gr.state != 18)
		    return false;

		return true;
    },

    getEmployeeDocuments : function() {
	    var userId = this._gs.getUserID();
	    var gr = new GlideRecord("sn_hr_core_case");
	    gr.addActiveQuery();
	    gr.addQuery("opened_for", userId);
	    gr.query();
	    if (!gr.next())
		    return "";

	    else {
		    var documentIds = "";
		    var tasks = this._getTasksOfCase(gr.getUniqueValue(), userId);
		    for (var i = 0; i < tasks.length; i++) {
			    var docId = this._getTaskDocumentSysId(tasks[i]);
			    if (docId && docId.length == 32)
				    documentIds += ',' + docId;
		    }
		    return documentIds;
	    }
    },

    _getTasksOfCase : function(caseId, userId) {
	    var gr = new GlideRecord("sn_hr_core_task");
	    gr.addQuery("parent", caseId);
	    gr.query();
	    var tasks = [];
	    while (gr.next()) {
		    var user = gr.getValue("assigned_to");
		    if (user == userId)
			    tasks.push(gr.getUniqueValue());
	    }
	    return tasks;
    },

    _getTaskDocumentSysId : function(taskSysId) {
	    var task = this._getTaskInfo(taskSysId);
	    var gr = new GlideRecord("dms_document_revision");
	    gr.addQuery("document", task.getValue("hr_task_document"));
	    gr.addQuery("stage", "published");
	    gr.query();
	    if (gr.next())
		    return gr.getUniqueValue();
	    else
		    return "";
    },

    _getTaskInfo : function(taskSysId) {
	    gr = new GlideRecord("sn_hr_core_task");
	    gr.get(taskSysId);
	    return gr;
    },

	/* get all the tasks assigned to me */
	getMyTasks: function (userId) {
		var gr = new GlideRecordSecure("sn_hr_core_task");
		gr.addQuery("state", "!=", "1");
		gr.addQuery("parent.state", "!=", "1");
		gr.addQuery("parent.active", "true");
		gr.addQuery("assigned_to", userId);
		gr.orderBy('due_date');
		gr.orderByDesc('sys_created_on');
		gr.query();
		var now = new GlideDateTime();
		var offset = now.getTZOffset();
		now = now.getNumericValue() + offset;
		var tasks = [];
		while (gr.next()) {
			var task = {};
			task.sys_id = gr.getValue("sys_id");
			task.case_id = gr.getValue("parent");
			task.short_description = gr.getValue("short_description");
			task.number = gr.getValue("number");
			task.order = gr.getValue("order");
			task.template = gr.getValue("template");
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
			task.assigned_to_me = gr.getValue("assigned_to") == userId;
			tasks.push(task);
		}
		return tasks;
	},

	cloneTask : function(original, cloneAsFollowOn) {
		var className = original.sys_class_name + '';
		// Clone this task to a new, mostly identical, task
		cloneAsFollowOn = cloneAsFollowOn === undefined ? false : cloneAsFollowOn;

		var clone = new GlideRecord(className);
		clone.cloned_from = original.sys_id;
		// Estimated and scheduled are copied
		clone.estimated_end = original.estimated_end;
		clone.estimated_travel_duration = original.estimated_travel_duration;
		clone.estimated_work_duration = original.estimated_work_duration;
		clone.expected_start = original.expected_start;
		clone.expected_travel_start = original.expected_travel_start;
		// Header
		clone.parent = original.parent;
		clone.description = original.description;
		clone.dispatch_group = original.dispatch_group;
		clone.location = original.location;
		clone.short_description = original.short_description;
		clone.skills = original.skills;
		clone.assignment_group = original.assignment_group;
		clone.state = 1; // Default state is Draft
		clone.sys_domain = original.sys_domain; // System
		clone.work_notes = gs.getMessage("Cloned from service Order Task {0}", original.number); // service notes
		clone.insert();

		// If the original was to be cloned as a follow on, set the "has follow on" flag
		if (cloneAsFollowOn) {
			original.has_follow_on = true;
			original.update();
		}

		// Return the newly cloned record
		return clone;

		// The following fields are not copied
		/*
		Acknowledged on
		Active
		Activity Due
		Actual duration
		Actual Travel Duration
		Actual Travel Start
		Actual Service end
		Actual Service start
		Approval
		Approval History
		Approval Set
		Close Notes
		Closed
		Closed By
		cmdb_ci
		Comments and Service notes
		Company
		Contact Type
		Contract
		Correlation ID
		Correlation display
		Created
		Created By
		Delivery Plan
		Delivery task
		Dispatched On
		Due Date
		Escelation
		Followup
		Group List
		Impact
		Knowledge
		Made SLA
		Number
		Opened
		Opened By
		Order
		Priority
		Reassignment count
		SLA Due
		task type
		Time serviced
		Updated
		Updated By
		Updates
		Upon approval
		Upon reject
		Urgency
		User input
		Watch List
		Work Notes
		Work Notes list
 		*/
	},

	getDueDays: function(dueDate) {
		if(!dueDate)
			return 'later';//Assuming task with no due date can be done later

		var due_date = new GlideDateTime(dueDate);
		var gdTaskDueDate = due_date.getLocalDate();
		var gdLocal = new GlideDateTime().getLocalDate();
		return GlideDate.subtract(gdLocal,gdTaskDueDate).getDayPart();
	},

    type : "hr_Task"
};