var RecordAccessChecker = Class.create();
RecordAccessChecker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	canWrite: function() {		 
		var table = this.getParameter("sysparm_table");		
		var sys_id = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord(table);
		if (!gr.get(sys_id))
			return false;
		
		return gr.canWrite();
	},
	
    type: 'RecordAccessChecker'
});