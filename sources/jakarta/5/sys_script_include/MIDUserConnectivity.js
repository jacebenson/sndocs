var MIDUserConnectivity = Class.create();

//
// Class Static Constants
//

// [ecc_agent_issue] InstanceSource
MIDUserConnectivity.INSTANCE_SOURCE = 'MIDUserConnectivity';

MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL = 1;
MIDUserConnectivity.LOG_PREFIX = MIDUserConnectivity.INSTANCE_SOURCE + ": ";

// Define JSON object field names used by the reporting methods
MIDUserConnectivity.JSON_KEY_MID = "mid";
MIDUserConnectivity.JSON_KEY_MESSAGE = "message";
MIDUserConnectivity.JSON_KEY_LOGIN_FAILED = "failed";
MIDUserConnectivity.JSON_KEY_LOGIN_SUCCESSFUL = "successful";
MIDUserConnectivity.JSON_KEY_LOGIN_AUTHORIZATION_FAILED = "authorization.failed";

// Database field, operator table names used multiple places
// (speed execution and reduce memory consumption)
MIDUserConnectivity.AGGREGATE_COUNT = "COUNT";
MIDUserConnectivity.COL_DOMAIN = "sys_domain";
MIDUserConnectivity.COL_COUNT = "count";
MIDUserConnectivity.COL_ECC_AGENT = 'ecc_agent';
MIDUserConnectivity.COL_LAST_DETECTED = "last_detected";
MIDUserConnectivity.COL_MESSAGE = "message";
MIDUserConnectivity.COL_MID_SERVER = "mid_server";
MIDUserConnectivity.COL_NAME = 'name';
MIDUserConnectivity.COL_NAME_LOGIN_SUCCEEDED_VALUE = 'login';
MIDUserConnectivity.COL_NAME_LOGIN_FAILED_VALUE = 'login.failed';
MIDUserConnectivity.COL_NAME_LOGIN_AUTHORIZATION_FAILED_VALUE = 'login.authorization.failed';
MIDUserConnectivity.COL_NAME_VALUE_MIDSERVER = 'mid_server';
MIDUserConnectivity.COL_PARAM_NAME = 'param_name';
MIDUserConnectivity.COL_PARAM_NAME_VALUE_MID_SERVER_INSTANCE_USERNAME = 'mid.instance.username';
MIDUserConnectivity.COL_PARM1 = 'parm1';
MIDUserConnectivity.COL_ROLE = 'role';
MIDUserConnectivity.COL_SOURCE = "source";
MIDUserConnectivity.COL_STATE = "state";
MIDUserConnectivity.COL_STATUS = 'status';
MIDUserConnectivity.COL_STATUS_VALUE_DOWN = 'Down';
MIDUserConnectivity.COL_SYS_CREATED_BY = 'sys_created_by';
MIDUserConnectivity.COL_SYS_CREATED_ON = 'sys_created_on';
MIDUserConnectivity.COL_SYS_ID = 'sys_id';
MIDUserConnectivity.COL_TYPE = 'type';
MIDUserConnectivity.COL_TYPE_VALUE = 'SOAP';
MIDUserConnectivity.COL_URL = 'url';
MIDUserConnectivity.COL_URL_VALUE = 'MIDServerCheck.do?SOAP';
MIDUserConnectivity.COL_USER = "user";
MIDUserConnectivity.COL_USERID = "user_name";
MIDUserConnectivity.COL_VALUE = 'value';
MIDUserConnectivity.DEFAULT_DOMAIN = "global";
MIDUserConnectivity.MID_SERVER_NOT_DEFINED = "MID NOT DEFINED";
MIDUserConnectivity.OPERATOR_GREATER_THAN = ">";
MIDUserConnectivity.OPERATOR_IN = "IN";
MIDUserConnectivity.OPERATOR_NOT_EQUAL = "!=";
MIDUserConnectivity.OPERATOR_NOT_IN = "NOT IN";
MIDUserConnectivity.TABLE_ECC_AGENT = 'ecc_agent';
MIDUserConnectivity.TABLE_ECC_AGENT_CONFIG = "ecc_agent_config";
MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE = "ecc_agent_issue";
MIDUserConnectivity.TABLE_SYSEVENT = "sysevent";
MIDUserConnectivity.TABLE_SYS_USER_HAS_ROLE = 'sys_user_has_role';
MIDUserConnectivity.TABLE_SYS_USER = "sys_user";
MIDUserConnectivity.TABLE_SYS_USER_ROLE = 'sys_user_role';
MIDUserConnectivity.TABLE_SYSLOG_TRANSACTION = "syslog_transaction";
MIDUserConnectivity.VALUE_RESOLVED = "resolved";

