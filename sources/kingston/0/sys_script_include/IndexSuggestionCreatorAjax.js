var IndexSuggestionCreatorAjax = Class.create();
IndexSuggestionCreatorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	process: function() {
		var funcName = this.getParameter("sysparm_ajax_processor_name");
		var sugIdxSysID = this.getParameter("sysparm_ajax_processor_sug_id");
		var time = this.getParameter("sysparm_ajax_processor_time");
		
		var gr = new GlideRecord('sys_index_suggestion');
		if (!gr.get(sugIdxSysID)) {
			gs.log("couldn't find Index Suggestion record with id: " + sugIdxSysID);
			return;
		}
				
		if (funcName == 'create')
			return this.create(sugIdxSysID);
		else if (funcName == 'drop')
			return this.drop(sugIdxSysID);
		else if (funcName == 'getTrackerID')
			return this.getTrackerID(sugIdxSysID);
		else if (funcName == 'schedule_create')
			return this.scheduleCreate(sugIdxSysID, time);
		else if (funcName == 'schedule_drop')
			return this.scheduleDrop(sugIdxSysID, time);
	},
	
	create: function (sugIdxSysID) {
		return new SNC.IndexSuggestionAPI().createIndexNow(sugIdxSysID);
	},
	
	drop: function (sugIdxSysID) {
		return new SNC.IndexSuggestionAPI().dropIndexNow(sugIdxSysID);
	},
	
	getTrackerID: function(sugIdxSysID) {		
		var gr = new GlideRecord('sys_execution_tracker');
		gr.addQuery('source', sugIdxSysID);
		gr.orderByDesc('sys_created_on');
		gr.query();
		if (gr.next())
			return gr.sys_id;
	},
	
	scheduleCreate: function(sugIdxSysID, timeString) {
		var time = new GlideDateTime();
		time.setDisplayValue(timeString);
		new SNC.IndexSuggestionAPI().createIndexLater(sugIdxSysID, time);
	},
	
	scheduleDrop: function(sugIdxSysID, timeString) {
		var time = new GlideDateTime();
		time.setDisplayValue(timeString);
		new SNC.IndexSuggestionAPI().dropIndexLater(sugIdxSysID, time);
	},

    type: 'IndexSuggestionCreatorAjax'
});