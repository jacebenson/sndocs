function previewDocument(){
var dialogClass = GlideModal ? GlideModal : GlideDialogWindow;
var dialog = new dialogClass('sn_hr_core_Preview Pdf Attachment');
dialog.setTitle(getMessage('Preview Document'));
dialog.setPreference('sysparm_sys_id', g_form.getUniqueValue());
dialog.render();
}