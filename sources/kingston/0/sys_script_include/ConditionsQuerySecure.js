var ConditionsQuerySecure = Class.create();
ConditionsQuerySecure.prototype = {
    initialize: function() {
    },
	
	getConditionQueryCount: function(tableName, encodedQuery) {
		if (!GlideTableDescriptor.isValid(tableName))
		   return "Not a valid table name";

		var gr = new GlideAggregate(tableName);
		if (!gr.canRead())
			return "User not allowed to access table: " + tableName;

		gr.addEncodedQuery(encodedQuery);
		gr.addAggregate("COUNT");
		gr.query();
		var count = 0;
		if (gr.next())
			count = gr.getAggregate("COUNT");

		var msg = gs.getMessage("records match condition");
		if (count == 1)
			msg = gs.getMessage("record matches condition");

		return count + " " + msg;
	},

    type: 'ConditionsQuerySecure'
};