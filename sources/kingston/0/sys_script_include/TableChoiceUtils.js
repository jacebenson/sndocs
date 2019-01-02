var TableChoiceUtils = Class.create();
TableChoiceUtils.prototype = {
	
	initialize: function (tableName) {
		this.tableName = tableName;
	},
	
   /**
	* This returns field choices (as a json object with (value, label) pairs) for the field name.   	*/
	
	getChoicesForField: function (fieldName) {
		// this method try to find the field through the parent hierarchy stating from current 
		// table until the base table.
		var table = new TableUtils(this.tableName);
		var hierarchy = table.getTables();
		var choices = {};

        for (i = 0; i < hierarchy.size(); i++) { 
		    var gr = new GlideRecord("sys_choice");
	        gr.addQuery("name", hierarchy.get(i));
	        gr.addQuery("element", fieldName);
	        gr.query();
	        if (gr.next()) {
			   choices[gr.getValue("value")] = gr.getValue("label");
			   while (gr.next())
				   choices[gr.getValue("value")] = gr.getValue("label");
			   // break when we found the field values 
		       break;
	        }
         }
		
		return choices;
	}
}