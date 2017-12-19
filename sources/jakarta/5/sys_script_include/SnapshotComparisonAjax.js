var SnapshotComparisonAjax = Class.create();
SnapshotComparisonAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process : function() {
		var source = this.getParameter("sysparm_ajax_processor_source");
		var source_table = this.getParameter("sysparm_ajax_processor_source_table");
		var event_type = this.getParameter("sysparm_ajax_processor_event_type");
		var patternID = this.getParameter("sysparm_ajax_processor_pattern_id");
		var table = this.getParameter("sysparm_ajax_processor_table");
		
		var gr = new GlideRecord(table);
		gr.get(patternID);
		var hash = gr.getValue('hash');
		
		return new SNC.IndexSuggestionAPI().evaluate(source, source_table, event_type, hash, table);
	},
	
    type: 'SnapshotComparisonAjax'
});