// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
data.typeTagNameMsg = gs.getMessage("Type tag name...");
var loggedInSysUserID = gs.getUser().getID();
data.userIsGuest = (gs.getUserName() === "guest");
data.liveProfileID = "";
var liveProfileGR = new GlideRecord("live_profile");
if (liveProfileGR.get("document", loggedInSysUserID))
	data.liveProfileID = liveProfileGR.getUniqueValue();

// blunt: delete the user's tags, then add back the ones we want to keep
if (input && input.action == "update") {
	var labelEntryGR = new GlideRecord("sqanda_tag_entry");
	labelEntryGR.addQuery("reference_name", "live_profile");
	labelEntryGR.addQuery("reference_id", data.liveProfileID);
	labelEntryGR.deleteMultiple();
	
	input.tagList.split(",").forEach(function(tagID) {
		var newLabelEntryGR = new GlideRecord("sqanda_tag_entry");
		newLabelEntryGR.initialize();
		newLabelEntryGR.reference_name = "live_profile";
		newLabelEntryGR.reference_id = data.liveProfileID;
		newLabelEntryGR.tag = tagID;
		newLabelEntryGR.insert();
	});
}

data.tags = [];

if (data.liveProfileID) {
	var labelEntryGR = new GlideRecord("sqanda_tag_entry");
	labelEntryGR.addQuery("reference_name", "live_profile");
	labelEntryGR.addQuery("reference_id", data.liveProfileID);
	labelEntryGR.query();
	
	while (labelEntryGR.next()) {
		var labelGR = labelEntryGR.getElement("tag").getRefRecord();
		if (labelGR.getUniqueValue() !== null)
			data.tags.push({
				name: labelGR.getValue("name"),
				sys_id: labelGR.getUniqueValue(),
				label_entry_id: labelEntryGR.getUniqueValue()
			});
	}
}