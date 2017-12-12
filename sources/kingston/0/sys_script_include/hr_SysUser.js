var hr_SysUser = Class.create();

hr_SysUser.rpToUserMap = {
			"work_email": "email",
			"work_phone": "phone",
			"work_mobile": "mobile_phone",
			"address": "ignore",
			"city": "ignore",
			"state": "ignore",
			"zip": "ignore"
};

hr_SysUser.userProfileWhitelist = {
			"first_name" : "", 
			"middle_name":"", 
			"last_name":"" , 
			"employee_number":"",
			"introduction":"", 
			"gender":"", 
			"department":"", 
			"manager":"", 
			"location":"", 
			"phone":"", 
			"email":"", 
			"home_phone":"", 
			"mobile_phone":""
};

hr_SysUser.userProfileLabelsMap = {
			"work_email": "Work email",
			"work_phone": "Work phone",
			"work_mobile": "Work mobile"
};

hr_SysUser.prototype = {
	initialize: function(_gr, _gs) {
		this._gr = _gr;
        this._gs = _gs || gs;
    },
	
	createUserRecordFromParameters: function(parameters, setUserCredentials) {
		// (0) Adjust the data by dereferencing fields to get at the right column
		parameters['title'] = hr_Utils.instance.dereferenceField(parameters['position'], 'sn_hr_core_position', 'position');
		parameters['country_code'] = hr_Utils.instance.dereferenceField(parameters['country'], 'core_country', 'iso3166_2');

	    // (1) Create a new user record	
    	var grUser = new GlideRecord(hr.TABLE_USER);
    	grUser.initialize();
		
		// (2) Store questions/answers in user record
		hr_Utils.instance.fillInFromMap(grUser, parameters, hr_SysUser.rpToUserMap);

		// (3) parameters[country_code] has the code we want to put into 'country' field
		// and country also has sys_id of country (needed elsewhere), adjust manually.
		if(parameters['country_code'])
			grUser.country = parameters['country_code'];

		if(setUserCredentials) {
			// (4) Generate an appropriate username for the user
			grUser.user_name = this.generateUserName(grUser.first_name, grUser.last_name);

			// (5) Indicate that the user password needs a reset
			grUser.password_needs_reset = "true";

			//(6) Set the password to user's email
			var glideElement = grUser.getElement("user_password");
			glideElement.setDisplayValue(parameters['personal_email'] + ""); 
		}
		
    	// (7) Return sys_id of user record
    	return grUser.insert();
	},
	
	updateUserRecordFromParameters: function(user, parameters) {
		var grUser = new GlideRecord(hr.TABLE_USER);
		grUser.get(user);
		
		// (1) Store questions/answers in user record
		hr_Utils.instance.fillInFromMap(grUser, parameters, hr_SysUser.rpToUserMap);

		// (2) parameters[country_code] has the code we want to put into 'country' field
		// and country also has sys_id of country (needed elsewhere), adjust manually.
		if(parameters['country_code'])
			grUser.setValue('country', parameters['country_code']);
    
    	// (3) Return sys_id of user record
    	return grUser.update();
	},
			
	generateUserName: function(first_name, last_name) {
		var userName = first_name + "." + last_name;
		var record = new GlideRecord(hr.TABLE_USER);
		if (!record.get("user_name", userName))
        	return userName.toLowerCase();

        var count = (gs.getProperty("sn_hr_core.profile.max.tries", 50));
        for (var suffix = 0; suffix < count; ++suffix) {
        	record = new GlideRecord("sys_user");
            userName = first_name + "." + last_name + suffix;
            if (!record.get("user_name", userName))
                return userName.toLowerCase(); 
    	}
		gs.debug("[hr_SysUser] Cannot generate user name for " + first_name + ", " + last_name);
    	return null;
    },
	
	getDisplayValue: function(userId, fieldName, display) {
		var user = new GlideRecord(hr.TABLE_USER);
		if (!user.get(userId))
			return '';
		
		var translatedField = hr_SysUser.rpToUserMap[fieldName] || fieldName;
		var userDisplayValue = (display) ? 
			user.getDisplayValue(translatedField) : 
			user.getValue(translatedField);
		
		return userDisplayValue || '';
	},
	
	// returns a comma separated list of user sys_ids of direct reports to a manager
	getDirectReports: function(managerId) {
		var users = '';
		var gr = new GlideRecord(hr.TABLE_USER);
		gr.addQuery('manager', managerId);
		gr.addActiveQuery();
		gr.query();
		while (gr.next()) {
			if (users == '')
				users += gr.sys_id;
			if (users.indexOf(gr.sys_id) == -1)
				users += ',' + gr.sys_id;
		}
		return users;
	},
	
	// returns a comma separated list of sys_ids of users under a manager (all reports)
	getAllReports: function(managerId) {
		var managers = [managerId];
		var users = '';
		while (managers.length) {
			managerId = managers.shift();
			var gr = new GlideRecord(hr.TABLE_USER);
			gr.addQuery('manager', managerId);
			gr.addActiveQuery();
			gr.query();
			while (gr.next()) {
				if (users == '') {
					users += gr.sys_id;
					managers.push(users);
				}
				if (users.indexOf(gr.sys_id) == -1) {
					users += ',' + gr.sys_id;
					managers.push(gr.sys_id + '');
				}
			}
		}
		return users;
	},
	
	getRPFieldsFromId: function(userId) {
		var rpFields = {};
		var grUser = new GlideRecordSecure(hr.TABLE_USER);
        if (grUser.get(userId)) {
			if (!hr_SysUser.userToRPMap)
				hr_SysUser.userToRPMap = hr_Utils.instance.invertMap(hr_SysUser.rpToUserMap);
			
			if (!hr_SysUser.tableFields)
				hr_SysUser.tableFields = hr_Utils.instance.getFieldsFromTable(hr.TABLE_USER);
			
			for(var field in hr_SysUser.tableFields) {
				var translatedField = hr_SysUser.userToRPMap[field] || field;
				
				var value = grUser.getValue(field);
				if (value == null || value === 'null')
					continue;
				
				rpFields[translatedField] = {};
				rpFields[translatedField].value = value;
				rpFields[translatedField].displayValue = grUser.getDisplayValue(field);
			}
		}
		return rpFields;
	},

	getUserProfileFields: function() {
		if (!hr_SysUser.userProfileFields) {
			var fields = hr_Utils.instance.getFieldsFromTable(hr.TABLE_USER, hr_SysUser.userProfileWhitelist);
			hr_SysUser.userProfileFields = hr_Utils.instance.translateFieldFromMap(fields, hr_SysUser.rpToUserMap, hr_SysUser.userProfileLabelsMap);
		}
		return hr_SysUser.userProfileFields;
	},
	
	getSysUserRecordFromNames : function(firstName, lastName) {
		var grUser = new GlideRecord(sn_hr_core.hr.TABLE_USER);
		grUser.addQuery('first_name',firstName);
		grUser.addQuery('last_name',lastName);
		grUser.query();
		return grUser.next() ? grUser : null;
	},
	
	getSysUser : function(userSysId){
		var grUser = new GlideRecord(sn_hr_core.hr.TABLE_USER);
		grUser.get(userSysId);
		return grUser;
		
	},
	
	updateSysUserFromParams : function(userSysId, jsonParams){
		var grUser = new GlideRecord(sn_hr_core.hr.TABLE_USER);
		grUser.get(userSysId);
		for (var prop in jsonParams)
			grUser[prop] = jsonParams[prop];

		grUser.update();
	},
	
	updateSysUser: function(caseId, userId) {		
		var grUser = new GlideRecord(sn_hr_core.hr.TABLE_USER);
        if (grUser.get(userId)) {
			var qa = new GlideRecord('question_answer');
			qa.addQuery("table_name", 'IN', hr.TABLE_CASE_EXTENSIONS);
            qa.addQuery('table_sys_id', caseId);
            qa.query();
            while (qa.next()) {
				var translatedField = hr_SysUser.rpToUserMap[qa.question.name] || qa.question.name;
                if (translatedField!='country' && (qa.getValue("value") != null) && grUser.isValidField(translatedField))
                    grUser.setValue(translatedField, qa.getValue("value"));
            }
            grUser.update();
        }
	},
	
	generatePassword: function() {
		var utils = new global.HRSecurityUtils();
		var pwd = utils.generatePassword();
		return pwd;
	},
	
    type: 'hr_SysUser'
};

hr_SysUser.instance = new hr_SysUser();