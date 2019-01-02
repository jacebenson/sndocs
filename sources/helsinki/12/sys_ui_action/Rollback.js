function confirmRollback(){
    var dialog = new GlideDialogWindow('instance_rollback_confirm ', false);
	dialog.setTitle(" Rollback instance clone ");
	dialog.render(); 
}