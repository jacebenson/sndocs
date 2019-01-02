var hr_Utils = Class.create();

hr_Utils.prototype = {
	initialize : function() {
		//this._log = new GSLog(hr.LOG, this.type).setLog4J();
	},
	
	userHasSPClientRole : function(user){
		var userId = user || gs.getUserID();
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('user', userId);
		gr.addQuery('role.name','LIKE','sn_hr_sp.hrsp_%');
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
	
	userHasHRRole : function(user) {
		var userId = user || gs.getUserID();
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('user', userId);
		gr.addQuery('role.name', hr.ROLE_HR_CASE_READER);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
	
	// Used as a reference qualifier in Disciplinary issue RP variable
	getHRClientUsers: function() {
		return "active=true";
	},

	//Used as a reference qualifier in Opened For field of Case form
	getOpenedForUsers: function() {
		var roles = gs.getUser().getRoles();
		if (roles.indexOf(hr.ROLE_HR_CASE_WRITER) > -1)
			//return all client users if case_writer
			return this.getHRClientUsers();
		else {
		    var users = [gs.getUserID()];
		    return 'sys_idIN'+ users.join(',');
        }
	},
	
	//Used as a reference qualifier in Subject Person field of Case form
	getSubjectPersonUsers: function() {
		var roles = gs.getUser().getRoles();
		if (roles.indexOf(hr.ROLE_HR_CASE_WRITER) > -1)
			//return all client users if case_writer
			return this.getHRClientUsers();
		else{
            //return only the subordinates and himself for current user
            var users = this.getHRClientSubordinateUsers(gs.getUserID());
            return 'sys_idIN'+ users.join(',');
        }
	},
	
	getHRClientSubordinateUsers:function(sysid){
		var subusers = new sn_hr_core.hr_SysUser().getAllReports(sysid).split(',');
		subusers.push(sysid);
		return subusers;
	},
	
	getHRRoles:function(searchString){
		var ids = [];
		var gr = new GlideRecord('sys_user_role');
		gr.addQuery('name','LIKE',searchString);
		gr.query();
		while (gr.next())
			ids.push(gr.sys_id.toString());
		
		return ids;
	},

	canUpdateContact: function(){
		var gr = new GlideRecord(hr.TABLE_BENEFICIARY);
		if (gr.get('contact.user', previous.user)) {
			//Beneficiary found but user is same returning true
			if (current.user == previous.user)
				return true;
			else
				//Beneficiary found and user is not same returning false
				return false;
		} else
			//Beneficiary not found returning true
			return true;
	},

	hasVIPUser: function(){
		var gr = new GlideRecord('sys_user');
		var q = gr.addQuery('sys_id', previous.opened_for);
		q.addOrCondition('sys_id',previous.subject_person);
		gr.addQuery('vip',true);
		gr.query();
		return gr.next();
	},

	getRoledUsers: function(queryCondition, roleListIds) {
		var users = {};
		var gr = new GlideRecord('sys_user_has_role');
		if (roleListIds) {
			gr.addQuery('role', queryCondition, roleListIds);
		}
		gr.query();
		while (gr.next()) {
			users[gr.user.toString()] = true;
		}

		var ids = [];
		for (var id in users)
			ids.push(id);

		return ids;
	},
	
	getAvailableTemplates : function() {
		var sysIds = '';
		return sysIds;
	},

	/*
 	 * Convenience method to get all the groups to which the user belongs to.
 	 */
	_getMyGroups: function(){
		var gr = new GlideRecord('sys_user_grmember');
		gr.addQuery("user", gs.getUserID());
		gr.addQuery("group.active", true);
		gr.query();
		var groups = [];
		while (gr.next())
			groups.push(gr.group);
		return groups.toString();
	},

	userHasRole : function(user) {
		var gr = new GlideRecord('sys_user_has_role');
		gr.addQuery('user',user);
		var qc = gr.addQuery('role.name','sn_hr_sp.hrsp_employee');
		qc.addOrCondition('role.name','sn_hr_sp.hrsp_new_hire');
		gr.query();
		return gr.hasNext();
	},

	/*
 			* Convenience method to prevent the code becoming unreadable from the useful debug statements
 			*/
	_logDebug : function(str) {
		if (gs.isDebugging())
			gs.debug(str);
	},

	hasApprovalPending : function(hrcase) {
		var gr = new GlideRecordSecure('sysapproval_approver');
		gr.addActiveQuery();
		gr.addQuery('sysapproval', hrcase.sys_id);
		gr.addQuery('state', 'requested');
		gr.setLimit(1);
		gr.query();

		return gr.hasNext();
	},
	
	canAccessManagedDoc: function(current) {
		var docRevGR = new GlideRecord('dms_document_revision');
		docRevGR.addActiveQuery();
		docRevGR.addQuery('stage', 'published');
		docRevGR.query();
		
		var docRevs = [];
		while (docRevGR.next()) {
			if (this._isDocRevOwner(docRevGR))
				docRevs.push(docRevGR.getUniqueValue());
		}
		return docRevs;	
	},
	
	_isDocRevOwner: function(docRevGR) {
		return (docRevGR.document.owner == gs.getUserID()) || gs.getUser().isMemberOf(docRevGR.document.owning_group.toString());
	}, 
	
	isWhiteListed : function(field, userId) {
		var roles = gs.getUser().getRoles();
		if (roles.indexOf(hr.ROLE_HR_PROFILE_WRITER) > -1)
			return true;
		// Check if the current field is present in the whitelist
		var editables = hr.DEFAULT_WHITELIST;

		var gr = new GlideRecord('sys_properties');
		if (gr.get('name', 'sn_hr_core.hr_profile_editable_fields'))
			editables = gr.value + ',';

		return !gs.nil(userId) && userId == gs.getUserID()
			&& this._arrayContains(editables.split(','), field);
	},

	_arrayContains : function(ary, seed) {
		for (var i = 0; i < ary.length; i++)
			if (ary[i].trim() === seed)
				return true;
		return false;
	},

	getRelevantPDFTemplates : function(record) {
		var strReturn = "sys_idIN";
		strReturn += this.getPDFTemplateBasedOnDocumentType(record.document_type, record.subject_person);
		
		return strReturn;
	},
	

	getPDFTemplateBasedOnDocumentType : function(documentType, subjectPerson){

		var documentTemplates = new GlideRecord('sn_hr_core_document_template');
		documentTemplates.addActiveQuery();

		if (documentType) 
			documentTemplates.addQuery('document_type', documentType);	

		documentTemplates.query();
		
		validTemplates = [];

        while (documentTemplates.next()) {
            if (this._criteriaHelper(documentTemplates, subjectPerson)) 
                validTemplates.push(documentTemplates.getUniqueValue());			
        }

		return validTemplates.join(',');
	},
	
	_criteriaHelper:function(template, subject_person) {

		if (template && subject_person) {
			var hrCriteria = template.getValue('hr_criteria');

			if (hrCriteria) {
				var isValidCriteria = new hr_Criteria().evaluateById(hrCriteria+'', subject_person +'');
				
				if (isValidCriteria) {
					//If HR criteria is valid return document template
					return template;
				} 
			} else {
				//If no HR Criteria, return document template
				return template;
			}
		}

		return "";
	},

	/*
 	 * Convert the parameters filled into a Record Producer, into a GlideRecord.  Map and fields using an
 	 * optional map object.
 	 */
	fillInFromMap : function(gr, parameters, map) {
		// Fill in the new Profile records
		for ( var key in parameters) {
			var field = (map && map[key]) ? map[key] : key;

			if (gr.isValidField(field))
				gr.setValue(field, parameters[key]);
		}
	},

	/*
 	 * Convert the fields filled into a GlideRecord, into a Record Producer.
 	 * Map and fields using an map object that is also inverted from RP -> GR map.
 	 */
	translateFieldFromMap : function(source, fieldMap, labelMap) {
		dest = {};
		var fields = this.invertMap(fieldMap);

		// Fill in the new Profile records
		for ( var key in source) {
			var destKey = (fields && fields[key]) ? fields[key] : key;
			dest[destKey] = (labelMap && labelMap[destKey]) ? labelMap[destKey] : source[destKey];
		}

		return dest;
	},

	/*
 	 * Invert a map so that the key and value are swapped; not generalizable as this only
 	 * works for map[String] = String;
 	 */
	invertMap : function(inverseMap) {
		var map = {};
		for ( var key in inverseMap) {
			var label = inverseMap[key];
			map[label] = key;
		}

		return map;
	},

	getFieldsFromTable : function(table, whitelist, blacklist) {
		var fieldsData = {};
		var badPrefix = "sys_";

		// Load the records from the passed in table directly
		var grTable = new GlideRecord(table);
		var elements = grTable.getElements();
		var schemas = [];
		for (var x = 0; x < elements.length; x++) {
			var ed = elements[x].getED();
			schemas.push(ed);
		}
		for (var i = 0; i < schemas.length; i++) {
			var glideElement = schemas[i];
			if ((glideElement.getName() + '').indexOf(badPrefix) !== 0)
				if (this._useField(glideElement, whitelist, blacklist))
					fieldsData[glideElement.getName()] = glideElement.getLabel();
		}

		return fieldsData;
	},

	_useField : function(ge, whitelist, blacklist) {
		if (whitelist && whitelist[ge.getName()] === undefined)
			return false;

		if (blacklist && blacklist[ge.getName()] !== undefined)
			return false;

		return true;
	},

	dereferenceField : function(ref, table, column) {
		var gr = new GlideRecord(table);
		if (gr.get(ref))
			return gr.getValue(column);
	},

	/* Start of Deprecated functions as of Helsinki */
	
	/*
 	 * Update a sn_hr_core_case record total_percent_complete field when related tasks are completed
 	 */
	updateHRCasePercentComplete : function(gr) {
		return new hr_Case().updateHRCasePercentComplete(gr);
	},
	
	generateUserName : function(first_name, last_name) {
		return new hr_SysUser().generateUserName(first_name, last_name);
	},
	
	createProfileFromUser : function(userId) {
		return new hr_Profile().createProfileFromUser(userId);
	},

	// Sync User for HR Profiles who do not have user during upgrade
	syncProfileWithUser : function(_gr) {
		var tblName = _gr.getTableName();

		// Exit if not sn_hr_core_profile or sys_user
		if (!(tblName == hr.TABLE_PROFILE || tblName == hr.TABLE_USER))
			return null;
		// If this is a sn_hr_core_profile sync, or exit if no user associated
		if (tblName == hr.TABLE_PROFILE) {
			if (!_gr.user.nil()) {
				var userGr = new GlideRecord(hr.TABLE_USER);
				if (!userGr.get(_gr.getValue("user")))
					return null;

				var profileExclusionList = [ "country", "position", "home_phone", "mobile_phone" ];
				if (userGr.canWrite()) {
					this._updateProfileMismatchField("position", _gr, userGr); // position is of ref type and title is sys_choice
					this._updateProfileMismatchField("country", _gr, userGr);
					map = {
						"email" : "work_email",
						"street" : "address"
					};
					return this.syncProfilesWithMap(_gr, userGr, map, profileExclusionList, 'true');
				}
			} else
				return null;
		}

	},

	/*
 	 * Synchronises data between the sys_user and the sn_hr_core_profile table if the field name
 	 * and type matches
 	 */
	syncProfileFields : function(_gr) {
		var tblName = _gr.getTableName();
		var destGr;

		// Exit if not sn_hr_core_profile or sys_user
		if (!(tblName == hr.TABLE_PROFILE || tblName == hr.TABLE_USER))
			return null;
		// If this is a sn_hr_core_profile sync, or exit if no user associated
		if (tblName == hr.TABLE_PROFILE) {
			if (!_gr.user.nil()) {
				var userGr = new GlideRecord(hr.TABLE_USER);
				if (!userGr.get(_gr.getValue("user")))
					return null;

				var profileExclusionList = [ "country", "position", "home_phone", "mobile_phone" ];
				if (userGr.canWrite()) {
					this._updateProfileMismatchField("position", _gr, userGr); // position is of ref type and title is sys_choice
					this._updateProfileMismatchField("country", _gr, userGr);
					map = {
						"email" : "work_email",
						"street" : "address"
					};
					return this.syncProfilesWithMap(_gr, userGr, map, profileExclusionList, 'false');
				}
			} else
				return null;
		}

		// If this is a sys_user sync , or exit if no profile points to it
		if (tblName == hr.TABLE_USER) {
			destGr = new GlideRecord(hr.TABLE_PROFILE);
			destGr.addQuery("user", _gr.getValue("sys_id"));
			destGr.query();
			if (destGr.next()) {
				if (destGr.canWrite()) {
					var userExclusionList = [ "country", "title", "mobile_phone", "home_phone" ];
					this.updateUserMismatchField("title", _gr, destGr);
					this.updateUserMismatchField("country", _gr, destGr);
					map = {
						"work_email" : "email",
						"address" : "street"
					};
					return this.syncProfilesWithMap(_gr, destGr, map, userExclusionList, 'false'); // Only sync one profile for a user.
				}
			} else
				return null;
		}
		return;
	},

	// Sync fields between GlideRecord objects with field map
	syncProfilesWithMap : function(srcGr, destGr, map, exclusionList, copyAllFields) {
		var srcFields = this._getChangedFields(srcGr, copyAllFields);
		var touched = false;
		var destFields = destGr.getElements();
		for (var x = 0; x < destFields.length; x++) {
			var element = destFields[x];
			var elName = element.getName();

			var isExcluded = false;
			for ( var exclude in exclusionList)
				if (elName == exclusionList[exclude])
					isExcluded = true;

			if (elName in srcFields && (!isExcluded)) {
				destGr.setValue(elName, srcGr.getValue(elName));
				touched = true;
			}
		}
		for ( var key in map) {
			if (map[key] in srcFields) {
				destGr.setValue(key, srcGr.getValue(map[key]));
				touched = true;
			}
		}
		if (touched) {
			destGr.getUniqueValue();
			destGr.update();
		}
		return destGr;
	},

	updateUserMismatchField : function(srcField, srcGr, destGr, copyAllFields) {
		var srcValue = srcGr.getValue(srcField);
		if (srcValue) {
			var touched = false;
			var srcFieldChanges = this._getChangedFields(srcGr);
			if (srcField == "title" && (srcField in srcFieldChanges || copyAllFields == 'true')) {
				var position = new GlideRecord("sn_hr_core_position");
				if (position.get("position", srcGr.title)) {
					destGr.setValue('position', position.sys_id);
					touched = true;
				} else
					gs.warn("[hr_Utils] User title '" + srcGr.title + "' does not exist in sn_hr_core_position");
			}
			if (srcField == "country" && (srcField in srcFieldChanges || copyAllFields == 'true')) {
				var country = new GlideRecord("core_country");
				country.get("iso3166_2", srcGr.country); // iso3166_2 is column name for country code in country table.
				destGr.setValue("country", country.sys_id);
				touched = true;
			}
			if (touched) {
				destGr.setWorkflow(false);
				destGr.getUniqueValue();
				destGr.update();
			}
		}
	},

	_updateProfileMismatchField : function(srcField, srcGr, destGr) {
		var srcValue = srcGr.getValue(srcField);
		if (srcValue) {
			var touched = false;
			var srcFieldChanges = this._getChangedFields(srcGr);
			if (srcField == "position" && srcField in srcFieldChanges) {
				var destTitleValue = new GlideRecord("sn_hr_core_position");
				if (destTitleValue.get(srcValue)) {
					destGr.setValue("title", destTitleValue.getDisplayValue());
					touched = true;
				}
			}
			if (srcField == "country" && srcField in srcFieldChanges) {
				var destValue = new GlideRecord("core_country");
				if (destValue.get(srcValue)) {
					destGr.setValue("country", destValue.iso3166_2); // iso3166_2 is column name for country code in country table.
					touched = true;
				}
			}
			if (touched) {
				destGr.getUniqueValue();
				destGr.update();
			}
		}
	},

	/*
 	 * Return an array containing elements of a GlideRecord that
 	 * have changed. Do not return calculated fields
 	 */
	_getChangedFields : function(srcGr, copyAllFields) {
		var changed = {};
		var fields = srcGr.getElements();
		for (var x = 0; x < fields.length; x++) {
			var element = fields[x];
			if (copyAllFields == 'true' || element.changes()) {
				var elName = element.getName();
				if (!element.getED().isVirtual() && !elName.startsWith('sys_'))
					changed[elName] = element;
			}
		}
		return changed;
	},

	maskSSN : function(str) {
		if (gs.nil(str))
			return "";
		//Remove the unwanted special characters
		str = this.sanitize(str);
		var trailingCharsIntactCount = 4;
		str = str.toString();
		var newstr = str;

		if (str.length > 4) {
			newstr = str.substring(0, str.length - trailingCharsIntactCount);
			newstr = newstr.replace(/./g, 'x') + str.slice(-trailingCharsIntactCount);

		}
		return newstr;
	},

	/**
 	 * Remove the unwanted speacial characters from the String
 	 * Characters inside regex array will be removed from string.
 	 */
	sanitize : function(str){
		var cleanStr = str.replace(/[-()]/g,'');
		return cleanStr;
	},

	getDocRevisionInfoByDocumentId : function(docId) {
		var docRevision = {};
		docRevision.filename = this.getDocumentNameById(docId);

		var gr = new GlideRecord("dms_document_revision");
		gr.addQuery("document", docId);
		gr.addQuery("stage", "published");
		gr.query();
		if (gr.next()) {
			var info = this.getAttachmentInfo("dms_document_revision", gr.getUniqueValue());
			docRevision.href = "/sys_attachment.do?sys_id=" + info.sys_id;
			docRevision.contentType = info.content_type;
			docRevision.bytes = info.size_bytes;
		}
		return docRevision;
	},

	getDocumentNameById : function(docId) {
		var gr = new GlideRecord("dms_document");
		if (gr.get(docId))
			return gr.getValue("name");
	},

	getAttachmentInfo : function(tableName, tableSysId) {
		var gr = new GlideRecord("sys_attachment");
		gr.addQuery("table_name", tableName);
		gr.addQuery("table_sys_id", tableSysId);
		gr.query();
		var info = {};
		if (gr.next()) {
			info.sys_id = gr.getUniqueValue();
			info.size_bytes = gr.getValue("size_bytes");
			info.content_type = gr.getValue("content_type");
		}
		return info;
	},

	/**
 									* Get the (actual) duration, between startTime and endTime
 									*/
	calcDuration : function(/* GlideDateTime or String */startTime, /* GlideDateTime or String */endTime) {
		if (!startTime || !endTime)
			return 0;

		endTime = new GlideDateTime(endTime);
		startTime = new GlideDateTime(startTime);
		var offsetEndTime = endTime.getTZOffset();
		var offsetStartTime = startTime.getTZOffset();
		return Math.floor((endTime.getNumericValue() + offsetEndTime) / 1000) - Math.floor((startTime.getNumericValue() + offsetStartTime) / 1000);
	},
	
	canReadHRTables:function(){
		var roles = gs.getUser().getRoles();
		for(var i=0;i<roles.length;i++){
			if(roles[i].indexOf(hr.ROLE_HR_ANY) > -1){
				return true;
			}
		}
		return false;
	},

	addUserRole: function(role, userSysId) {
		if(this.isHRRole(role)){
			var gr = new GlideRecord('sys_user_has_role');
			gr.initialize();
			gr.user = userSysId;
			gr.role = role;
			var res = gr.insert();
			if(!res)
				gs.addErrorMessage(gs.getMessage("Your role does not allow assignment of {0} role", this._getRoleName(role)));
		}
	},
	
	isHRRole: function(role){
		var gr = new GlideRecord('sys_user_role');
		gr.addQuery("sys_id",role);
		gr.addQuery('name', 'STARTSWITH', "sn_hr_");
		gr.query();
		return gr.next();
	},

	// Removes all core roles and portal roles.
	removeRolesAssigned:function(userSysId){
		var answer = [];
		var gr = new GlideRecord('sys_user_role');
		var gc = gr.addQuery('name', 'STARTSWITH', "sn_hr_core.hrsm");
		gc.addOrCondition('name', 'STARTSWITH', "sn_hr_sp.hrsp");
		gr.query();
		while (gr.next()) {
			answer.push(gr.getValue('name'));
		}
		if(answer.length > 0){
			new global.HRSecurityUtilsAjax().removeUserRoles(userSysId, answer.join(','));
		}
	},

	//   Assigns roles based on condition mntioned in HR condition table.
	matchingPortalRoles:function(current){
		var userSysId = current.user.sys_id;
		var conditions = this._matchingPortalRolesCondition('sn_hr_core_client_role_rule');
		for (var i = 0; i < conditions.length; i++) {
			var bool = GlideFilter.checkRecord(current, conditions[i].conditions);
			if (bool) {
				var hasRole = this._checkIsRolePresent(userSysId, conditions[i].roleName);
				if(hasRole){
					this.addUserRole(conditions[i].roleName, userSysId);
				}
			}
		}
	},

	// Checks whether user already has role. If he has core role it will remove and assign portal role if service portal is enabled.
	_checkIsRolePresent:function(userSysId,role){
		var hasRole = new GlideRecord('sys_user_has_role');
		var roleName = this._getRoleName(role);
		if(roleName.indexOf("hrsm") > -1){
			roleName = roleName.replace("core.hrsm","sp.hrsp");
			hasRole.addQuery('user.sys_id',userSysId);
			hasRole.addQuery('role.name',roleName);
			hasRole.query();
			while(hasRole.next()){
				return false;
			}
			return true;
		}
		if(roleName.indexOf("hrsp") > -1){
			roleName = roleName.replace("sp.hrsp","core.hrsm");
			hasRole.addQuery('user.sys_id',userSysId);
			hasRole.addQuery('role.name',roleName);
			hasRole.query();
			while(hasRole.next()){
				new global.HRSecurityUtilsAjax().removeUserRoles(userSysId,role);
			}
			return true;
		}
		return false;
	},

	//   Gets role name from role sys_id.
	_getRoleName:function(role){
		var roleName = new GlideRecord('sys_user_role');
		roleName.addQuery('sys_id',role);
		roleName.query();
		if(roleName.next()){
			return roleName.name;
		}
	},

	_matchingPortalRolesCondition:function(table) {
		var criteria = new GlideRecord(table);
		var conditions = [];
		criteria.addQuery('active', 'true');
		criteria.query();
		while (criteria.next()) {
			var condition = criteria.condition.condition.toString();
			var role = criteria.role.toString();
			conditions.push({conditions: condition,roleName: role});
		}
		return conditions;
	},

	//   Assigns new role based on new condition.
	assignRolesPerCondition:function(condition,role){
		var user = new GlideRecord('sn_hr_core_profile');
		user.addEncodedQuery(condition);
		user.query();
		while(user.next()){
			var bool = this._checkIsRolePresent(user.user.sys_id,role);
			if(bool){
				this.addUserRole(role,user.user.sys_id);
			}
		}
	},

	//   Removes previously assigned roles based on previous condition.
	removePreviouslyAssignedRoles:function(condition,roleName){
		var user = new GlideRecord('sn_hr_core_profile');
		user.addEncodedQuery(condition);
		user.query();
		while(user.next()){
			new global.HRSecurityUtilsAjax().removeUserRoles(user.user.sys_id,roleName);
		}
	},

	//get list of case sys Id's that need to be approved
	getCaseSysIdListForApprovals:function(userId){
		var caseSysIdList = [];
		var sysApprovalGR = new GlideRecord('sysapproval_approver');
		sysApprovalGR.addQuery('approver', userId);
		sysApprovalGR.query();
		while(sysApprovalGR.next())
			caseSysIdList.push(String(sysApprovalGR.sysapproval));

		return caseSysIdList.toString();
	},
	
	//get list of case sys Id's for task Assignee
	getCaseSysIdForTaskAssignee : function(userId){
		var caseSysIdList = [];
		var hrTask = new GlideRecord('task');
		hrTask.addQuery('sys_class_name', 'sn_hr_core_task');
		hrTask.addQuery('assigned_to', userId);
		hrTask.addNotNullQuery('parent');
		hrTask.query();
		while (hrTask.next())
			caseSysIdList.push(String(hrTask.parent));
		return caseSysIdList.toString();
	},
	
	/*
	 * Returns the portal page to redirect to for hr service, sc catalog and order guide task types
	 */
	ticketPage: function() {
		if (new GlidePluginManager().isActive('com.sn_hr_service_portal'))
			return new sn_hr_sp.hr_PortalUtil().ticketPage();
	},
	
	cleanupChildRecordsForCase: function(grCase) {
		var gr = new GlideRecord('sn_hr_core_case');
		gr.addQuery('parent', grCase.sys_id);
		gr.addActiveQuery();
		gr.setValue('state', '7');
		gr.updateMultiple();
		
		gr = new GlideRecord('sn_hr_core_task');
		gr.addQuery('parent', grCase.sys_id);
		gr.addActiveQuery();
		gr.setValue('state', '4');
		gr.setValue("work_notes", gs.getMessage('Automatically closed because parent case was cancelled'));
		gr.updateMultiple();
	},

	type : 'hr_Utils'
};

hr_Utils.initializeQueryVariables = function() {
	hr_Utils.instance = new hr_Utils();
	hr_Utils.myGroups = hr_Utils.instance._getMyGroups();
	hr_Utils.myCasesWithApprovals = hr_Utils.instance.getCaseSysIdListForApprovals(gs.getUserID());
	hr_Utils.myCasesWithTasks = hr_Utils.instance.getCaseSysIdForTaskAssignee(gs.getUserID());
};

hr_Utils.initializeQueryVariables();