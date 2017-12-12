var WidgetTextFields = Class.create();
WidgetTextFields.prototype = {
	initialize: function() {
	},
	process: function(table_name, current_table_name, indicator_id) {
		answer = [];
		var gr = new GlideRecord("pa_indicators");
		gr.get(indicator_id);

		var domain = new SNC.PADomainUtils().getCurrentUserDomain();
		var x = SNC.PAUtils.getFieldNames(gr.getValue('cube'), domain);
		answer = JSON.parse(x);
		return answer;
	},
	type: 'WidgetTextFields'
};