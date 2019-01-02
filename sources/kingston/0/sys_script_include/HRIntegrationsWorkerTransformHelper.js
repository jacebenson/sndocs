var HRIntegrationsWorkerTransformHelper = Class.create();
var hrIntegrationsHelper = new HRIntegrationsHelper();

HRIntegrationsWorkerTransformHelper.prototype = {
	initialize: function() {
		
	},
	
	todayDate : "",
	
	getTodayDate: function(source) {
		if (!this.todayDate)
			this.todayDate = hrIntegrationsHelper.getProperty(hrIntegrations.CURRENT_SYNC_DATE,source.source.sys_id);
		return this.todayDate;
	},
	
	/*
	 * Perform the transform on the record. - to be called from Transform Map.
	 */
	transform: function(source, target) {
		if (this.shouldSkipTransform(source, target)) {
			ignore = true;
			return;
		}
		this.processEmploymentStatus(source, target);
		this.postProcessTransform(source,target);
	},
	
	/**
	 * This is for customers to add custom logic.
	 */
	postProcessTransform : function(source, target) {
	},
	
	// Should this record be skipped ?
	shouldSkipTransform: function(source, target) {
		//do not insert a new profile for terminated workers and future hires
        //The future hires will not have a start date in the Use queue - so we need to account for it..
		var transactionLogMatched = false;
		var profile = new GlideRecord('sn_hr_core_profile');
		var isPushEnabled = hrIntegrationsHelper.isPushEnabled(source.source);
		if (profile.get(target.sys_id) && isPushEnabled)
			if (profile.getValue('transaction_log') && source.getValue('transaction_log'))
				transactionLogMatched = profile.getValue('transaction_log').indexOf(source.getValue('transaction_log').trim()) > -1;
		if (((source.terminated== "1"||source.employement_status=='T') && action == "insert") || (source.currently_active == "0" && !source.current_hire_date) || source.current_hire_date > this.getTodayDate(source)|| (transactionLogMatched)) {
			ignore = true;
			return true;
		} else {
			return false;
		}
	},

	processEmploymentStatus: function(source, target) {
		//If a worker is terminated, set the employment status and end date
		if (source.terminated == "1"||source.employement_status=='T') {
			gs.info(">>>>>>>>>>>>>SET EMPLOYEE END DATE >>>>>>>>>>>>>>>>>>>>>>>");
			target.employment_end_date = source.end_date;
		} 
	},
	
	/**
	 * Override this if you don't want the manager update.
	 */
	shouldSkipManagerUpdate: function(record) {
		return false;
	},
	
	postProcessAllRecords: function(importSetId) {
		this.updateManagers(importSetId);
	},
	
	/**
	 * Update the manager information after transform (performed at the end).
	 */
	updateManagers: function(importSetId) {
		var hrRead;
		var hrWrite;
		var employeeID = "";
		var managerID = "";
		var managerSysID = "";

		var wd = new GlideRecord(hrIntegrations.HR_WORKER_STAGING);
		wd.addQuery("sys_import_set",importSetId);
		wd.query();
			
		// Query the integration table for each record and retrieve the workday manager and employee IDs			
		while (wd.next()) {			
			if (this.shouldSkipManagerUpdate(wd))
				continue;
			
			managerID = wd.manager_id;
			employeeID = wd.employee_id;
			if (!gs.nil(employeeID) && !gs.nil(managerID)) {
				//Query the sys_user table to get the hr record for each manager from the integration table				 

				hrRead = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
				hrRead.addQuery("employee_number", managerID);
				hrRead.query();
				if (hrRead.next()){
					// Retrieve the sys_id using the workday manager id
					managerSysID = hrRead.sys_id;
					if (managerSysID != null) {
						//Query the sys_user table to get the hr_record for each employee from the integration table and update it 
						// with the manager sys_id
						hrWrite = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
						hrWrite.addQuery("employee_number", employeeID);							
						hrWrite.query();
						if (hrWrite.next()) {
							//Query the sys_user table for each employee and update the manager info
							if (hrWrite.manager != managerSysID) {
								hrWrite.manager = managerSysID;
								hrWrite.update();
							}
						
							// add manager to watch list of HR Change request
							/*var hrchange = new GlideRecord("sn_hr_core_case");
							hrchange.addQuery('hr_profile', hrWrite.sys_id);
							hrchange.addQuery('request_category.type', sn_hr_core.hr.CATEGORY_TYPE_ONBOARDING);
							hrchange.query();
							if (hrchange.next()) {
								var watchList = hrchange.watch_list + '';
								if (watchList.indexOf(managerSysID) == -1) {
									hrchange.watch_list = managerSysID + ',' + watchList;
									hrchange.update();
								}
							}*/
						}															
					}
				}
			}
			else if (!gs.nil(employeeID)){
				hrWrite = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
						hrWrite.addQuery("employee_number", employeeID);							                    hrWrite.addNotNullQuery("manager");
						hrWrite.query();
						if (hrWrite.next()) {
								hrWrite.manager = "";
								hrWrite.update();
							}
			}
		}
	},
	
	/**
	 * Terminate sys_user record.
	 */
	terminateSysUser: function(target) {
		var sysUser = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
		if (sysUser.get(target.user)) {
			sysUser.active = false;
			sysUser.locked_out = true;
			sysUser.update();
		}
	},
	
	/**
	 * Determine whether sys_user record exist for this profile
	 */
	getSysUser: function(source) {
		var email = '';
		var empId = '';
		if (source.getValue('primaryworkemail'))
			email = source.getValue('primaryworkemail').trim();
		if (source.getValue('employee_id'))
			empId = source.getValue('employee_id').trim();
		var sysUsrQry = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
		if (source.getValue('pref_first_name'))
			sysUsrQry.addQuery("first_name", source.getValue('pref_first_name').trim());
		if (source.getValue('pref_last_name'))
			sysUsrQry.addQuery("last_name", source.getValue('pref_last_name').trim());
		if (email && email != 'NULL')
			sysUsrQry.addQuery("email", email);
		sysUsrQry.addQuery("employee_number", empId);
		sysUsrQry.query();
		return sysUsrQry.next() ? sysUsrQry : null;
	},
	
	/**
 	* Create the sys_user record for the sn_hr_core_profile record.
 	*/
	createSysUserForHrProfile: function(source, target) {
		var userName;
		var sid = "";
		var sysGlideRecord;
		
		gs.info("Target User  " + target.user + "  "+ source.employee_id);
		if (target.user) {
			this.updateUser(source, target.user);
			if ((source.terminated == "1"||source.employement_status=='T') && source.end_date < this.getTodayDate(source)||source.currently_active=="0")
				this.terminateSysUser(target);
			return;
		}
		
		/**
 		* If profile already exists with same first name, last name and
 		* personal email combination, then update the user for the profile
 		**/
		var profile = this.getProfile(source);
		gs.info("Is Profile Found " + profile) ;
		if (profile) {
			gs.info("Profile Found "  + profile.user);
			this.updateUser(source, profile.user);
			target.user = profile.user;
			if ((source.terminated == "1"||source.employement_status=='T') && source.end_date < this.getTodayDate(source))
				this.terminateSysUser(target);
			return;
		}
		
		//If the profile is terminated, do not create sys_user account
		if ((source.terminated == "1"||source.employement_status=='T') && source.end_date < this.getTodayDate(source))
			return;
		
		// First search sys_user
		sysGlideRecord = this.getSysUser(source);
		if (sysGlideRecord) {
			sid = sysGlideRecord.sys_id;
			//this._debug("Found user in sys_user: " + sysGlideRecord.user_name + " sys_user_id = " + sid);
		} else {
			// User does not exist in sys_user
			// create it
			userName = this.getUserName(source);
			if (!userName) {
				//this._debug("Skipping user creation. Generated username is null for "+source.pref_first_name+ " "+source.pref_last_name);
				gs.info("Generated username is null for "+source.pref_first_name+ " "+source.pref_last_name, hrIntegrations.HR_INT_LOADER_LOG);
			} else {
				sysGlideRecord = this.createUser(source, userName);
				if (sysGlideRecord) {
					sid = sysGlideRecord.insert();
				//	this._debug("Created new sys user: " + userName + " first_name = " + source.pref_first_name);
				}
			}
		}
		target.user = sid;
	},
	
	/**
     * Check if profile exists
	 */
	getProfile: function(source) {
		var fname = source.legal_first_name;
		var lname = source.legal_last_name;
		var email = source.primarypersonalemail;
		var empId = source.getValue('employee_id').trim();
		var hrProfile = new GlideRecord(hrIntegrations.HR_PROFILE_TABLE);
		hrProfile.addQuery('user.first_name', fname); // From sys_user table
		hrProfile.addQuery('user.last_name', lname);  // From sys_user table
		if (email && email != 'NULL')
			hrProfile.addQuery('personal_email', email);
		hrProfile.addQuery('user.employee_number', empId);
		hrProfile.query();

		return (hrProfile.next())? hrProfile: null;
	},
	
	/**
	 * Get the new UserName.
	 * You can extend this script and override this logic if needed.
	 */
	getUserName: function(source) {
		return new sn_hr_core.hr_SysUser().generateUserName(source.getValue('pref_first_name').trim(), source.getValue('pref_last_name').trim());
	},
	
	/**
	 * Method to update sys_user record
	 * 
	 * Override this method to modify different columns in sys_user table
	 */
	updateUser: function(source, userSysId) {
		if (this.shouldSkipUpdate(source, userSysId))
			return;
		
		var sysUser = new GlideRecord(hrIntegrations.SYS_USER_TABLE);
		var updated = false;
		var importFields = ["primaryworkemail", "full_legal_name", "legal_first_name", "legal_last_name","legal_middle_name", "work_phone","home_mobile_phone","employee_id","transaction_log","name_prefix"];
		var userFields = ["email", "name", "first_name", "last_name","middle_name", "phone", "mobile_phone","employee_number","transaction_log","introduction"];
		if (sysUser.get(userSysId)) {
			for (var i = 0; i < importFields.length; ++i) {
				var importField = importFields[i];
				var userField = userFields[i];
				if (sysUser[userField] != source[importField]) {
					updated = true;
					sysUser[userField] = source[importField];
				}
			}
			//activate the user if not active
			if(!sysUser.active && (source.terminated == "1"||source.employement_status=='T') && source.end_date < this.getTodayDate(source))
				sysUser.active = true;
			var locationUpdated =  this.updateLocation(source, sysUser);
			var deptUpdated =  this.updateDepartment(source, sysUser);
			
			if (updated || locationUpdated || deptUpdated) {
				gs.info('Updating user with username:' + sysUser.user_name);
				sysUser.update();
			}
		}
	},
	
	/**
	 * Check if transaction log matches, i.e. no new update from workday
	 */
	shouldSkipUpdate: function (source, userSysId) {
		var transactionLogMatched = false;
		var profile = new GlideRecord('sn_hr_core_profile');
		var isPushEnabled = hrIntegrationsHelper.isPushEnabled(source.source);
		if (profile.get('user.sys_id',userSysId) && isPushEnabled)
			if (profile.getValue('transaction_log') && source.getValue('transaction_log'))
				transactionLogMatched = profile.getValue('transaction_log').indexOf(source.getValue('transaction_log').trim()) > -1;
		return transactionLogMatched;
	},
	
	/*
	 * Method to create the sys_user. 
	 * Returns the glide record to create the user record.
	 * 
	 * Override this method to set various column values for the record. The insert() will be performed by the calling
	 * function (in this case - createSysUserForHrProfile() ).
	 */
	createUser: function(source, userName) {
		var sid;
		var sysUsrName; 
		var skipUserCreation = false;

		if (skipUserCreation) {
			/*this._debug('[As per Workday properties settings] Skipping creation of user: '+userName+
						' for profile with name: '+source.full_legal_name);*/
			return null;
		}
		gs.info('Creating user with username:'+userName);
			
		sysUsrName = new GlideRecord(hrIntegrations.SYS_USER_TABLE);			
		sysUsrName.initialize();
		sysUsrName.email = source.primaryworkemail;
		sysUsrName.phone = source.work_phone;
		sysUsrName.mobile_phone = source.work_mobile_phone;
		sysUsrName.name = source.full_legal_name;
		sysUsrName.introduction = source.name_prefix;
		sysUsrName.user_name = userName;
		sysUsrName.first_name = source.legal_first_name;
		sysUsrName.last_name = source.legal_last_name ;
		sysUsrName.middle_name = source.legal_middle_name ;
		sysUsrName.employee_number = source.employee_id;
		if(source.currently_active)
		sysUsrName.active=source.currently_active;
		if(source.gender)
		sysUsrName.gender = this.getGenderInformation(source.gender) ;	
		
		var usrPassword = new sn_hr_core.hr_SysUser().generatePassword();
		sysUsrName.user_password.setDisplayValue(usrPassword);
		
		this.updateLocation(source, sysUsrName);
		this.updateDepartment(source, sysUsrName);

		return sysUsrName;
	},
	
	
	/**
	 * Update the Gender Information
	 */
	getGenderInformation: function(gender){
		var varFemale = "female";
		var varMale = "male";
		var varF = "f";
		var varM = "m";
		
		if(gender.toLowerCase()==varFemale.toLowerCase()||gender.toLowerCase()==varF.toLowerCase())
			return 'Female';
		else if(gender.toLowerCase()==varMale.toLowerCase()||gender.toLowerCase()==varM.toLowerCase())
			return 'Male';
		else
			return '';
	},
	
	
	/**
	 * Set the correct location for the sn_hr_core_profile record. 
	 */
	updateLocation: function(source, target) {
		var locationRec;
		if (source.address_id) {
			locationRec = new GlideRecord(hrIntegrations.LOCATION_TABLE); 
			locationRec.addQuery(hrIntegrations.CORRELATION_ID, source.address_id);
			locationRec.query();
			if (locationRec.next()){
				gs.info("Location exists in the system ID: " + source.address_id);
				target.location = locationRec.sys_id;
				return true;
			}
		}
		gs.info("Location not exists in the system ID: " + source.address_id );
		return false;
	},
	
	/**
	 * Set the correct department for the sn_hr_core_profile record. 
	 */
	updateDepartment: function(source, target) {
		var departmentRec;
		if(source.department_id){
			var deptRec = new GlideRecord(hrIntegrations.DEPARTMENT_TABLE);
			deptRec.addQuery(hrIntegrations.CORRELATION_ID, source.department_id);
			deptRec.query();
			if(deptRec.next()){
				gs.info("Department exists in the system ID: " + source.department_id );
				target.department = deptRec.sys_id;
				return true;
			}
		}
		gs.info("Department not exists in the system ID: " + source.department_id );
		return false;
	},
	
	type: 'HRIntegrationsWorkerTransformHelper'
};