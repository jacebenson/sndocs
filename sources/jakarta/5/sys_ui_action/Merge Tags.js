function merge() {
	var labelIds = g_list.getChecked().split(",");
	if (!labelIds || labelIds.length == 0)
		return;

	var callback = function(targetLabel) {

		var mergeFunction = new GlideAjax("LabelMergeAjax");
		mergeFunction.addParam("sysparm_name", "mergeLabels");
		mergeFunction.addParam("sysparm_labelIds", labelIds);
		mergeFunction.addParam("sysparm_targetLabel", targetLabel);

		var mergeResponse = function () {
			reloadWindow(window);
		};

		mergeFunction.getXML(mergeResponse.bind(this));
		return true;
	};

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var targetTagInput = new dialogClass("merge_tags_input", false, 400);
	targetTagInput.setTitle(getMessage("Enter tag to merge other tag(s) into"));
	targetTagInput.setPreference("onPromptComplete", callback.bind(this));
	targetTagInput.render();
}
