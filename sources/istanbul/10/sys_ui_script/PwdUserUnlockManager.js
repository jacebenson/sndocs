var PwdUserUnlockManager = Class.create();

PwdUserUnlockManager.prototype = {
	DEBUG : true,
	requestId : "",
	processId : "",
	userId : "",
	errorMsg : "",
	startTime : "",
	wfCheckDoneFrequency : 500,
	wfTimeOut : 300000,
	wfContextSysId : "",
	resultCallback : null,
	
	initialize : function (_wfCheckDoneFrequency, _wfTimeOut) {
		this.wfCheckDoneFrequency = _wfCheckDoneFrequency;
		this.wfTimeOut = _wfTimeOut;
	},
	
	// ---------------------------------------------------------------------------------
	// ------------- Handle the retrieval of the account lock status : -----------------
	// ---------------------------------------------------------------------------------
	
	// Triggers the workflow to get the user's lock state:
	//
	// The resultCallback param is a function,in the calling page, that will be called once the workflow completes.
	initiateGetLockStateWF : function(processId, requestId, userId, resultCallback) {
		this.requestId = requestId;
		this.processId = processId;
		this.userId = userId;
		this.resultCallback = resultCallback;
		
		this.startTime = new Date().getTime();
		
		var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
		
		// These 3 params are required.
		ga.addParam('sysparm_name', 'initiateGetLockStateWF');
		ga.addParam('sysparam_request_id', requestId);
		ga.addParam('sysparam_sys_user_id', userId);
		ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);	// csrf token
		ga.getXML(this.CallbackForInitiateGetLockStateWF.bind(this));
	},

	
	// Callback to process the initial ajax response (of triggering the workflow):
	CallbackForInitiateGetLockStateWF : function(response) {
		// Handle security before anything else:
		handleSecurityFrom(response);
		
		// reponse message. this always exists.
		var res =  response.responseXML.getElementsByTagName("response");
		var status = res[0].getAttribute("status");
		var message = res[0].getAttribute("message");
		this.wfContextSysId = res[0].getAttribute("value");
		if (status.match(/failure/i)) {
			return;
		}
		
		this.setTimeoutForGetStateRefresh();
	},

	setTimeoutForGetStateRefresh : function() {
		window.setTimeout(this.checkGetLockStateWF.bind(this), this.wfCheckDoneFrequency);
	},
  
	
	// Poll if the workflow to get the user's lock state is complete:
	checkGetLockStateWF : function() {
		var currTime = new Date().getTime();
		if (currTime - this.startTime > this.wfTimeOut) {
			return;
		}
		
		var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
		ga.addParam('sysparm_name', 'checkGetLockStateWFState');
		ga.addParam('sysparam_wf_context_sys_id', this.wfContextSysId);
		ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);	// csrf token
		ga.getXML(this.CallbackForCheckGetLockStateWF.bind(this));
	},
	
	
	// Callback to process the lock state response:
	CallbackForCheckGetLockStateWF : function(response) {
		// Handle security before anything else:
		handleSecurityFrom(response);
		
		var res =  response.responseXML.getElementsByTagName("response");
		var state = res[0].getAttribute("state");
		var result = res[0].getAttribute("result");

		if (!state.match(/finished/i)) {
			this.setTimeoutForGetStateRefresh();
			return;
		}
		
		this.resultCallback(result);
	},

	
	// ---------------------------------------------------------------------------------
	// -------------------- Handle the actual account ulocking: ------------------------
	// ---------------------------------------------------------------------------------
	
	// Trigger the workflow to get the user's lock state:
	//
	// The resultCallback param is a function,in the calling page, that will be called once the workflow completes.
	initiateUnlockWF : function(processId, requestId, resultCallback) {
		this.requestId = requestId;
		this.processId = processId;
		this.resultCallback = resultCallback;
		
		this.startTime = new Date().getTime();
		
		var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
		
		// These 3 params are required.
		ga.addParam('sysparm_name', 'initiateUnlockWF');
		ga.addParam('sysparam_request_id', requestId);
		ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);	// csrf token
		ga.getXML(this.CallbackForInitiateUnlockWF.bind(this));
	},

	// Process the initial ajax response (of triggering the workflow):
	CallbackForInitiateUnlockWF : function(response) {
		// Handle security before anything else:
		handleSecurityFrom(response);
		
		// reponse message. this always exists.
		var res =  response.responseXML.getElementsByTagName("response");
		var status = res[0].getAttribute("status");
		var message = res[0].getAttribute("message");
		this.wfContextSysId = res[0].getAttribute("value");
		if (status.match(/failure/i)) {
			return;
		}
		
		this.setTimeoutForUnlockRefresh();
	},

	setTimeoutForUnlockRefresh : function() {
		window.setTimeout(this.checkUnlockWF.bind(this), this.wfCheckDoneFrequency);
	},
	
	
	// Poll if the workflow to get the user's lock state is complete:
	checkUnlockWF : function() {
		var currTime = new Date().getTime();
		if (currTime - this.startTime > this.wfTimeOut) {
			return;
		}
		
		var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
		ga.addParam('sysparm_name', 'checkUnlockWFState');
		ga.addParam('sysparam_wf_context_sys_id', this.wfContextSysId);
		ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);	// csrf token
		ga.getXML(this.CallbackForCheckUnlockWF.bind(this));
	},
	
		
	CallbackForCheckUnlockWF : function(response) {
		// Handle security before anything else:
		handleSecurityFrom(response);
		
		var res =  response.responseXML.getElementsByTagName("response");
		var state = res[0].getAttribute("state");
		var result = res[0].getAttribute("result");

		if (!state.match(/finished/i)) {
			this.setTimeoutForUnlockRefresh();
			return;
		}

		this.resultCallback(result);
	},
	

