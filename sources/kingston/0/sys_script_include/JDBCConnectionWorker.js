var JDBCConnectionWorker = Class.create();

JDBCConnectionWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	start: function() {
		var credentialSysId = this.getParameter('sysparm_credential_id');
		var jdbcConnectionSysId = this.getParameter('sysparm_jdbc_connection_id');
		var connTimeout = this.getParameter('sysparm_connection_timeout');
		var timeout = this._parseTimeout(connTimeout);
		
		var worker = new GlideJDBCConnectionWorker();
		worker.setCredentialSysId(credentialSysId);
		worker.setJDBCConnectionSysId(jdbcConnectionSysId);
		worker.setTimeoutInSecs(timeout);
		worker.setBackground(true);		
		worker.start();
		var progressId = worker.getProgressID();
		return progressId;
	},
	
	monitor: function() {
		var progressId = this.getParameter('sysparm_progress_id');
		var monitorGr = new GlideRecord('sys_progress_worker');
		monitorGr.get(progressId);
		if ((!gs.nil(monitorGr)) && (monitorGr.getValue('state') == 'complete')){
		    return true; 	
		} else {
			return false;
		}
	},
	
	retrieve: function() {
		var progressId = this.getParameter('sysparm_progress_id');
		var monitorGr = new GlideRecord('sys_progress_worker');
		monitorGr.get(progressId);

		var succeed = false;
		var message;
		if ((!gs.nil(monitorGr)) && (monitorGr.getValue('state_code') == 'success')){
			succeed = true;
		}
		
		if (succeed)
			message = "Connection Looks Good";
		else
			message = "Connection Failed: " + monitorGr.message;
		
		var result = this.newItem("result");
		result.setAttribute('succeed', succeed);
		result.setAttribute('message', message);
	},
	
	_parseTimeout: function(timeout) {
		var defaultTimeout = 60;
		
		if (JSUtil.notNil(timeout)) {
			var parsedTimeout = parseInt(timeout, 10);
			if (isNaN(parseInt(timeout, 10)) || parseInt(timeout, 10) <= 0) {
				return defaultTimeout;
			}
			return parsedTimeout;
		}
		return defaultTimeout;
	}
});