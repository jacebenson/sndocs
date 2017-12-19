renameTable();

function renameTable(){
	//Rename Sys Db Object
	var dbObj = new GlideRecord("sys_db_object");
	dbObj.addQuery("name","svc_baseline_exclusion");
	dbObj.query();
	if(dbObj.next()){
		dbObj.setValue("label","Exclusion List");
		dbObj.update();
	}
	
	var docObj = new GlideRecord("sys_documentation");
	docObj.addQuery("name","svc_baseline_exclusion");
	docObj.addNullQuery("element");
	docObj.query();
	if(docObj.next()){
		docObj.setValue("plural","Exclusion Lists");
		docObj.update();
	}
	
}