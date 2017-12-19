function onLoad() {
	if(g_scratchpad.indexNeeded == "true"){
	  openMonitorPopUp();
	}
}

function openMonitorPopUp(){
   var dialog = new GlideDialogWindow("glide_confirm_standard");
   dialog.setWidth("800");
   dialog.setTitle(getMessage("Coalesce field not indexed"));
   dialog.setPreference('warning', true);
   dialog.setPreference('title', getMessage("None of fields configured to coalesce are indexed on the target table. Unindexed coalesce fields may impact performance during transformation. If you want to create an index, click OK. Otherwise, click Cancel to return to your transform map."));
   dialog.setPreference('defaultButton', 'ok_button');
   dialog.setPreference('onPromptComplete', onPromptComplete);
   dialog.render(); //Open the dialog
}

function onPromptComplete(){
	openIndexCreatorDialog();
}

function openIndexCreatorDialog(){
	var gDialog = new GlideDialogWindow("dialog_index_create");
    gDialog.setSize(400, 250);
    gDialog.setPreference('index_table', g_scratchpad.targetTable);
    gDialog.setPreference('index_fields', g_scratchpad.coalesceFieds);
    gDialog.setPreference('table', 'dialog_index_create');
    gDialog.setTitle(getMessage("Create a New Index"));
    gDialog.render();
}