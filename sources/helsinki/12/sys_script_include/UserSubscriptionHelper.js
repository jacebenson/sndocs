var UserSubscriptionHelper = Class.create();

UserSubscriptionHelper.prototype = {
    initialize: function() {
		
		this.LICENSE_STATUS_ASSIGNED = 'assigned';
		this.LICENSE_STATUS_APPROVAL_REQUIRED = 'approval_required';
		
		this.LICENSE_SOURCE_USERSET = 'userset';
		
		// table names
		this.LICENSE_EXCLUSION_TABLE = 'sys_user_license_exclude';
		this.USER_HAS_LICENSE_TABLE = 'sys_user_has_license';
		this.USER_PENDING_LICENSE_TABLE = 'sys_user_pending_license';
		this.LICENSE_SOURCE_TABLE = 'sys_user_license_source';
    },
	
	doesUserHaveLicense: function(userSysID, licenseSysID) {
		// This function checks if the user has license (is user a licensed user)
		var userLicenseGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
		userLicenseGR.addQuery('user', userSysID);
		userLicenseGR.addQuery('license', licenseSysID);
		userLicenseGR.query();

		return userLicenseGR.hasNext();
	},
	
	isUserAddedToLicense: function(userSysID, licenseSysID) {
		// This function only checks if the user, license pair exists in the 
		// sys_user_has_license table
		var userLicenseGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
		userLicenseGR.addQuery('user', userSysID);
		userLicenseGR.addQuery('license', licenseSysID);
		userLicenseGR.query();

		return userLicenseGR.hasNext();
	},
	
	isUserAddedToPendingLicense: function(userSysID, licenseSysID) {
		// This function only checks if the user, license pair exists in the 
		// sys_user_pending_license table
		var userLicenseGR = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		userLicenseGR.addQuery('user', userSysID);
		userLicenseGR.addQuery('license', licenseSysID);
		userLicenseGR.query();

		return userLicenseGR.hasNext();
	},
	
	addUserToLicense: function (userSysID, licenseSysID, userSetSysID) {
		if (this.isUserAddedToLicense(userSysID, licenseSysID)) {
			this.addToLicenseSource(userSysID, licenseSysID, userSetSysID, false);
			return;
		}	
		
		var userLicenseStatus = this.canUserBeAssignedToLicense(licenseSysID, userSysID);
		
		if (userLicenseStatus.canBeAdded) {
			this.addUserToLicenseWithStatus(userSysID, licenseSysID, userSetSysID, userLicenseStatus.assignStatus);
		}	
	},

	addUserToLicenseWithStatus: function(userSysID, licenseSysID, userSetSysID, status) {
	
		var isUserAdded = false;
	
		if (this.isUserAddedToLicense(userSysID, licenseSysID) 
				|| this.isUserAddedToPendingLicense(userSysID, licenseSysID)) {
			this.addToLicenseSource(userSysID, licenseSysID, userSetSysID, false);
			return isUserAdded;
		}
		
		if (this._isUserExcludedFromLicense(userSysID, licenseSysID))
			return isUserAdded;
		
		if (JSUtil.notNil(status) && status === this.LICENSE_STATUS_APPROVAL_REQUIRED) 
			isUserAdded = this.addUserToPendingLicense(userSysID, licenseSysID, false);
		else 
			isUserAdded = this._allocateUserToLicense(userSysID, licenseSysID, userSetSysID);
	
		if (isUserAdded) 
			this.addToLicenseSource(userSysID, licenseSysID, userSetSysID, false);
		
		return isUserAdded;
	},
	
	_allocateUserToLicense: function(userSysID, licenseSysID, userSetSysID) {
		
		var userLicenseGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
		userLicenseGR.initialize();
		userLicenseGR.setValue('user', userSysID);
		userLicenseGR.setValue('license', licenseSysID);
		
		if (JSUtil.notNil(userSetSysID))
			userLicenseGR.setValue('source', this.LICENSE_SOURCE_USERSET);
		
		return (JSUtil.notNil(userLicenseGR.insert()))? true : false;
		
	},
	
	addUserToPendingLicense: function(userSysID, licenseSysID, isDirect) {
		
		if(this.isUserAddedToPendingLicense(userSysID, licenseSysID))
			return false;
		
		var userPending = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		userPending.initialize();
		userPending.setValue('user', userSysID);
		userPending.setValue('license', licenseSysID);
		
		if (isDirect)
			userPending.setValue('source', 'direct');
		else 
			userPending.setValue('source', 'userset');
		
		return (JSUtil.notNil(userPending.insert()))? true : false;
	},
	
	canUserBeAssignedToLicense: function (licenseSysID, userSysID) {
		
		var returnObj = {}; // will contain 2 keys canBeAdded and assignStatus
		
		if (JSUtil.nil(licenseSysID)) {
			returnObj.canBeAdded = false;
			return returnObj;
		}	
		
		var licenseGR = this._fetchLicenseBySysID(licenseSysID);
		
		// If not a valid license or if the user is excluded from the license
		if (!licenseGR.isValidRecord() || this._isUserExcludedFromLicense(userSysID, licenseSysID)) {
			returnObj.canBeAdded = false;
			return returnObj;
		}
		
		var purchased = parseInt(licenseGR.getValue('count'));
		var used = parseInt(licenseGR.getValue('allocated'));
		
		if (used >= purchased) {
			returnObj.canBeAdded = true;
			returnObj.assignStatus = this.LICENSE_STATUS_APPROVAL_REQUIRED;

			return returnObj;
		}
		
		// can be assigned to the license
		returnObj.canBeAdded = true;
		returnObj.assignStatus = this.LICENSE_STATUS_ASSIGNED;
	
		return returnObj;
	},
	
	canUserBeSubscribedToLicense: function(licenseSysID, userSysID) {
		
		var result = this.canUserBeAssignedToLicense(licenseSysID, userSysID);		
		return ((result.canBeAdded == true) && (result.assignStatus == this.LICENSE_STATUS_ASSIGNED));
	},
	
	doesUserFailEnforcementLimit: function (pendingSysIdList) {
		
		if (JSUtil.nil(pendingSysIdList))
			return false;
		
		var pendingGR = new GlideRecord('sys_user_pending_license');
		pendingGR.addQuery('sys_id', pendingSysIdList[0]);
		pendingGR.query();
	
		if (pendingGR.next()) {
			var licGR = new GlideRecord('license_details');
			licGR.addQuery('sys_id', pendingGR.getValue('license'));
			licGR.query();
		
			if (licGR.next()) {
				
				var allocated = parseInt(licGR.getValue("allocated"));
				var purchased = parseInt(licGR.getValue("count"));
				var toBeAllocated = pendingSysIdList.length;
				
				var slotsAvailable = purchased - allocated;
				
				var isCapped = licGR.getValue('is_capped') == '1';
				var isLicenseOverflown = allocated  >= purchased;
				var willLicenseOverflow = toBeAllocated > slotsAvailable;
				// If user has enforcement limit turned ON 
			    // AND allocation count is equal to or more than purchased,
				// OR no. of users to be subscripbed is more than available slots, 
				// he is not complying with the enforcement limit of the subscription.
				return (isCapped && (isLicenseOverflown || willLicenseOverflow));
			}
		}
		
		return false;
	},
	
	doesAddingAListOfUsersExceedPurchasedLimit: function(/* array */userList, licenseSysID) {
		var licGR = new GlideRecord('license_details');
		licGR.addQuery('sys_id', licenseSysID);
		licGR.query();
		
		if (licGR.next()) {
			var allocated = parseInt(licGR.getValue("allocated"));
			var purchased = parseInt(licGR.getValue("count"));
			var toBeAllocated = userList.length;
			var slotsAvailable = purchased - allocated;
		
			return (toBeAllocated > slotsAvailable);
		}
		return false;
	},
	
	_fetchLicenseBySysID: function(licSysID) {
		var licGR = new GlideRecord('license_details');
		licGR.get(licSysID);
		
		return licGR;
		
	},
	
	addToLicenseSource: function(userSysID, licenseSysID, userSetSysID, isDirect) {
		
		if (this._doesLicenseSourceExist(userSysID, licenseSysID, userSetSysID, isDirect)) {
			return;
		}	
		
		var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
		userLicenseSourceGR.initialize();
		userLicenseSourceGR.setValue('user', userSysID);
		userLicenseSourceGR.setValue('license', licenseSysID);
		
		if (isDirect) {
			userLicenseSourceGR.setValue('is_direct', 1);
		} else {
			userLicenseSourceGR.setValue('user_set_source', userSetSysID);
		}	
			
		userLicenseSourceGR.insert();
		
	},
	
	_doesLicenseSourceExist: function(userSysID, licenseSysID, userSetSysID, isDirect) {
		
		var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
		userLicenseSourceGR.initialize();
		userLicenseSourceGR.addQuery('user', userSysID);
		userLicenseSourceGR.addQuery('license', licenseSysID);
		
		if (isDirect) {
			userLicenseSourceGR.addQuery('is_direct', 1);
		} else {
			userLicenseSourceGR.addQuery('user_set_source', userSetSysID);
		}	
		
		userLicenseSourceGR.query();
		
		return userLicenseSourceGR.hasNext();
		
	},
	
	movePendingUserHasLicenseRecToSubscribed: function(pendingLicSysId) {
		
		var userSysId = "";
		var licSysId = "";
		var source = "";
		
		var pendingLicGR = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		pendingLicGR.addQuery('sys_id', pendingLicSysId);
		pendingLicGR.query();
		
		if(pendingLicGR.next()) {
			userSysId = pendingLicGR.getValue('user');
			licSysId = pendingLicGR.getValue('license');
			source = pendingLicGR.getValue('source');
			
			if (JSUtil.notNil(userSysId) && JSUtil.notNil(licSysId)) {
				var userLicenseGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
				userLicenseGR.initialize();
				userLicenseGR.setValue('user', userSysId);
				userLicenseGR.setValue('license', licSysId);
				userLicenseGR.setValue('source', source);
				userLicenseGR.setWorkflow(false);
				userLicenseGR.insert();
			}
		
			this._deleteUserFromPendingLicenseBySysId(pendingLicSysId);
		}
	},
	
	removeUserFromLicense: function(userSysID, licenseSysID, removedUserSetSysID) {
		// User set disassociated from the license, attempt to remove all the users
		// who came to the license from this user set
		return this._removeAUserFromLicense(userSysID, licenseSysID, false, false, removedUserSetSysID);
	},
	
	removeUserDirectlyFromLicense: function(userSysID, licenseSysID) {
		// Called when user is removed directly removed from the UI
		return this._removeAUserFromLicense(userSysID, licenseSysID, true, false, '');
	},
	
	removeAndExcludeUserFromLicense: function(userSysID, licenseSysID) {
                 // Removes a user from license and also excludes him from the license
		 return this._removeAUserFromLicense(userSysID, licenseSysID, true, true, '');
	},
	
	removeAndExcludeUserFromPendingLicense: function(userSysID, licenseSysID) {
    	// Removes a user from license and also excludes him from the pending license
        return this._removeAUserFromPendingLicense(userSysID, licenseSysID, true, true);
	},
	
	removeUserFromPendingLicense: function(userSysID, licenseSysID) {
		return this._removeAUserFromPendingLicense(userSysID, licenseSysID, true, false);
	},
	
	_removeAUserFromPendingLicense: function(userSysID, licenseSysID, wasRemovedFromUI, excludeUser) {
		// There is 1 way in which a user could be removed from a pending license
		// Directly selecting the record from the sys_user_pending_license table and deleting it
		
		var isUserRemoved = false;
		
		if (wasRemovedFromUI) {
        // Removed directly from UI - remove all the license sources, add to the exclusion table 
        // Finally delete the user license association
           this.removeAllSourcesForUserLicense(userSysID, licenseSysID);
           this._deleteUserFromPendingLicense(userSysID, licenseSysID);
           isUserRemoved = true;
                          
            if (excludeUser)
                this._addUserToLicenseExclusionList(userSysID, licenseSysID);
        }
        
		return isUserRemoved;		
	},
	
	_removeAUserFromLicense: function(userSysID, licenseSysID, wasRemovedFromUI, excludeUser, removedUserSetSysID) {
		// There are only 2 ways in which a user could be removed from a license
		// Either directly selecting the record from the sys_user_has_license table and deleting it, or by removing 
		// a user set associated to a license
		
		var isUserRemoved = false;
		
		if (wasRemovedFromUI) {
        // Removed directly from UI - remove all the license sources, add to the exclusion table 
        // Finally delete the user license association
           this.removeAllSourcesForUserLicense(userSysID, licenseSysID);
           this._deleteUserFromLicense(userSysID, licenseSysID);
           isUserRemoved = true;
                          
            if (excludeUser)
                this._addUserToLicenseExclusionList(userSysID, licenseSysID);
			
			return isUserRemoved;
        }
		
		
		// User set dis-associated from the license
		// retrieve all the sources for this user and license, 
		// if the only source is this userset, remove this license user association
		if (this._getNumLicenseSourcesForAUserAndLicense(userSysID, licenseSysID) === 1) {
		
			this.removeAllSourcesForUserLicense(userSysID, licenseSysID);
				
			if (this._isUserPendingLicense(userSysID, licenseSysID)) 
				this._deleteUserFromPendingLicense(userSysID, licenseSysID);
			else
				this._deleteUserFromLicense(userSysID, licenseSysID);
				
			isUserRemoved = true;
		} else {
			// He has this license from multiple sources, only disassociate this source
			this.removeUserSetSourceForUserLicense(userSysID, licenseSysID, removedUserSetSysID);
		}
		
		return isUserRemoved;		
	},
	
	_isUserPendingLicense: function(userSysID, licenseSysID) {
		var pendingLicGR = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		pendingLicGR.addQuery('user', userSysID);
		pendingLicGR.addQuery('license', licenseSysID);
		pendingLicGR.query();
		
		return pendingLicGR.hasNext();
	},
	
	_deleteUserFromPendingLicense: function(userSysID, licenseSysID) {
		
		if (!this._isUserPendingLicense(userSysID, licenseSysID))
			return;
		
		// Deletes a user from a pending license.
		var usrPendingLicGR = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		usrPendingLicGR.addQuery('user', userSysID);
		usrPendingLicGR.addQuery('license', licenseSysID);
		usrPendingLicGR.query();
		
		if (usrPendingLicGR.next())
			usrPendingLicGR.deleteRecord();
	},
	
	_deleteUserFromPendingLicenseBySysId: function(pendingLicSysId) {
		// Deletes a user from a pending license.
		var usrPendingLicGR = new GlideRecord(this.USER_PENDING_LICENSE_TABLE);
		usrPendingLicGR.addQuery('sys_id', pendingLicSysId);
		usrPendingLicGR.query();
		
		if (usrPendingLicGR.next())
			usrPendingLicGR.deleteRecord();
	},
	
	_getNumLicenseSourcesForAUserAndLicense: function(userSysID, licenseSysID) {
			var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
			userLicenseSourceGR.addQuery('user', userSysID);
			userLicenseSourceGR.addQuery('license', licenseSysID);
			userLicenseSourceGR.query();
			
		return userLicenseSourceGR.getRowCount();
	},
	
	removeUserSetSourceForUserLicense: function(userSysID, licenseSysID, sourceUserSetSysID) {
		var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
		userLicenseSourceGR.addQuery('user', userSysID);
		userLicenseSourceGR.addQuery('license', licenseSysID);
		userLicenseSourceGR.addQuery('user_set_source', sourceUserSetSysID);
		userLicenseSourceGR.query();
		
		if (userLicenseSourceGR.next())
			userLicenseSourceGR.deleteRecord();
	},
	
	removeDirectSourceForUserLicense: function(userSysID, licenseSysID, licenseSource) {
		var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
		userLicenseSourceGR.addQuery('user', userSysID);
		userLicenseSourceGR.addQuery('license', licenseSysID);
		userLicenseSourceGR.addQuery('is_direct', '1');
		userLicenseSourceGR.query();
		
		if (userLicenseSourceGR.next())
			userLicenseSourceGR.deleteRecord();
	},
	
	removeAllSourcesForUserLicense: function(userSysID, licenseSysID) {
		// Removes all the licenses sources for this user and license
		var userLicenseSourceGR = new GlideRecord(this.LICENSE_SOURCE_TABLE);
		userLicenseSourceGR.addQuery('user', userSysID);
		userLicenseSourceGR.addQuery('license', licenseSysID);
		userLicenseSourceGR.query();
		
		while (userLicenseSourceGR.next()) {
			userLicenseSourceGR.deleteRecord();
		}
		
	},
	
	_addUserToLicenseExclusionList: function(userSysID, licenseSysID) {
		var userExcludeGR = new GlideRecord(this.LICENSE_EXCLUSION_TABLE);
		userExcludeGR.initialize();
		userExcludeGR.setValue('user', userSysID);
		userExcludeGR.setValue('license', licenseSysID);
		
		userExcludeGR.insert();
	},
	
	removeUserFromLicenseExclusionList: function(userSysID, licenseSysID) {
		
		if (!this._isUserExcludedFromLicense(userSysID, licenseSysID))
			return;
		
		var userExcludeGR = new GlideRecord(this.LICENSE_EXCLUSION_TABLE);
		userExcludeGR.addQuery('user', userSysID);
		userExcludeGR.addQuery('license', licenseSysID);
		userExcludeGR.query();
		
		if (userExcludeGR.next())
			userExcludeGR.deleteRecord();
	},
	
	_isUserExcludedFromLicense: function(userSysID, licenseSysID) {
		var userExcludeGR = new GlideRecord(this.LICENSE_EXCLUSION_TABLE);
		userExcludeGR.addQuery('user', userSysID);
		userExcludeGR.addQuery('license', licenseSysID);
		userExcludeGR.query();
		
		return userExcludeGR.hasNext();
	},
	
	getExcludedUsersForLicense: function(licenseSysID) {
		var excludedUserSysIds = [];
		
		var userExcludeGR = new GlideRecord(this.LICENSE_EXCLUSION_TABLE);
		
		userExcludeGR.addQuery('license', licenseSysID);
		userExcludeGR.query();
		
		while (userExcludeGR.next()) {
			excludedUserSysIds.push(userExcludeGR.getValue('user'));
		}
		
		return excludedUserSysIds;
	},
	
	getUsersAllocatedForLicense: function(licenseSysID) {
		var subscribedUserSysIds = [];
		
		var subscribedUserGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
		subscribedUserGR.addQuery('license', licenseSysID);
		subscribedUserGR.query();
		
		while (subscribedUserGR.next())
			subscribedUserSysIds.push(subscribedUserGR.getValue('user'));
		
		return subscribedUserSysIds;
	},
	
	_deleteUserFromLicense: function(userSysID, licenseSysID) {
		// Deletes a user from a license, does not matter what state he is in
		var userLicenseGR = new GlideRecord(this.USER_HAS_LICENSE_TABLE);
		userLicenseGR.addQuery('user', userSysID);
		userLicenseGR.addQuery('license', licenseSysID);
		userLicenseGR.query();
		
		if (userLicenseGR.next())
			userLicenseGR.deleteRecord();
	},

    type: 'UserSubscriptionHelper'
};