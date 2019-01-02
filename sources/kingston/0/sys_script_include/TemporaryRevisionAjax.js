var TemporaryRevisionAjax = Class.create();
TemporaryRevisionAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	createTemporaryRevision: function() {
		var documentManagementDB = new DocumentManagementDB();
		var publishedRevision = documentManagementDB.getPublishedRevisionByDocument(this.getParameter('sysparm_document_id'));
		var type = documentManagementDB.getTypeById(this.getParameter('sysparm_type'));
		var temporaryRevision = new Object();
		temporaryRevision.name = this.getParameter('sysparm_revision_name');
		temporaryRevision.note = "";
		temporaryRevision.owner = this.getParameter('sysparm_owner');
		temporaryRevision.author = gs.getUserID();
		temporaryRevision.type = this.getParameter('sysparm_type');
		temporaryRevision.revision_number = this.getParameter('sysparm_revision_number');
		
		var temporaryRevisionId = documentManagementDB.insertRevision(temporaryRevision);
		temporaryRevision.sys_id = temporaryRevisionId;
		return temporaryRevision.sys_id;
	},
	type: 'TemporaryRevisionAjax'
});