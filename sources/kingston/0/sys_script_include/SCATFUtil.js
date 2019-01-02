var SCATFUtil = Class.create();
SCATFUtil.prototype = {
    initialize: function() {
    },
	/**
	 **	Populates answer object in the context with the choices.
	**/
	getVariables : function(current) {
		var cat_item_id = current.inputs.catalog_item;
		if (!cat_item_id)
			return;
		var cat_item = new sn_sc.CatItem(cat_item_id);
		var variablesList = this._getFlatVariables(cat_item.getVariables());

		for (var i=0; i<variablesList.length; i++) {
			var variable = variablesList[i];
			answer.add(variable.id, variable.label);
		}
	},
	getVariableDisplayName : function (qId) {
		var question = new GlideappQuestion.getQuestion(qId);
		if (question)
			return question.getLabel();
		else
			return "";
	},
	getVariable : function (qId) {
		return new GlideappQuestion.getQuestion(qId);
	},
	getVariableType : function (qId) {
		var question = new GlideappQuestion.getQuestion(qId);
		if (question)
			return question.getType();
		else
			return "";	
	},
	getValueValidationDescription : function (catalog_conditions) {
		//build query in dispaly format
		var queryString = new GlideQueryString("sc_cart_item", catalog_conditions);
		queryString.deserialize();
		var qObj = queryString.getTerms();
		var LINE_BREAK = "\n";
		var OR = gs.getMessage("or");
		var AND = gs.getMessage("and");
		var description = "";
		var NEW_QUERY_PREFIX = LINE_BREAK + "-- " + OR + " --" + LINE_BREAK;
		var OR_PREFIX = LINE_BREAK + "  " + OR + " ";
		var AND_PREFIX = LINE_BREAK + AND + " ";
		var newQuery = true;
		for (var i=0; i<qObj.size(); i++) {
			if (qObj.get(i).isEndQuery())
				break;
			var qTerm = qObj.get(i);
			if (qTerm.isNewQuery()) {
				description += NEW_QUERY_PREFIX;
				newQuery = true;
			}
			if (!newQuery) {
				if (qTerm.isOR())
					description += OR_PREFIX;
				else
					description += AND_PREFIX;
			}
			var questionLabel = this.getVariableDisplayName(qTerm.getField().substring(3));
			var value = qTerm.getValue();
			if (value.startsWith("javascript:")){
				var sBoxEvalObj = new GlideScriptEvaluator();
				sBoxEvalObj.setEnforceSecurity(true);
				value = sBoxEvalObj.evaluateString(value, true);
			}
			
			var question = this.getVariable(qTerm.getField().substring(3));
			question.setValue(value);
			value = question.getDisplayValue();
			
			description += questionLabel + " " + qTerm.getOperator() + " " + value;
			newQuery = false;
		}
		return description;

	},
	_getFlatVariables : function (nestedVariableList) {
		var variableList = [];
		for (var i=0; i<nestedVariableList.length; i++) {
			
			var variable = nestedVariableList[i];
			if (variable.type && this._canValidateVariable(variable.type))
				variableList.push({
					label : variable.label || "",
					id : variable.id
				});
			if (variable.children) {
				var childList = this._getFlatVariables(variable.children);
				for (var j=0; j<childList.length; j++) {
					variableList.push({
						label: childList[j].label,
						id : childList[j].id
					});
				}
			}
		}
		return variableList;
	},
	_canValidateVariable : function (type) {
		return (type != 0 && type != 12 && type != 20 && type != 24);
	},
	getValidCategoryQuery : function (current) {
		var query = "active=true";
		if (current.inputs.catalog != "")
			query += "^sc_catalogIN" + current.inputs.catalog;
		return query;
	},
	getValidCatalogItemsQuery : function(current) {
		var query = "active=true";
		if (current.inputs.category != "") {
			var catalogIdStr = "";
			var catItemCatalog = new GlideRecord("sc_cat_item_category");
			catItemCatalog.addQuery("sc_category", current.inputs.category);
			catItemCatalog.query();
			while (catItemCatalog.next())
				catalogIdStr += catItemCatalog.getValue("sc_cat_item") + ",";
			if (catalogIdStr)
				query += "^sys_idIN" + catalogIdStr;
		} else if (current.inputs.catalog != "")
			query += "^sc_catalogsCONTAINS" + current.inputs.catalog;
		return query;
	},
    type: 'SCATFUtil'
};

SCATFUtil.getLastUsedCatalogItemInTestBasedOnStep = function (stepGR) {
	if (!stepGR || !stepGR.isValid() || !stepGR.getValue("test"))
		return "";

	var previousStepGr = new GlideRecord("sys_atf_step");
	previousStepGr.addActiveQuery();
	previousStepGr.addQuery("test", stepGR.getValue("test"));
	previousStepGr.orderByDesc("order");
	if (stepGR.getValue("order"))
		previousStepGr.addQuery("order", "<", stepGR.getValue("order"));
	previousStepGr.setLimit(1);
	previousStepGr.query();
	if (previousStepGr.next())
		return previousStepGr.inputs.catalog_item;
	return "";
};