//
// Function declarations
//
MIDUserConnectivity.prototype = {
	
//
// Public Functions
//

//
// FUNCTION:    initialize()
// DESCRIPTION: Initializes object
// NOTE:
// 1) To debug, copy the following statement into a System Definition->Scripts-Background module 
//    new MIDUserConnectivity(2).checkConnectivity(4 *  (60 * 60 * 1000));
//
initialize: function(debugLevel) {
	
	// logging
	//  debugLevel <= 0: debug disabled
	//  debugLevel == 1: display datetime, display array lengths
	//  debugLevel > 1:  display datetime, array and object contents
	this.debugLevel = debugLevel;

},

//
// FUNCTION:    checkConnectivity()
// DESCRIPTION:
//   Identifies the set of MID Server Users that have failed to login due to network
//   misconfiguration or authentication failures.
// NOTE:
// 1) The MIDUserConnectivity().checkConnectivity() method is invoked by a periodic
//    Scheduled Job [sysauto].  It is passed the periodic repeat time interval in millseconds,
//    enabling the job repeat interval to the easily changed.  Currently the repeat interval
//    set to 4 hours.
// 2) The searchDateTimeWindowMilliseconds input parameter, when subtracted from the current
//    datetime, provides a start datetime to use when searching for user login
//    (success/failure) events and soap transactions [syslog_transaction].
// 3) The userIDMIDServerMap object will 
//    a) ONLY store names of MID Servers that are down.
//    b) UserIDs for active users that have the mid_server role.
//    c) Configured MID Server UserIDs (that may be active or inactive)
//    d) Format: 
//       { {MID's sys_id  : MID's name },
//         {userID : 
//            {domain     : user's domain, 
//             mid_server : [<array of down MID sys_ids associated with userID>]} 
// 4) If the MID Server attempts to connect to the Instance with a non-existent account
//    NO MID Server Issues table entries shall be generated.  A login.failed message is not
//    generated and there is no way of knowing that the MID Server attempted to login.
// 5) This class generates messages based on events posted to the [sys_event] table.
//    Currently the events posted to the [sys_event] table are currently NOT
//    associated with a specific MID Server and it is possible for a user account
//    to be associated with multiple MID Servers.
//    Therefore no messages generated currently provide a reference to a specific MID.
//
checkConnectivity: function(configuredExecutionDelayMilliseconds) {
	
    // Define common date and collections locally (to support javascript debugging)
    var jobSchedulerDateTime = new GlideDateTime();
    var userIDMIDServerMap = {};
	
	//
	// Determine approximate time the [sysauto] MIDUserConnectivity script
	// scheduled this job for execution (less a small processing delay)
	//
	this._initializeJobSchedulerDateTime(configuredExecutionDelayMilliseconds, jobSchedulerDateTime);
	
	//
	// Determine the set of "active UserIDs with the MID Server role"
	// NOTE: Users may or may NOT be associated with a specific MID Server defined in the
	// [ecc_agent] table
	//
	var activeUserIDsWithMIDServerRole = this._getActiveUserIDsWithMIDServerRole(userIDMIDServerMap);

	//
	// Determine the configured UserIDs associated with the set of down MID Servers 
	// NOTE: 
	// 1) Users may or may be active (i.e. active state not used to restrict records returned)
	// 2) Users may or may NOT have the MID Server role
	//
	var downMIDServerConfiguredUserIDs = this._getDownMIDServerConfiguredUserIDs(userIDMIDServerMap);
		
	//
	// Determine the set of configured MID Server UserIDs
	// NOTE: 
	// 1) Users may or may NOT have the MID Server role
	// 2) Users may or may NOT be active (i.e. active state not used to restrict records returned)
	//
	var configuredMIDServerUserIDs = this._getConfiguredMIDServerUserIDs();
	
	//
	// Determine the set of "active UserIDs with mid_server role" that are NOT associated with a
	// configured MID
	// NOTE:  Users will NOT be associated with a specific MID Server defined in the
	//        [ecc_agent] table
	//
	var activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer = 
		this._getActiveUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer(
		activeUserIDsWithMIDServerRole,
	    configuredMIDServerUserIDs);
	
	// Add results to the set of (active or inactive) UserIDs to be examined for potential network 
	// misconfiguration, authentication or authorization failures
	var userIDsWithIssues = [];	
	userIDsWithIssues.push.apply(userIDsWithIssues, downMIDServerConfiguredUserIDs);
	userIDsWithIssues.push.apply(
	userIDsWithIssues, activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer);
	
	// Log array contents
	if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		JSUtil.logObject(userIDsWithIssues, MIDUserConnectivity.LOG_PREFIX + "userIDsWithIssues");
	
	//
	// Search for users whose most recent login attempt, within the reporting period,
	// failed or succeeded.
	// NOTE:
	// The set of UserIDs (contained in the userIDsWithIssues[]) to be considered are
	// 1) configured MID Server UserIDs where the MID Server is down 
	//    (and the user may be active or inactive - active state not used to restrict records returned)
	// 2) "active UserIDs with the MID Server role" that are NOT associated with a configured
	//    MID Server user
	//
	var userIDsMostRecentLogin = this._getUserIDsMostRecentLoginAttempt(
		jobSchedulerDateTime,
        userIDsWithIssues);

	//
	// Determine set of configured MID Server users where
	// connectivity to the MID cannot be detected by the instance
	// NOTE:
	// 1) Include all UserIDs defined in userIDsWithIssues[] that are NOT contained in
	//    a) userIDsMostRecentLogin["succeeded]: array property
	//    b) userIDsMostRecentLogin["failed"] array property
	//    c) userIDsMostRecentLogin["login.authorization.failed]: array property
	// 2) The assumption is that if the instance recorded receipt of a login attempt
	//    from the user account then network connectivity is OK.
	//
	var userIDsWhereConnectivityToMidCanNotBeDetectedByInstance = 
		this._getUserIDsWhereConnectivityToMidCanNotBeDetectedByInstance(
	    userIDsWithIssues,
		userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_SUCCESSFUL],
		userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_FAILED],
		userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_AUTHORIZATION_FAILED]);
	
	//
	//   Report User Authentication Failures
	//
	var doNotAutoResolveMessages = this._reportUserAuthenticationFailure(
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_FAILED],
	userIDMIDServerMap);
	
	//
	// Report "active users with the mid_server role" without an associated MID server 
	// who logged in successfully
	//
	this._reportSuccessfulLoginUsersMIDRoleNoMIDServer(
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_SUCCESSFUL],
	userIDMIDServerMap,
	doNotAutoResolveMessages);
	
	//
	// Report User Authorization Failures
	//
	this._reportUserAuthorizationFailure(
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_AUTHORIZATION_FAILED],
	userIDMIDServerMap,
	doNotAutoResolveMessages);
	
	//
	// Report user connectivity to the instance not detected
	// 1) Report "active users with the mid_server role" without an associated MID server 
	//    who have NOT attempted to login within the reporting period.
	// 2) Report "active" users associated with down MID server(s) who have NOT attempted
	//    to login within the reporting period.
	//
	this._reportConnectivityUndetectable(
	userIDsWhereConnectivityToMidCanNotBeDetectedByInstance,
	userIDMIDServerMap,
	doNotAutoResolveMessages);
	
	//
	// Resolve all non-resolved MID Server Issues for UsersIDs that are NOT contained in
	// doNotAutoResolveMessages[]
	//
	this._autoResolveMIDServerIssuesNoLongerPresent(doNotAutoResolveMessages);

	if (this.debugLevel >= MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
	    gs.log(MIDUserConnectivity.LOG_PREFIX + "processing completed");
},
	
//
// 	Private Functions
//

//
// FUNCTION:  _initializeJobSchedulerDateTime()
// DESCRIPTION:
//   Determine approximate time the [sysauto] MIDUserConnectivity script
//   scheduled this job for execution (less a small processing delay)
// NOTE:
// 1) 1 minute delay, to allow for processing delay before 
//    this scheduled job was launched, shall be subtracted from the
//    estimated time the Scheduler queued this job for future execution.
//
_initializeJobSchedulerDateTime: function(configuredExecutionDelayMilliseconds, jobSchedulerDateTime) {
		
	// 1 minute delay (allow for processing delay before scheduled job was launched)
	var PROCESSING_DELAY_MARGIN_MSEC = 1 * (60 * 1000);
	
	// Determine estimated time the Job Scheduler queued this job for execution
	// less a 1 minute processing delay
	var startSearchDelayMilliseconds =
	PROCESSING_DELAY_MARGIN_MSEC + configuredExecutionDelayMilliseconds;
	
	jobSchedulerDateTime.subtract(startSearchDelayMilliseconds);
	
	// Log datetime Job Scheduler launch connectivity check
	if (this.debugLevel >= MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL) {
		JSUtil.logObject(jobSchedulerDateTime, 
						 MIDUserConnectivity.LOG_PREFIX + "jobSchedulerDateTime");
		JSUtil.logObject(jobSchedulerDateTime.getDisplayValue(), 
						 MIDUserConnectivity.LOG_PREFIX + "jobSchedulerDateTime (current users display format and timezone)");
	}    
},

