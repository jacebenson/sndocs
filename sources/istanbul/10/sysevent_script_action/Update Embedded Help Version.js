if (gs.getProperty("glide.installation.production")) {
	var build = gs.getProperty("glide.buildname");
	var embHelp = "sys_embedded_help_content";
	var choiceList = new GlideRecord("sys_choice");
	choiceList.addQuery("element", "version");
	choiceList.addQuery("name", embHelp);
	choiceList.addQuery("value", build.toLowerCase().substring(0,1));
	choiceList.query();
	if (!choiceList.hasNext()) {
		choiceList = new GlideRecord("sys_choice");
		choiceList.initialize();
		choiceList.setValue("element", "version");
		choiceList.setValue("name", embHelp);
		choiceList.setValue("value", build.toLowerCase().substring(0,1));
		choiceList.setValue("label", build);
		choiceList.insert();
		var dict = new GlideRecord("sys_dictionary");
		dict.addQuery("name", embHelp);
		dict.addQuery("element", "version");
		dict.query();
		if (dict.next()) {
			if (dict.getValue("default_value") != build.toLowerCase().substring(0,1)) {
				dict.getValue("default_value", build.toLowerCase().substring(0,1));
				dict.update();
			}
		}
		gs.log("Embedded Help Version Upgrade to: " + build);

	}
	
	// Purge old embedded help
	/*
	// This needs to be fixed before uncommenting it. In a dev env the build name is always HEAD which deletes all Helsinki content.  
	var content = new GlideRecord(embHelp);
	content.addQuery("version", "!=", build.toLowerCase().substring(0,1));
	content.addQuery("version", "!=", "all");
	content.addQuery("snc_created", "true");
	content.query();
	content.deleteMultiple();
	*/
	
	var blankRecords = new GlideRecord(embHelp);
	blankRecords.addQuery("snc_created", true);
	blankRecords.addNullQuery("content");
	blankRecords.query();
	blankRecords.deleteMultiple();
}


