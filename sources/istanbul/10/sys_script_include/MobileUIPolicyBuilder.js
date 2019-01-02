var MobileUIPolicyBuilder = Class.create();
MobileUIPolicyBuilder.prototype = {
    initialize: function() {
    },
	
	/**
	 * Return UI Policy for given table and view
	 */
	getUIPolicy: function(tableName, viewName) {
        var builder = new UIPolicyBuilder();
		builder.setUIScriptType(1); // set compatibility to smartphone
        
        // iterate the sys_ui_policy for this table
        var gr = new GlideRecord('sys_ui_policy');
        gr.addQuery('table', tableName);
        gr.addNullQuery('model_table');
        gr.addActiveQuery();
        gr.addDomainQuery(null);
        gr.addQuery('global', 'true').addOrCondition('view', viewName);
        gr.orderBy('order');
        gr.query();
        builder.process(gr);
        
        // include any inherited policies as well
        var tables = GlideDBObjectManager.getActionTables(tableName);
        // don't mess with the static table list directly, make a copy of it for our purposes
        var tableList = new Packages.java.util.ArrayList(tables);
        tableList.remove(0);
        if (tableList.size() != 0) {
            gr.initialize();
            gr.addQuery('table', tableList);
            gr.addNullQuery('model_table');
            gr.addActiveQuery();
            gr.addQuery('global', 'true').addOrCondition('view', viewName);
            gr.addQuery('inherit', true);
            gr.orderBy('order');
            gr.query();
            builder.process(gr);
        }
    
        var tableListStr = GlideStringUtil.join(tables);
        gr = new GlideRecord('sys_data_policy2');
        if (gr.isValid()){
            gr.addQuery('model_table', tableName);
            gr.addQuery('enforce_ui', '=', 'true');
            gr.addDomainQuery(null);
            gr.addActiveQuery();
            gr.query();
            builder.process(gr, true);        

            gr.initialize();
            gr.addQuery('model_table', 'IN', tableListStr);
            gr.addQuery('enforce_ui', '=', 'true'); 
            gr.addActiveQuery();
            gr.query();
            builder.process(gr, true);
        }

        // TODO: This is probably where we should handle workflow policies that involve model_id

        // handle javascript: values
        builder.updateValues();
        //builder.toStringWithoutScripts();
        return this.mergeScriptsWithPolicies(builder.getFieldPolicies(), builder.getScripts());
    },
	
	/**
	 * At this point, the policies are in one map, and the scripts are in another
	 * 
	 * This function will merge them into the script_true and script_false properties of each
	 */
	mergeScriptsWithPolicies: function(policies, scripts) {
		
		// loop through each policy
		for (var i = 0; i < policies.length; i++) {
			var policy = policies[i];

			// go through the script_true and script_false fields
			var scriptTypes = ['script_true', 'script_false'];
			for (var j = 0; j < scriptTypes.length; j++) {
				var scriptName = policy[ scriptTypes[j] ];

				// if there is no script then continue
				if (!scriptName)
					continue;
				
				var s = {
					name: scriptName,
					script: scripts[scriptName]
				};
				
				policy[ scriptTypes[j] ] = s;
			}
		}
		
		return {
			policy: policies
		};
	},
	
    type: 'MobileUIPolicyBuilder'
}