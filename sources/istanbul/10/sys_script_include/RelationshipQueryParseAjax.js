// Similar to QueryStringSerializer toXML
var RelationshipQueryParseAjax = Class.create();
RelationshipQueryParseAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
    process: function() {
		var query = this.getParameter("sysparm_chars");
		var table = this.getParameter("sysparm_name");
		this.getRootElement().setAttribute("table", table);
		
		var terms = (new SNC.ConditionUtils()).getTerms(query);
		for(var i = 0; i < terms.length; i++) {
			var queryTerm = terms[i];
			var item = this.newItem("item");
			this._setAttributes(item, queryTerm);
			this._addReferenceInfo(item, queryTerm, table);
		}
	},
	
	_setAttributes: function(item, qt) {
		item.setAttribute("operator", qt.getOperator());
		item.setAttribute("field", qt.getTermField());
		item.setAttribute("value", qt.getValue());
		item.setAttribute("goto", qt.isGoto()? "true":"false");
		item.setAttribute("endquery", qt.isEndQuery()? "true":"false");
		item.setAttribute("newquery", qt.isNewQuery()? "true":"false");
		item.setAttribute("or", qt.isOR()? "true":"false");
		item.setAttribute("operator", qt.getOperator());
	},
	
	_addReferenceInfo: function(item, queryTerm, table) {
		var value = queryTerm.getValue();
		var referenceTable;
		switch(table) {
			case 'cmdb_rel_type':
				referenceTable = 'cmdb_ci';
				break;
			case 'cmdb_rel_user_type':
				referenceTable = 'sys_user';
				break;
			case 'cmdb_rel_group_type':
				referenceTable = 'sys_user_group';
				break;
			default:
				return;
				break;
		}
		var record = new GlideRecord(referenceTable);
		record.get(value);
		var displayValue = record.getDisplayValue(record.getDisplayName())
		item.setAttribute('display_table', referenceTable);
		item.setAttribute('display_value', displayValue);
	},

    type: 'RelationshipQueryParseAjax'
});