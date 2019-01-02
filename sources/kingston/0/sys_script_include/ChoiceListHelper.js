var ChoiceListHelper = Class.create();
ChoiceListHelper.prototype = {
    initialize : function(tableName, fieldName) {
      this.tableName = tableName;
      this.fieldName = fieldName;
    },
	
	getChoiceSysId : function(choice) {
       var gr = new GlideRecord("sys_choice");
       gr.addQuery("name", this.tableName);
       gr.addQuery("element", this.fieldName);
       gr.addQuery("value", choice);
       gr.query();

       if (gr.next()) {
         return gr.sys_id;
       }

       return null;
   },

    type: 'ChoiceListHelper'
};