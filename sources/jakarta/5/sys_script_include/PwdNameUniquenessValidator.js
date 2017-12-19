var PwdNameUniquenessValidator = Class.create();

PwdNameUniquenessValidator.validate = function(current) {
	// firstly trim the input
	current.name = current.name.trim();	
	if (!current.name){
		gs.addErrorMessage(gs.getMessage("You must enter a Name."));
		current.setAbortAction(true);
	}
	
	// validate uniqueness of the colName considering within the same domain
	var gr = new GlideRecord(current.getTableName());
	gr.addQuery("name", current.name);
	gr.addQuery("sys_domain", current.sys_domain);
	
	if(current.operation() == "update") {
		gr.addQuery("sys_id", "<>", current.sys_id);
	}
	
	gr.query();
	
	if (gr.next()) {
		var errMsg = gs.getMessage("The Name '{0}' is already in use. Enter a different name.", current.name);
	    gs.addErrorMessage(errMsg);
	    current.setAbortAction(true);
	}
};



