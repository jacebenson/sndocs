if(!pm.isZboot()) {
	var gr = new GlideRecord("sysauto_script");
	if(gr.isValid()) {
		gr.addQuery("sys_id","9777f44097220100d308124eda297511");
		gr.query();
		gr.setWorkflow(false);
		if(gr.next())
			gr.deleteRecord();
	}
}