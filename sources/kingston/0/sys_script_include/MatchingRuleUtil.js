var MatchingRuleUtil = Class.create();
MatchingRuleUtil.prototype = {
    initialize: function() {
    },
	
	getReferenceQueryForResource : function (rule) {
		var resourceGR = new GlideRecordSecure(rule.resource_type_table);
		resourceGR.addActiveQuery();
		return resourceGR.getEncodedQuery();
	},

    type: 'MatchingRuleUtil'
};