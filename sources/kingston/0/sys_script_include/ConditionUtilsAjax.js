var ConditionUtilsAjax = Class.create();
ConditionUtilsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getQueryDisplay: function() {
		var query = this.getParameter('sysparm_query');
		var tableName = this.getParameter('sysparm_table_name');
		var info = (new SNC.ConditionUtils()).getQueryTerms(query, tableName);
		info = (new JSONParser()).parse(info);
		var queryDisplay = info.queryDisplay;
		var item = this.newItem('result');
		item.setAttribute('queryDisplay', queryDisplay);
	},
	
	getRelationshipQueryDisplay: function() {
		var query = this.getParameter('sysparm_query');
		var relTypeTable = this.getParameter('sysparm_rel_type_table');
		var relTargetTable = this.getParameter('sysparm_rel_target_table');
		var info = (new SNC.ConditionUtils()).getRelationshipQueryTerms(query, relTypeTable, relTargetTable);
		info = (new JSONParser()).parse(info);
		var queryDisplay = info.queryDisplay;
		var item = this.newItem('result');
		item.setAttribute('queryDisplay', queryDisplay);
	},

	validateField: function () {
		var table_name = this.getParameter('sysparm_table_name');
		var field = this.getParameter('sysparm_field');
		var gr = new GlideRecord(table_name);
		var valid = gr.getElement(field)!=null;
		var item = this.newItem('result');
		item.setAttribute('valid', valid);
	},

	// copied from AddRelationshipAjax to use Relationship related lists
	getRelatedLists: function() {
		var dependentTable = this.getParameter('sysparm_dependent_table');
		var gr = new GlideRecord(dependentTable);
		var map = gr.getRelatedLists();
		var iterator = map.keySet().iterator();
		var relatedListsArry = new Array();
		var relatedLists = {};

		while (iterator.hasNext()) {
			var key = iterator.next();
			relatedListsArry.push({
				'key': key,
				'label': map.get(key)
			});
		}

		// add customized relationships
		// code hinted from SlushbucketRelatedList.get
		var cls = new GlideChoiceListSet();
		var util = new GlideRelationshipUtil();
		util.addChoices(dependentTable, cls);
		var iterChoice = cls.getColumns().iterator();
		while (iterChoice.hasNext()) {
		    var choice = iterChoice.next();
		    relatedListsArry.push({
				'key': choice.getValue(),
				'label': choice.getLabel()
		    });
		}

		// sort by label
		relatedListsArry.sort(function(objA, objB) {
			if (objA.label < objB.label)
				return -1;
			else if (objA.label == objB.label)
				return 0;
			else
				return 1;
		});

		relatedLists['relatedLists'] = relatedListsArry;

		var json = new JSON();

		var result = this.newItem("result");
		result.setAttribute("relatedList", json.encode(relatedLists));
	},

    type: 'ConditionUtilsAjax'
});