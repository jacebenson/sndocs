var SlowPatternGraphManager = Class.create();
SlowPatternGraphManager.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getGraphSysId: function() {
		var tableName = this.getParameter('sysparm_table');
		var patternSysId = this.getParameter('sysparm_pattern_id');
		var timeSpan = this.getParameter('sysparm_time_span');
		var graphType = this.getParameter('sysparm_graph_type');
		
		var gr = new GlideRecord("jrobin_definition");
		gr.addQuery('base_shard', tableName);
		gr.addQuery('name', 'CONTAINS', graphType);
		gr.query();

		while (gr.next()) { 
			var gr2 = new GlideRecord("jrobin_graph_line");
			gr2.addQuery('jrobin_definition', gr.getValue('sys_id'));
			gr2.addQuery('jrobin_graph.form', true);
			gr2.query();

			while (gr2.next()) {
				return gr2.jrobin_graph;
			}
		}
		
		return null;
	},
    type: 'SlowPatternGraphManager'
});