var DocumentManagementApprovalMatcher = Class.create();

DocumentManagementApprovalMatcher.prototype = {
	initialize : function(documentId) {
		this.firstMatchingRule = false;
		this.db = new DocumentManagementDB();
		this.documentGR = this.db.getDocumentById(documentId, true);
		this.approvalRules = this.db.getAll(this.db.approval_rule_table);
		this.matchingApprovalRules = new Array();
		this._initMatchingApprovalRules();
	},

	_initMatchingApprovalRules: function() {
		var filter = GlideFilter;
		for(var i=0; i<this.approvalRules.length; i++) {
			var match = filter.checkRecord(this.documentGR,this.approvalRules[i].condition);
			if(match && this.approvalRules[i].active=="1")
				this.matchingApprovalRules.push(this.approvalRules[i]);
		}
	},
	
	_getMatchingApprovalRuleIds: function(){
		var matchingApprovalRuleIds = new Array();
		for(var i=0; i<this.matchingApprovalRules.length; i++) {
			matchingApprovalRuleIds.push(this.matchingApprovalRules[i].sys_id);
		}
		return matchingApprovalRuleIds;
	},

	getUserApprovers : function() {
		
		var matchingUserApprovers = new Array();
		var matchingApprovalRuleIds = this._getMatchingApprovalRuleIds();
		
		if(matchingApprovalRuleIds.length==0) 
			return matchingUserApprovers;
		
		var userApprovers = this.db.getUserByApprovalRuleIds(matchingApprovalRuleIds);
		var attributes = ["user","sequnce"];
		for(var i=0; i<userApprovers.length; i++) {
			if(!this._isInArray(userApprovers[i],matchingUserApprovers,attributes))
				matchingUserApprovers.push(userApprovers[i]);
		}
		
		return matchingUserApprovers;
	},
	
	getGroupApprovers: function() {
		
		var matchingGroupApprovers = new Array();
		var matchingApprovalRuleIds = this._getMatchingApprovalRuleIds();
		
		if(matchingApprovalRuleIds.length==0) 
			return matchingGroupApprovers;
		
		var groupApprovers = this.db.getGroupByApprovalRuleIds(matchingApprovalRuleIds);
		var attributes = ["group","sequence"];
		for(var i=0; i<groupApprovers.length; i++) {
			if(!this._isInArray(groupApprovers[i],matchingGroupApprovers,attributes))
				matchingGroupApprovers.push(groupApprovers[i]);
		}
		
		return matchingGroupApprovers;
	},
	
	_isInArray: function(newApprover,array, attributesToCheck) {
		for(var i=0; i<array.length; i++){
			var existingApprover = array[i];
			if(DocumentManagementUtils.areObjectAttributesEqual(newApprover,existingApprover,attributesToCheck))
				return true;
		}
		return false;
	}
};