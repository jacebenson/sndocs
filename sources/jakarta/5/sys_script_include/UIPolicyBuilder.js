var UIPolicyBuilder = Class.create();




UIPolicyBuilder.prototype = {
	
	initialize: function() {
		this.uiPolicy = {};
		this.uiPolicy.fieldPolicies = [];
		this.uiPolicy.scripts = {};
		this.debug = false;
		this.uiScriptType = 0; // UI type compatibility - only use browser scripts and both by default
		this.uiPolicyScoper = new SNC.UIPolicyScoper();
	},
	
	setUIScriptType: function(type) {
		this.uiScriptType = type;
	},
	
	process: function(/*GlideRecord(sys_ui_policy)*/gr, /*isDataPolicy*/ isDataPolicy) {
		while (gr.next())
			this._process(gr, isDataPolicy);
	},
	
	toString: function(ignoreScripts) {
		var xmlUtil = GlideXMLUtil;
		var xml = xmlUtil.newDocument("ui_policy");
		var root = xml.getDocumentElement();
		root.setAttribute("debug", this.debug.toString());
		for (var i = 0; i < this.uiPolicy.fieldPolicies.length; i++) {
			var fpNode = xmlUtil.newElement(root, "fp");
			var fp = this.uiPolicy.fieldPolicies[i];
			this._fieldPolicyToXML(fpNode, fp);
			
			for (var cndx = 0; cndx < fp.condition_fields.length; cndx++)
				this._conditionFieldToXML(fpNode, fp.condition_fields[cndx]);
			
			for (var cndx = 0; cndx < fp.conditions.length; cndx++)
				this._conditionToXML(fpNode, fp.conditions[cndx]);
			
			for (var cndx = 0; cndx < fp.actions.length; cndx++)
				this._actionToXML(fpNode, fp.actions[cndx]);
		}
		
		if (!ignoreScripts) {
			for (var n in this.uiPolicy.scripts)
				this._scriptToXML(root, n);
		}
		
		return xmlUtil.toString(xml);
	},
	
	_fieldPolicyToXML: function(/*xmlnode*/ node, /*fieldPolicy{}*/ fp) {
		node.setAttribute("table", fp.table);
		node.setAttribute("short_description", fp.short_description);
		node.setAttribute("reverse", fp.reverse);
		node.setAttribute("onload", fp.onload);
		node.setAttribute("script_false", fp.script_false);
		node.setAttribute("script_true", fp.script_true);
		node.setAttribute("sys_id", fp.sys_id);
		node.setAttribute("source_table", fp.source_table);
	},
	
	_conditionFieldToXML: function(/*xmlnode*/ node, /*conditionField*/ name) {
		var xmlUtil = GlideXMLUtil;
		var cfield = xmlUtil.newElement(node, "cfield");
		cfield.setAttribute("name", name);
	},
	
	_conditionToXML: function(/*xmlnode*/ node, /*condition{}*/ cond) {
		var xmlUtil = GlideXMLUtil;
		var condNode = xmlUtil.newElement(node, "condition");
		condNode.setAttribute("field", cond.field);
		condNode.setAttribute("oper", cond.oper);
		condNode.setAttribute("value", cond.value);
		condNode.setAttribute("or", cond.or);
		condNode.setAttribute("type", cond.type);
		condNode.setAttribute("newquery", cond.newquery);
		condNode.setAttribute("term", cond.term);
	},
	
	_actionToXML: function(/*xmlnode*/ node, /*action{}*/ action) {
		var xmlUtil = GlideXMLUtil;
		var aNode = xmlUtil.newElement(node, "action");
		aNode.setAttribute("name", action.name);
		aNode.setAttribute("mandatory", action.mandatory);
		aNode.setAttribute("disabled", action.disabled);
		aNode.setAttribute("visible", action.visible);
	},
	
	_scriptToXML: function(/*xmlnode*/ node, scriptName) {
		var xmlUtil = GlideXMLUtil;
		var script = this.uiPolicy.scripts[scriptName];
		var sNode = xmlUtil.newElement(node, "script");
		sNode.setAttribute("name", scriptName);
		xmlUtil.setText(sNode, script);
	},
	
	toStringWithoutScripts: function() {
		var json = new JSON();
		return json.encode(this.uiPolicy.fieldPolicies);
	},
	
	getScripts: function() {
		return this.uiPolicy.scripts;
	},
	
	getFieldPolicies: function() {
		return this.uiPolicy.fieldPolicies;
	},
	
	setUIPolicy: function(xmlString) {
		var xmlUtil = GlideXMLUtil;
		this.initialize();
		var xml = xmlUtil.parse(xmlString);
		var root = xml.getDocumentElement();
		if (xmlUtil.getAttribute(root, "debug", "false") == "true")
			this.debug = true;
		
		var list = xmlUtil.getChildrenByTagName(root, "fp");
		if (list) {
			for (var fpNdx = 0; fpNdx < list.size(); fpNdx++) {
				var fpNode = list.get(fpNdx);
				var fp = this._fieldPolicyFromXML(fpNode);
				this.uiPolicy.fieldPolicies.push(fp);
				
				var conditions = [];
				fp.conditions = conditions;
				var children = xmlUtil.getChildrenByTagName(fpNode, "condition");
				if (children) {
					for (var i = 0; i < children.size(); i++) {
						var cond = this._conditionFromXML(children.get(i));
						conditions.push(cond);
					}
				}
				
				// get the policy actions
				var actions = [];
				fp.actions = actions;
				var children = xmlUtil.getChildrenByTagName(fpNode, "action");
				if (children) {
					for (var i = 0; i < children.size(); i++) {
						var action = this._actionFromXML(children.get(i));
						actions.push(action);
					}
				}
				
				// set of fields that have conditions attached
				var fields = [];
				fp.condition_fields = fields;
				var children = xmlUtil.getChildrenByTagName(fpNode, "cfield");
				if (children) {
					for (var i = 0; i < children.size(); i++) {
						var e = children.get(i);
						fields.push(this._getAttribute(e, "name"));
					}
				}
			}
		}
		var scripts = xmlUtil.getChildrenByTagName(root, "script");
		if (scripts) {
			for (var i = 0; i < scripts.size(); i++) {
				this._scriptFromXML(scripts.get(i));
			}
		}
	},
	
	_fieldPolicyFromXML: function(/*xmlnode*/ node) {
		var fieldPolicy = {};
		fieldPolicy.table = this._getAttribute(node, "table");
		fieldPolicy.short_description = this._getAttribute(node, "short_description");
		fieldPolicy.reverse = this._getAttribute(node, "reverse") == "true";
		fieldPolicy.onload = this._getAttribute(node, "onload") == "true";
		fieldPolicy.script_true = this._getAttribute(node, "script_true");
		fieldPolicy.script_false = this._getAttribute(node, "script_false");
		fieldPolicy.sys_id = this._getAttribute(node, "sys_id");
		fieldPolicy.source_table = this._getAttribute(node, "source_table");
		fieldPolicy.debug = this.debug;
		return fieldPolicy;
	},
	
	_conditionFromXML: function(/*xmlnode*/ node) {
		var condition = {};
		condition.newquery = this._getAttribute(node, "newquery") == "true";
		condition.field = this._getAttribute(node, "field");
		condition.oper = this._getAttribute(node, "oper");
		condition.value = this._getAttribute(node, "value");
		condition.type = this._getAttribute(node, "type");
		condition.or = this._getAttribute(node, "or") == "true";
		condition.term = this._getAttribute(node, "term");
		return condition;
	},
	
	_actionFromXML: function(/*xmlnode*/ node) {
		var action = {};
		action.name = this._getAttribute(node, "name");
		action.mandatory = this._getAttribute(node, "mandatory");
		action.visible = this._getAttribute(node, "visible");
		action.disabled = this._getAttribute(node, "disabled");
		return action;
	},
	
	_scriptFromXML: function(/*xmlnode*/ node) {
		var xmlUtil = GlideXMLUtil;
		var n = this._getAttribute(node, "name");
		if (!n)
			return;
		
		this.uiPolicy.scripts[n] = this._escapeScript(xmlUtil.getText(node) + '');
	},
	
	setDebug: function(flag) {
		this.debug = flag;
	},
	
	_process: function(gr, isDataPolicy) {
		this._processScripts(gr);
		this._processPolicy(gr, isDataPolicy);
	},
	
	/**
 	* Determine if there is are true and/or false scripts for the current policy
 	* and if so, save the scripts in the scripts hashmap so the script names can
 	* be properly referenced when building the policy information.
 	*
 	* Each script is checked to ensure that there is actually some code to write out. Since we
 	* default the scripts to:
 	*
 	* function onCondition() {
 		* }
 		*
 		* to help the user build the scripts, we first get rid of all whitespace and see if
 		* there is any user added code in the script. If so, we change the name of the
 		* script to onCondition_<sys_id>_[true|false] so that there are no name conflicts.
 		*/
		_processScripts: function(gr) {
			// only include this script if run_scripts is true and it is the right UI type
			// possible values include 0 - browser, 1 - smartphone, and 10 - both, as well as null which resolves to 0
			var uiType = gr.isValidField('ui_type') ? gr.ui_type : 0;
			if (gr.run_scripts && (uiType == this.uiScriptType || uiType == 10)) {
				this._processScript(gr.script_true.toString(), gr, "true");
				this._processScript(gr.script_false.toString(), gr, "false");
			}
		},
		
		_processScript: function(script, gr, type) {
			if (!script)
				return;
			
			// See if there is code in the script first
			var blankFunc = "functiononCondition() {}";
			var s = script.replace(/\s/g, "");
			if (blankFunc == s)
				return;
			
			// Mangle the function name
			var name = this._getScriptName(gr.getValue("sys_id"), type);
			script = script.replace(/\r/g, "");
			script = script.replace(/onCondition/g, name);
			script = this.uiPolicyScoper.getScopedScript(gr, name, script);
			this.uiPolicy.scripts[name] = script;
		},
		
		_getScriptName: function(sysId, type) {
			return "onCondition_" + sysId + "_" + type;
		},
		
		_processPolicy: function(gr, isDataPolicy) {
			var set = new Packages.java.util.HashSet();
			var tableTD;
			if (!isDataPolicy)
				tableTD = GlideTableDescriptor.get(gr.table);
			else
				tableTD = GlideTableDescriptor.get(gr.model_table);
			
			var scriptTrue = "";
			var scriptFalse = "";
			
			var scriptName = this._getScriptName(gr.sys_id, "true");
			if (this.uiPolicy.scripts[scriptName])
				scriptTrue = scriptName;
			
			scriptName = this._getScriptName(gr.sys_id, "false");
			if (this.uiPolicy.scripts[scriptName])
				scriptFalse = scriptName;
			
			var fieldPolicy = {};
			
			fieldPolicy.table = gr.getTableName();
			if (!fieldPolicy.table)
				fieldPolicy.table = gr.model_table.toString();
			
			fieldPolicy.short_description = gr.short_description.toString();
			fieldPolicy.reverse = (gr.reverse_if_false.toString() == "true");
			if (!isDataPolicy)
				fieldPolicy.onload = (gr.on_load.toString() == "true");
			else
				fieldPolicy.onload = true;
			
			fieldPolicy.script_true = scriptTrue;
			fieldPolicy.script_false = scriptFalse;
			
			fieldPolicy.sys_id = gr.sys_id.toString();
			fieldPolicy.source_table = 'sys_ui_policy';
			
			fieldPolicy.debug = this.debug;
			this.uiPolicy.fieldPolicies.push(fieldPolicy);
			
			// Handle the conditions
			var conditions = [];
			fieldPolicy.conditions = conditions;
			
			var eq = new GlideQueryString();
			var table = gr.table;
			if (!table)
				table = gr.model_table;
			
			eq.init(table, gr.conditions);
			eq.deserialize();
			var terms = eq.getTerms();
			for (var i = 0; i != terms.size(); i++) {
				var term = terms.get(i);
				
				if (term.isEndQuery())
					continue;
				
				// determine field type
				var ce = new GlideCompositeElement(term.getTermField(), tableTD);
				
				if (!ce)
					continue;
				
				var ed = ce.getTargetED();
				
				if (!ed)
					continue;
				
				var fieldType = ed.getInternalType();
				var condition = {};
				condition.isParenthesesTerm = false;
				condition.newquery = term.isNewQuery();
				condition.field = term.getTermField() + '';
				condition.oper = this._convertOper(term.getOperator() + '');
				condition.value = term.getValue() + '';
				condition.type = fieldType;
				condition.or = term.isOR();
				condition.term = term.getTerm();
				conditions.push(condition);
				
				set.add(term.getTermField());
			}
			
			// get the policy actions
			var actions = [];
			fieldPolicy.actions = actions;
			
			var tableName = 'sys_ui_policy_action';
			var joinField = 'ui_policy';
			if (isDataPolicy){
				tableName = 'sys_data_policy_rule';
				joinField = 'sys_data_policy';
			}
			
			var actionGR = new GlideRecord(tableName);
			actionGR.addQuery(joinField, gr.sys_id);
			actionGR.query();
			while (actionGR.next()) {
				var action = {};
				action.name = actionGR.field.toString();
				action.mandatory = actionGR.mandatory.toString();
				if (isDataPolicy)
					action.visible = 'ignore';
				else
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
		
		/**
 		* Update any values in the ui policy that contain any javascript: parts
 		*/
		updateValues: function() {
			// regex used to determine if things look like a date time
			var dateTimeRegEx = new RegExp("[12][0-9]{3}-[01][0-9]-[0-3][0-9] [0-2][0-9]:[0-5][0-9]:[0-5][0-9]");
			var gdt = new GlideDateTime();
			var controller = GlideController;
			
			for (var i = 0; i != this.uiPolicy.fieldPolicies.length; i++) {
				var conditions = this.uiPolicy.fieldPolicies[i].conditions;
				for (var j = 0; j != conditions.length; j++) {
					var condition = conditions[j];
					if (condition.type == "__preevaluated__")
						continue;
					
					var value = condition.value;
					if (!value)
						continue;
					if (value.indexOf('javascript:') == -1)
						continue;
					
					var parts = value.split("@");
					for (var k = 0; k != parts.length; k++) {
						if (parts[k].indexOf('javascript:') != 0)
							continue;
						
						parts[k] = controller.evaluateString(parts[k].substring(11));
						
						// dates come back as yyyy-mm-dd hh:mm:ss but in GMT
						// we have to convert these to session TZ so that we have a
						// chance of using them for comparisons
						if (condition.type != 'glide_duration' && dateTimeRegEx.test(parts[k])) {
							gdt.setValue(parts[k]);
							parts[k] = gdt.getDisplayValue();
						}
					}
					condition.value = parts.join("@");
				}
			}
		},

		preEvaluate: function(/* GlideRecord */ gr, fieldsOnForm) {
			if (gr == null || fieldsOnForm == null)
				return;

			var fields = GlideStringUtil.split(fieldsOnForm);

			for (var i = 0; i != this.uiPolicy.fieldPolicies.length; i++) {
				var conditions = this.uiPolicy.fieldPolicies[i].conditions;
				for (var j = 0; j != conditions.length; j++) {
					var condition = conditions[j];

				// Don't pre-evaluate conditions for GlideVar elements
				// legacy GlideVars always started with "vars."
				// but newer ones can start with anything(e.g. atf vars start with "inputs.")
				if (this._containsAny(["var__m", "vars."], condition.field))
						continue;

					if (!fields.contains(condition.field)) {
						condition.type = "__preevaluated__";
						var f = new GlideFilter(condition.term, "UI Policy Filter");
						condition.value = f.match(gr, true);
					}
				}
			}
		},

	_containsAny: function(needles, hay) {

		for (var i = 0, len = needles.length; len > i; i++) {
			if (this._contains(needles[i], hay))
				return true;
		}

		return false;
	},

	_contains: function(needle, hay) {

		return hay.indexOf(needle) !== -1;
	},

		_getAttribute: function(e, name) {
			return e.getAttribute(name) + '';
		},

		_escapeScript: function(script) {
			if (script.indexOf("</script>") == -1)
				return script;

			return script.split("</script>").join("</script>");
		},

		_convertOper: function(oper) {
			if (oper == "CONTAINS")
				return "LIKE";

			if (oper == "DOES NOT CONTAIN")
				return "NOT LIKE";

			return oper;
		},

		type: 'UIPolicyBuilder'
	}
	