var DocumentCheckoutAJAX = Class.create();
DocumentCheckoutAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	processCheckout : function(){
		var documentManagement = new DocumentManagement();
		
		document_id = this.getParameter('sysparm_documentId');
		revision_id = this.getParameter('sysparm_revisionId');
		user_id = this.getParameter('sysparm_userId');
		
		documentManagement.checkOutDocument(document_id,revision_id, user_id);
	},
	
    type: 'DocumentCheckoutAJAX'
});