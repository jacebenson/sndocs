/**
 * hr_Ajax
 *
 * Wraps all ajax request methods used by HR Core.
 */
var hr_CaseAjax = Class.create();

hr_CaseAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	initialize : function(request, responseXML, gc) {
		global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},

	getDefaultVIPPriority : function() {
		var vipPriority = hr.DEFAULT_HIGH_PRIORITY;
		var vipPropertyName = 'sn_hr_core.hr_vip_default_priority';
		var gr = new GlideRecord("sys_properties");
		gr.addQuery("name", vipPropertyName);
		gr.query();
		if (gr.next()) {
			var priority = gr.getValue('value');
			vipPriority = priority ? priority : vipPriority;
		}
		return vipPriority;
	},

	_getDefaultPriorityFromService : function(service) {
		var grService = new GlideRecord('sn_hr_core_service');
		if(grService.get(service)){
			var priorityFromTemplate = this._getTemplateProperty(grService.template,'priority');
			if(priorityFromTemplate != null)
				return priorityFromTemplate;
		}
	},

	getPriority: function(){
		var service = this.getParameter('sysparm_service');
		var usersParm = this.getParameter('sysparm_users');
		var users = usersParm ? new global.JSON().decode(usersParm) : [];
		if(this._containsVipUser(users))
			return this.getDefaultVIPPriority();
		else if(service){
			var priority = this._getDefaultPriorityFromService(service);
		
			var glideRecord = new GlideRecord("sn_hr_core_case");
			glideRecord.newRecord();
			
			var defaultPriority = glideRecord.getValue('priority');
			
			return priority ? priority : defaultPriority;
		}
	},

	getNoticePeriod: function(userSysId){
		if (!userSysId)
			return '';

		var hrProfile = new GlideRecord(hr.TABLE_PROFILE);

		hrProfile.addQuery('user', userSysId);
		hrProfile.query();

		if (hrProfile.next() && hrProfile.canRead())
			return hrProfile.notice_period + '';
		else
			return '';
	},

	getDepartment: function(positionSysId){
		if (!positionSysId)
			return {};

		var department = {};

		var position = new GlideRecord(hr.TABLE_POSITION);
		position.addQuery('sys_id', positionSysId);
		position.query();

		if (position.next()){
			department.name = 'department';
			department.value = position.department + '';
			department.displayValue = position.getDisplayValue('department') + '';
		}

		return department;
	},

	getManager: function(departmentSysId){
		if (!departmentSysId)
			return {};

		var manager = {};

		var department = new GlideRecord(hr.TABLE_DEPARTMENT);
		department.addQuery('sys_id', departmentSysId);
		department.query();

		if (department.next()){
			manager.name = 'manager';
			manager.value = department.dept_head + '';
			manager.displayValue = department.getDisplayValue('dept_head') + '';
		}

		return manager;
	},

	isPhoneNumberValid : function(number){
		if(gs.nil(number)){
			number = this.getParameter('sysparm_phoneNumber');
		}
		if(gs.nil(number)){
			return new global.JSON().encode({valid:false, number:''});
		}
		var invalidResultsArray = [];
		if((number+"").indexOf(',') > 0){
			var numbers = (number+"").split(',');
			for(var num in numbers){
				if(gs.nil(numbers[num])){
					invalidResultsArray.push(false);
				}
				if(numbers[num]){
					var data = JSON.parse(this._validateNumber(numbers[num]));
					if(!data.valid)
						return new global.JSON().encode({valid:false});
				}
			}
			if(invalidResultsArray.length > 0){
				return new global.JSON().encode({valid:false});
			}
			return new global.JSON().encode({valid:true});

		} else {
			return this._validateNumber(number);
		}
	},

	_validateNumber : function(number){
		var record = new GlideRecord('sn_hr_core_profile');
		record.initialize();
		// home_phone is used only for validating any phone number
		var gePN = record.home_phone;
		var data = {};
		data.valid = gePN.setPhoneNumber(number + "",true);
		if(!data.valid){
			var numberWithUsersCode = this.getUsersCountryCode() + number;
			data.valid = gePN.setPhoneNumber(numberWithUsersCode,true);
		}
		if(data.valid){
			data.number = gePN.getGlobalDisplayValue();
		} else {
			data.number = '';
		}
		return new global.JSON().encode(data);
	},

	getUsersCountryCode : function(){
		var defaultCode = '+1';
		var user = new GlideRecord('sys_user');
		user.get(gs.getUserID());
		var country = user.getDisplayValue('country');
		if(country){                                      //Users having country code 'US' have country value null.
			var prefix = '+';
			var code = new GlideRecord('sys_phone_territory');
			code.get('name',country);
			return prefix + code.ccc;
		}
		return defaultCode;
	},

	_getTemplateProperty : function(templateSysId, field) {
		return new sn_hr_core.hr_TemplateUtils()._getTemplateProperty(templateSysId, field);
	},

	_inactivePreviousSignature : function(tableName, documentId){
		var record = new GlideRecordSecure(tableName);
		if (record.get(documentId) && !record.active) {
			return;     //don't delete signature for completed tasks
		}
		var gr = new GlideRecord('signature_image');
		gr.addQuery('user', gs.getUserID());
		gr.addQuery('table', tableName);
		gr.addQuery('document', documentId);
		gr.addActiveQuery();
		gr.setValue('active', false);
		gr.updateMultiple();
	},

	documentBody : function(tableName, tableId, targetTable, targetId, canEdit) {
		// Ensure you can read and write to the target record, unless the target record does not exist
		var task = new GlideRecord(targetTable);
		var tableGr = new GlideRecord(tableName);
		if (task.isValid() && task.get(targetId)) {
			if (!(task.canRead() && task.canWrite()))
				return {};
		} else if (tableGr.isValid() && tableGr.get(tableId)) {
			if (!(tableGr.canRead() && tableGr.canWrite()))
				return {};
		} else
			return {};

		if (canEdit == 'true')
			this._inactivePreviousSignature(tableName, tableId);
		var hrform = new GeneralHRForm(tableName, tableId, targetTable, targetId);
		return canEdit == 'true' ? hrform : {body: hrform.remove_all_variables(hrform.body)};
	},

	setDocumentBody : function(documentBody, tableName, tableId, targetTable, targetId, canEdit) {
		// Ensure you can read and write to the target record, unless the target record does not exist
		var task = new GlideRecord(targetTable);
		var tableGr = new GlideRecord(tableName);
		if (task.isValid() && task.get(targetId)) {
			if (!(task.canRead() && task.canWrite()))
				return {};
		} else if (tableGr.isValid() && tableGr.get(tableId)) {
			if (!(tableGr.canRead() && tableGr.canWrite()))
				return {};
		} else
			return {};
		
		if (documentBody.trim() == '')
			gs.debug("[setDocument] The document is empty, returning");
		else {
			if (canEdit == 'false') {
				var templateBody = this.documentBody(tableName, tableId, targetTable, targetId, 'true');
				documentBody = templateBody.body;
			}
			var gr = new GlideRecord("draft_document");
			gr.addQuery('table', tableName);
			gr.addQuery('document', tableId);
			gr.addActiveQuery();
			gr.query();

			if (gr.next() && gr.canWrite()){
				gr.setValue('body', documentBody);
				gr.target_table = targetTable;
				gr.target_id = targetId;
				gr.update();
			} else {
				gr.initialize();

				gr.table = tableName;
				gr.document = tableId;
				gr.body = documentBody;
				gr.target_table = targetTable;
				gr.target_id = targetId;
				gr.user = gs.getUserID();

				gr.insert();
			}
		}
	},

	/**
     * Tests for an sn_hr_core_profile/sys_user record that contains the specified UserID
     *
     * @param user user field of record being searched
	 * @return sys_id of sn_hr_core_profile if record exists for this field combination,
	 *         empty string otherwise
     */
	ajaxFunction_createOrGetProfileFromUser: function() {
		var userId = this.getParameter('sysparm_user');
		if (!userId) {
			gs.debug("[getProfileFromUser] Didn't receive any parameters, returning");
			return;
		}
		var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
		if (hrProfile.get('user', userId))
			return hrProfile.canRead() ? hrProfile.sys_id : '';

		return this._createProfileFromUser(userId);
	},

	/**
 	* Creates profile when called from HR case form
 	*/
	_createProfileFromUser : function(userId) {
		if (!userId) {
			gs.debug("[createProfileFromUser] Didn't receive any parameters, returning");
			return;
		}
		var user = this._getUserNameFromSysId(userId);
		gs.addInfoMessage(gs.getMessage('HR profile is created for {0}', user));
		var answer = new hr_Profile().createProfileFromUser(userId);
		return answer;
	},

	ajaxFunction_canAccessProfile : function() {

		if (new sn_hr_core.hr_CoreUtils().impersonateCheck())
			return false;

		var roles = gs.getUser().getRoles();
		if (roles.indexOf(hr.ROLE_HR_PROFILE_READER) > -1)
			return true;

		var profileId = this.getParameter('sysparm_profile');
		var caseId = this.getParameter('sysparm_caseId');
		if (gs.nil(profileId)){
			if(gs.getUserID()==this._getOpenedForFromCaseId(caseId))
				return true;
			profileId = this._getProfileIdFromCaseId(caseId);
			if (gs.nil(profileId))
				return false;
		}

		// Check if the profile is related to the current user
		var profile = new GlideRecord('sn_hr_core_profile');
		if (profile.get(profileId)) {
			var profileUser = profile.getValue("user");

			if (!gs.nil(profileUser) && (gs.getUserID() == profileUser || new global.HRSecurityUtilsAjax().userReportsTo(profileUser, gs.getUserID(), '')))
				return true;
		}
		return false;
	},

	_getProfileIdFromCaseId : function(caseId){
		var gr =  new GlideRecordSecure('sn_hr_core_case');
		if (gs.nil(caseId) || !gr.get(caseId))
			return '';

		return gr.hr_profile;
	},

	_getOpenedForFromCaseId : function(caseId){
		var gr =  new GlideRecordSecure('sn_hr_core_case');
		if (gs.nil(caseId) || !gr.get(caseId))
			return '';

		return gr.opened_for;
	},

	ajaxFunction_getCatalogVariableNames : function() {
		this._log
		.debug("[getCatalogVariableNames] Retrieving all the variables for the hr_case_management variable set");

		var answer = {
			variables : []
		};

		var gr = new GlideRecord("item_option_new");
		gr.addQuery("variable_set.name", "hr_benefit_questions");
		gr.query();

		while (gr.next())
			answer.variables.push(gr.name + "");

		if (gs.isDebugging())
			gs.debug("[getCatalogVariableNames] variables -- " + answer.variables.join(", "));

		return new global.JSON().encode(answer);
	},

	createUserAndProfile : function() {
		var firstName = this.getParameter('firstName');
		if (!firstName) {
			gs.debug("[createUserAndProfile] Didn't receive a first name, returning");
			return;
		}
		var lastName = this.getParameter('lastName');
		if (!lastName) {
			gs.debug("[createUserAndProfile] Didn't receive a last name, returning");
			return;
		}
		var personalEmail = this.getParameter('personalEmail');
		if (!personalEmail) {
			gs.debug("[createUserAndProfile] Didn't receive a personal email, returning");
			return;
		}
		var parameters = { first_name     : firstName,
						   last_name      : lastName,
						   personal_email : personalEmail
						 };

		var profile = new hr_Profile().createOrGetProfileFromParameters(parameters);
		if (profile) {
			var answer = { id   : profile.user + '',
						   name : profile.user.getDisplayValue()
						 };
			return new global.JSON().encode(answer);
		}
	},

	getTemplateFields: function() {
		var templateSysId = this.getParameter('sysparm_template_sys_id');
		var usersParm = this.getParameter('sysparm_users');
		var users = usersParm ? new global.JSON().decode(usersParm) : [];

		var templateData = new sn_hr_core.hr_TemplateUtils()._getTemplateData(templateSysId);
		// g_form does not fully support setValue(field, "javascript:...")
		for (var key in templateData)
			if (String(templateData[key].value).indexOf("javascript:") > -1)
				delete templateData[key];

		if (templateData.hasOwnProperty("priority") && this._containsVipUser(users))
			templateData["priority"] = this.getDefaultVIPPriority();

		return new global.JSON().encode(templateData);
	},

	_containsVipUser : function(userArr) {
		var userGr = new GlideRecord("sys_user");
		for (var i = 0; i < userArr.length; i++)
			if (userArr[i] && userGr.get(userArr[i]) && userGr.vip)
				return true;

		return false;
	},

	getCoeFromDetail : function() {
		var detailId = this.getParameter('sysparm_detail_sys_id');
		var detailGr = new GlideRecord("sn_hr_core_topic_detail");

		if (detailGr.get(detailId) && !gs.nil(detailGr.topic_category.coe))
			return detailGr.topic_category.coe.toString();

		return "";
	},

	_getData : function(gr){
		var data = {};
		var elements = gr.getElements();
		for(var i=0; i<elements.length; i++){
			var ed = elements[i].getED();
			var name = ed.getName();
			data[name] = gr.getValue(name);
		}
		data['ZZ_YY_display_value'] = gr.getDisplayValue();
		return data;
	},

	getGlideRecordSecureData : function(table,query){
		var gr = new GlideRecordSecure(table);
		if(gr.get(query))
			return new global.JSON().encode(this._getData(gr));
		else
			return new global.JSON().encode(false);
	},

	getGlideRecordSecureSetData : function(table,query){
		var records = [];
		var gr = new GlideRecordSecure(table);
		gr.addEncodedQuery(query);
		gr.query();
		while(gr.next())
			records.push(this._getData(gr));
		return new global.JSON().encode(records);
	},

	/**
     * Sends an event request to reactivate the specified user
     *
     * @param sysparm_user - id of the user to reactivate
	 * @return true if the user request has been added to the queue
     */
	ajaxFunction_reactivateUser: function() {
		var userId = this.getParameter('sysparm_user');
		var grProfile = new GlideRecord(hr.TABLE_PROFILE);

		if (!userId) {
			gs.warn("[reactivateUser] Didn't receive id of user to reactivate, returning");
			return false;
		} else if (!grProfile.get('user', userId)) {
			gs.warn("[reactivateUser] Unable to retrieve profile for user to reactivate, returning");
			return false;
		} else if (!gs.hasRole(hr.ROLE_HR_PROFILE_WRITER)) {
			gs.warn("[reactivateUser] User does not have permission to reactivate the user, returning");
			return false;
		}

		gs.eventQueue("sn_hr_core_profile.reactivate_user", grProfile, '', '');

		return true;
	},

	/**
     * Checks whether the user with the sepcified sysId given can be found
     *
     * @param sysparm_user - id field of record being searched for
	 * @return true if the record was found, false otherwise
     */
	ajaxFunction_checkUserActive: function() {
		var userId = this.getParameter('sysparm_user');
		if (!userId) {
			gs.warn("[checkUserActive] Didn't receive any parameters, returning");
			return;
		}
		var grUser = new GlideRecord('sys_user');
		return grUser.get(userId);
	},

	ajaxFunction_inactivateRecords: function() {

        var tableName = this.getParameter('sysparm_tableName');
        var query = this.getParameter('sysparm_query');
        var filter = this.getParameter('sysparm_filter');

        var gr = new GlideRecordSecure(tableName);
        gr.addEncodedQuery(query);
        gr.addActiveQuery();
        gr.query();
        gr.setValue('active', 'false');
        gr.updateMultiple();
        var msg = gr.getRowCount() == 1 ? '{0} record inactivated.' : '{0} records inactivated.';
        msg += '<a href="' + tableName + '_list.do?sysparm_query=' + filter + '"> Click here.</a>';
        gs.addInfoMessage(gs.getMessage(msg, gr.getRowCount()));
        return;
    },

	getOfficeSpaceParams: function(sys_id) {
		var params = {
			'user_to_be_moved' : '',
			'short_description': ''
		};

		var grTask =  new GlideRecord('task');
		grTask.get(sys_id + '');

		var className = grTask.sys_class_name;

		if (className == 'sn_hr_core_task') {
			grTask = new GlideRecord('sn_hr_core_task');
			grTask.get(sys_id + '');
			params["short_description"] = grTask.short_description + '';

			var parentCaseGR = new GlideRecord('sn_hr_core_case');
			parentCaseGR.get(grTask.getValue('parent'));
			params['user_to_be_moved'] = parentCaseGR.subject_person + '';
		} else {
			var hierarchyUtils = new GlideTableHierarchy(grTask.sys_class_name);
			var baseTable = hierarchyUtils.getBase();
			if (baseTable == 'sn_hr_core_case') {
				grTask = new GlideRecord(className + '');
				grTask.get(sys_id + '');

				params['user_to_be_moved'] = grTask.subject_person + '';

				var tasks = new GlideRecord('sn_hr_core_task');
				tasks.addQuery('parent', sys_id);
				tasks.query();
				while (tasks.next()) {
					if (tasks.sc_cat_item) {
						// Set params for Select Office Space SC Catalog item
						if (tasks.sc_cat_item.sys_id == '65f6ad093b143200705d86a734efc43b')
							params['short_description'] = tasks.short_description + '';
					}
				}
			}
		}
		return params;
	},

	directDepositValidation: function(param) {
        var record = JSON.parse(param);
        var amounts = [];
        var percentages = [];
        var balances = [];
        populateArrays(record);

        var deposits = new GlideRecord('sn_hr_core_direct_deposit');
        deposits.addActiveQuery();
        deposits.addQuery('employee', record.employee);
        deposits.addQuery('sys_id', '!=', record.sys_id);
        deposits.query();
        while (deposits.next()) {
            populateArrays(deposits);
        }

        if (record.deposit_type == 'amount')
            return validateAmount(record);
        else if (record.deposit_type == 'percentage')
            return validatePercentage(record);
        else if (record.deposit_type == 'balance')
            return validateBalance(record);

			function populateArrays(gr) {
				if (gr.deposit_type == 'amount')
					amounts[gr.sys_id] = gr.deposit_amount;
				else if (gr.deposit_type == 'percentage')
					percentages[gr.sys_id] = gr.deposit_percentage.toString();
				else if (gr.deposit_type == 'balance')
					balances.push(gr.sys_id);
				else {
					return new global.JSON().encode(gs.getMessage("Deposit type is required"));
				}
			}

			function validateAmount(record) {
				if (record.deposit_amount == 0 || !record.deposit_amount)
					return new global.JSON().encode(gs.getMessage("Deposit amount must be greater than zero"));

				if (Object.keys(percentages).length > 0)
					return new global.JSON().encode('conflict');

				return true;
			}

			function validatePercentage(record) {
				if (!record.deposit_percentage || record.deposit_percentage <= 0 || record.deposit_percentage > 100)
					return new global.JSON().encode(gs.getMessage("Deposit percentage must be greater than zero and less than or equal to 100"));

				var sum = 0;

				for (var key in percentages)
					sum += Number(percentages[key]);

				if (sum > 100)
					return new global.JSON().encode(gs.getMessage("Total direct deposit instructions for {0} exceed 100%", record.employee_name));
				else if (sum == 100 && Object.keys(balances).length > 0)
					return new global.JSON().encode(gs.getMessage("Total direct deposit instructions for {0} are already 100%", record.employee_name));


				if (Object.keys(amounts).length > 0)
					return new global.JSON().encode('conflict');

				return true;
			}

			function validateBalance(record) {
				if (Object.keys(percentages).length > 0) {
					var sum = 0;
					for (var key in percentages)
						sum += Number(percentages[key]);

					if (sum >= 100)
						return new global.JSON().encode(gs.getMessage("A balance deposit type cannot be added because {0} has direct deposit instructions totalling 100%", record.employee_name));
				}

				if (Object.keys(balances).length > 1)
					return new global.JSON().encode('conflict');

				return true;
			}
    },

	/*
	* Returns an array of objects. Each object contains:
	* -Field : whose value is update
	* -Table : To which table that field belongs to(user or profile)
	* -newValue : The value requested by user.
	*
	* @param - Unique value of case record.
	* This function uses payload object for finding
	* all the modified fields.
	*/
	getModifiedFields: function(){
		var caseId = this.getParameter('sysparm_caseId') + '';
		var grCase = new GlideRecord(sn_hr_core.hr.TABLE_CASE);
		if(grCase.get(caseId)){
			var modifiedFields = this._getModifiedFields(grCase);
			return new global.JSON().encode(modifiedFields);
		}
	},

	/*
	* Private method to determine all modified fields from case record
	*/
	_getModifiedFields: function(grCase){
		//Cat item variables implementation may differ from form fields
		var mismatchFields = [ "country",'country_of_birth','home_phone','work_mobile','mobile_phone'];

		var payload = JSON.parse(grCase.payload);
		var grProfile = grCase.hr_profile.getRefRecord();
		var grUser = grCase.subject_person.getRefRecord();
		var fields = [];

		//Loop through the fields from RP
		for (var prop in payload) {
			var isMisMatchProperty = mismatchFields.indexOf(prop)>-1;

			//Filter out mismatched fields
			if(!isMisMatchProperty){

				//Check if field belongs to HR Profile
				if(grProfile.hasOwnProperty(prop)) {
					fields.push(this._getModifiedFieldInfo(grProfile,'profile',prop,payload[prop]));
					continue;

				//Check if field belongs to Sys User record
				} else if(grUser.hasOwnProperty(prop) && (!isMisMatchProperty)){
					fields.push(this._getModifiedFieldInfo(grUser,'user',prop,payload[prop]));
					continue;
				}

			//Handle mismatch fields
			} else if(isMisMatchProperty){
				if((prop == 'country' || prop == 'country_of_birth') && grProfile.getValue(prop)!=payload[prop])
					fields.push(this._getModifiedFieldInfo(grProfile,'profile',prop,this.getCountryName(payload[prop])));
				else if(prop=='home_phone'||prop=='work_mobile' || prop=='mobile_phone'){
					var phoneNumber = this.sanitizePhoneNumber(payload[prop]);
					if(phoneNumber != grProfile.getValue(prop))
						fields.push(this._getModifiedFieldInfo(grProfile,'profile',prop,payload[prop]));
				}
			}
		}
		return fields;
	},

	//Returns the object that contains updated field info
	_getModifiedFieldInfo: function(grProfile,table,prop,newValue){
		var currentValue = this.sanitize(grProfile.getValue(prop),'');

		//Checking if value is modified
		if(currentValue !== newValue){
			return ({
				table:table,
				field:prop,
				newValue:this.sanitize(newValue,'Empty')
			});
		}
	},

	sanitizePhoneNumber: function(number){
		return number.replace(/[\s-()]/g,"");
	},

	getCountryName: function(countryId){
		var c = new GlideRecord('core_country');
		return (c.get(countryId))?c.getDisplayValue():gs.getMessage('Empty');
	},

	sanitize: function(value,defaultVal){
		return (value)?value:defaultVal;
	},
	/*
	* Public method to add info message when opened_for is a user without HR profile
	*/
	addMsgForOpenedForHRProfile : function(){
		var gr = new GlideRecord('sn_hr_core_profile');
		gr.addQuery('user',this.getParameter('sysparm_sys_id'));
		gr.query();
		if (!gr.hasNext()) {
			var user = this._getUserNameFromSysId(this.getParameter('sysparm_sys_id'));
			if (user)
				gs.addInfoMessage(gs.getMessage('HR profile will be created for {0}', user));
			else
			    gs.addInfoMessage(gs.getMessage('HR profile will be created for opened_for user'));
		}
	},
	
	_getUserNameFromSysId : function(sysId){
			var grUser = new GlideRecord('sys_user');
			grUser.addQuery('sys_id',sysId);
			grUser.query();
			if(grUser.next())
				return grUser.name;
	},
	ajaxFunction_getPDFTemplate: function() {
		var documentType = this.getParameter('sysparm_document_type');
		var subjectPerson = this.getParameter('sysparm_subject_person');
		var answer = new sn_hr_core.hr_Utils().getPDFTemplateBasedOnDocumentType(documentType, subjectPerson);

		return answer;
	},

	type : "hr_CaseAjax"
});
