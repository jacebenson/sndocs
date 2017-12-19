/*
 * Class is a Ajax processor which handles password reset workflow related functionality.
 */
var PwdAjaxWFRequestProcessor = Class.create();
PwdAjaxWFRequestProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {
	
	TYPE_INFO: "Info",
	TYPE_WARNING: "Warning",
	TYPE_ERROR: "Error",
	
	STAGE_RESET: "Reset",
	
	MASTER_WORKFLOW: "Pwd Reset - Master",
	
	validatePassword: function() {
		var processId = this.getParameter("sysparam_process_id");
		var newPasswd = this.getParameter("sysparam_new_password");

		var pwdWFRequestProcessor = new PwdWFRequestProcessor();
		var res = pwdWFRequestProcessor.validatePassword(processId, newPasswd);
		
		return res;
	},
	
	
	/**
	 * This function starts a workflow. In case of an exception, will send an error
	 * message back to client.
	 */
	startWorkflow: function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;
		
		var requestId = this.getParameter("sysparam_request_id");
		var newPasswd = this.getParameter("sysparam_new_password");
		
		var pwdWFRequestProcessor = new PwdWFRequestProcessor();
		var res = pwdWFRequestProcessor.startWorkflow(requestId, newPasswd);
		
		this._setResponseMessage(res.status, res.msg, res.value);
	},
	
	/**
 	* A synchronous AJAX function returns the wf status based upon the wf_context table.
 	*/
 	/* eslint-disable consistent-return */ 
	getWorkflowStatus: function() {
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;
		
		var sysId = this.getParameter('sysparam_wf_context_sys_id');
		var state = 'failure';
		var gr = new GlideRecord('wf_context');
		if (gr.get(sysId)) {
			state = gr.getValue('state');
		}
		return state;
	},
	
	/**
 	* This function makes this AJAX public. By default, all AJAX server side is private.
 	*/
	isPublic: function() {
		return true;
	},
	/* eslint-enable consistent-return */
	
    /**
    * Execute the post processor script include
    */
    runPostProcessor: function() {
        // check the security before anything else.
        // If any violation is found, then just return.
        if(!this._validateSecurity())
            return;

        var LOG_ID = "[PwdAjaxWFRequestProcessor:runPostProcessor] ";
        var trackingMgr = new SNC.PwdTrackingManager();
        
        var requestId = this.getParameter('sysparam_request_id');
        
        var processId = this.getParameter('sysparam_process_id');
        var gr = new GlideRecord('pwd_process');
        if (!gr.get(processId)) {
            var errorMsg = "Cannot load the process: " + processId;
            trackingMgr.createActivity(this.TYPE_WARNING, this.STAGE_RESET, errorMsg, requestId);
            var responseErrorMsg = gs.getMessage("{0} Cannot load the process: {1}", [LOG_ID, processId]);
            this._setResponseMessage("failure", responseErrorMsg, "");
            return;
        }
        
        if (!gs.nil(gr.post_processor)) {
            var postProcessorId = gr.post_processor;
            var postProcessorName = gr.post_processor.name;
            
            try {
                // Invoke the post process script include selected on the process
                
                // published interface for the password_reset.extension.post_rest_script extensions (see pwd_extension_type) is:
                //
                // @param params.resetRequestId The sys-id of the current password-reset request (table: pwd_reset_request)
                // @param params.wfSuccess      A flag indicating if workflow completed sucessfully. True if (and only if) sucessful.
                // @return no return value
                
                var params = new SNC.PwdExtensionScriptParameter();
                params.resetRequestId = requestId;  
                params.wfSuccess = this.getParameter('sysparam_workflow_status') == "true" ? true : false;              
                var postResetExtension = new SNC.PwdExtensionScript(postProcessorId);
                
                var infoMsg = "Starting post-processor script: " + postProcessorName;
                trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_RESET, infoMsg, requestId);   

                postResetExtension.process(params);             
            } catch (error) {
                var exceptionMsg = gs.getMessage("Error while executing post-processor script: {0}. Error:{1}", [postProcessorName, error]);
                trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_RESET, exceptionMsg, requestId);
                var responseExceptionMsg = gs.getMessage("{0} Error while executing post-processor script {1}. Error: {2}", 
                							[LOG_ID, postProcessorName, error]);
                this._setResponseMessage("failure", responseExceptionMsg, "");
                return;
            }
            var successMsg = gs.getMessage("Completed post-processor script: {0}", postProcessorName);
            trackingMgr.createActivity(this.TYPE_INFO, this.STAGE_RESET, successMsg, requestId);
            var responseSuccessMsg = gs.getMessage("{0} Completed post-processor script: {1}", [LOG_ID, postProcessorName]);
            this._setResponseMessage("success", responseSuccessMsg, "");
        }
    },
	
	_setResponseMessage: function(status, msg, value) {
		var response = this.newItem("response");
		response.setAttribute("status", status);
		response.setAttribute("message", msg);
		response.setAttribute("value", value);
	},
	
	
	ajaxFunction_getWorkflowResult: function() {
		
		// check the security before anything else.
		// If any violation is found, then just return.
		if(!this._validateSecurity())
			return;
		
		var ctxId = this.getParameter("sysparam_wf_context_sys_id");
		this._getWFContext(ctxId);
		this._getWFHistory(ctxId);
		this._setResponseMessage("success", gs.getMessage("The request has been successfully completed") ,ctxId);
	},
	
	_getWFContext: function(sysId) {
		var gr = new GlideRecord('wf_context');
		if (gr.get(sysId)) {
			var ctx = this.newItem('context');
			ctx.setAttribute('workflow', gr.getValue('workflow'));
			ctx.setAttribute('workflow_version', gr.getValue('workflow_version'));
			ctx.setAttribute('parent', gr.getValue('parent'));
			ctx.setAttribute('table', gr.getValue('table'));
			ctx.setAttribute('id', gr.getValue('id'));
			ctx.setAttribute('state', gr.getValue('state'));
			ctx.setAttribute('started', gr.getValue('started'));
			ctx.setAttribute('ended', gr.getValue('ended'));
			ctx.setAttribute('due', gr.getValue('due'));
			ctx.setAttribute('stage', gr.getValue('stage'));
			ctx.setAttribute('result', gr.getValue('result'));
			ctx.setAttribute('scratchpad', gr.getValue('scratchpad'));
			ctx.setAttribute('active', gr.getValue('active'));
			ctx.setAttribute('active_count', gr.getValue('active_count'));
			ctx.setAttribute('active_index', gr.getValue('active_index'));
			ctx.setAttribute('after_business_rules', gr.getValue('after_business_rules'));
			ctx.setAttribute('sys_id', gr.getValue('sys_id'));
			ctx.setAttribute('started_by', gr.getValue('started_by'));
			ctx.setAttribute('auto_start', gr.getValue('auto_start'));
			ctx.setAttribute('sys_domain', gr.getValue('sys_domain'));
			ctx.setAttribute('schedule', gr.getValue('schedule'));
			ctx.setAttribute('timezone', gr.getValue('timezone'));
			ctx.setAttribute('sys_id', gr.getValue('sys_id'));
			ctx.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			ctx.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			ctx.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			ctx.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			ctx.setAttribute('sys_domain', gr.getValue('sys_domain'));
			ctx.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
		}
	},
	
	_getWFHistory: function(ctxId) {
		var gr = new GlideRecord('wf_history');
		gr.addQuery('context', ctxId);
		gr.orderBy('activity_index');
		gr.addJoinQuery('wf_activity', 'activity', 'sys_id');
		gr.query();
		
		while(gr.next()) {
			var history = this.newItem('history');
			history.setAttribute('workflow_version', gr.getValue('workflow_version'));
			history.setAttribute('context', gr.getValue('context'));
			var activity = gr.getValue('activity');
			history.setAttribute('activity', activity);
			this._getWFActivity(activity, history);
			history.setAttribute('parent', gr.getValue('parent'));
			history.setAttribute('is_parent', gr.getValue('is_parent'));
			history.setAttribute('started', gr.getValue('started'));
			history.setAttribute('ended', gr.getValue('ended'));
			history.setAttribute('due', gr.getValue('due'));
			history.setAttribute('state', gr.getValue('state'));
			history.setAttribute('activity_result', gr.getValue('result'));
			history.setAttribute('fault_description', gr.getValue('fault_description'));
			history.setAttribute('output', gr.getValue('output'));
			history.setAttribute('activity_index', gr.getValue('activity_index'));
			history.setAttribute('rolled_back_by', gr.getValue('rolled_back_by'));
			history.setAttribute('sys_domain', gr.getValue('sys_domain'));
			history.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			history.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			history.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			history.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			history.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
			history.setAttribute('sys_id', gr.getValue('sys_id'));
		}
	},
	
	/* eslint-disable no-unused-vars */ 
	_getWFActivity: function(activityId, history) {
		var activity = this.newItem('activity');
		var gr = new GlideRecord('wf_activity');
		if (gr.get(activityId)) {
			activity.setAttribute('name', gr.getValue('name'));
			activity.setAttribute('state', gr.getValue('state'));
			activity.setAttribute('activity_definition', gr.getValue('activity_definition'));
			activity.setAttribute('workflow_version', gr.getValue('workflow_version'));
			activity.setAttribute('stage', gr.getValue('stage'));
			activity.setAttribute('x', gr.getValue('x'));
			activity.setAttribute('y', gr.getValue('y'));
			activity.setAttribute('height', gr.getValue('height'));
			activity.setAttribute('width', gr.getValue('width'));
			activity.setAttribute('parent', gr.getValue('parent'));
			activity.setAttribute('vars', gr.getValue('vars'));
			activity.setAttribute('timeout', gr.getValue('timeout'));
			activity.setAttribute('sys_domain', gr.getValue('sys_domain'));
			activity.setAttribute('sys_id', gr.getValue('sys_id'));
			activity.setAttribute('sys_updated_by', gr.getValue('sys_updated_by'));
			activity.setAttribute('sys_updated_on', gr.getValue('sys_updated_on'));
			activity.setAttribute('sys_created_by', gr.getValue('sys_created_by'));
			activity.setAttribute('sys_created_on', gr.getValue('sys_created_on'));
			activity.setAttribute('sys_mod_count', gr.getValue('sys_mod_count'));
		}
	},
	/* eslint-enable no-unused-vars */ 
	
	type:PwdAjaxWFRequestProcessor
});