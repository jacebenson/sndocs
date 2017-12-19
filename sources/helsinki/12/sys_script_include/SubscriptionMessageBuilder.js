var SubscriptionMessageBuilder = Class.create();
SubscriptionMessageBuilder.prototype = {
    initialize: function() {
		
		this.FULL_REMOVE = "Unsubscribed {0} user(s)";
		
		this.NO_REMOVE = "No users were unsubscribed because the {0} user set contains no users";
		
		this.NO_REMOVE_ALL_ALREAY_REF = "No users were removed from the subscription because all of the users in the {0} user set were either individually subscribed or were added from other user sets";
		
		this.SOME_REMOVED_REST_REFERENCED = "The {0} user set was removed. {2} users were unsubscribed";
		
		this.EMPTY_ADD_REQUEST = "No users were allocated because the {0} user set contains no users";
		
		this.NO_ADD_ALL_EXCLUDED = "No users were allocated because all users are on the Excluded User list";
		
		this.NO_ADD_ALL_ALREADY_ADDED = "No users were added to the subscription. All {0} users in the {1} user set are already subscribed.";
		
		this.NO_ADD_SOME_ALREADY_ADDED_SOME_EXCLUDED = "No users were allocated because {0} users are already subscribed and {1} users are on the Excluded User list";
		
		this.FULL_ADD = "Allocated {0} user(s) to the subscription from the {1} user set.";
		
		
		this.FULL_PENDING_ADD = 'Because the subscription limit would be exceeded, {0} users could not be allocated and are listed on the <b>Pending Users</b> tab';
		
		
		this.SOME_ADDED_REST_ALREADY_ADDED = "{0} users were allocated, {1} users were already subscribed";
		
		
		this.SOME_PENDING_ADDED_REST_ALREADY_ADDED = 'Because the subscription limit would be exceeded, {0} users could not be allocated and are listed on the <b>Pending Users</b> tab';
		
		
		this.SOME_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED = "{0} users were allocated, {1} users were already subscribed, and {2} users are on the Excluded Users list";
		
		
		this.SOME_PENDING_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED = '{0} users were already subscribed and {1} users are on the Excluded Users list. Because the subscription limit would be exceeded, {2} users could not be allocated and are listed on the <b>Pending Users</b> tab.';
		
		this.SOME_ADDED_REST_EXCLUDED = "{0} users were allocated, {1} users are on the Excluded Users list";
		
		this.SOME_PENDING_ADDED_REST_EXCLUDED = '{0} users are on the Excluded Users list. Because the subscription limit would be exceeded, {1} users could not be allocated and are listed on the <b>Pending Users</b> tab.';
		
		// Hint variables:
		this.noOfUsersRequestedToBeAdded = 0;
		this.noOfUsersToBeAdded = 0;
		this.noOfExcludedUsers = 0;
		this.noOfUsersActullyAdded = 0;
		this.userSetName = "";
		this.status = "";
		
		// Derived Hint variables:
		this.usersAlreadyAdded = 0;
		this.usersFromUserSetExcluded = 0;
		
		// Hint constants:
		this.allocated = "assigned";
		this.approvalRequired = "approval_required";
		
		// Hint collection:
		this.hints = {};
    },
	
	addHint: function(key, value) {
		this.hints[key] = value;
	},
	
	getMessage: function() {
		
		var operation = this.hints["operation"];
		
		this._initializeHints();
		
		if (operation === "insert")
			return this._getInsertOpMessage();
		
		else if (operation === "delete")
			return  this._getRemoveOpMessage();
		
	},
	
	_initializeHints: function() {
		this.noOfUsersRequestedToBeAdded = this.hints["users_requested_to_be_added"].length;
		this.noOfUsersToBeAdded = this.hints["users_to_be_added"].length;
		this.noOfExcludedUsers = this.hints["users_excluded"].length;
		this.noOfUsersActullyAdded = this.hints["num_users_added"];
		this.userSetName = this.hints["new_source_name"];
		this.status = this.hints["status"];
	},
	
	_getInsertOpMessage: function() {
	
		var message = "";
		var msgArr = [];
		
		if (this._isEmptyAddRequest(msgArr)) {
			message = this._get_EMPTY_ADD_REQUEST_MSG(msgArr);
		}
		
		else if (this._isActualAddedEmpty()) {
			if (this._nothingToAdd(msgArr)) 
				message = this._get_NO_ADD_ALL_EXCLUDED_MSG(msgArr);
			else if (this._allAlreadyAdded(msgArr))
				message = this._get_NO_ADD_ALL_ALREADY_ADDED_MSG(msgArr);
			else
				message = this._get_NO_ADD_SOME_ALREADY_ADDED_SOME_EXCLUDED_MSG(msgArr);
			
		}
		
		else if (this._isFullAdd()) {
			msgArr.push(this.noOfUsersActullyAdded.toFixed());
			msgArr.push(this.userSetName); // should this be commented???
			
			message = (this._isPendingAdd()) ? gs.getMessage(this.FULL_PENDING_ADD, msgArr) : gs.getMessage(this.FULL_ADD, msgArr);
		}
		
		else if (this._isSomeAddedRestAlreadyAdded()) 
			
			message = (this._isPendingAdd()) ? this._get_SOME_PENDING_ADD_REST_ALREADY_ADDED_MSG(msgArr) : this._get_SOME_ADD_REST_ALREADY_ADDED_MSG(msgArr);
		
		
		else if (this._isSomeAddedSomeAlreadyAddedRestExcluded())
			
			message = (this._isPendingAdd()) ? this._get_SOME_PENDING_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED_MSG(msgArr) : this._get_SOME_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED_MSG(msgArr);
		
		else if (this._isSomeAddedRestExcluded())
			
			message = (this._isPending()) ? this._get_SOME_PENDING_ADDED_REST_EXCLUDED_MSG(msgArr) : this._get_SOME_ADDED_REST_EXCLUDED_MSG(msgArr);
		
			
		return message;
	},
	
	
	_getRemoveOpMessage: function() {
		
		var numRequestedToBeRemoved = this.hints["users_requested_to_be_removed"];
		var numActuallyRemoved = this.hints["users_removed"];
		var userSetName = this.hints["new_source_name"];
		
		var numUsersHavingReference = numRequestedToBeRemoved - numActuallyRemoved;
		
		var message = "";
		var msgArr = [];
		
		if (numRequestedToBeRemoved === 0) {
			msgArr.push(userSetName);
			message = gs.getMessage(this.NO_REMOVE, msgArr);
		}
		
		else if (numRequestedToBeRemoved > 0 && numActuallyRemoved === 0) {
			msgArr.push(userSetName);
			message = gs.getMessage(this.NO_REMOVE_ALL_ALREAY_REF, msgArr);
		}
			
		
		else if (numRequestedToBeRemoved == numActuallyRemoved) {
			msgArr.push(numActuallyRemoved.toFixed());
			message = gs.getMessage(this.FULL_REMOVE, msgArr);
		}
		
		else if (numActuallyRemoved > 0 && numActuallyRemoved < numRequestedToBeRemoved) {
			msgArr.push(userSetName);
			msgArr.push(numRequestedToBeRemoved.toFixed());
			msgArr.push(numActuallyRemoved.toFixed());
			
			message = gs.getMessage(this.SOME_REMOVED_REST_REFERENCED, msgArr);
		}
			
		return message;
	},
	
	_isEmptyAddRequest: function(msgArr) {
		
		return this.noOfUsersRequestedToBeAdded === 0;
	},
	
	_get_EMPTY_ADD_REQUEST_MSG: function(msgArr) {
		
		msgArr.push(this.userSetName);		
		return gs.getMessage(this.EMPTY_ADD_REQUEST, msgArr);
	},
	
	_isActualAddedEmpty: function() {
		return this.noOfUsersRequestedToBeAdded > 0 && this.noOfUsersActullyAdded == 0;
	},
	
	_nothingToAdd: function(msgArr) {
		return this.noOfUsersToBeAdded === 0;
	},
	
	_get_NO_ADD_ALL_EXCLUDED_MSG: function(msgArr) {
		
		//msgArr.push(this.userSetName);
		//msgArr.push(this.noOfUsersRequestedToBeAdded.toFixed());
		return gs.getMessage(this.NO_ADD_ALL_EXCLUDED, msgArr);
	},
	
	_allAlreadyAdded: function(msgArr) {
		return this.usersFromUserSetExcluded == 0;
	},
	
	_get_NO_ADD_ALL_ALREADY_ADDED_MSG: function(msgArr) {
		
		msgArr.push(this.noOfUsersRequestedToBeAdded.toFixed());
		msgArr.push(this.userSetName);
		return gs.getMessage(this.NO_ADD_ALL_ALREADY_ADDED, msgArr);
	},
	
	_get_NO_ADD_SOME_ALREADY_ADDED_SOME_EXCLUDED_MSG: function(msgArr) {
		
		this.usersAlreadyAdded = this.noOfUsersToBeAdded;
		this.usersFromUserSetExcluded = this.noOfUsersRequestedToBeAdded - this.noOfUsersToBeAdded;
		
		msgArr.push(this.usersAlreadyAdded.toFixed());
		msgArr.push(this.usersFromUserSetExcluded.toFixed());
		
		return gs.getMessage(this.NO_ADD_SOME_ALREADY_ADDED_SOME_EXCLUDED, msgArr);
	},
	
	_isFullAdd: function() {
		return (this.noOfUsersRequestedToBeAdded === this.noOfUsersActullyAdded);
	},
	
	_isPendingAdd: function() {
		return (this.status === this.approvalRequired);
	},
	
	_isSemiAdd: function() {
		return (this.noOfUsersActullyAdded < this.noOfUsersRequestedToBeAdded);
	},
	
	_isSomeAddedRestAlreadyAdded: function() {
		this.usersFromUserSetExcluded = this.noOfUsersRequestedToBeAdded - this.noOfUsersToBeAdded;
		return (this._isSemiAdd() && (this.usersFromUserSetExcluded === 0));
	},
	
	_get_SOME_ADD_REST_ALREADY_ADDED_MSG: function(msgArr) {
		
		this.usersAlreadyAdded = this.noOfUsersRequestedToBeAdded - this.noOfUsersActullyAdded;
		
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
		msgArr.push(this.usersAlreadyAdded.toFixed());
				
		return gs.getMessage(this.SOME_ADDED_REST_ALREADY_ADDED, msgArr);
	},
	
	_get_SOME_PENDING_ADD_REST_ALREADY_ADDED_MSG: function(msgArr) {
		this.usersAlreadyAdded = this.noOfUsersRequestedToBeAdded - this.noOfUsersActullyAdded;
		
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
		
		return gs.getMessage(this.SOME_PENDING_ADDED_REST_ALREADY_ADDED, msgArr);
	},
	
	_isSomeAddedSomeAlreadyAddedRestExcluded: function() {
		
		this.usersAlreadyAdded = this.noOfUsersToBeAdded - this.noOfUsersActullyAdded;
		return (this._isSemiAdd() && (this.usersAlreadyAdded > 0));
	},
	
	_get_SOME_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED_MSG: function(msgArr) {
		
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
		msgArr.push(this.usersAlreadyAdded.toFixed());
		msgArr.push(this.usersFromUserSetExcluded.toFixed());
		
		return gs.getMessage(this.SOME_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED, msgArr);
	},
	
	_get_SOME_PENDING_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED_MSG: function(msgArr) {
		
		msgArr.push(this.usersAlreadyAdded.toFixed());
		msgArr.push(this.usersFromUserSetExcluded.toFixed());
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
		
		return gs.getMessage(this.SOME_PENDING_ADDED_SOME_ALREADY_ADDED_REST_EXCLUDED, msgArr);
	},
	
	_get_SOME_ADDED_REST_EXCLUDED_MSG: function(msgArr) {
		
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
		msgArr.push(this.usersFromUserSetExcluded.toFixed());
					
		return gs.getMessage(this.SOME_ADDED_REST_EXCLUDED, msgArr);
	},
	
	_isSomeAddedRestExcluded: function() {
		this.usersAlreadyAdded = this.noOfUsersToBeAdded - this.noOfUsersActullyAdded;
		return (this._isSemiAdd() && (this.usersAlreadyAdded === 0));
	},
	
	_get_SOME_PENDING_ADDED_REST_EXCLUDED_MSG: function(msgArr) {
		
		msgArr.push(this.usersFromUserSetExcluded.toFixed());
		msgArr.push(this.noOfUsersActullyAdded.toFixed());
					
		return gs.getMessage(this.SOME_PENDING_ADDED_REST_EXCLUDED, msgArr);
	},

    type: 'SubscriptionMessageBuilder'
};