//
// FUNCTION:  _getActiveUserIDsWithMIDServerRole()
// DESCRIPTION:
//   Determine the set of "active Users with the MID Server role"
// NOTE:
// 1) Returns the following output array
//    activeUserIDsWithMIDServerRole[]
// 2) Updates the following input/output parameters
// a) userIDMIDServerMap :
//    Format: 
//    { {MID's sys_id  : MID's name },
//      {userID : 
//         {domain     : user's domain, 
//          mid_server : [<array of down MID sys_ids associated with userID>]} 
// 3) All userIDs entries returned in the userIDMIDServerMap will have
//    an empty array of configured MID Server sys_id(s). 
//
_getActiveUserIDsWithMIDServerRole: function(userIDMIDServerMap) {
	
	//
	// Determine mid_server role sys_id
	//
	var activeUserIDsWithMIDServerRole = [];
	
	var sysUserRoleGr = new GlideRecord(MIDUserConnectivity.TABLE_SYS_USER_ROLE);
	sysUserRoleGr.addQuery(MIDUserConnectivity.COL_NAME, MIDUserConnectivity.COL_NAME_VALUE_MIDSERVER);
	sysUserRoleGr.query();
	
	// Exit if no mid_server role defined
	if (! sysUserRoleGr.next()) {
		gs.error(MIDUserConnectivity.LOG_PREFIX + "mid_server role NOT defined");
		return activeUserIDsWithMIDServerRole;
	}
	
	//
	// Obtain sysIDs for all users with the mid_server role (active or inactive)
	//
	var sysUserHasRoleGr = new GlideRecord(MIDUserConnectivity.TABLE_SYS_USER_HAS_ROLE);
	sysUserHasRoleGr.addQuery(MIDUserConnectivity.COL_ROLE, sysUserRoleGr.sys_id);
	sysUserHasRoleGr.query();
	
	// Store sys_id(s) for all users with the mid_server role (active or inactive)
	var userSysIDs = [];
	
	while (sysUserHasRoleGr.next())
		userSysIDs.push("" + sysUserHasRoleGr.getValue(MIDUserConnectivity.COL_USER));
	
	// abbreviated log message
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		gs.log(MIDUserConnectivity.LOG_PREFIX +
	    "found (" +
	    userSysIDs.length +
	    ") user(s) with the mid_server role defined");
	
	// Exit if no active users with mid_server role found
	if (userSysIDs.length == 0) {
		
		if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		    JSUtil.logObject(activeUserIDsWithMIDServerRole, 
							 MIDUserConnectivity.LOG_PREFIX + "activeUserIDsWithMIDServerRole");
		
		return activeUserIDsWithMIDServerRole;
	}
	
	//
	// Store userIDs for all for all active users with the mid_server role
	//
	var sysUserGr = new GlideRecord(MIDUserConnectivity.TABLE_SYS_USER);
	sysUserGr.addQuery(MIDUserConnectivity.COL_SYS_ID, MIDUserConnectivity.OPERATOR_IN, userSysIDs);
	sysUserGr.addActiveQuery();
	sysUserGr.query();
	
	var userID = "";
	
	while (sysUserGr.next()) {

		userID = "" + sysUserGr.getValue(MIDUserConnectivity.COL_USERID);
		
		if (! gs.nil(userID)) {

			activeUserIDsWithMIDServerRole.push(userID);

			// Store user's domain (which will be the same as all MID Servers 
			// using it since userIDs are unique across domains)
			// Associate userID with an empty array of down MID sys_ids associated with userID
			var userInfo = {};
			userInfo[MIDUserConnectivity.COL_DOMAIN] = sysUserGr.getValue(MIDUserConnectivity.COL_DOMAIN);
			userInfo[MIDUserConnectivity.COL_MID_SERVER] = [];
			userIDMIDServerMap[userID] = userInfo;

		}
	}
	
	// Log array contents
	if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		JSUtil.logObject(activeUserIDsWithMIDServerRole, 
						 MIDUserConnectivity.LOG_PREFIX + "activeUserIDsWithMIDServerRole");
	
	return activeUserIDsWithMIDServerRole;
},

