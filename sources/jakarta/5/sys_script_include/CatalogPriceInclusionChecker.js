var CatalogPriceInclusionChecker = Class.create();

CatalogPriceInclusionChecker.prototype = {
	initialize : function() {
	},

	includePrice: function(reqItemID) {
		
		// Check the approval records for this item - all of them must be in a valid state
		var states = ["requested", "approved", "not requested", "not_required"];
		var grApprovals = new GlideRecord("sysapproval_approver");
		grApprovals.addQuery("sysapproval", reqItemID);
		grApprovals.query();
		while (grApprovals.next()) { 
			var valid = false;
			for (var i = 0; i < states.length; i++)
				if (states[i].equals(grApprovals.getValue("state")))
					valid = true;
			if (!valid)
				return false;
		}
		
		var reqItem = new GlideRecord("sc_req_item");
		reqItem.addQuery("sys_id", reqItemID);
		reqItem.query();
		if (reqItem.next()) {
			var approval = reqItem.getValue("approval");
			if ("rejected".equals(approval))
				return false;
		
			var state = reqItem.getValue("state");
			if ("4".equals(state) || "7".equals(state))
				return false;
		}
		return true;
	}
};