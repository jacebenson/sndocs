var UserSetHelper = Class.create();

UserSetHelper.prototype = {
    initialize: function() {
		
		this.USER = "user";
		this.SYS_USER = "sys_user";
		this.SYS_USER_GROUP = "sys_user_group";
		this.GROUPS = "groups";
		this.USER_SET = "user_set";
		this.SYS_USER_SET = "sys_user_set";
		this.USER_SET_SOURCE = "user_set_source";
		
		this.LICENSE = "license";
		this.LICENSE_DETAILS = "license_details";
		this.LICENSE_HAS_USER_SET = "license_has_user_set";
		this.SYS_USER_LICENSE_SOURCE = "sys_user_license_source";
		
		this.SYS_USER_HAS_LICENSE = "sys_user_has_license";
		this.SYS_USER_PENDING_LICENSE = "sys_user_pending_license";
		
		this.SYS_ID = "sys_id";
		
		this.userSetIDToNameMap = {};
		this.userSubHelper = new UserSubscriptionHelper();
		this.msgBuilder = null;
    },
    
    setMessageBuilder: function(subMsgBuilder) {
		this.msgBuilder = subMsgBuilder;
	},
	
	getLicenseHasUserSetGr: function (sysIds) {
		var index = 0;
		var licenseUserSetGr = new GlideRecord(this.LICENSE_HAS_USER_SET);
		var qCondition = licenseUserSetGr.addQuery(this.SYS_ID,sysIds[index++]);
		while(sysIds.length > index) {
			qCondition.addOrCondition(this.SYS_ID,sysIds[index++]);
		}
		licenseUserSetGr.query();
		return licenseUserSetGr;
		
	},

	getLicenseCountForUserSet: function (userSetSysId) {
		
		var licenseForUserSetGr = new GlideRecord(this.LICENSE_HAS_USER_SET);
		licenseForUserSetGr.addQuery(this.USER_SET,userSetSysId);
		licenseForUserSetGr.query();
		
		return licenseForUserSetGr.getRowCount();		
	},
	
	getUserLicenseSourceGr : function(licenseHasUserSetGR, eq) {
		var userLicenseSourceGr = new GlideRecord(this.SYS_USER_LICENSE_SOURCE);
		var licenseSysId='',userSetSysIds='';
		while(licenseHasUserSetGR.next()) {
			gs.info(licenseHasUserSetGR.getValue(this.USER_SET));
			if(!licenseSysId) {
				licenseSysId = licenseHasUserSetGR.getValue(this.LICENSE);
			}
			userSetSysIds += licenseHasUserSetGR.getValue(this.USER_SET);
			if(licenseHasUserSetGR.hasNext()){
				userSetSysIds += ',';
			}
		}			
			userLicenseSourceGr.addQuery(this.LICENSE,licenseSysId);
		if(eq == '=') {
			userLicenseSourceGr.addQuery(this.USER_SET_SOURCE, 'IN',userSetSysIds);
		} else {
			var qCondition = userLicenseSourceGr.addQuery('user_set_source', 'NOT IN',userSetSysIds);
			qCondition.addOrCondition('is_direct','1');
		}
		
		userLicenseSourceGr.query();
		
		return userLicenseSourceGr;
	},
	
	_getLicenseMappedToUserSets: function (/* [] of license_has_user_set sysids*/licenseHasUserSet) {
		
		var gr = new GlideRecord(this.LICENSE_HAS_USER_SET);
		gr.addQuery(this.SYS_ID, licenseHasUserSet[0]);
		gr.query();
		
		if (gr.next())
			return gr.getValue(this.LICENSE);
		
		return "";
	},
	
	_getUsersCountEligibleForRemoval: function (licenseSysID, userLicenseSourceGR) {
		
		var distributionDetails = {};
		
		var subscribedUserCount = 0;
		var pendingUserCount = 0;
		
		distributionDetails.subscribed = subscribedUserCount;
		distributionDetails.pending = pendingUserCount;
		
		var userSysID = "";
				
		if (!userLicenseSourceGR.hasNext()) 
			return distributionDetails;
		
		
		while (userLicenseSourceGR.next()) {
			
			userSysID = userLicenseSourceGR.getValue(this.USER);
			
			if (this._isSubscriptionEligibleForRemoval(userSysID, licenseSysID)) {
				subscribedUserCount++;
			} else if (this._isPendingEligibleForRemoval(userSysID, licenseSysID)) {
				pendingUserCount++;
			}
			
		}
		
		distributionDetails.subscribed = subscribedUserCount;
		distributionDetails.pending = pendingUserCount;
		
		return distributionDetails;
	},
	
	_isSubscriptionEligibleForRemoval: function (userSysID, licenseSysID) {
		
		if ( this.userSubHelper.isUserAddedToLicense(userSysID, licenseSysID) 
						&& (this.userSubHelper._getNumLicenseSourcesForAUserAndLicense(userSysID, licenseSysID) === 1)) 
				return true;
		
		return false;
	},
	
	_isPendingEligibleForRemoval: function (userSysID, licenseSysID) {
		
		if ( this.userSubHelper.isUserAddedToPendingLicense(userSysID, licenseSysID) 
						&& (this.userSubHelper._getNumLicenseSourcesForAUserAndLicense(userSysID, licenseSysID) === 1)) 
				return true;
		
		return false;
	},
	
	
	getUserDistributionDetailsFromUserSets: function(licUserSetMappingIds) {
	
		
		if (JSUtil.nil(licUserSetMappingIds))
			return distributionDetails;
		
		var licUserSetIds = licUserSetMappingIds.split(',');
		
		if (licUserSetIds.length == 0)
			return distributionDetails;
		
		var licSysId = this._getLicenseMappedToUserSets(licUserSetIds);
		
		if (JSUtil.nil(licSysId))
			return distributionDetails;
		
		
		var licenseHasUserSetGR = this.getLicenseHasUserSetGr(licUserSetIds);
		var userLicenseSourceGR = this.getUserLicenseSourceGr(licenseHasUserSetGR,'=');
	
		
		var distributionDetails = this._getUsersCountEligibleForRemoval(licSysId, userLicenseSourceGR);
		
		
		return distributionDetails;
	},
	
	getUserSetName: function(userSetSysID) {
		var userSetName = this.userSetIDToNameMap[userSetSysID];
		
		if (JSUtil.nil(userSetName)) {
			
			var userSetGR = new GlideRecord(this.SYS_USER_SET);
			userSetGR.get(userSetSysID);
			
			userSetName = userSetGR.getValue('name');
			this.userSetIDToNameMap[userSetSysID] = userSetName;
		}	
		
		return userSetName;
	},
	
	retrieveUserSetMemberWithSysID: function(userSetSysID) {
		if (JSUtil.nil(userSetSysID) || userSetSysID.length != 32)
			return;
		
		var userSetGR = new GlideRecord(this.SYS_USER_SET);
		userSetGR.get(userSetSysID);
		
		return this.retrieveUserSetMembers(userSetGR);
	},
	
	retrieveUserSetMembers: function(userSetGR) {
		var userSysIDs = [];
		
		if (JSUtil.nil(userSetGR) || userSetGR.getTableName() !== this.SYS_USER_SET)
			return userSysIDs;
		
		var source = userSetGR.getValue('source');
		
		if (source === this.SYS_USER) {
			userSysIDs = this._retrieveUsersWhoseConditionsMatch(userSetGR);
		} else if (source === this.SYS_USER_GROUP) {
			userSysIDs = this._retrieveUsersWhoAreInGroup(userSetGR);
		}

		return userSysIDs;
	},
	
	retrieveUserSetCount: function(userSetGR) {
		var count = 0;
		
		if (JSUtil.nil(userSetGR) || userSetGR.getTableName() !== this.SYS_USER_SET)
			return count;
		
		var source = userSetGR.getValue('source');
		
		if (source === this.SYS_USER) {
			count = this._retrieveUserCountWhoseConditionsMatch(userSetGR);
		} else if (source === this.SYS_USER_GROUP) {
			count = this._retrieveUserCountWhoAreInGroup(userSetGR);
		}

		return count;
	},

	_retrieveUsersWhoseConditionsMatch: function(subUserSetGR) {
		var userSysIDs = [];

		var userGR = this._getUserSetQueryForConditionMatch(subUserSetGR);

		if (JSUtil.notNil(userGR)) {
			
			while (userGR.next()) 
				userSysIDs.push(userGR.getValue(this.SYS_ID));
		}

		return userSysIDs;
	},
	
	_retrieveUserCountWhoseConditionsMatch: function(subUserSetGR) {
		var userGR = this._getUserSetQueryForConditionMatch(subUserSetGR);

		if (JSUtil.notNil(userGR))
			return userGR.getRowCount();		

		return 0;
	},
	
	_getUserSetQueryForConditionMatch: function (userSetGR) {
		var conds = userSetGR.getValue('conditions');

		if (JSUtil.notNil(conds)) {
			// Query all the users who satisfy the query conditions
			var userGR = new GlideRecord(this.SYS_USER);
			userGR.addEncodedQuery(conds);
			userGR.query();
			
			return userGR;
		}
		
		return "";
	},

	_retrieveUsersWhoAreInGroup: function(subUserSetGR) {
		var userSysIDs = [];
		
		var groupMemberGR = this._getUserSetQueryForGroup(subUserSetGR);

		if (JSUtil.notNil(groupMemberGR)) {			

			while (groupMemberGR.next())
				userSysIDs.push(groupMemberGR.getValue(this.USER));
		}

		return userSysIDs;
	},
	
	_retrieveUserCountWhoAreInGroup: function(subUserSetGR) {
		
		
		var groupMemberGR = this._getUserSetQueryForGroup(subUserSetGR);

		if (JSUtil.notNil(groupMemberGR)) 		
			return groupMemberGR.getRowCount();

		return 0;
	},
	
	_getUserSetQueryForGroup: function (userSetGR) {

		if (JSUtil.notNil(userSetGR.getValue(this.GROUPS))) {
			// Get all the groups and split on comma and convert to array 
			// For each group retrieve all the members
			var groupSysIDs = userSetGR.getValue(this.GROUPS).split(",");

			var groupMemberGR = new GlideRecord('sys_user_grmember');
			groupMemberGR.addQuery('group', 'IN', groupSysIDs);
			groupMemberGR.query();

			return groupMemberGR;
		}
		
		return "";
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
		var noOfUsersUnSubscribed = 0;
		
		var isUnSubscribed = false;
		var isDismissed = false;
		
		for (var i = 0; i < userSysIDs.length; i++) {
						
			if (( isUnSubscribed = this.userSubHelper.unSubscribeEligibleUser(userSysIDs[i], licenseSysID) ))
				noOfUsersUnSubscribed++;
			else if (( isDismissed = this.userSubHelper.dismissEligibleUserFromPending(userSysIDs[i], licenseSysID)) )
				noOfUsersRemoved++;
			
			
			if ( !isUnSubscribed && !isDismissed ) {
				// Only remove the source since user was not eligible for removal.
				this.userSubHelper.removeUserSetSourceForUserLicense(userSysIDs[i], licenseSysID, userSetSysID);
			}
				
		}
		
		if (JSUtil.notNil(this.msgBuilder)){
			this.msgBuilder.addHint("users_requested_to_be_removed", userSysIDs.length);
			this.msgBuilder.addHint("users_removed", noOfUsersUnSubscribed);
		}
	},
	
	_calculateLicenseStatus: function(licenseSysID, numUserToBeAdded, numUsersAlreadyAdded) {
		var finalNoOfUsersToBeAdded = numUserToBeAdded - numUsersAlreadyAdded;
		
		return this.getUserLicenseStatus(licenseSysID, finalNoOfUsersToBeAdded);
	},
	
	getUserLicenseStatus: function (licenseSysID, numUsersToAdd) {
		
		var licenseGR = new GlideRecord(this.LICENSE_DETAILS);
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