//
// FUNCTION:  _getDownMIDServerConfiguredUserIDs(userIDMIDServerMap)
// DESCRIPTION:
//   Determine the configured UserIDs associated with the set of down MID Servers
// NOTE:
// 1) Users may or may be active (i.e. active state not used to restrict records returned)
// 2) Users may or may NOT have the MID Server role
// 3) Returns the following output array
//    downMIDServerConfiguredUserIDs[]
// 4) Updates the following input/output parameters
// a) userIDMIDServerMap :
//    Format: 
//    { {MID's sys_id  : MID's name },
//      {userID : 
//         {domain     : user's domain, 
//          mid_server : [<array of down MID sys_ids associated with userID>]} 
//
_getDownMIDServerConfiguredUserIDs: function(userIDMIDServerMap) {
	
	//
	// Determine the set of down MID Servers (sysIDs)
	//
	var downMIDServerConfiguredUserIDs = [];
	
	var eccAgentGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT);
	eccAgentGr.addQuery(MIDUserConnectivity.COL_STATUS,  
						  MIDUserConnectivity.COL_STATUS_VALUE_DOWN);
	eccAgentGr.query();
	
	var midServerSysId = "";
	var downMIDServersSysIDs = [];
	
	// Store name associated with all defined MID Servers in the Map. [sys_id] -> name
	while (eccAgentGr.next()) {	
		midServerSysId = "" + eccAgentGr.getValue(MIDUserConnectivity.COL_SYS_ID);
		downMIDServersSysIDs.push(midServerSysId);
		userIDMIDServerMap[midServerSysId] = eccAgentGr.getValue(MIDUserConnectivity.COL_NAME);
	}
	
	// Exit if no MID Servers are down
	if (downMIDServersSysIDs.length == 0) {
		gs.log(MIDUserConnectivity.LOG_PREFIX + "no MIDServers are down");
		return downMIDServerConfiguredUserIDs;
	}
	
	//
	// Obtain UserIDs for all down MID Servers with a configured 'mid.instance.username'
	//
	var eccAgentConfigGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT_CONFIG);
	eccAgentConfigGr.addQuery(MIDUserConnectivity.COL_PARAM_NAME, 
								 MIDUserConnectivity.COL_PARAM_NAME_VALUE_MID_SERVER_INSTANCE_USERNAME);
	eccAgentConfigGr.addQuery(MIDUserConnectivity.COL_ECC_AGENT, MIDUserConnectivity.OPERATOR_IN, downMIDServersSysIDs);
	eccAgentConfigGr.query();
	
	// Store configured userIDs associated with all down MID servers
	while (eccAgentConfigGr.next())	{
		
		midServerSysId = "" + eccAgentConfigGr.getValue(MIDUserConnectivity.COL_ECC_AGENT);

		var configuredUserID = "" + eccAgentConfigGr.getValue(MIDUserConnectivity.COL_VALUE);
		downMIDServerConfiguredUserIDs.push(configuredUserID);
		
		var userInfo = {};
		
		if (userIDMIDServerMap.hasOwnProperty(configuredUserID)) {
			// User must have the mid_server role
			userInfo = userIDMIDServerMap[configuredUserID];	
		} else {
			// Create map entry for the newly discovered user.
			// User must NOT have the mid_server role.
			// Since userIDs are unique across domains, 
			// the domain for the MID should be the same as the user.
			userInfo[MIDUserConnectivity.COL_DOMAIN] = eccAgentConfigGr.getValue(MIDUserConnectivity.COL_DOMAIN);
			userInfo[MIDUserConnectivity.COL_MID_SERVER] = [];	
			userIDMIDServerMap[configuredUserID] = userInfo;
		}
		
		// store MID server into the user's array of configured MID Servers
		userInfo[MIDUserConnectivity.COL_MID_SERVER].push(midServerSysId);
	}

	// Remove duplicates from the array (multiple MID Servers may share the same user account)
    var arrayUtil = new ArrayUtil();
	downMIDServerConfiguredUserIDs = arrayUtil.unique(downMIDServerConfiguredUserIDs);
	
	// Log array and object map contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL) {

		gs.log(
		MIDUserConnectivity.LOG_PREFIX + "found (" +
		downMIDServerConfiguredUserIDs.length +
		") down MID Servers with a configured 'mid.instance.username' parameter");
		
	} else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL) {
		
		JSUtil.logObject(downMIDServerConfiguredUserIDs, 
						 MIDUserConnectivity.LOG_PREFIX + "downMIDServerConfiguredUserIDs");
		JSUtil.logObject(userIDMIDServerMap, 
						 MIDUserConnectivity.LOG_PREFIX + "userIDMIDServerMap");
	}
	
	return downMIDServerConfiguredUserIDs;
},

//
// FUNCTION:  _getConfiguredMIDServerUserIDs
// DESCRIPTION:
//   Determine the set of configured MID Server UserIDs
// NOTE:
// 1) Users may or may be active (i.e. active state not used to restrict records returned)
// 2) Returns the following output array
//    configuredMIDServerUserIDs[]
//
_getConfiguredMIDServerUserIDs: function() {
	
	//
	// Obtain configured MID Server UserIDs
	//
	var configuredMIDServerUserIDs = [];
	
	var eccAgentConfigGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT_CONFIG);
	eccAgentConfigGr.addQuery(MIDUserConnectivity.COL_PARAM_NAME,
							  MIDUserConnectivity.COL_PARAM_NAME_VALUE_MID_SERVER_INSTANCE_USERNAME);
	eccAgentConfigGr.query();
	
	while (eccAgentConfigGr.next())
		configuredMIDServerUserIDs.push(
	    "" + eccAgentConfigGr.getValue(MIDUserConnectivity.COL_VALUE));

	// Remove duplicates from the array (multiple MID Servers may share the same user account)
    var arrayUtil = new ArrayUtil();
	configuredMIDServerUserIDs = arrayUtil.unique(configuredMIDServerUserIDs);
	
	// Log object contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		gs.log(MIDUserConnectivity.LOG_PREFIX + "found (" +
	    configuredMIDServerUserIDs.length +
	    ") configured MID Server UserIds");
	
	else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
	    JSUtil.logObject(configuredMIDServerUserIDs, "configuredMIDServerUserIDs");
	
	return configuredMIDServerUserIDs;
},

//
// FUNCTION:   _getActiveUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer()
// DESCRIPTION:
//   Determines the set of "active UserIDs with the MID Server role" that are NOT
//   associated with a configured MID Server user.
// NOTE:  
// 1) The users will be active and have the MID Server role.
// 2) Users will NOT be associated with a specific MID Server defined in
//    the [ecc_agent] table.
// 3) Returns the following output array
//    activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer[]
//
_getActiveUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer: function(
activeUserIDsWithMIDServerRole,
configuredMIDServerUserIDs) {
	
	// NOTE:  
	// ArrayUtil.diff() shall return an array of items from 
	// activeUserIDsWithMIDServerRole that are not found in the
	// configuredMIDServerUserIDs array.
	// Duplicates are removed from the result.	
	var arrayUtil = new ArrayUtil();

	// return active users with mid_server role that are NOT a configured MID Server user
    var activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer = 
		 arrayUtil.diff(activeUserIDsWithMIDServerRole, 
					    configuredMIDServerUserIDs);	
	
    // Log array contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		gs.log(
	    MIDUserConnectivity.LOG_PREFIX + "found (" +
	    activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer.length +
	    ") active user(s) with the MID Server role NOT also associated with a configured MID Server user");

	else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		JSUtil.logObject(activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer,
						  MIDUserConnectivity.LOG_PREFIX + 
						 "activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer");
	
	return activeUserIDsWithMIDServerRoleNotAssociatedWithConfiguredMIDServer;
},

