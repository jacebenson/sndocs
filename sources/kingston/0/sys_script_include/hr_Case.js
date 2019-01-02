var hr_Case = Class.create();

hr_Case._ignoreChangeEditableFields = {
			'opened_for' : '',
			'priority' : '',
			'short_description' : '',
			'description' : ''
};

hr_Case.userHasSubjectPersonAccess = function(gr) {
	var isPropertySet = !gs.nil(gr.hr_service) && gr.hr_service.subject_person_access;
	var isSubjectPerson = gr.subject_person == gs.getUserID();

	return isPropertySet && isSubjectPerson;
};

/*
 * Handle HR Case generation and management through the Case creation process:
 * - through an RP
 * - script based
 * - with a New button
 */
hr_Case.prototype = {

	initialize : function(_case, _gs) {
	    if (!_case)
		    return;

	    this._case = _case;
	    this._gs = _gs || gs;


    },


	/*
     * Sets the location, company and department fields on sn_hr_core_case from the user in opened_for
     */
    setUserFields : function() {
	    this._logDebug("[setUserFields] Setting user fields kicking off");

	    // Don't do anything if we're updating and nothing has changed
	    if (!this._case.opened_for || !this._case.opened_for.changes()) {
		    this._logDebug("[setUserFields] no changes to opened_for, exiting");
		    return;
	    }

	    // Dereference these fields from opened_for user; set for example, this._case[location]
	    this._setFromRefField("opened_for", "location");
	    this._setFromRefField("opened_for", "company");
	    this._setFromRefField("opened_for", "department");
    },

    /*
    * Public helper method for read/write ACLs
    */
    canEditCase : function() {
		if (this._case.isNewRecord())
		    return true;

		var roles = gs.getUser().getRoles();
		var isCaseWriter = roles.indexOf(hr.ROLE_HR_CASE_WRITER) > -1;
		if (isCaseWriter)
		  return true;

	    // Check if it's the user who called the case and the case state is in draft
		var currentUserId = this._gs.getUserID();
	    if (!gs.nil(this._case.caller) && this._case.caller == currentUserId && this._case.state == 1)
		    return true;

	    // Check if it's the user who opened the case
	    if (!gs.nil(this._case.opened_by) && this._case.opened_by == currentUserId)
		    return true;

	    // Check if it's the user for whom the case was opened for
	    if (!gs.nil(this._case.opened_for) && this._case.opened_for == currentUserId)
		    return true;

	    // Check if the user is in the watch list field
	    if (!gs.nil(this._case.watch_list) && this._case.watch_list.indexOf(currentUserId) > -1)
		    return true;

	    return false;
    },
	
	canReadCase : function(userId) {
		userId = gs.nil(userId) ? this._gs.getUserID() : userId;
		var hasRole  = new sn_hr_core.hr_Utils().userHasHRRole(userId);
		var roCondition = this._evaluateROConditionForHRCase(userId);
		var parent = this._hasParentAccess(userId);
		return hasRole || roCondition || parent || this._isTaskAssignee();
	},
	
	_hasParentAccess :function(userId){
		var access;
		if (!gs.nil(this._case.parent)) {
			access = (this._case.parent.opened_for == userId || this._case.parent.opened_by == userId || this._case.parent.watch_list.toString().indexOf(userId) >=0);
		}
		return access;
	},

	_isTaskAssignee : function(userId) {
		return new hr_Utils().getCaseSysIdForTaskAssignee(userId).indexOf(this._case.sys_id) >= 0;
	},


	_evaluateROConditionForHRCase: function(userId){
		return sn_hr_core.hr_Case.userHasSubjectPersonAccess(this._case) || this.canEditCase() || this.isApproverUserForCase(userId);
	},


    /*
     * Public helper method to determine if user can cancel his/her own case.
     */
    canCancelCase : function() {
		var currentUserId = this._gs.getUserID();
		var openedFor = this._case.opened_for;

		if (openedFor == currentUserId && !this._case.submitter_can_cancel)
			return false;
		return true;
    },

	/*
	* Public helper method to determine whether the case has an approver user
	*/
	isApproverUserForCase : function(userId){
		var sysApprovalGR = new GlideRecord('sysapproval_approver');
		sysApprovalGR.addQuery('sysapproval', this._case.getUniqueValue());
		sysApprovalGR.addQuery('approver', userId);
		sysApprovalGR.query();
		return sysApprovalGR.next();
	},

    /*
    * Public helper functions to trigger case creation events
    */
    sendEvents : function() {
	    var _gr = this._case;
	    var _gs = this._gs;

	    this._logDebug("sending events for sn_hr_core_case: " + _gr.number);

	    // On insert
	    if (_gr.operation() == "insert")
		    _gs.eventQueue("sn_hr_core_case.inserted", _gr, _gs.getUserID(), _gs.getUserName());

	    if (_gr.operation() == "insert" && _gr.assignment_group.nil())
		    _gs.eventQueue("sn_hr_core_case.inserted.unassigned", _gr, _gs.getUserID(), _gs.getUserName());

	    if (_gr.operation() == "insert" && !_gr.assignment_group.nil())
		    _gs.eventQueue("sn_hr_core_case.inserted.assigned", _gr, _gs.getUserID(), _gs.getUserName());

	    // On update
	    if (_gr.operation() == "update")
		    _gs.eventQueue("sn_hr_core_case.updated", _gr, _gs.getUserID(), _gs.getUserName());

	    // On Assignment group change
	    if (_gr.operation() == "update" && _gr.assignment_group.changes())
		    _gs.eventQueue("sn_hr_core_case.assignment_group.changed", _gr, _gs.getUserID(), _gs.getUserName());

	    // On comments
	    if (_gr.operation() != "insert" && _gr.comments.changes())
		    _gs.eventQueue("sn_hr_core_case.commented", _gr, _gs.getUserID(), _gs.getUserName());
    },

    /*
    * Gets the current calendar duration, utility function
    */
    getCalendarDuration : function() {
	    var start = new GlideDateTime(this._case.getValue("opened_at"));
	    if (!start) {
		    return;
	    }
	    var end = new GlideDateTime();
	    end.setDisplayValue(new GlideDateTime().getDisplayValue());

		var hrUtil = new sn_hr_core.hr_Utils();
	    var seconds = hrUtil.calcDuration(start, end);
	    //Convert seconds to milliseconds and gets the duration value
	    var duration = new GlideDuration(seconds * 1000);
	    this._case.calendar_duration = duration;
    },

    /*
    * Populates fields on sn_hr_core_case from another record
    */
    _setFromRefField : function(refField, fromField, toField) {
	    if (!toField)
		    toField = fromField;

	    if (this._case[toField]) {
		    // The destination is not empty: do not update it
		    return;
	    } else {
		    // Set the source
		    this._logDebug("[setField] " + toField + " set to " + this._case[refField][fromField]);
		    this._case[toField] = this._case[refField][fromField];
	    }
    },

    /*
    * Gets calendar duration between two dates
    *
    * @param startDateTime the start GlideDateTime
    * @param endDateTime the end GlideDateTime
    * @return the GlideDuration between the dates directly
    */
    _calculateCalendarDuration : function(startDateTime, endDateTime) {
	    //calls duration calculator to get the difference of start date and end date in seconds

	    var newDuration = new rhino.global.DurationCalculator();

	    newDuration.calcScheduleDuration(startDateTime, endDateTime);

	    //Convert seconds to milliseconds and gets the duration value
	    var gd = new GlideDuration((newDuration.getSeconds() * 1000));
	    return gd;
    },

    /*
    * Method to iterate through stated sections that are in the properties and
    * work out percentage completed.
    */
    getUserCompletionStatusForm : function(currentRecord) {
	    var formSections = gs.getProperty("com.snc.hr.employee_change.sections", "");
	    var returnSections = {
		    data : []
	    };
	    var totalFields = 0;
	    var totalFilledFields = 0;
	    if (formSections != "") {
		    var uiSections = new GlideRecord("sys_ui_section");
		    uiSections.addEncodedQuery("name=sn_hr_core_case^view=99b6e2c637311100e90d4e06efbe5dbb^captionIN" + formSections);
		    uiSections.query();
		    while (uiSections.next()) {
			    var validElements = this._getSectionElements(uiSections.sys_id);
			    totalFields += validElements.length;
			    var filledFields = 0;
			    for (var i = 0; i < validElements.length; i++) {
				    if (this._validateRecordField(currentRecord, validElements[i]))
					    filledFields++;
			    }
			    totalFilledFields += filledFields;
			    returnSections.data.push(this._checkSectionStatus(uiSections.caption, filledFields, validElements.length));
		    }
	    }
	    returnSections["filled"] = totalFilledFields;
	    returnSections["total"] = totalFields;

	    return returnSections;
    },

    /*
    * Gets display value for passed in variable
    *
    * @param variable The variable whose value is wanted
    * @param defaultAnswer The value to return if a display value could not be found
    * @return The value to display for the passed in variable
    */
    _getDisplayValue : function(variable, defaultAnswer, defaultDisplayValue) {
	    var value = defaultDisplayValue ? defaultDisplayValue : defaultAnswer;

	    var tableName = variable.reference.getDisplayValue();
	    if (!tableName)
		    return value;

	    var record = new GlideRecord(tableName);
	    return (record.get(defaultAnswer)) ? record.getDisplayValue() : value;
    },

    /*
    *  Gets all the elements that are related in the section
    */
    _getSectionElements : function(sectionId) {
	    var elements = [];
	    var uiSectionElement = new GlideRecord("sys_ui_element");
	    uiSectionElement.addQuery("sys_ui_section", sectionId);
	    uiSectionElement.addQuery("type", "");
	    uiSectionElement.query();
	    while (uiSectionElement.next()) {
		    if (uiSectionElement.element.substring(0, 1) != ".")
			    elements.push(uiSectionElement.getDisplayValue("element"));
	    }

	    return elements;
    },

    /*
    *  Used to validate if the field stated in the element is populated.
    */
    _validateRecordField : function(current, element) {
	    if (element.indexOf(".") > -1) {
		    var elementArray = element.split(".");
		    if (elementArray[0] == current.getTableName())
			    return (current.getDisplayValue(elementArray[1]) == "");
		    else {
			    var grRec = new GlideRecord(elementArray[0]);
			    if (grRec.get(current.getValue(elementArray[0]))) {
				    return ((grRec.getDisplayValue(elementArray[1]) != "") && (grRec.getDisplayValue(elementArray[1]) != null));
			    }
		    }
		    return false;
	    } else
		    return current.getDisplayValue(element) != "";

    },

    /*
    * Takes input section with a total of fields and a number of filled in
    * fields. Returns JSON object of progress for section.
    */
    _checkSectionStatus : function(caption, count, total) {
	    var section = {};

	    section["title"] = "" + caption;
	    section["cssClass"] = "";
	    section["status"] = "";

	    if (count == total) {
		    section["cssClass"] = "done";
		    section["status"] = "Done";
	    }
	    if (count < total) {
		    section["cssClass"] = "in_progress";
		    section["status"] = "In Progress";
	    }
	    if (count == 0) {
		    section["cssClass"] = "not_started";
		    section["status"] = "Not Done";
	    }
	    return section;
    },

    /*
    * Convenience method to prevent the code becoming unreadable from the useful debug statements
    */
    _logDebug : function(str) {
	    if (gs.isDebugging())
		    gs.debug(gs.getMessage(str));
    },

	/**
	   Checks if the document is already attached to the case or to the task
	*/
    hasAttachment : function(tableName, currentRecord) {
    	var template;
    	if (tableName == hr.TABLE_TASK)
    		template = currentRecord.parent.pdf_template.getDisplayValue() + '%';
	    else
	    	template = currentRecord.pdf_template.getDisplayValue() + '%';
	    var attachment = new GlideRecord('sys_attachment');
	    attachment.addQuery('table_name', tableName);
	    attachment.addQuery('table_sys_id', currentRecord.sys_id);
	    attachment.addQuery('file_name', 'LIKE', template);
		attachment.setLimit(1);
	    attachment.query();
	    return attachment.hasNext();
    },

	/**
	  Returns true if the current record is a glide record, has a field named pdf_template, has a value for that field,
	  and has an attachment whose name starts with the display value of the pdf template
	*/
	hasPdfTemplateAttachment : function(currentRecord) {
		if (!(currentRecord instanceof GlideRecord))
			return false;
		if (!currentRecord.pdf_template || !currentRecord.pdf_template.getDisplayValue())
			return false;

	    var attachment = new GlideRecord('sys_attachment');
	    attachment.addQuery('table_name', currentRecord.getTableName());
	    attachment.addQuery('table_sys_id', currentRecord.sys_id);
	    attachment.addQuery('file_name', 'STARTSWITH', currentRecord.pdf_template.getDisplayValue());
		attachment.setLimit(1);
	    attachment.query();
	    return attachment.hasNext();
    },

    needUserAction : function(currentRecord, display) {
	    var tasks = new GlideRecord('sn_hr_core_task');
	    if (display == "message")
		    tasks.addActiveQuery();
	    tasks.addQuery('state', 'IN', '10,16,17,18,3,4');
	    tasks.addQuery('parent', currentRecord.getUniqueValue());
	    tasks.addQuery('assigned_to', gs.getUserID());
	    tasks.addNotNullQuery('hr_task_type');
		tasks.setLimit(1);
	    tasks.query();
	    return tasks.hasNext();
    },

	/**
	* Return true if:
    *   the user has case writer role
    *   the case status is assigned or ready
	*   the case isn't already assigned to the user
    *   if there is an assignment group, the user is in the assignment group
	* @return boolean user can assign the case to self
	*/
    canAssignToSelf : function() {
	    var hasRole = this._gs.hasRole("sn_hr_core.case_writer");
	    if (!hasRole)
		    return false;

	    var assignableState = (this._case.state == hr_Constants.CASE_ASSIGNED || this._case.state == hr_Constants.CASE_QUALIFIED);
	    if (!assignableState)
		    return false;

	    var notAssignedToSelf = this._case.assigned_to != this._gs.getUserID();
	    if (!notAssignedToSelf)
		    return false;

	    if (this._case.assignment_group.nil())
		    return true;

	    var user_group = new GlideRecord("sys_user_grmember");
	    user_group.addQuery("user", this._gs.getUserID());
	    user_group.addQuery("group", "" + this._case.assignment_group);
	    user_group.query();
	    var userIsAgentForGroup = user_group.hasNext();

	    return userIsAgentForGroup;
    },

    canSignDocument : function() {
	    if (this._case.assigned_to != this._gs.getUserID())
		    return false;

	    var signature = new GlideRecord('signature_image');
	    signature.addQuery('document', this._case.sys_id);
	    signature.addActiveQuery();
	    signature.query();
	    return !signature.next();
    },

    /*
    * Update a sn_hr_core_case record total_percent_complete field when related tasks are completed
    */
    updateHRCasePercentComplete : function(gr) {
	    // Exit if no parent field
	    if (gr.parent.nil())
		    return;

	    // Exit if unable to get the sn_hr_core_case record
	    var hrCase = new GlideRecord("sn_hr_core_case");
	    if (!hrCase.get(gr.getValue("parent")))
		    return;

	    var totalGr = new GlideRecord("task");
	    totalGr.addQuery("parent", gr.getValue("parent"));
	    totalGr.addQuery("sys_class_name", "!=", "sysapproval_group");
	    totalGr.query();

	    var totalGrCount = totalGr.getRowCount();

	    var completeGr = 0;
	    while (totalGr.next()) {
		    if (!totalGr.active)
			    completeGr++;
	    }

	    var percent = parseInt((completeGr / totalGrCount) * 100);

	    hrCase.setValue("task_percent_complete", percent);
	    hrCase.update();
	    return percent;
    },

    /*
	* Validates whether the changes on the record producer require HR
	* authorization. Returns yes if requires authorization.
	* Called from Employee Update Profile Workflow
	*/
	requireChgAuthorization : function() {
		// Hr case writer can update all fields with no restriction
		var roles = gs.getUser().getRoles();
		if (roles.indexOf('sn_hr_core.case_writer') > -1)
			return 'no';

		var fieldsList = gs.getProperty('sn_hr_core.hr_profile_editable_fields', 'state,home_phone,address,work_mobile,country,work_email,introduction,middle_name,work_phone,zip,personal_email,city,mobile_phone,');
		var parameters = new global.JSON().decode(this._case.payload);
		var grProfile = new GlideRecord(sn_hr_core.hr.TABLE_PROFILE);
		if (grProfile.get(this._case.hr_profile)) {
			var hrProfile = new sn_hr_core.hr_Profile(this._case.hr_profile, this._gs);
			for (var key in parameters) {
 				if (hr_Case._ignoreChangeEditableFields.hasOwnProperty(key))
 					continue;

				var val = hrProfile.getDisplayValue(grProfile, key, false);
				if (parameters[key] != val && fieldsList.indexOf(key) == -1) {
					this._case.comments = gs.getMessage('Change requires an approval, submitting approval request');
					return 'yes';
				}
			}
		}
		// No Approval required if no keys were found in
		return 'no';
	},

	/*
	* Method for Employee Profile Update workflow to update the
	* profile record from values provided from record producer.
	*/
	updateProfile : function() {
		var hrProfile = new sn_hr_core.hr_Profile(this._case.hr_profile, this._gs);
		hrProfile.updateProfile(current.sys_id, current.hr_profile);
	},

	/*
	* Return boolean if the hr Case has a valid task with given assigned to user
	*
	*/
	allowTaskAccessToAssignedToUser : function(userName){
		var hrTask = new GlideRecord('sn_hr_core_task');
		hrTask.addQuery('assigned_to', userName);
		hrTask.addQuery('parent', this._case.getUniqueValue());
		hrTask.query();
		return hrTask.hasNext();
	},

	type : "hr_Case"
};