(function() {
	data.table = options.table || $sp.getParameter("table");
	data.sys_id = options.sys_id || $sp.getParameter("sys_id") || $sp.getParameter("sl_sys_id");

	if (input) {
		var vars = [];
		var fields = input.sc_cat_item._fields;
		data.sys_id = input.sys_id;
		data.table = input.table;
		for (var v in fields) {
			vars.push(fields[v]);
		}

		if (data.table == "sc_cart_item")
			SPCart.updateItem(input.sys_id, vars);
		else
			$sp.saveVariables(input.table, input.sys_id, vars);
	}

	var gr = new GlideRecord(data.table);
	if (gr.get(data.sys_id)) {
    var targetTable = data.table;
    if (targetTable == "sc_cart_item")
      targetTable = "sc_cat_item";
		data.sc_cat_item = $sp.getCatalogItem(gr.cat_item, !!options.isOrdering, targetTable);
		if (options.showItemTitle)
			data.itemTitle = data.sc_cat_item.short_description;
		var values = getValues(data.table, data.sys_id);

		for(var f in data.sc_cat_item._fields) {
			// Put the values into the cat item fields
			if (typeof values[f] != "undefined" && typeof values[f].value != "undefined") {
				if (values[f].type == 9 || values[f].type == 10)
					data.sc_cat_item._fields[f].value = values[f].displayValue;
				else
					data.sc_cat_item._fields[f].value = values[f].value;
				data.sc_cat_item._fields[f].displayValue = values[f].displayValue;
				data.sc_cat_item._fields[f].display_value_list = values[f].display_value_list;
			}
		}
	}

	function getValues(table, sys_id) {
		var qs = new GlideappVariablePoolQuestionSet();
		if (table == "sc_cart_item")
			qs.setCartID(sys_id);
		else
			qs.setRequestID(sys_id);

		qs.load();
		var values = {};
		var questions = qs.getFlatQuestions().toArray();
		for (var i = 0; i < questions.length; i++) {
			var q = questions[i];
			var o = {value: q.getValue(), displayValue: q.getDisplayValue(), type: q.getType()};
			if (o.type == 21)
				o.display_value_list = q.getDisplayValues().toArray();

			values["IO:" + q.getId()] = o;
		}
		return values;
	}
})();