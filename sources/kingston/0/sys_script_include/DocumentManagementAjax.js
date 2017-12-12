var DocumentManagementAjax = Class.create();

DocumentManagementAjax.prototype = Object.extendsObject(AbstractAjaxProcessor,
{
	
	process: function(){
		this.documentManagementDB = new DocumentManagementDB();
		this.documentManagement = new DocumentManagement();
		var revision = new Object();

		revision.sys_id = this.getParameter("sysparm_sys_id");
		revision.name = this.getParameter("sysparm_name");
		revision.document = this.getParameter("sysparm_document_id");
		revision.revision_number = this.getParameter("sysparm_revision_number");
		revision.note = this.getParameter("sysparm_note");
		revision.attachment = this.getParameter("sysparm_attachment_id");

		
		var result = this.documentManagementDB.updateRevision(revision);
		
		this.documentManagementDB.deleteRevisionsNotAttachedToDocument();
		
		if(this.getParameter("sysparm_launch_workflow"))
			this.documentManagement.startWorkflowForRevision(revision.sys_id);
		
		if(this.getParameter("sysparm_check_in"))
			this.documentManagement.checkInDocument(revision,gs.getUserID());
		
		return result;
	},
	
	/**
	 * Prevent Public access to this processor
	 */
	isPublic: function() {
		return false;
	},

	type : "DocumentManagementAjax"

});