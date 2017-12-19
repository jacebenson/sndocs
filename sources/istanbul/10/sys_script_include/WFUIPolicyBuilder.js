var WFUIPolicyBuilder = Class.create();

WFUIPolicyBuilder.prototype = Object.extendsObject(UIPolicyBuilder, {
	
	initialize: function() {
		UIPolicyBuilder.prototype.initialize.call(this);
	},
	
	_processPolicy: function(gr) {
		var scriptTrue = "";
		var scriptFalse = "";
		var set = new Packages.java.util.HashSet();
		var scriptName = this._getScriptName(gr.sys_id, "true");
		if (this.uiPolicy.scripts[scriptName])
			scriptTrue = scriptName;
		
		scriptName = this._getScriptName(gr.sys_id, "false");
		if (this.uiPolicy.scripts[scriptName])
			scriptFalse = scriptName;
		
		var fieldPolicy = {};
		
		fieldPolicy.table = "wf_activity";
		fieldPolicy.short_description = gr.short_description.toString();
		fieldPolicy.reverse = (gr.reverse_if_false.toString() == "true");
		fieldPolicy.onload = (gr.on_load.toString() == "true");
		fieldPolicy.script_true = scriptTrue;
		fieldPolicy.script_false = scriptFalse;
		fieldPolicy.debug = this.debug;
		this.uiPolicy.fieldPolicies.push(fieldPolicy);
		
		// Handle the conditions
		var conditions = [];
		fieldPolicy.conditions = conditions;
		
		var tableTD = this._getWFVariableTD(gr.activity_definition.toString());
		var eq = new GlideQueryString();
		eq.init(gr.getTableName(), gr.workflow_conditions);
		eq.deserialize();
		var terms = eq.getTerms();
		fieldPolicy.condition_fields = [];
		for (var i = 0; i != terms.size(); i++) {
			var term = terms.get(i);
			if (term.isEndQuery())
				continue;
			
			var ed = tableTD.getElementDescriptor(term.getTermField());
			
			if (!ed)
				continue;
			
			// determine field type
			var fieldName = "vars." + tableTD.getName() + "." + term.getTermField();
			var fieldType = ed.getInternalType();
			if (!fieldType)
				continue;
			
			var condition = {};
			var oper = this._convertOper(term.getOperator() + '');
			condition.newquery = term.isNewQuery();
			condition.field = fieldName;
			condition.oper = oper;
			condition.value = term.getValue() + '';
			condition.type = fieldType;
			condition.or = term.isOR();
			condition.term = fieldName + oper + term.getValue();
			conditions.push(condition);
			
			set.add(fieldName);
		}
		
		// get the policy actions
		var actions = [];
		fieldPolicy.actions = actions;
		
		var actionGR = new GlideRecord('wf_ui_policy_action');
		actionGR.addQuery('ui_policy', gr.sys_id);
		actionGR.query();
		while (actionGR.next()) {
			var action = {};
			action.name = "vars." + tableTD.getName() + "." + actionGR.variable.toString();
			action.mandatory = actionGR.mandatory.toString();
			action.visible = actionGR.visible.toString();
			action.disabled = actionGR.disabled.toString();
			actions.push(action);
		}
		
		// set of fields that have conditions attached
		var fields = [];
		fieldPolicy.condition_fields = fields;
		var iter = set.iterator();
		while (iter.hasNext())
			fields.push(iter.next());
		
		set.clear();
	},
	
	_getWFVariableTD: function(modelId) {
		var grVariable = new GlideRecord("wf_activity_variable");
		grVariable.addQuery("model", modelId);
		grVariable.query();
		if (grVariable.next())
			return GlideTableDescriptor.get(grVariable.name);
		
	},
	
	
	type: 'WFUIPolicyBuilder'
});