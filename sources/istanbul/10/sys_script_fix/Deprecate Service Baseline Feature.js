removeData();

function removeData(){
	//Remove left hand menu item
	var menu = new GlideRecord("sys_app_module");
	if(menu.get("356876133723210052e2cc028e41f163"))
		menu.deleteRecord();

	var exclusionMenu = new GlideRecord("sys_app_module");
	if(exclusionMenu.get("e03f5851d7403100c1ed0fbc5e610395"))
		exclusionMenu.deleteRecord();
	
	//Remove Processor Record
	var processor = new GlideRecord("sys_processor");
	if(processor.get("58d32ac33763210052e2cc028e41f1e3"))
		processor.deleteRecord();
	
	//Delete Baseline Dump table
	GlideSystemUtilDB.dropTable("svc_baseline_dump");

	//Delete Baseline CI table 
	GlideSystemUtilDB.dropTable("svc_baseline_ci");

	//Delete Baseline Dirty table 
	GlideSystemUtilDB.dropTable("svc_baseline_dirty");
}