//
// FUNCTION:  _getUserIDsMostRecentLoginAttempt()
// DESCRIPTION:
//   Search for users whose most recent login attempt, within the reporting period, either 
//   failed or succeeded.
// NOTE:
// 1) The GlideAggregate method is NOT used because it does not support 
//    setting a MAX aggregate on the SYS_CREATED_ON field.
// 2) The set of UserIDs (contained in the userIDsWithIssues array) to be considered are
//    a) configured MID Server UserIDs where the MID Server is down 
//       (and the user may be active or inactive).
//    b) "active UserIDs with the MID Server role" that are NOT associated with a configured
//       MID Server user.
// 3) Returns the userIDsMostRecentLogin object containing three arrays
//    { 
//       "succeeded":             userIDsMostRecentLoginAttemptSuccessful[],
//       "failed":                userIDsMostRecentLoginAttemptFailed[],
//  	 "authorization.failed":  userIDsMostRecentLoginAttemptAuthorizationFailed[]
//    }
//
_getUserIDsMostRecentLoginAttempt: function(
jobSchedulerDateTime,
userIDsWithIssues) {
	
	//
	// Obtain list of logins within the time period, sorted in descending order by date, where
	// UserIDs are contained in the userIDsWithIssues[]
	//	
    // Desired array output  
    //   1) A list of users whose most recent login attempt succeeded.
	//   2) A list of users whose most recent login attempt failed.
	//   3) A list of users whose most recent login attempt failed due to user authorization.
	// Query Conditions
    //   For each user in the "userIDsWithIssues" array
	//   1) Limit the records to login attempts (login, login.failed, login.authorization.failed) 
	//      within the time period.
	//   NOTE:
	//     A while loop is used since the size of the user list is expected to be small
	//     and the number of login attempts may be large.  
	//     This enables the database query to limit the number of records returned per
	//     user to the most recent.
	// Query Ordering
	//   For each user
    //   1) Obtain the login attempts for the user.
    //      Order result set in descending order by date, limiting result
	//      to the most recent record.
    // Query Result Processing
    //   For each user
	//   1) Store the userid in either the login succeed, 
	//      login failed, or login authorization array.
	//
	var userIDsMostRecentLoginAttemptFailed = [];
	var userIDsMostRecentLoginAttemptSuccessful = [];
	var userIDsMostRecentLoginAttemptAuthorizationFailed = [];
	userIDsMostRecentLogin = {};
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_FAILED] = userIDsMostRecentLoginAttemptFailed;
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_SUCCESSFUL] = userIDsMostRecentLoginAttemptSuccessful;
	userIDsMostRecentLogin[MIDUserConnectivity.JSON_KEY_LOGIN_AUTHORIZATION_FAILED] = userIDsMostRecentLoginAttemptAuthorizationFailed;
	
	var userID = "";
	
	for (var idx = 0; idx < userIDsWithIssues.length; ++idx) {
	
		userID = userIDsWithIssues[idx];
		
		if (gs.nil(userID))
			continue;
		
		// Obtain list of login attempts for the specified user within the time period, sorted in descending order by date
	    var sysEventGr = new GlideRecord(MIDUserConnectivity.TABLE_SYSEVENT);
		// filter conditions
	    var orConditionGr =
	    sysEventGr.addQuery(MIDUserConnectivity.COL_NAME, MIDUserConnectivity.COL_NAME_LOGIN_SUCCEEDED_VALUE);
	    orConditionGr.addOrCondition(MIDUserConnectivity.COL_NAME, MIDUserConnectivity.COL_NAME_LOGIN_FAILED_VALUE);
		orConditionGr.addOrCondition(MIDUserConnectivity.COL_NAME, MIDUserConnectivity.COL_NAME_LOGIN_AUTHORIZATION_FAILED_VALUE); // authorization failure
	    sysEventGr.addQuery(MIDUserConnectivity.COL_PARM1, userID);
	    sysEventGr.addQuery(
	    MIDUserConnectivity.COL_SYS_CREATED_ON, MIDUserConnectivity.OPERATOR_GREATER_THAN, jobSchedulerDateTime);		
		// order by date in descending order, returning the most recent
	    sysEventGr.orderByDesc(MIDUserConnectivity.COL_SYS_CREATED_ON);
		sysEventGr.setLimit(1);
        // execute	
	    sysEventGr.query();
	
	    // Store the most recent login attempt
	    if (sysEventGr.next()) {
		
		    // Most recent login attempt successful?
		    var loginResult = "" + sysEventGr.getValue(MIDUserConnectivity.COL_NAME);
			
		    if (! gs.nil(loginResult)) {
				
				// Most recent login succeeded?
			    if (loginResult == MIDUserConnectivity.COL_NAME_LOGIN_SUCCEEDED_VALUE)
			        userIDsMostRecentLoginAttemptSuccessful.push(userID);
		        else if (loginResult == MIDUserConnectivity.COL_NAME_LOGIN_FAILED_VALUE)
		           userIDsMostRecentLoginAttemptFailed.push(userID);
				else if (loginResult == MIDUserConnectivity.COL_NAME_LOGIN_AUTHORIZATION_FAILED_VALUE)
					userIDsMostRecentLoginAttemptAuthorizationFailed.push(userID);
				else 
					gs.error(MIDUserConnectivity.LOG_PREFIX + 
							 "Invalid [sysevent] parm1 field value - " + loginResult);
			}
		}
	} // for (...)
	
	// Log array contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL) {
		
		gs.log(
		MIDUserConnectivity.LOG_PREFIX + "found (" +
		userIDsMostRecentLoginAttemptFailed.length +
		") user(s) whose most recent login attempt during the reporting period failed");
		
		gs.log(
		MIDUserConnectivity.LOG_PREFIX + "found (" +
		userIDsMostRecentLoginAttemptAuthorizationFailed.length +
		") user(s) whose most recent login attempt during the reporting period failed due to user authorization");
		
		gs.log(
		MIDUserConnectivity.LOG_PREFIX + "found (" +
		userIDsMostRecentLoginAttemptSuccessful.length +
		") user(s) whose most recent login attempt during the reporting period succeeded");
		
	} else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL) {

		JSUtil.logObject(userIDsMostRecentLoginAttemptFailed,
						 MIDUserConnectivity.LOG_PREFIX + "userIDsMostRecentLoginAttemptFailed");
		
		JSUtil.logObject(userIDsMostRecentLoginAttemptAuthorizationFailed,
						 MIDUserConnectivity.LOG_PREFIX + "userIDsMostRecentLoginAttemptAuthorizationFailed");
	
		JSUtil.logObject(userIDsMostRecentLoginAttemptSuccessful,
						 MIDUserConnectivity.LOG_PREFIX + "userIDsMostRecentLoginAttemptSuccessful");
	}

	return userIDsMostRecentLogin;
},

