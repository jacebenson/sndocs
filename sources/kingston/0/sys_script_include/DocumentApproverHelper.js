var DocumentApproverHelper = Class.create();

DocumentApproverHelper.prototype = {

	initialize : function(documentId) {
		this.documentId = documentId;
		this.approvalMatcher = new DocumentManagementApprovalMatcher(this.documentId);
		this.db = new DocumentManagementDB();
	},

	refreshApproverList : function() {
		
		this._deleteApproverGeneratedBySystem();
		
		var userApprovers = this.approvalMatcher.getUserApprovers();
		
		var groupApprovers = this.approvalMatcher.getGroupApprovers();
		
		for(var i=0; i<userApprovers.length; i++){
			var userApprover = this.convertRuleApproverToDocumentApprover(userApprovers[i]);
			this.db.insert(userApprover, this.db.approval_sequence_table);
		}

		for(var i=0; i<groupApprovers.length; i++){
			var groupApprover = this.convertRuleGroupApproverToDocumentGroupApprover(groupApprovers[i]);
			//db.insert(groupApprover, this.db.approval_sequence_table);
		}
	},
	
	_deleteApproverGeneratedBySystem : function() {
		var approvers = this.db.getApprovers(this.documentId, "system");
		var approverIds = new Array();

		for(var i=0; i<approvers.length; i++){
			approverIds.push(approvers[i].sys_id);
		}
		
		this.db.deleteRecord(this.db.approval_sequence_table, "sys_id", approverIds);
	},
	
	/**
	 * Convert a rule approver object retrieved from the m2m_approval_rule_user to a document approver.
	 * 
	 * @param Object ruleApprover
	 * @returns Object userApprover
	 */
	convertRuleApproverToDocumentApprover: function(ruleApprover) {
		var userApprover = new Object();
		userApprover.table_name = this.db.document_table;
		userApprover.document_id = this.documentId;
		userApprover.user = ruleApprover.user;
		userApprover.sequence = ruleApprover.sequence;
		userApprover.generated_by = "system";
		return userApprover;
	},
	
	/**
	 * Convert a rule group approver object retrieved from the m2m_approval_rule_user to a document group approver.
	 * 
	 * @param Object ruleGroupApprover
	 * @returns Object groupApprover
	 */
	convertRuleGroupApproverToDocumentGroupApprover: function(ruleGroupApprover) {
		var groupApprover = new Object();
		groupApprover.table_name = this.db.document_table;
		groupApprover.document_id = this.document_id;
		groupApprover.group = ruleGroupApprover.group;
		groupApprover.generated_by = "system";
		groupApprover.sequence = ruleGroupApprover.sequence;
		return groupApprover;
	}

};