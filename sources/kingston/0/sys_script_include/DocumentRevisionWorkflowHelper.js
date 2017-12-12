var DocumentRevisionWorkflowHelper = Class.create();

DocumentRevisionWorkflowHelper.prototype = {
	initialize : function(revisionId) {
		this.documentManagementDB = new DocumentManagementDB();
		this.revisionGR = this.documentManagementDB.getRevisionById(revisionId,true);
	},
	
	startWorkflow : function(){
		var w = new Workflow();
		var workflowId = this.revisionGR.document.workflow;
		var context = w.startFlow(workflowId, this.revisionGR, this.revisionGR.operation(), null);
		if (context != null) 
			this.revisionGR.context = context.sys_id;		
	}, 

	/**
	 * Indicates whether there is a workflow running against the revision or not
	 * 
	 * @param revision
	 * @returns Boolean
	 */
	isWorkflowRunningAgainstRevision : function(){
		var workflowContextGR = new GlideRecord("wf_context");
		workflowContextGR.addQuery("table","dms_document_revision");
		workflowContextGR.addQuery("id",this.revisionGR.sys_id);
		workflowContextGR.addQuery("wf_workflow_version","IN",this.getWorkflowVersionIds());
		workflowContextGR.addQuery("state","executing");
		workflowContextGR.query();
		if(workflowContextGR.hasNext())
			return true;
		
		return false;
	},
	
	getWorkflowVersionIds: function(){
		var workflowVersionIds = new Array();
		var workflowVersionGR = new GlideRecord("wf_workflow_version");
		workflowVersionGR.addQuery("workflow",this.revisionGR.document.workflow);
		workflowVersionGR.query();
		while(workflowVersionGR.next()){
			workflowVersionIds.push(workflowVersionGR.sys_id);
		}
		return workflowVersionIds;
	},
	
	getWorkflowName: function() {
		return this.revisionGR.document.workflow.name;
	},
	
	type : "DocumentRevisionWorkflowHelper"
};