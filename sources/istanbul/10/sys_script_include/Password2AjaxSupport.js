var Password2AjaxSupport = Class.create();
Password2AjaxSupport.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   getClearPassword2: function() {
	 var tableName = this.getParameter('sysparm_table_name');
	 var fieldName = this.getParameter('sysparm_field_name');
	 var sysId = this.getParameter('sysparm_sys_id');
     return GlideEncryptionUtil.getClearPassword2(tableName,fieldName,sysId);
   }
});
