function openAddToBoardDialogListContext() {
	var taskSysID = rowSysId,
	tableName = g_list.getTableName();
	
	var o = new GlideOverlay({
		title : "Choose a Visual Task board",
		iframe : "$vtb_add_to_board.do?sysparm_record_id=" + taskSysID + "&sysparm_table_name=" + tableName + "&sysparm_nostack",
			allowOverflowX : true,
		height : 1000,
		width : 2000,
		messages : ""
	});
	o.setPreference("sysparm_record_id", typeof rowSysId == 'undefined' ? taskSysID : rowSysId);
	o.setPreference("sysparm_table_name", tableName);
	o.setOnBeforeClose(displayMessageStashListContext);
	o.render();
	
}


function displayMessageStashListContext() {
	if (!this.getData("messages"))
		return;
	
	GlideUI.get().clearOutputMessages();
	
	var m = this.getData("messages");
    if (m.messages.info) {
		for(var i = 0; i < m.messages.info.length; i++) {
			var msg = m.messages.info[i];
			if(msg)
				addFormMessage(msg, "info", 0);
		}
	}
	
	if (m.messages.error) {
		for(var i = 0; i < m.messages.error.length; i++) {
			var msg = m.messages.error[i];
			if(msg)
				addFormMessage(msg, "error", 0);
		}
	}
}

function addFormMessage(msg, type, id) {
	    GlideUI.get().addOutputMessage({msg: msg, type: type, id: id});
		var scrollDiv = getFormContentParent();
		scrollDiv.scrollTop = 0;
}
