var ValidateTextIndexFields = Class.create();
ValidateTextIndexFields.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getValidFields : function(){
		var fieldNames = this.getParameter("sysparm_field_names");
		var tableName = this.getParameter("sysparm_tablename");
		return this.getValidatedFields(tableName, fieldNames);
	},
	getValidatedFields : function(tableName, fieldNames){
		var result = [];
		var fields = fieldNames.split(",");
		var gr = new GlideRecord(tableName);
		for (var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var fieldElement = gr.getElement(field);
			var fieldED = fieldElement.getED();
			if (String(field).split('.').length > 1) {
				gs.log('Skip the dot walked field : ' + field);
				continue;
			}
			if (fieldED.getInternalType() == "string")
				result.push(fields[i]);
		}
		return result.toString();
	},
	isPublic: true,
    type: 'ValidateTextIndexFields'
});