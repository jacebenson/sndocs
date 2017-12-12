var hr_Profile = Class.create();

// Place field names that do not map directly from the Record Producer to the HR Profile.
// example:
//     	"work_email": "email"
//      - maps value in RP:parameters[work_email] into new gr:profile[email]
hr_Profile.rpToProfileMap = {
			"change_date": "employment_start_date"
};
				
// Do not show these fields in the approval list, and in profile/user updates; users
// do not get to change these.
hr_Profile.userProfileBlacklist = {
			"active" : "",
			"user": "",
			"name": "" ,
			"workday_transaction_log": "",
			"number": "",
			"offboard_type": "",
			"ssn_display": ""
};

hr_Profile.userExclusionList = [ "country", "title", "mobile_phone", "home_phone" ];
	
hr_Profile.userFieldMap = {
			"work_email"  : "email",
			"work_phone"  : "phone",
			"work_mobile" : "mobile_phone",
			"address"     : "street"
};
				
hr_Profile.prototype = {
			initialize: function(_gr, _gs) {
				this._gr = _gr;
				this._gs = _gs || gs;
				
				if (!hr_Profile.tableFields)
					hr_Profile.tableFields = hr_Utils.instance.getFieldsFromTable(hr.TABLE_PROFILE);  // cache tableFields
			},
	
			/**
			* Creates an sn_hr_core_profile record from a parameter list and links it
			* to the sys_user record
			* @param  parameters object map that contain name/value pairs from the RP
			* @return fully populated sn_hr_core_profile record
			*/
			createOrGetProfileFromParameters: function(parameters) {
				var fname = parameters['first_name'];
				var lname = parameters['last_name'];
				var email = parameters['personal_email'];
				
				//get the user from first name / last name
				var userGr = hr_SysUser.instance.getSysUserRecordFromNames(fname,lname);
				//get the hr profile based on unique key
				var profile = this.getProfileFromUniqueKey(fname, lname, email);
				
				// if user and associated profile record is null then create new profile 
			    // along with user and return the newly created profile
				if (gs.nil(userGr) || gs.nil(profile))
					return this._createProfileFromParameters(parameters, null);
				
				//activate the user if not activated
				if (!(profile.user.active)) {
					var params = {};
					params.active = true;
					hr_SysUser.instance.updateSysUserFromParams(profile.user.getUniqueValue(), params);
				}
				//if user and profile exists then return the updated the hr profile 
				return this._updateProfileFromParameters(profile, parameters);
			},
			
			/**
 			* Tests for an sn_hr_core_profile/sys_user record that contains the specified UserID
 			*
 			* @param user user field of record being searched
 			* @return glide record of sn_hr_core_profile if record exists for this field combination,
 			*         null otherwise
 			*/
			getProfileFromUser: function(userId) {
				var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
				return (hrProfile.get('user', userId))? hrProfile: null;
			},
			
			/**
 			* Tests for an sn_hr_core_profile/sys_user record that matches the fields
 			* that unique profile rule.
 			*
 			* Note, fname and lname are stored in the sys_user table and verified through
 			* a reference lookup
 			*
 			* @param fname field first_name of the user record being searched
 			* @param lname field last_name of the user record being searched
 			* @param email field personal_email of the user record being searched
 			* @return glide record of sn_hr_core_profile if record exists for this field combination,
 			*         null otherwise
 			*/
			getProfileFromUniqueKey: function(fname, lname, email) {
				var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
				hrProfile.addQuery('user.first_name', fname); // From sys_user table
				hrProfile.addQuery('user.last_name', lname);  // From sys_user table
				hrProfile.addQuery('personal_email', email);
				hrProfile.query();
				
				return (hrProfile.next())? hrProfile: null;
			},
			
			getProfileFromParameters: function(parameters) {
				var user = parameters['opened_for'] || parameters['user'];
				var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
				
				// Find a profile with thie requested User and return it
				if (hrProfile.get('user', user))
					return hrProfile;
				
				// Else, we create a profile from User and return it; might be null if
				// user id does not match a User record
				return this._createProfileFromUser(user);
			},
			
			getProfileFromId: function(profileId) {
				var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
				return (hrProfile.get(profileId))? hrProfile: null;
			},
			
			getDisplayValue: function(grprofile, fieldName, display) {
				var translatedField = hr_Profile.rpToProfileMap[fieldName] || fieldName;
				
				var profileDisplayValue = (display) ? grprofile.getDisplayValue(translatedField) : grprofile.getValue(translatedField);
				var userDisplayValue = hr_SysUser.instance.getDisplayValue(grprofile.user, fieldName, display);
				
				if (profileDisplayValue)
					return profileDisplayValue;
				if (userDisplayValue)
					return userDisplayValue;
				
				return '';
			},
			
			/**
 			* Creates an HR Profile (and sys_user) record from HR Case record producer
 			* and populates the relevant fields for the variables
 			*
 			* @param  parameters object map that contain name/value pairs from the RP
			* @param  UserGR sys_user gliderecord
 			* @return the sys_id to a fully populated sn_hr_core_profile record
 			*/
			_createProfileFromParameters: function(parameters, sysUser) {
				var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
				hrProfile.initialize();
				// Fill in a new sys_user record if not exists
				if (gs.nil(sysUser))
					hrProfile.user = hr_SysUser.instance.createUserRecordFromParameters(parameters, false);
				else
					hrProfile.user = sysUser.getUniqueValue();
				
				// Fill in the profile fields we care about
				hr_Utils.instance.fillInFromMap(hrProfile, parameters, hr_Profile.rpToProfileMap);
				
				// Create the sn_hr_core_profile record
				hrProfile.insert();	
				return hrProfile;
			},
			
			/**
 			* Updates an HR Profile (and sys_user) record from HR Case record producer
 			* and populates the changed fields for the variables
 			*
 			* @param  parameters object map that contain name/value pairs from the RP
 			* @return fully populated sn_hr_core_profile record
 			*/
			_updateProfileFromParameters: function(profile, parameters) {
				// Update sys_user record
				hr_SysUser.instance.updateUserRecordFromParameters(profile.user, parameters);
				
				// Make the changes in profile
				hr_Utils.instance.fillInFromMap(profile, parameters, hr_Profile.rpToProfileMap);
				profile.update();
				
				return profile;
			},
			
			/*
 			* Convenience method to prevent the code becoming unreadable from the useful debug statements
 			*/
			_logDebug : function(str) {
				if (gs.isDebugging())
					gs.debug(gs.getMessage(str));
			},
			
			/*
 			* Create profile from sys_user
 			* called from the HR case form button
 			*/
			createProfileFromUser: function(userId) {
				var hrProfile = this._createProfileFromUser(userId);
				if (hrProfile)
					return hrProfile.getUniqueValue();
				
				gs.addErrorMessage(gs.getMessage('User record not found'));
				return null;
			},
	
			_createProfileFromUser: function(userId) {
				if(this.userHasProfile(userId))
					return this.getCurrentProfile(userId);
				
				var user = new GlideRecord(hr.TABLE_USER);
				if (user.get(userId)) {
					var hrProfile = new GlideRecord(hr.TABLE_PROFILE);
					hrProfile.initialize();
					hrProfile.user = user.sys_id;
					
					hrProfile.insert();
					hr_Utils.instance.updateUserMismatchField("title", user, hrProfile, 'true');
					hr_Utils.instance.updateUserMismatchField("country", user, hrProfile, 'true');
					hr_Utils.instance.syncProfilesWithMap(user, hrProfile, hr_Profile.userFieldMap, hr_Profile.userExclusionList, 'true');
					return hrProfile;
				}
				return null;
			},
			
			/**
 			* Tests for if sys_user record has a matching HR profile.
 			*
 			* @param userId sys_id field of user
 			* @return true if an sn_hr_core_profile record exists for this userId, false otherwise
 			*/
			userHasProfile: function(userId) {
				if (this.getCurrentProfile(userId))
					return true;
				else
					return false;
			},
			
			getCurrentProfile: function(userId) {
				if (!userId)
					return null;
				
				var gr = new GlideRecord(hr.TABLE_PROFILE);
				gr.addQuery("user", userId);
				gr.addActiveQuery();
				gr.query();
				if (gr.next() && gr.canRead())
					return gr;
				else
					return null;
			},
			
			canReadProfileFields: function() {
				if (this._gr.isNewRecord())
					return true;
				
				// Check the hr role
				if (this._gs.hasRole(hr.ROLE_HR_PROFILE_READER))
					return true;
				
				// Check if the profile is related to the current user
				var profileUser = this._gr.getValue("user");
				if (!gs.nil(profileUser) && this._gs.getUserID() == profileUser)
					return true;
				
				// Check if the current user is a manager of the profile
				if (!gs.nil(profileUser) && new global.HRSecurityUtilsAjax().userReportsTo(profileUser, this._gs.getUserID()))
					return true;
				
				return false;
			},
			
			isCurrentUserRecord: function(current){
				var employeeUser = current.getValue("user");
				return !gs.nil(employeeUser) && gs.getUserID() == employeeUser;
			},
			
			// returns a comma separated list of sys_ids of users under a manager (all reports)
			getAllReports: function(managerId) {
				var managers = [managerId];
				var users = '';
				while (managers.length) {
					managerId = managers.shift();
					var gr = new GlideRecord(hr.TABLE_PROFILE);
					gr.addNotNullQuery('manager');
					gr.addQuery('manager', managerId);
					gr.addActiveQuery();
					gr.query();
					while (gr.next()) {
						if (users == '') {
							users += gr.sys_id;
							managers.push(gr.user.sys_id);
						}
						if (users.indexOf(gr.sys_id) == -1) {
							users += ',' + gr.sys_id;
							managers.push(gr.user.sys_id + '');
						}
					}
				}
				return users;
			},
			
			getProfileFields: function() {
				if (!hr_Profile.profileFields) {
					var profileFields = hr_Utils.instance.getFieldsFromTable(hr.TABLE_PROFILE, null, hr_Profile.userProfileBlacklist);
				
					// Add the profile related fields that are supported in the SysUser table as well
					var userFields = hr_SysUser.instance.getUserProfileFields();
					for (var userField in userFields)
						profileFields[userField] = userFields[userField];
				
					hr_Profile.profileFields = profileFields;
				}
				return hr_Profile.profileFields;
			},
			
			getRPFieldsFromId: function(profileId) {
				var rpFields = {};
				var grProfile = new GlideRecordSecure(hr.TABLE_PROFILE);
				if (grProfile.get(profileId)) {
						for (var field in hr_Profile.tableFields) {
							rpFields[field] = {};
								rpFields[field].value = grProfile.getValue(field);
								rpFields[field].displayValue = grProfile.getDisplayValue(field);
						}
				}
						
				// Add the profile fields that are supported in the SysUser table as well
				var userFields = hr_SysUser.instance.getRPFieldsFromId(grProfile.getValue("user"));
				for (var userField in userFields)
					rpFields[userField] = userFields[userField];
						
				return rpFields;
			},
					
			getRPFieldsFromUserId: function(userId) {
						var rpFields = {};
						// Add the profile fields that are supported in the SysUser table as well
						var userFields = hr_SysUser.instance.getRPFieldsFromId(userId);
						for (var userField in userFields) {
							if (userField!=='country')
									rpFields[userField] = userFields[userField];
						}
						var grProfile = new GlideRecordSecure(hr.TABLE_PROFILE);
						if (grProfile.get('user', userId)) {
								for(var field in hr_Profile.tableFields) {
									var value = grProfile.getValue(field);
									if (value == null || value === 'null')
										continue;
									
									rpFields[field] = {};
									rpFields[field].value = value;
									rpFields[field].displayValue = grProfile.getDisplayValue(field);
								}
						}
						return rpFields;
			},
							
			/*
 			 * Validates if user profile already exists
 			 *
 			 * @param first name - First Name of employee
 			 * @param last name - Last name of employee
 			 * @param email - personal email address of user; if empty return true
 			 * @return boolean whether the user profile exists.
 			*/
			validateUserProfileRecord: function(first_name, last_name, email) {
						if (!email || email == null || email == 'null' || email == 'NULL')
								return true;
				
						email = email + '';
						if (email.trim() == '')
								return true;
				
						var profileRecord = new GlideRecord(hr.TABLE_PROFILE);
						profileRecord.addQuery("user.first_name", first_name);
						profileRecord.addQuery("user.last_name", last_name);
						profileRecord.addQuery("personal_email", email);
						profileRecord.query();
								
						// this._logDebug("[    - validateUserProfileRecord] check " + first_name + " " + last_name + " count - " + profileRecord.getRowCount());
						return profileRecord.getRowCount() == 0;
			},	
								
			updateProfile: function(caseId, profileId) {
						var grProfile = new GlideRecord(sn_hr_core.hr.TABLE_PROFILE);
						if (grProfile.get(profileId)) {
								hr_SysUser.instance.updateSysUser(caseId, grProfile.user);
										
								var qa = new GlideRecord("question_answer");
								qa.addQuery('table_name', 'IN', hr.TABLE_CASE_EXTENSIONS);
								qa.addQuery('table_sys_id', caseId);
								qa.query();
										
								while (qa.next()) {
									var translatedField = hr_Profile.rpToProfileMap[qa.question.name] || qa.question.name;
											
									if ((qa.getValue("value") != null) && grProfile.isValidField(translatedField))
										grProfile.setValue(translatedField, qa.getValue("value"));
								}
								if (grProfile.update())
									gs.addInfoMessage(gs.getMessage('Profile updated successfully'));
								else
									gs.addErrorMessage(gs.getMessage('Profile not updated'));
						}
			},
								
			type: "hr_Profile"
};