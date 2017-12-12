gs.log("Start to migrate credential tags in discover_credential table ...");
changeCredTagTypeToGlideList();
migrateCredTags();


function changeCredTagTypeToGlideList() {
	var gr = new GlideRecord("sys_dictionary");
	gr.addQuery("name", "discovery_credentials");
	gr.addQuery("element", "tag");
	gr.query();
	if (gr.next()) {
		gr.setValue("internal_type", "glide_list");
		gr.setValue("reference", "sys_alias");
		gr.update();
	}
}

function migrateCredTags() {
	var credGr = new GlideRecord("discovery_credentials");
	credGr.addNotNullQuery("tag");
	credGr.query();
	
	gs.log("Credential tag migration: Find " + credGr.getRowCount() + " credential records have tags");
	
	while(credGr.next()) {
		gs.log("Credential " + credGr.name + " has tag:  "  +  credGr.tag );
		
		var tagSysIds = "";
		var tags = credGr.tag.split(",");
		
		for (var i in tags) {
			var tag = tags[i].trim();
			var tagSysId = "";
			
			var credTagGr = new GlideRecord("sys_alias");
			credTagGr.addQuery("name", tag);
			credTagGr.query();
			
			if (credTagGr.next())
				tagSysId = credTagGr.getUniqueValue();
			else {
				var newTagGr = new GlideRecord("sys_alias");				
				newTagGr.initialize();
				newTagGr.setWorkflow(false);
				newTagGr.name = tag;
				newTagGr.type = 'credential';
				newTagGr.insert();
				
				tagSysId = newTagGr.getUniqueValue();
			}
			
			tagSysIds += (tagSysIds == "") ? tagSysId : "," + tagSysId;
		}
		
		credGr.tag =  tagSysIds;
		credGr.update();
	}
}