//
// FUNCTION:  _getUserIDsWhereConnectivityToMidCanNotBeDetectedByInstance()
// DESCRIPTION:
//   Determine set of configured MID Server users where connectivity to the MID
//   cannot be detected by the instance.
// NOTE:
// 1) Include all UserIDs defined in userIDsWithIssues[] array that are NOT contained in
//    a) userIDsMostRecentLogin["succeeded]: array property
//    b) userIDsMostRecentLogin["failed"] array property
//    c) userIDsMostRecentLogin["login.authorization.failed]: array property
// 2) Returns the following output array
//    a) userIDsWhereConnectivityToMidCanNotBeDetectedByInstance[]
// 3) The assumption is that if the instance recorded receipt of a login attempt
//    from the user account then network connectivity is OK.
//
_getUserIDsWhereConnectivityToMidCanNotBeDetectedByInstance: function(
userIDsWithIssues,
userIDsMostRecentLoginAttemptSuccessful,
userIDsMostRecentLoginAttemptFailed, 
userIDsMostRecentLoginAttemptAuthorizationFailed

) {
	// NOTE:  
	// ArrayUtil.diff() shall return an array of items from 
	// userIDsWithIssues that are not found in the following
	// arrays: userIDsMostRecentLoginAttemptSuccessful
	//         userIDsMostRecentLoginAttemptFailed,
	//         userIDsMostRecentLoginAttemptAuthorizationFailed        
	// Duplicates are removed from the result	
	var arrayUtil = new ArrayUtil();
	
    var userIDsWhereConnectivityToMidCanNotBeDetectedByInstance = 
		 arrayUtil.diff(userIDsWithIssues, 
					userIDsMostRecentLoginAttemptSuccessful,
					userIDsMostRecentLoginAttemptFailed, 
				    userIDsMostRecentLoginAttemptAuthorizationFailed);
		
	// Log array contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)		
		gs.log(
	    MIDUserConnectivity.LOG_PREFIX + "found (" +
	    userIDsWhereConnectivityToMidCanNotBeDetectedByInstance.length +
	    ") configured MID Server users where connectivity to the MID by the instance can not be detected");
	
	else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)		
		JSUtil.logObject(
		userIDsWhereConnectivityToMidCanNotBeDetectedByInstance,
	    MIDUserConnectivity.LOG_PREFIX + "userIDsWhereConnectivityToMidCanNotBeDetectedByInstance");
	
	return userIDsWhereConnectivityToMidCanNotBeDetectedByInstance;
},

//
// FUNCTION:  _autoResolveMIDServerIssuesNoLongerPresent()
// DESCRIPTION:
//   Resolve all non-resolved MID Server Issues for UsersIDs that are NOT contained in
//   doNotAutoResolveMessages[]
// NOTE:
// 1) None
_autoResolveMIDServerIssuesNoLongerPresent: function(doNotAutoResolveMessages) {
	
	//
	// Obtain the set of MID Server Issues records, for the collection of records where
	// 1) the Instance Source is supported by the MIDUserConnectivity class
	// 2) the state is NOT resolved
	// 3) the message is NOT in the doNotAutoResolveMessages[] list
	// NOTE: Users may or may NOT be associated with a specific MID Server defined
	//       in the [ecc_agent] table
	//
	var eccAgentIssueGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE);
	eccAgentIssueGr.addQuery(
	MIDUserConnectivity.COL_MESSAGE, MIDUserConnectivity.OPERATOR_NOT_IN, doNotAutoResolveMessages);
	eccAgentIssueGr.addQuery(MIDUserConnectivity.COL_SOURCE, MIDUserConnectivity.INSTANCE_SOURCE);
	eccAgentIssueGr.addQuery(
	MIDUserConnectivity.COL_STATE, MIDUserConnectivity.OPERATOR_NOT_EQUAL, MIDUserConnectivity.VALUE_RESOLVED);
	eccAgentIssueGr.query();
	
	//
	// Resolve all returned issues, updating the state
	//
	if (eccAgentIssueGr.hasNext()) {
		eccAgentIssueGr.setValue(MIDUserConnectivity.COL_STATE, MIDUserConnectivity.VALUE_RESOLVED);
		eccAgentIssueGr.updateMultiple();
	}
	
	// Log array contents
	if (this.debugLevel == MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		gs.log(
	    MIDUserConnectivity.LOG_PREFIX + "found (" +
	    doNotAutoResolveMessages.length +
	    ") new message(s) skipped by the auto-resolver");
	
	else if (this.debugLevel > MIDUserConnectivity.ABBREVIATED_DEBUG_LEVEL)
		JSUtil.logObject(doNotAutoResolveMessages, 
						 MIDUserConnectivity.LOG_PREFIX + "doNotAutoResolveMessages");
},

//
// FUNCTION:  _reportUserAuthenticationFailure()
// DESCRIPTION:
//   Report login authentication failure for users failing authentication that
//   are either associated with a MID Server or have the mid_server role.
// NOTE:  
// 1) userIDMIDServerMap
//    Format: 
//    { {MID's sys_id  : MID's name },
//      {userID : 
//         {domain     : user's domain, 
//          mid_server : [<array of down MID sys_ids associated with userID>]} 
// 2) Returns the following output array
//    a) doNotAutoResolveMessages[]	
//
_reportUserAuthenticationFailure: function(
userIDsMostRecentLoginAttemptFailed,
userIDMIDServerMap) {

	var doNotAutoResolveMessages = [];
	var message = "";
	var numberConfiguredMIDServers = 0;
	var userID = "";
	var userInfo = {};
	var messageCollection = []; // array of messageCollectionEntry objects
	var messageCollectionEntry = {}; // {mid: xxx, message: xxx, sys_domain: xxx}
	
	// Message types
	// "Login authentication failure for User XXX associated with 1 down MID Server. Check password on MID server."
	// "Login authentication failure for User XXX associated with 22 down MID Servers. Check password on MID servers."
	// "Login authentication failure for User XXXX with mid_server role not associated with a MID Server."
	var messagePrefix1 = "Login authentication failure for User ";
	var messageNoMIDSuffix = " with mid_server role not associated with a MID Server.";
	var messageMIDSuffix1 = " associated with ";
	var messageMIDSuffix2 = " down MID Server.  Check password on MID server.";
	var messageMIDSuffix3 = " down MID Servers.  Check password on MID servers.";
		
	for (var idx = 0; idx < userIDsMostRecentLoginAttemptFailed.length; ++idx) {

		userID = "" + userIDsMostRecentLoginAttemptFailed[idx];
		
		// should never happen
		if ( gs.nil(userID) || (! userIDMIDServerMap.hasOwnProperty(userID)) )
			continue;
				
		// NOTE:  every property in the userInfo object should exist and be initialized
		userInfo = userIDMIDServerMap[userID];			
        numberConfiguredMIDServers = userInfo[MIDUserConnectivity.COL_MID_SERVER].length;
		
		// User not associated with any MID Servers?
		if (numberConfiguredMIDServers == 0)			
			message = messagePrefix1 + userID + messageNoMIDSuffix;			
		else if (numberConfiguredMIDServers == 1)
			message = messagePrefix1 + userID + messageMIDSuffix1 + "1" + messageMIDSuffix2;				
		else
			message = messagePrefix1 + userID + messageMIDSuffix1 + numberConfiguredMIDServers + messageMIDSuffix3;
		
		// Cache message to prevent autoresolve
		doNotAutoResolveMessages.push(message);
		
		messageCollectionEntry = {};
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MID] = MIDUserConnectivity.MID_SERVER_NOT_DEFINED;
		messageCollectionEntry[MIDUserConnectivity.COL_DOMAIN] = userInfo[MIDUserConnectivity.COL_DOMAIN];
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MESSAGE] = message;
		messageCollection.push(messageCollectionEntry);

	} // end for (...)
		
	// write detected errors to the [ecc_agent_issue] table
	if (messageCollection.length > 0)
		this._reportDetectedMidAgentIssues(messageCollection);
		
	return doNotAutoResolveMessages;
},
	
