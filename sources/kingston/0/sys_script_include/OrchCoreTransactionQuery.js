var OrchCoreTransactionQuery = Class.create();
OrchCoreTransactionQuery.prototype = {
	initialize: function() {
		this.scopeQuery="activity.activity_definition.sys_scope.scopeNOT LIKEsn_hr_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_sec_^activity.activity_definition.sys_scope.scopeNOT LIKEsn_si^activity.activity_definition.sys_scope.scopeNOT LIKEsn_ti^activity.activity_definition.sys_scope.scopeNOT LIKEsn_vul^EQ";
	},
	getTransactionsCount:function(timePeriodQuery){
		var count = 0;
		var exeGr = new GlideAggregate("orch_execution");
		exeGr.addAggregate("COUNT");
		exeGr.addEncodedQuery(this.scopeQuery);
		exeGr.addEncodedQuery(timePeriodQuery);
		exeGr.query();
		while(exeGr.next()) {
			count = parseInt(exeGr.getAggregate("COUNT"));
		}
		return count;
	},
	getTransactionsCountMonthlyTrend:function(timePeriodQuery){
		var trend =[];
		var exeGr = new GlideAggregate("orch_execution");
		exeGr.addAggregate("COUNT");
		exeGr.addEncodedQuery(this.scopeQuery);
		exeGr.addEncodedQuery(timePeriodQuery);
		exeGr.addTrend ('sys_created_on','Month');
		exeGr.query();
		while(exeGr.next()) {
			var timeref = exeGr.getValue('timeref');
			var timerefArr = timeref.split('/');
			var month = timerefArr[0];
			
			var trendData = {month:month, count:parseInt(exeGr.getAggregate("COUNT"))};
				trend.push(trendData);
			}
			return trend;
		},
		
		type: 'OrchCoreTransactionQuery'
	};