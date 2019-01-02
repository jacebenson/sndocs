var AJAXFormLoad = Class.create();
AJAXFormLoad.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	canFormReload: function() {
		if (!this._recordCheck())
			return "submitted";
		
		return "not_submitted";
	},
	
	/**
	 * Returns true if this record does not exist
	 * Returns false if the record does exist, thereby failing the check
	 */
	_recordCheck: function() {
		var table = this.getParameter('sysparm_table');
		var sys_id = this.getParameter('sysparm_sys_id');
		if (!table || !sys_id)
			return true;
		
		var gr = new GlideRecordSecure(table);
		return !gr.get(sys_id);
	}
});