//
// FUNCTION: _reportSuccessfulLoginUsersMIDRoleNoMIDServer()
// DESCRIPTION:
//  Report "active users with the mid_server role" without an associated MID server
//  who logged in successfully.
// NOTE:
// 1) Skip UserIDs that are associated with one or more MID Server(s).
//    Rational being the events posted to the [sys_event] table are currently NOT
//    associated with a specific MID Server and it is possible for a user account
//    to be associated with multiple MID Servers.
// 2) userIDMIDServerMap
//    Format: 
//    { {MID's sys_id  : MID's name },
//      {userID : 
//         {domain     : user's domain, 
//          mid_server : [<array of down MID sys_ids associated with userID>]} 
// 3) Updates the following input/output array
//    a) doNotAutoResolveMessages[]		
//
_reportSuccessfulLoginUsersMIDRoleNoMIDServer: function(
userIDsMostRecentLoginAttemptSuccessful,
userIDMIDServerMap,
doNotAutoResolveMessages) {
	
	var message = "";
	var numberConfiguredMIDServers = 0;
	var userID = "";
	var userInfo = {};
	var messageCollection = []; // array of messageCollectionEntry objects
	var messageCollectionEntry = {}; // {mid: xxx, message: xxx, sys_domain: xxx}

	//  "User XXXX with mid_server role successfully connected but is not associated with a MID Server.  The mid_server role should be reserved for MID Server use only."
	var messagePrefix = "User ";
	var messageSuffix = " with mid_server role successfully connected but is not associated with a MID Server.  The mid_server role should be reserved for MID Server use only.";
		
	for (var idx = 0; idx < userIDsMostRecentLoginAttemptSuccessful.length; ++idx) {

		userID = "" + userIDsMostRecentLoginAttemptSuccessful[idx];
		
		// should never happen
		if ( gs.nil(userID) || (! userIDMIDServerMap.hasOwnProperty(userID)) )
			continue;
				
		// NOTE:  every property in the userInfo object should exist and be initialized
		userInfo = userIDMIDServerMap[userID];			
        numberConfiguredMIDServers = userInfo[MIDUserConnectivity.COL_MID_SERVER].length;
		
		// Skip user associated with one or more MID Servers
		if (numberConfiguredMIDServers != 0)			
			continue;
		
		message = messagePrefix + userID + messageSuffix;
				
		// Cache message to prevent autoresolve
		doNotAutoResolveMessages.push(message);
		
		messageCollectionEntry = {};
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MID] = MIDUserConnectivity.MID_SERVER_NOT_DEFINED;
		messageCollectionEntry[MIDUserConnectivity.COL_DOMAIN] = userInfo[MIDUserConnectivity.COL_DOMAIN];
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MESSAGE] = message;
		messageCollection.push(messageCollectionEntry);

	} // end for (...)
		
	// write detected errors to the [ecc_agent_issue] table
	if (messageCollection.length > 0)
		this._reportDetectedMidAgentIssues(messageCollection);
},		
	
//
// FUNCTION:  _reportUserAuthorizationFailure()
// DESCRIPTION:
//   Report User Authorization failures.
// NOTE:
// 1) Updates the following input/output array
//    a) doNotAutoResolveMessages[]	
// 2) The MIDServerCheck() scripted web service posts the 
//    login.authorization.failed event.  In order for it to be
//    invoked the user account must have the SOAP roles.
//    Therefore this will not catch the case where the user account
//    is missing the SOAP role and the mid_server role.
_reportUserAuthorizationFailure: function(
userIDsMostRecentLoginAttemptAuthorizationFailed,
userIDMIDServerMap,
doNotAutoResolveMessages) {
	
	var message = "";
	var numberConfiguredMIDServers = 0;
	var userID = "";
	var userInfo = {};
	var messageCollection = []; // array of messageCollectionEntry objects
	var messageCollectionEntry = {}; // {mid: xxx, message: xxx, sys_domain: xxx}
	
	// Message types
	// "Login authorization failure for User XXX associated with 1 down MID Server.  Re-assign mid_server role to grant all required roles."
	// "Login authorization failure for User XXX associated with 22 down MID Servers.  Re-assign mid_server role to grant all required roles."
	// "Login authorization failure for User XXXX with mid_server role not associated with a MID Server."
	var messagePrefix1 = "Login authorization failure for User ";
	var messageNoMIDSuffix = " with mid_server role not associated with a MID Server.";
	var messageMIDSuffix1 = " associated with ";
	var messageMIDSuffix2 = " down MID Server.  Re-assign mid_server role to grant all required roles.";
	var messageMIDSuffix3 = " down MID Servers.  Re-assign mid_server role to grant all required roles.";
		
	for (var idx = 0; idx < userIDsMostRecentLoginAttemptAuthorizationFailed.length; ++idx) {

		userID = "" + userIDsMostRecentLoginAttemptAuthorizationFailed[idx];
		
		// should never happen
		if ( gs.nil(userID) || (! userIDMIDServerMap.hasOwnProperty(userID)) )
			continue;
				
		// NOTE:  every property in the userInfo object should exist and be initialized
		userInfo = userIDMIDServerMap[userID];			
        numberConfiguredMIDServers = userInfo[MIDUserConnectivity.COL_MID_SERVER].length;
		
		// User not associated with any MID Servers?
		if (numberConfiguredMIDServers == 0)			
			message = messagePrefix1 + userID + messageNoMIDSuffix;			
		else if (numberConfiguredMIDServers == 1)			
			message = messagePrefix1 + userID + messageMIDSuffix1 + "1" + messageMIDSuffix2;				
		else
			message = messagePrefix1 + userID + messageMIDSuffix1 + numberConfiguredMIDServers + messageMIDSuffix3;
		
		// Cache message to prevent autoresolve
		doNotAutoResolveMessages.push(message);
		
		messageCollectionEntry = {};
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MID] = MIDUserConnectivity.MID_SERVER_NOT_DEFINED;
		messageCollectionEntry[MIDUserConnectivity.COL_DOMAIN] = userInfo[MIDUserConnectivity.COL_DOMAIN];
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MESSAGE] = message;
		messageCollection.push(messageCollectionEntry);

	} // end for (...)
		
	// write detected errors to the [ecc_agent_issue] table
	if (messageCollection.length > 0)
		this._reportDetectedMidAgentIssues(messageCollection);
},
	
