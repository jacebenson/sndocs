var OutboundUsageMetricsAggregator = Class.create();
var outbound_metrics_table = 'outbound_request_usage_metrics';
var exclusion_table = 'licensing_exclusion';
OutboundUsageMetricsAggregator.prototype = {
	getExcludedScopes: function() {
		var scopes = [];
		var excludes = new GlideRecord(exclusion_table);
		excludes.addEncodedQuery('exclude_from_integrationhub=true');
		excludes.query();
		while(excludes.next()) {
			scopes.push(excludes.sys_scope + '');
		}
		return scopes;
	},
	getGlideAggregate: function(origin, exclude_scope, encoded_query) {
		var aggregate = new GlideAggregate(outbound_metrics_table);
		aggregate.addAggregate('SUM', 'agg_value');
		aggregate.addQuery('origin_type', origin);
		if(encoded_query)
			aggregate.addEncodedQuery(encoded_query);
		if (exclude_scope) {
			var scopes = this.getExcludedScopes();
			aggregate.addQuery('app_scope', 'NOT IN', scopes.join(','));
		}
		aggregate.setGroup(false);
		aggregate.addTrend('sys_created_on', 'Month');
		aggregate.query();
		return aggregate;
	},
	getTransactionCountByMonth: function(origin, exclude_scope) {
		var aggregate = this.getGlideAggregate(origin, exclude_scope, "sys_created_onBETWEENjavascript:gs.beginningOfLast12Months()@javascript:gs.endOfLastMonth()");
		return aggregate;
	},
	getTransactionCountForLastMonth: function(origin, exclude_scope) {
		var aggregate = this.getGlideAggregate(origin, exclude_scope, "sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()");
		if(aggregate.next())
			return  parseInt(aggregate.getAggregate('SUM', 'agg_value'));
		else
			return 0;
	},
	getTransactionCountForLast30Days: function(origin, exclude_scope) {
		var aggregate = this.getGlideAggregate(origin, exclude_scope, "sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()");
		if(aggregate.next())
			return parseInt(aggregate.getAggregate('SUM', 'agg_value'));
		else
			return 0;
	},
	type: 'OutboundUsageMetricsAggregator'
};