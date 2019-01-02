var TestQueryPerformanceAjax = Class.create();
TestQueryPerformanceAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process: function() {
		var funcName = this.getParameter("sysparm_function");
		var indexSuggestionSysID = this.getParameter("sysparm_suggestion_id");

		if (funcName == 'test')
			return this.startQueryPerformanceTest(indexSuggestionSysID);

		if (this.getType() == 'cancel')
			return this.cancel(this.getTrackerID(indexSuggestionSysID));

		if (this.getType() == 'isSafeStatement') {
			return this.isSafeStatement(indexSuggestionSysID);
		}
	},

	startQueryPerformanceTest: function (indexSuggestionSysID) {
		return new SNC.IndexSuggestionAPI().startQueryPerformanceTest(indexSuggestionSysID);
	},

	cancel: function (trackerID) {
		return new SNC.IndexSuggestionAPI().cancelQueryPerformanceTest(trackerID);
	},

	isSafeStatement: function (indexSuggestionSysID) {
		return new SNC.IndexSuggestionAPI().isSafeStatement(indexSuggestionSysID);
	},

	getTrackerID: function(indexSuggestionSysID) {
		var gr = new GlideRecord('sys_execution_tracker');
		gr.addQuery('source', indexSuggestionSysID);
		gr.orderByDesc('sys_created_on');
		gr.query();
		if (gr.next())
			return gr.getUniqueValue(); 
	},

    type: 'TestQueryPerformanceAjax'
});