/*
	// Process the result of the workflow to get user's lock state:
	processGetLockStateWF : function () {
		var ga = new GlideAjax('PwdAjaxUserUnlockProcessor');
		// These 3 params are required.
		ga.addParam('sysparm_name', 'getLockStateWFResults');
		ga.addParam('sysparam_wf_context_sys_id', this.wfContextSysId);
		ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);	// csrf token
		ga.getXML(this.callbackForProcessGetLockStateWF.bind(this));
	},
	
	
	callbackForProcessGetLockStateWF : function () {
		this._alert("client: callbackForProcessLockStateWF triggered!");
		
		// Handle security before anything else:
		handleSecurityFrom(response);
		
		// Retrieve and test the overall workflow result:
		var res =  response.responseXML.getElementsByTagName("response");
		
		var wfGeneralStatus = res[0].getAttribute("status");
		var message = res[0].getAttribute("message");
		var value = res[0].getAttribute("value");
		
		// Check for failure:
		if (!wfGeneralStatus.match(/success/i)) {
			return;
		}
		
		// Retrieve and test all activities results:
		var history = response.responseXML.getElementsByTagName('history');
		var names = response.responseXML.getElementsByTagName('activity');
		
		var bAllActivitiesSucceeded = true;
		
		// An array of obj representing the state of an activity
		var allActivitiesObj = [];
		
		// Grab all the activities in the workflow and build an array of objects
		for (var i = 0; i < history.length; i++) {
			var tmp = {};
			tmp.name = names[i].getAttribute("name");
			tmp.index = history[i].getAttribute("activity_index");
			tmp.result = history[i].getAttribute("activity_result");
			
			tmp.faultDescription = history[i].getAttribute("fault_description");
			if (tmp.faultDescription == undefined) {
				tmp.faultDescription = "";
			}
			
			allActivitiesObj.push(tmp);
			
			this._alert("Adding activity: " + "index=" + tmp.index + " : name=" + tmp.name + " : result=" + tmp.result + " : faultDescription=" + tmp.faultDescription);
		}
		
		// Iterate through activity history list to find the first error
		allActivitiesObj.sort(function(a, b) { return b.index - a.index; });
		var failingActivityObj = {};
		for (var j in allActivitiesObj) {
			var eachObj = allActivitiesObj[j];
			
			if (eachObj.result == undefined) {
				continue;
			}
			
			if (eachObj.result.match(/failure/i)) {
				allActivitiesSucceeded = false;
				this._alert("Found an error in activity history -> " + eachObj.name);
				
				// Check if faultDescription is an json object. If so, this was created via SNC.PwdWorkflowManager().creatError().
				try {
					failingActivityObj = eval("(" + eachObj.faultDescription + ")");
					this._alert("Fault description created via new SNC.PwdWorkflowManager().getErrorJSONString(...): \n* wfName=" +
								failingActivityObj.wfName + "\n* activityName=" + failingActivityObj.activityName + " \n* message=" + 
								failingActivityObj.message + " \n* isFatal=" + failingActivityObj.isFatal);
				} catch (e) {
					//The faultDescription was created manually, and not via new SNC.PwdWorkflowManager().getErrorJSONString(...)
					this._alert("Fault description created manually");
					failingActivityObj.message = eachObj.faultDescription;
				}
				break;
			}
		}
		
		if (!allActivitiesSucceeded) {
			return;
		}

		if (failingActivityObj) {
			var msg = "Password reset failed from a non-fatal error. Would you like to retry?";
			this._alert(msg);
				
			submitWithOKAndSysParam('pwd_new.do','sysparm_page_text', msg);
				
		}
	},

*/
	
	_alert : function(msg) {
		if (this.DEBUG) {
			alert(msg);
		}
	},
		
	type : "PwdUserUnlockManager"
};
