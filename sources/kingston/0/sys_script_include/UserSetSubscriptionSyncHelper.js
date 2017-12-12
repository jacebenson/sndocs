var UserSetSubscriptionSyncHelper = Class.create();
UserSetSubscriptionSyncHelper.prototype = {
    initialize: function() {
		this._arrayUtil = new ArrayUtil();
		this._userSetHelper = new UserSetHelper();
		this._userSubscriptionHelper = new UserSubscriptionHelper();
		this.LICENSE_DETAILS_TABLE = 'license_details';
		this.SYS_USER_LICENSE_SOURCE_TABLE = 'sys_user_license_source';
		this.userSetIDToNameMap = {};
		this.licenseIDToNameMap = {};
    },
	
	startSync: function() {
		var autoSyncedLicenseGR = this._getAllLicenseWithSyncSetTrue();
		
		if (!autoSyncedLicenseGR.hasNext()) {
			gs.log('No subscription marked as auto sync, skipping sync');
			return;
		}
		
		while(autoSyncedLicenseGR.next()) {
			
			gs.log('Syncing subscription ' + autoSyncedLicenseGR.getValue('name'));
			
			this.syncLicense(autoSyncedLicenseGR);
		}
	},
	
	syncLicense: function(licenseGR) {
		
		if (!licenseGR.isValidRecord())
			return;
		
		var licenseSysId = licenseGR.getValue('sys_id');
		this.licenseIDToNameMap[licenseSysId] = licenseGR.getValue('name');
		var licenseHasUserSetGR = this._getUserSetsForLicense(licenseSysId);
			
		var usersToBeAdded = {};
		var usersTobeRemoved = {};
		var totalUsersToBeAddedForThisLicense = 0;
		var totalUsersToBeRemovedFromLicense = 0;
		while(licenseHasUserSetGR.next()) {
			var userSetSysId = licenseHasUserSetGR.getValue('user_set');

			var userSetGR = this._getUserSetGR(userSetSysId);
			this.userSetIDToNameMap[userSetSysId] = userSetGR.getValue('name');

			// Retrieve the users who came to the license from this user set
			var userFromThisSetInLicense = this._getUsersInLicenseFromThisUserSet(licenseSysId, userSetSysId);
			var usersInThisSet = this._userSetHelper.retrieveUserSetMemberWithSysID(userSetSysId);

			// add members who are in the set and not in the license from this set
			var usersAddedToSet = this._arrayUtil.diff(usersInThisSet, userFromThisSetInLicense);

			// remove members who are in the license and not in set
			var usersRemovedFromSet = this._arrayUtil.diff(userFromThisSetInLicense, usersInThisSet);

			if (usersAddedToSet.length > 0) {
				totalUsersToBeAddedForThisLicense += usersAddedToSet.length;
				usersToBeAdded[userSetSysId] = usersAddedToSet; // mapping of user set sys id to the array of members to add
			}	

			if (usersRemovedFromSet.length > 0) {
				totalUsersToBeRemovedFromLicense += usersRemovedFromSet.length;
				usersTobeRemoved[userSetSysId] = usersRemovedFromSet; // mapping of user set sys id to the array of members to remove
			}
		}
		
		var retObj;
		
		if (this._getObjectSize(usersToBeAdded) > 0 || this._getObjectSize(usersTobeRemoved) > 0) {
			 retObj = this._addRemoveUsersFromLicense(licenseSysId, usersToBeAdded, usersTobeRemoved);
		} else {
				retObj = {};
				retObj.numUsersAdded = totalUsersToBeAddedForThisLicense;
				retObj.numUsersRemoved = totalUsersToBeRemovedFromLicense;
		}
		
		return retObj;
	},
	
	_addRemoveUsersFromLicense: function(licenseSysID, /* object */addedUsers, /* object */removedUsers) {
		var retStatus = {};
		retStatus.numUsersAdded = 0;
		retStatus.numUsersRemoved = 0;
		
		for(var userSetSysID in removedUsers) {
			var numRemoved = this._syncRemoveUsersFromLicense(removedUsers[userSetSysID], licenseSysID, userSetSysID);
			retStatus.numUsersRemoved = numRemoved;
			gs.log('Syncher removed ' + numRemoved + ' users from user set ' +  this.userSetIDToNameMap[userSetSysID] + ' from the subscription ' + this.licenseIDToNameMap[licenseSysID]);
		}
		
		// So, here numUsersToAdd number of users are added from all the sets, if the license has
		// that many slots available all of them can be assigned else all of them go to pending 
		if (this._getObjectSize(addedUsers) > 0) {
			
			var uniqueUsersAddedInSets = [];
			for(var setSysID in addedUsers) {
				uniqueUsersAddedInSets = this._arrayUtil.union(uniqueUsersAddedInSets, addedUsers[setSysID]);
			}
			
			var uniqueUsersToBeAddedToLicense = [];
			for (var i = 0; i < uniqueUsersAddedInSets.length; i++) {
				// From the uniqueUsersAddedInSets, check if anyone already is already allocated to the license or is excluded
				if (!this._userSubscriptionHelper.doesUserHaveLicense(uniqueUsersAddedInSets[i], licenseSysID) 
					&& !this._userSubscriptionHelper._isUserExcludedFromLicense(uniqueUsersAddedInSets[i], licenseSysID))
					uniqueUsersToBeAddedToLicense.push(uniqueUsersAddedInSets[i]);
			}
			
			var status = this._userSetHelper.getUserLicenseStatus(licenseSysID, uniqueUsersToBeAddedToLicense.length);
			
			gs.log('Adding ' + uniqueUsersToBeAddedToLicense.length + ' users to license ' + this.licenseIDToNameMap[licenseSysID]);
			for(var usrSetSysID in addedUsers) {
				var numAdded = this._syncAddUsersToLicense(addedUsers[usrSetSysID], licenseSysID, usrSetSysID, status);
				gs.log('Syncher added ' + numAdded + ' new users from the user set ' + this.userSetIDToNameMap[usrSetSysID]  + ' to the subscription ' +   this.licenseIDToNameMap[licenseSysID]);
			}
			
			retStatus.numUsersAdded = uniqueUsersToBeAddedToLicense.length;
		}
		
		return 	retStatus;
	},

	_getUserSetsForLicense: function(licenseSysId){
		var licenseUserSetGr = new GlideRecord('license_has_user_set');
		licenseUserSetGr.addQuery('license',licenseSysId);
		licenseUserSetGr.query();
		return licenseUserSetGr;
	},
	
	_getUsersInLicenseFromThisUserSet: function(licenseSysId, userSetSysId){
		
		var userInLicenseIds = [];
		var userHaLicenseGR = new GlideRecord(this.SYS_USER_LICENSE_SOURCE_TABLE);
		userHaLicenseGR.initialize();
		userHaLicenseGR.addQuery('license', licenseSysId);
		userHaLicenseGR.addQuery('user_set_source', userSetSysId);
		userHaLicenseGR.orderBy('user.sys_id');
		userHaLicenseGR.query();

		while (userHaLicenseGR.next()) {
			userInLicenseIds.push(userHaLicenseGR.getValue('user'));

		}
		return userInLicenseIds;
	},
	
	_getAllLicenseWithSyncSetTrue: function() {
		var licenseDetailsGR = new GlideRecord(this.LICENSE_DETAILS_TABLE);
		licenseDetailsGR.addQuery('auto_sync', '1');
		licenseDetailsGR.query();
		
		return licenseDetailsGR;
	},
	
	_syncRemoveUsersFromLicense: function(/* array */removedUserList, licenseSysID, userSetSysId) {
		var removedUserCount = 0;
		for (var i = 0; i < removedUserList.length; i++) {
			if (this._userSubscriptionHelper.removeUserFromLicense(removedUserList[i], licenseSysID, userSetSysId));
				removedUserCount++;
			
		}
		
		return removedUserCount;
	},
	
	_syncAddUsersToLicense: function(/* array */addedUserList, licenseSysID, userSetSysId, status) {
		var addedUserCount = 0;
		
		for (var i = 0; i < addedUserList.length; i++) {
			gs.log('Adding ' +addedUserList[i] + ' user to subscription ' +licenseSysID + ' with status ' +status);
			if (this._userSubscriptionHelper.addUserToLicenseWithStatus(addedUserList[i], licenseSysID, userSetSysId, status))
				addedUserCount++;
		}
		
		return addedUserCount;
	},
	
	_getObjectSize: function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	},
	
	_getUserSetGR: function(userSetSysID) {
		var userSetGR = new GlideRecord('sys_user_set');
		if (JSUtil.nil(userSetSysID))
			return userSetGR;
			
		userSetGR.get(userSetSysID);
			
		return userSetGR;
	},
	
    type: 'UserSetSubscriptionSyncHelper'
};