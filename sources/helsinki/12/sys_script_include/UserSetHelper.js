var UserSetHelper = Class.create();

UserSetHelper.prototype = {
    initialize: function() {
		this.userSetIDToNameMap = {};
		this.userSubHelper = new UserSubscriptionHelper();
		this.msgBuilder = null;
    },
    
    setMessageBuilder: function(subMsgBuilder) {
		this.msgBuilder = subMsgBuilder;
	},
	
	getLicenseHasUserSetGr: function (sysIds) {
		var index = 0;
		var licenseUserSetGr = new GlideRecord('license_has_user_set');
		var qCondition = licenseUserSetGr.addQuery('sys_id',sysIds[index++]);
		while(sysIds.length > index) {
			qCondition.addOrCondition('sys_id',sysIds[index++]);
		}
		licenseUserSetGr.query();
		return licenseUserSetGr;
		
	},

	getLicenseCountForUserSet: function (userSetSysId) {
		
		var licenseForUserSetGr = new GlideRecord('license_has_user_set');
		licenseForUserSetGr.addQuery('user_set',userSetSysId);
		licenseForUserSetGr.query();
		
		return licenseForUserSetGr.getRowCount();		
	},
	
	getUserLicenseSourceGr : function(licenseHasUserSetGR, eq) {
		var userLicenseSourceGr = new GlideRecord('sys_user_license_source');
		var licenseSysId='',userSetSysIds='';
		while(licenseHasUserSetGR.next()) {
			gs.info(licenseHasUserSetGR.getValue('user_set'));
			if(!licenseSysId) {
				licenseSysId = licenseHasUserSetGR.getValue('license');
			}
			userSetSysIds += licenseHasUserSetGR.getValue('user_set');
			if(licenseHasUserSetGR.hasNext()){
				userSetSysIds += ',';
			}
		}			
			userLicenseSourceGr.addQuery('license',licenseSysId);
		if(eq == '=') {
			userLicenseSourceGr.addQuery('user_set_source', 'IN',userSetSysIds);
		} else {
			var qCondition = userLicenseSourceGr.addQuery('user_set_source', 'NOT IN',userSetSysIds);
			qCondition.addOrCondition('is_direct','1');
		}
			userLicenseSourceGr.query();
		return userLicenseSourceGr;
	},
	
	getUsersInUserSetCountForDeletion: function(sysIdsList) {
		var licenseHasUserSet = sysIdsList.split(',');
		var totalCount = 0; 
		var diffArray;
		var arrayUtil = new ArrayUtil();
		var usersInUserSet = [];
		var usersNotInUserSet = [];
		var licenseHasUserSetGR = this.getLicenseHasUserSetGr(licenseHasUserSet);
		var userLicenseSourceGr = this.getUserLicenseSourceGr(licenseHasUserSetGR,'=');

		while (userLicenseSourceGr.next()) {
			usersInUserSet.push(userLicenseSourceGr.getValue('user'));
		}

		var licenseHasUserSetGR2 = this.getLicenseHasUserSetGr(licenseHasUserSet);

		var userLicenseSourceGr2 = this.getUserLicenseSourceGr(licenseHasUserSetGR2,'!=');

		while (userLicenseSourceGr2.next()) {
			usersNotInUserSet.push(userLicenseSourceGr2.getValue('user'));
		}

		diffArrray = arrayUtil.diff(usersInUserSet, usersNotInUserSet);
		totalCount += parseInt(diffArrray.length);

		return totalCount;
	},
	
	getUserSetName: function(userSetSysID) {
		var userSetName = this.userSetIDToNameMap[userSetSysID];
		
		if (JSUtil.nil(userSetName)) {
			
			var userSetGR = new GlideRecord('sys_user_set');
			userSetGR.get(userSetSysID);
			
			userSetName = userSetGR.getValue('name');
			this.userSetIDToNameMap[userSetSysID] = userSetName;
		}	
		
		return userSetName;
	},
	
	retrieveUserSetMemberWithSysID: function(userSetSysID) {
		if (JSUtil.nil(userSetSysID) || userSetSysID.length != 32)
			return;
		
		var userSetGR = new GlideRecord('sys_user_set');
		userSetGR.get(userSetSysID);
		
		return this.retrieveUserSetMembers(userSetGR);
	},
	
	retrieveUserSetMembers: function(userSetGR) {
		var userSysIDs = [];
		
		if (JSUtil.nil(userSetGR) || userSetGR.getTableName() !== 'sys_user_set')
			return userSysIDs;
		
		var source = userSetGR.getValue('source');
		
		if (source === 'sys_user') {
			userSysIDs = this._retrieveUsersWhoseConditionsMatch(userSetGR);
		} else if (source === 'sys_user_group') {
			userSysIDs = this._retrieveUsersWhoAreInGroup(userSetGR);
		}

		return userSysIDs;
	},

	_retrieveUsersWhoseConditionsMatch: function(subUserSetGR) {
		var userSysIDs = [];

		var conds = subUserSetGR.getValue('conditions');

		if (JSUtil.notNil(conds)) {
			// Query all the users who satisfy the query conditions
			var userGR = new GlideRecord('sys_user');
			userGR.addEncodedQuery(conds);
			userGR.query();
			while (userGR.next()) {
				userSysIDs.push(userGR.getValue('sys_id'));
			}
		}

		return userSysIDs;
	},

	_retrieveUsersWhoAreInGroup: function(subUserSetGR) {
		var userSysIDs = [];

		if (JSUtil.notNil(subUserSetGR.getValue('groups'))) {
			// Get all the groups and split on comma and convert to array 
			// For each group retrieve all the members
			var groupSysIDs = subUserSetGR.getValue('groups').split(",");

			var groupMemberGR = new GlideRecord('sys_user_grmember');
			groupMemberGR.addQuery('group', 'IN', groupSysIDs);
			groupMemberGR.query();

			while (groupMemberGR.next()) {
				userSysIDs.push(groupMemberGR.getValue('user'));
			}
		}

		return userSysIDs;
	},
	
	addUserSetMembersToLicense: function(userSetSysID, licenseSysID) {
		
		var arrayUtil = new ArrayUtil();
	
		var noOfUsersActullyAdded = 0;
		
		// Retrieve all user set members
		var userSetMemberSysIDs = this.retrieveUserSetMemberWithSysID(userSetSysID);
		
		// Retrieve the exclusion list for this license
		var excludedUserSysIDs = this.userSubHelper.getExcludedUsersForLicense(licenseSysID);
		
		// Retrieve the allocated users for this license
		var alreaySubscribedUserSysIDs = this.userSubHelper.getUsersAllocatedForLicense(licenseSysID);
		
		// get the difference betweeen the userSetMemberSysIDs array and excludedUserSysIDs array
		var userSysIDs = userSetMemberSysIDs;
		if (excludedUserSysIDs.length > 0)
			userSysIDs = arrayUtil.diff(userSetMemberSysIDs, excludedUserSysIDs);
		
		// get the common users between the userSysIDs and alreaySubscribedUserSysIDs
		var subscribedUserSysIds = [];
		if (alreaySubscribedUserSysIDs.length > 0)
			subscribedUserSysIds = arrayUtil.intersect(userSysIDs, alreaySubscribedUserSysIDs);
		
		var status = this._calculateLicenseStatus(licenseSysID, userSysIDs.length, subscribedUserSysIds.length);
		
		if (JSUtil.notNil(status)) {
			for (var i = 0; i < userSysIDs.length; i++)
				if (this.userSubHelper.addUserToLicenseWithStatus(userSysIDs[i], licenseSysID, userSetSysID, status))
					noOfUsersActullyAdded++;
		}
		
		if (JSUtil.notNil(this.msgBuilder)){
			this.msgBuilder.addHint("users_requested_to_be_added", userSetMemberSysIDs);
			this.msgBuilder.addHint("users_to_be_added", userSysIDs);
			this.msgBuilder.addHint("users_excluded", excludedUserSysIDs);
			this.msgBuilder.addHint("status", status);
			this.msgBuilder.addHint("num_users_added", noOfUsersActullyAdded);
		}
		
	},
	
	removeAllUserSetMembersFromLicense: function (userSetSysID, licenseSysID) {
		
		var userSysIDs = this.retrieveUserSetMemberWithSysID(userSetSysID);
		
		var noOfUsersRemoved = 0;
		
		for (var i = 0; i < userSysIDs.length; i++) {
			if (this.userSubHelper.removeUserFromLicense(userSysIDs[i], licenseSysID, userSetSysID))
				noOfUsersRemoved++;
		}
		
		if (JSUtil.notNil(this.msgBuilder)){
			this.msgBuilder.addHint("users_requested_to_be_removed", userSysIDs.length);
			this.msgBuilder.addHint("users_removed", noOfUsersRemoved);
		}
	},
	
	_calculateLicenseStatus: function(licenseSysID, numUserToBeAdded, numUsersAlreadyAdded) {
		var finalNoOfUsersToBeAdded = numUserToBeAdded - numUsersAlreadyAdded;
		
		return this.getUserLicenseStatus(licenseSysID, finalNoOfUsersToBeAdded);
	},
	
	getUserLicenseStatus: function (licenseSysID, numUsersToAdd) {
		
		var licenseGR = new GlideRecord('license_details');
		licenseGR.get(licenseSysID);
		
		if (!licenseGR.isValidRecord())
			return '';
		
		var isCapped = licenseGR.getValue('is_capped');
		var status = 'assigned';
		
		// purchased - used
		var availableSlots = parseInt(licenseGR.getValue('count')) - parseInt(licenseGR.getValue('allocated'));
		
		if (numUsersToAdd > availableSlots)
			status = 'approval_required';
	
		return status;

	},
	
    type: 'UserSetHelper'
};