var PwdTestCredStoreConnectionWorker = Class.create();

PwdTestCredStoreConnectionWorker.prototype = {
	  CONNECTION_MASTER : 'Pwd Connection Test - Master',
  	WAIT_TIME : GlideProperties.get('password_reset.connection_test.progress_timeout', 120),
	  initialize : function() {
	  },
	  // This is the entry method for this script from Test Connection UI action
	  // kicks of the master test connection workflow
	  process: function(cred_store_id) {
		  var LOG_ID = '[PwdTestCredStoreConnectionWorker - process] ';
		  
		  // getting info about cred store for messages
		  var cred = new GlideRecord('pwd_cred_store');
		  if (!cred.get(cred_store_id)) {
			  this._setError(gs.getMessage('Invalid credential store ID: {0}', [cred_store_id]));
			  return;
		  }
		  var cred_store_name = cred.getValue('name');
		  var hostname = cred.getValue('hostname');
		  
		  worker.setProgressState("running");
		  this._addMessage(gs.getMessage('Starting connection test for credential store: {0} on host: {1}', [cred_store_name, hostname]));

		  // start master workflow			 
		  var context_id = this._startMasterWorkflow(cred_store_id);
	      if (context_id == null ) {
			  return;
		  } 		 
		  
		  var pm = new GlideProgressMonitor(worker.getProgressID());
		  var progress_state = pm.waitForCompletionOrTimeout(this.WAIT_TIME);	  		  
		  if (!progress_state) {
			  this._setError(gs.getMessage('Timed out workflow: {0}', [this.CONNECTION_MASTER]));
		  }

	  },
	  _startMasterWorkflow : function (cred_store_id) {
		    var LOG_ID = '[PWD Test Cred Store Worker - startMasterWF] ';
			var wf = new Workflow();
			var workflowSysId = wf.getWorkflowFromName(this.CONNECTION_MASTER);		
  		 
		    if (gs.nil(workflowSysId)) {				
				this._setError(gs.getMessage('Could not start workflow: {0}', [this.CONNECTION_MASTER]));
				return null;
			}	
			this._addMessage(gs.getMessage('Starting workflow: {0}', [this.CONNECTION_MASTER]));
		  
		    var gr = wf.startFlow(workflowSysId, null, 'update', 
								  {u_cred_store_id: cred_store_id,
								   u_worker_id: worker.getProgressID()});
			if (gr == null) {
				this._setError(gs.getMessage('Could not start workflow: {0}', [this.CONNECTION_MASTER]));
				return null;
			} 
			else {
				gr.next();
				var context_id = gr.getValue('sys_id');
				return context_id;
			}
	  },
	 _setError : function (msg) {
		 msg += ": ";
		 worker.setProgressState("error");
		 worker.setProgressStateCode("error");	  
		 this._addMessage(msg);
	  },
			
	  _addMessage : function (msg) {
			worker.addMessage(msg);
		  
		    var gr = new GlideRecord('sys_progress_worker');
		    gr.get(worker.getProgressID());
		    var summary = gr.getValue('output_summary');
		    if (summary == null) {
				summary = '';
		    }
		    summary = summary + msg + '\n';
		    worker.setOutputSummary(summary);		
	  }

}