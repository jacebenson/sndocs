var KBWorkflowSNC = Class.create();

KBWorkflowSNC.prototype = Object.extendsObject(KBCommon, {
	
    initialize: function() {
    },

	/**
	 * Updates the workflow_state of a kb_knowledge according to the passed state.
	 *
	 * @param GlideRecord kb_knowledge record that requires state change
	 * @param String the record status should be updated to this value
	 * @return Boolean success if kb_knowledge state is progressed
	 */
	progressStatus: function(kbKnowledgeGR, state) {
		kbKnowledgeGR.setValue("workflow_state", state);
		if (state == "published" || state == "retired")
			kbKnowledgeGR.setValue(state, new GlideDate());
		return true;
	},

	/**
     * Publishes the kb_knowledge record
	 *
	 * @param GlideRecord kb_knowledge record that is published
	 * @return Boolean True if kb_knowledge updated successfully
     */
    publishKnowledge: function(kbKnowledgeGR) {
        kbKnowledgeGR.workflow_state = "published";
		kbKnowledgeGR.retired = "";
		kbKnowledgeGR.published = new GlideDate();
		return true;
    },
	
	/**
     * Cancels any approvals associated with the kb_knowledge and reverts
     * to the records previous state.
     *      
     * @param GlideRecord kb_knowledge
     * @return successful update operation
     */
    cancelApproval: function(knowledgeGR) {
        var mapState = {review: "draft", pending_retirement: "published"};
        new Workflow().cancel(knowledgeGR, "kb_knowledge");
        return this.progressStatus(knowledgeGR, mapState[knowledgeGR.workflow_state + ""]);
    },	
	
	/**
     * Retires the kb_knowledge record
	 *
	 * @param GlideRecord kb_knowledge record that is retired
	 * @return Boolean True if kb_knowledge updated successfully
     */
	retireKnowledge: function(knowledgeGR) {
		// Case 1: Ensure the parent kb_knowledge record can be found
		if (!knowledgeGR.isValid())
			return false;
		
		// Default: Set the kb_knowledge record to a state of retired
        knowledgeGR.workflow_state = "retired";
		knowledgeGR.retired = new GlideDate();
		return true;
	},
	
	/**
     * Starts the workflow associated to the knowled_base.
     *
	 * @param workflowField the field used to find the publish/ retire workflow
     * @param GlideRecord kb_knowledge record that has been sent for publish
     * @return Boolean true if operation was successful
     */
    startWorkflow: function(knowledgeGR, workflowField) {
        var workflowId = this._getDotField(knowledgeGR, "kb_knowledge_base." + workflowField);
        if (JSUtil.nil(workflowId))
            return false;
        var initial_workflow_state = knowledgeGR.workflow_state;
        var context = new Workflow().startFlow(workflowId, knowledgeGR, knowledgeGR.operation(), {initial_workflow_state:initial_workflow_state});
        if (JSUtil.nil(context))
            return false;
        
        return true;
    },
	
	/**
	 * Gets a list of managers and the owner from the associated Knowledge Base, 
	 * which will be used as approvers for the kb_knowledge.
	 *
	 * @param GlideRecord kb_knowledge that is going through approval
	 * @return String comma seperated list of user_ids
	 */
	getApprovers: function(knowledgeGR) {
		var kbOwner = knowledgeGR.kb_knowledge_base.owner;
		var kbManagers = knowledgeGR.kb_knowledge_base.kb_managers;
		
		//Approval activity will handle any trailing comma, if there are no managers.
		return kbOwner + "," + kbManagers;
	},
	
	/**
	 * Gets a list of workflows that can be applied to the kb_knowledge table.
	 * 
	 * @return Array of wf_workflow ids
	 */
	getWorkflowIds: function() {
		var arrWorkflowIds = [];

		var gr = new GlideRecord("wf_workflow_version");
		gr.addActiveQuery();
		gr.addQuery("published", "true");
		gr.addQuery("table", "kb_knowledge");
		gr.query();

		while (gr.next())
   		arrWorkflowIds.push(gr.workflow.sys_id+"");

		return arrWorkflowIds;
	},
	
    type: 'KBWorkflowSNC'
});