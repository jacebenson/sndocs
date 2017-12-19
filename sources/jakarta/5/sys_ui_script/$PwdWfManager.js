var PwdWfManager = Class.create();

PwdWfManager.prototype = {
  wfResult : {bPass : false, msg : ""},
  requestId : "",
  processId : "",  
  // Error Message to display in case of workflow errors
  errorMsg : "",
  startTime : "",
  wfCheckDoneFrequency : 500,
  wfTimeOut : 300000,
  wfContextSysId : "",
  
  initialize : function (_wfCheckDoneFrequency, _wfTimeOut) {
    this.wfCheckDoneFrequency = _wfCheckDoneFrequency;
    this.wfTimeOut = _wfTimeOut;
  },
  
  startWfViaAjax : function(processId, requestId, password) {
    this.requestId = requestId;
    this.processId = processId;
    this.startTime = new Date().getTime();

    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    
    // These 4 params are required.
    ga.addParam('sysparm_name', 'startWorkflow');
    ga.addParam('sysparam_request_id', requestId);
    if (password != undefined) {
      ga.addParam('sysparam_new_password', password);
	  ga.addParam("ni.nolog.sysparam_new_password", "true");
    }
    ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
    ga.addParam("ni.truncate.sysparam_pwd_csrf_token", "true");
    ga.getXML(this.callBackForStartWf.bind(this));
  },
  
  callBackForStartWf : function(response, args) {
    //Let's handle the security.
    handleSecurityFrom(response);

    // reponse message. this always exists.
    var res =  response.responseXML.getElementsByTagName("response");
    var status = res[0].getAttribute("status");
    var message = res[0].getAttribute("message");
    this.wfContextSysId = res[0].getAttribute("value");
    if (status.match(/failure/i)) {
      //this._onError("An error occured in PwdWfManager UI Script callBackForStartWf(): " + message);
		this._onError("TIMEOUT");
      return;
    }
    
    this.setTimeoutForRefresh();
  },
  
  setTimeoutForRefresh : function() {
    window.setTimeout(this.checkWFProgress.bind(this), this.wfCheckDoneFrequency);
  },
  
  checkWFProgress : function() {
    var currTime = new Date().getTime();
    if (currTime - this.startTime > this.wfTimeOut) {
      this._onError("TIMEOUT");
      return;
    }
    
    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    ga.addParam('sysparm_name', 'getWorkflowStatus');
    ga.addParam('sysparam_wf_context_sys_id', this.wfContextSysId);
    // csrf token
    ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
    ga.getXMLWait();
    
    handleSecurityFrom(ga.requestObject);
    var state = ga.getAnswer();
    
    if (!state.match(/finished/i)) {
      this.setTimeoutForRefresh();
      return;
    } else if (state.match(/failure/i)) {
      this._onError("An error occured in PwdWfManager UI Script : checkWFProgress()");
      return;
    }
    
	var gaResult = new GlideAjax('PwdAjaxWFRequestProcessor');
    gaResult.addParam('sysparm_name', 'getWorkflowResult');
    gaResult.addParam('sysparam_wf_context_sys_id', this.wfContextSysId);
    
    // csrf token
    gaResult.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
    gaResult.getXML(this.callBackForGetWfContext.bind(this));
  },
  

  callBackForGetWfContext : function(response) {
    handleSecurityFrom(response);

    this._alert("client: callBackForGetWfContext triggered!");
    
    var history = response.responseXML.getElementsByTagName('history');
    var names = response.responseXML.getElementsByTagName('activity');
    
    var bAllActivitiesSucceeded = true;
    
    // An array of obj representing the state of an activity
    var allActivitiesObj = [];
    
    
    // Grab all the activities in the workflow and build an array of objects
    for (var ii=0; ii<history.length; ii++) {
      var tmp = {};
      tmp.name = names[ii].getAttribute("name");
      tmp.index = history[ii].getAttribute("activity_index");
      
      tmp.result = history[ii].getAttribute("activity_result");
      if (tmp.result == undefined) {
        tmp.result = "";
      }
      
      tmp.faultDescription = history[ii].getAttribute("fault_description");
      if (tmp.faultDescription == undefined) {
        tmp.faultDescription = "";
      }
      
      allActivitiesObj.push(tmp);
      
      this._alert("Adding activity: " + "index=" + tmp.index + " : name=" + tmp.name + " : result=" + tmp.result + " : faultDescription=" + tmp.faultDescription);
    }
    
    // Iterate through activity history list to find the first error
    allActivitiesObj.sort(function(a, b) { return b.index - a.index; });
    var failingActivityObj = {};
    for (var jj in allActivitiesObj) {
      var eachObj = allActivitiesObj[jj];
      
      if (eachObj.result == undefined)
        continue;
      
      if (eachObj.result.match(/failure/i)) {
        bAllActivitiesSucceeded = false;
        this._alert("Found an error in activity history -> " + eachObj.name);
        
        // Check if faultDescription is an json object. If so, this was created via SNC.PwdWorkflowManager().creatError().
        try {
          failingActivityObj = eval("(" + eachObj.faultDescription + ")");
          this._alert("Fault description created via new SNC.PwdWorkflowManager().getErrorJSONString(...): \n* wfName=" + failingActivityObj.wfName + "\n* activityName=" + failingActivityObj.activityName + " \n* message=" + failingActivityObj.message + " \n* isFatal=" + failingActivityObj.isFatal);
        } catch (e) {
          //The faultDescription was created manually, and not via new SNC.PwdWorkflowManager().getErrorJSONString(...)
          this._alert("Fault description created manually");
          failingActivityObj.message = eachObj.faultDescription;
          failingActivityObj.isFatal = true;
        }
        break;
      }
    }
    
    try {
      var res =  response.responseXML.getElementsByTagName("response");
    } catch (error) {
      alert("PwdWfManager caught exception! " + error.message);
    }
    var wfGeneralStatus = res[0].getAttribute("status");
    var message = res[0].getAttribute("message");
    var value = res[0].getAttribute("value");
    
    if (!wfGeneralStatus.match(/success/i) || (!bAllActivitiesSucceeded)) {
      //Check failure via by workflow result
      this.wfResult.bPass = false;
      this.wfResult.msg = "Password reset request failed.";
    } else { //pass
      this.wfResult.bPass = true;
    }
  
    this._alert ("Final: WFContext results:\n bPass=" + this.wfResult.bPass + " \n msg=" + this.wfResult.msg);
    
    if (this.wfResult.bPass) {
      this._postProcessSuccess();
    } else {
      if (failingActivityObj) {
        if (!failingActivityObj.isFatal) {
          var msg = "non fatal failure";
		  this._alert(msg);
          
          submitWithOKAndSysParam('$pwd_new.do','sysparm_page_text', msg);
        
        } else {
          this._postProcessError(this.wfResult.msg);
        }
      } else {
        this._postProcessError(this.wfResult.msg);
      }
    }
  },

  _postProcessSuccess : function() {
    var ga = this._createPostProcessAjax("true");
    ga.getXML(this._onSuccess.bind(this));
  },
  
  _postProcessError : function(msg) {
    this.errorMsg = msg;
    var ga = this._createPostProcessAjax("false");
    // Need to use the callback because of the parameter errorMsg
    ga.getXML(this.callBackForPostProcessOnError.bind(this));
  },
  
  callBackForPostProcessOnError : function(response) {
    this._onError(this.errorMsg);
  },
  
  _createPostProcessAjax : function(isSuccess) {
    var ga = new GlideAjax('PwdAjaxWFRequestProcessor');
    ga.addParam('sysparm_name', 'runPostProcessor');
    ga.addParam('sysparam_request_id', this.requestId);
    ga.addParam('sysparam_process_id', this.processId);
    ga.addParam('sysparam_workflow_status', isSuccess);
    ga.addParam('sysparam_pwd_csrf_token', findCSRFElement().value);
    return ga;
  },
  
  _alert : function(msg) {
    var debug = false;
    if (debug) {
      alert(msg);
    }
  },
  _onError:function(errorReason) {
    submitWithBlock('$pwd_error.do',errorReason);
  },
  _onSuccess:function(response) {
    handleSecurityFrom(response);
    submitWithOKAndSysParam('$pwd_success.do','sysparm_success','SUCCESS');
  },

  type : "PwdWfManager"
};
