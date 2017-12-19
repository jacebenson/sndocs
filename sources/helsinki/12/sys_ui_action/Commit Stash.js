function commitStash() {
	var map = new GwtMessage().getMessages(["Commit Stash", "Close", "Invalid record",
			"A stash must be previewed before it can be committed"]);

	if (typeof rowSysId == 'undefined')
     sysId = gel('sys_uniqueValue').value;
	else
     sysId = rowSysId;
	
	var gr = new GlideRecord('sys_repo_stash');
	if (!gr.get(sysId)) {
		alert(map["Invalid record"]);
		return;
	}
	if (gr.state != 'stash_previewed') {
		alert(map["A stash must be previewed before it can be committed"]);
		return;
	}
	
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("simple_progress_viewer", true, "40em", "10em");
	dd.on("beforeclose", function() {
		refreshNav();
		reloadWindow(window); //reload current form after closing the progress viewer dialog
	});

	dd.setTitle(map["Commit Stash"]);
	
	dd.setPreference('sysparm_ajax_processor', 'SourceControlAjax');
	dd.setPreference('sysparm_ajax_processor_type','commit_stash');
	dd.setPreference('sysparm_ajax_processor_sys_repo_stash_id', sysId);

	dd.setPreference('sysparm_renderer_progress_title', map["Commit Stash"]);
	dd.setPreference('sysparm_button_close', map["Close"]);

	dd.on("executionComplete", function(trackerObj) {
		var closeBtn = $("sysparm_button_close");
		if (closeBtn) {
			closeBtn.onclick = function() {
				dd.destroy();
			};
		}
	});

	dd.render();
}