var DocumentAttachmentAjax = Class.create();

DocumentAttachmentAjax.prototype = Object.extendsObject(AbstractAjaxProcessor,
{
	
	process: function(){
		
		var attachmentId = this.getParameter("sysparm_attachment_id");
		var newName = this.getParameter("sysparm_new_name");
		
		
		var attachmentGR = new GlideRecord("sys_attachment");
		attachmentGR.addQuery("sys_id",attachmentId);
		attachmentGR.query();
		if(attachmentGR.next()){
			attachmentGR.setValue("file_name",newName);
			attachmentGR.update();
			return true;
		}
		
		return ;
	},
	
	/**
	 * Prevent Public access to this processor
	 */
	isPublic: function() {
		return false;
	},

	type : "DocumentAttachmentAjax"

});