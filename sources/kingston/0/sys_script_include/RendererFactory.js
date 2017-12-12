var RendererFactory = Class.create();
RendererFactory.prototype = {
    initialize: function() {
    },
    type: 'RendererFactory'
};

/** 
 * Select renderer for a given table.column ref and row ID
 */
RendererFactory.getRenderer = function(ref, id) {
	if (GlideUtil.isExpressInstance())
		return "express_workflow_renderer";

	var DEFAULT_RENDERER = "Legacy";
	var ctx = new Workflow().getContexts(current);
	if (ctx && ctx.next()) {
	    var renderer = contextHasRenderer(ctx) ? ctx.column_renderer.name : ctx.workflow_version.column_renderer.name;
	    if (renderer)
		    return renderer;
	}
	
	// Handle deleted contexts if posible: if a request item we know the workflow 
	// from that potentially so use it if we can.
	if (current && current.getTableName() == 'sc_req_item' && current.cat_item && current.cat_item.workflow) {
		var wf = new Workflow().getVersion(current.cat_item.workflow);
		if (gs.nil(wf))
			return DEFAULT_RENDERER;
			
		var renderer = wf.column_renderer.name;
		if (gs.nil(renderer))
			return DEFAULT_RENDERER;

		return renderer;
	}

	return DEFAULT_RENDERER;
	
	// if we have the renderer in the context, use that (Eureka++)
	function contextHasRenderer(ctx) {
		return ctx.isValidField('column_renderer') && !ctx.column_renderer.nil();
	}
};

RendererFactory.getSchedule = function(ref, id) {
	var tableName = ref.split('.');
    if (tableName.length != 2) 
		return '';

	var grCurrent = new GlideRecord(tableName[0]);
	grCurrent.sys_id = id;
	
	var ctx = new Workflow().getRunningFlows( grCurrent, tableName[0] );
	
	if (!ctx.next())
		return'';

	var schedule = ctx.workflow_version.schedule+'';
	return schedule ? schedule : '';
};
	