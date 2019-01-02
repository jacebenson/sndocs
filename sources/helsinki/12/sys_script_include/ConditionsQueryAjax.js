var ConditionsQueryAjax = Class.create();

ConditionsQueryAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    ajaxFunction_getConditionQueryCount: function() {
	   var tableName = this.getParameter('sysparm_table');
	   if (!GlideTableDescriptor.isValid(tableName))
		   return "Not a valid table name";

	   var gr = new GlideAggregate(tableName);
	   if (!gr.canRead())
		   return "User not allowed to access table: " + tableName;
		
       gr.addEncodedQuery(this.getParameter('sysparm_encoded_query'));
       gr.addAggregate("COUNT");
       gr.query();
       var count = 0;
       if (gr.next())
         count = gr.getAggregate("COUNT");

       var msg = gs.getMessage("records match condition");
       if (count == 1)
         msg = gs.getMessage("record matches condition");

       return count + " " + msg;
    }
});