//
// FUNCTION: _reportConnectivityUndetectable()
// DESCRIPTION:
// Report user connectivity to the instance not detected
// 1) Report "active users with the mid_server role" without an associated MID server 
//    who have NOT attempted to login within the reporting period.
// 2) Report "active" users associated with down MID server(s) who have NOT attempted
//    to login within the reporting period.
// 3) userIDMIDServerMap
//    Format: 
//    { {MID's sys_id  : MID's name },
//      {userID : 
//         {domain     : user's domain, 
//          mid_server : [<array of down MID sys_ids associated with userID>]} 
// 4) Updates the following input/output array
//    a) doNotAutoResolveMessages[]
//
_reportConnectivityUndetectable: function(
userIDsWhereConnectivityToMidCanNotBeDetectedByInstance,
userIDMIDServerMap,
doNotAutoResolveMessages) {

	var message = "";
	var numberConfiguredMIDServers = 0;
	var userID = "";
	var userInfo = {};
	var messageCollection = []; // array of messageCollectionEntry objects
	var messageCollectionEntry = {}; // {mid: xxx, message: xxx, sys_domain: xxx}

	// "User XXX with mid_server role is not associated with a MID Server.  No login attempts within reporting period."
	// "User XXX associated with 1 down MID Server.  No login attempts within reporting period." 
	// "User XXX associated with 2 down MID Servers.  No login attempts within reporting period."   
    var messagePrefix = "User ";
	var messageNoMIDSuffix = " with mid_server role not associated with a MID Server.  No login attempts within reporting period.";
	var messageMIDSuffix1 = " associated with ";
	var messageMIDSuffix2 = " down MID Server.  No login attempts within reporting period.";
	var messageMIDSuffix3 = " down MID Servers.  No login attempts within reporting period.";
	
	for (var idx = 0;
		idx < userIDsWhereConnectivityToMidCanNotBeDetectedByInstance.length;
	    ++idx) {

		userID = "" + userIDsWhereConnectivityToMidCanNotBeDetectedByInstance[idx];
		
		// should never happen
		if ( gs.nil(userID) || (! userIDMIDServerMap.hasOwnProperty(userID)) )
			continue;
				
		// NOTE:  every property in the userInfo object should exist and be initialized
		userInfo = userIDMIDServerMap[userID];			
        numberConfiguredMIDServers = userInfo[MIDUserConnectivity.COL_MID_SERVER].length;
		
		// User not associated with any MID Servers?
		if (numberConfiguredMIDServers == 0)			
			message = messagePrefix + userID + messageNoMIDSuffix;			
		else if (numberConfiguredMIDServers == 1)			
			message = messagePrefix + userID + messageMIDSuffix1 + "1" + messageMIDSuffix2;				
		else
			message = messagePrefix + userID + messageMIDSuffix1 + numberConfiguredMIDServers + messageMIDSuffix3;
		
		// Cache message to prevent autoresolve
		doNotAutoResolveMessages.push(message);
		
		messageCollectionEntry = {};
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MID] = MIDUserConnectivity.MID_SERVER_NOT_DEFINED;
		messageCollectionEntry[MIDUserConnectivity.COL_DOMAIN] = userInfo[MIDUserConnectivity.COL_DOMAIN];
		messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MESSAGE] = message;
		messageCollection.push(messageCollectionEntry);

	} // end for (...)
		
	// write detected errors to the [ecc_agent_issue] table
	if (messageCollection.length > 0)
		this._reportDetectedMidAgentIssues(messageCollection);
},

//
// FUNCTION:  _reportDetectedMidAgentIssues(messageCollection)
// DESCRIPTION:
//   Common method used to write/update detected problems to the [ecc_agent_issue] table
// NOTE:
// 1) None	
_reportDetectedMidAgentIssues: function(messageCollection) {

    var messageCollectionEntry = {}; // {mid: xxx, message: xxx, sys_domain: xxx}
	var midServer = "";
	var message = "";
	var domain = "";
	
	for (var idx = 0; idx < messageCollection.length; ++idx ) {
		
		messageCollectionEntry = messageCollection[idx];
		
		// sanity check
		if (gs.nil(messageCollectionEntry))
			continue;
		
		midServer = messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MID];
		message = messageCollectionEntry[MIDUserConnectivity.JSON_KEY_MESSAGE];
		domain = messageCollectionEntry[MIDUserConnectivity.COL_DOMAIN];
		if (gs.nil(domain))
			domain = MIDUserConnectivity.DEFAULT_DOMAIN;
		
		// sanity checks
		if (gs.nil(midServer) || gs.nil(message))
			continue;
		
		// Seach for existing MID Server record
		var eccAgentIssueGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE);
		eccAgentIssueGr.addQuery(MIDUserConnectivity.COL_SOURCE, MIDUserConnectivity.INSTANCE_SOURCE);
		eccAgentIssueGr.addQuery(
		MIDUserConnectivity.COL_STATE, MIDUserConnectivity.OPERATOR_NOT_EQUAL, MIDUserConnectivity.VALUE_RESOLVED);
		eccAgentIssueGr.addQuery(MIDUserConnectivity.COL_MESSAGE, message);
		
		// MID Server defined?
		if (midServer != MIDUserConnectivity.MID_SERVER_NOT_DEFINED)
			eccAgentIssueGr.addQuery(MIDUserConnectivity.COL_MID_SERVER,  midServer);
		else
			eccAgentIssueGr.addNullQuery(MIDUserConnectivity.COL_MID_SERVER);
		
		eccAgentIssueGr.query();
		
		//
		// Add (or update existing) record in ecc_agent_issue table
		//
		
		// Update existing unresolved record?
		if (eccAgentIssueGr.next()) {
			
			// Bump the 'last_detected' and 'count' fields.
			eccAgentIssueGr.setValue(
			MIDUserConnectivity.COL_COUNT,
			(+ eccAgentIssueGr.getValue(MIDUserConnectivity.COL_COUNT)) + 1);
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_LAST_DETECTED, new GlideDateTime());
			
			// update the domain in case it has changed
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_DOMAIN, domain);
			
			if (eccAgentIssueGr.update() == null)
				gs.error("Table update failed: " + MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE);
			
		} else {
			
			//
			// Insert new [ecc_agent_issue] table record
			//
			eccAgentIssueGr = new GlideRecord(MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE);
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_LAST_DETECTED, new GlideDateTime());
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_MESSAGE, message);
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_SOURCE, MIDUserConnectivity.INSTANCE_SOURCE);
			eccAgentIssueGr.setValue(MIDUserConnectivity.COL_DOMAIN, domain);
			
			// MID Server defined?
			if (midServer != MIDUserConnectivity.MID_SERVER_NOT_DEFINED)
				eccAgentIssueGr.setValue(MIDUserConnectivity.COL_MID_SERVER,  midServer);
			
			if (eccAgentIssueGr.insert() == null)
				gs.error("Table insert failed: " + MIDUserConnectivity.TABLE_ECC_AGENT_ISSUE);
			
		} // end if
	} // end for (...)
},

type: 'MIDUserConnectivity'

};