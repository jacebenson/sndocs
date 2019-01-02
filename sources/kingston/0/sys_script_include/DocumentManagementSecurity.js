var DocumentManagementSecurity = Class.create();

DocumentManagementSecurity.canReadDocumentRecord = function(document) {

  if (document.sys_id.nil())
    return true;

  if (gs.hasRole("document_management_admin"))
    return true;

  if (document.owner == gs.getUserID())
    return true;

  if (document.reviewers.toString().indexOf(gs.getUserID()) > -1)
    return true;

  if (gs.getUser().isMemberOf(document.owning_group))
    return true;

  if (DocumentManagementSecurity.isUserADocumentApprover(document))
    return true;

  var perm = new GlideRecord("dms_document_user_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("user", gs.getUserID());
  perm.addQuery("type", "IN", "Owner,Editor,Reader");
  perm.query();
  if (perm.hasNext())
    return true; 

  var perm = new GlideRecord("dms_document_group_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("group", getMyGroups());
  perm.addQuery("type", "IN", "Owner,Editor,Reader");
  perm.query();
  if (perm.hasNext())
    return true;

  return false;
};

DocumentManagementSecurity.canWriteDocumentRecord = function(document) {

  if(!(gs.hasRole("document_management_admin") || gs.hasRole("document_management_user")))
    return false;

  if (document.state == "inactive" || document.state == "cancelled")
    return false;
    
  if (!document.checked_out_by.nil() && document.checked_out_by != gs.getUserID())
    return false;
  
  if (document.sys_id.nil() || document.isNewRecord())
    return true;
  
  if (gs.hasRole("document_management_admin"))
    return true;
  
  if (document.owner == gs.getUserID())
    return true;
  
  if (gs.getUser().isMemberOf(document.owning_group))
    return true;
  
  var perm = new GlideRecord("dms_document_user_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("user", gs.getUserID());
  perm.addQuery("type", "IN", "Owner,Editor");
  perm.query();
  if (perm.hasNext())
    return true;

  var perm = new GlideRecord("dms_document_group_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("group", getMyGroups());
  perm.addQuery("type", "IN", "Owner,Editor");
  perm.query();
  if (perm.hasNext())
    return true;

  return false;
};

DocumentManagementSecurity.canDeleteDocumentRecord = function(document) {
  if (gs.hasRole("document_management_admin"))
    return true;

  if (document.owner == gs.getUserID())
    return true;

  if (gs.getUser().isMemberOf(document.owning_group))
    return true;

  if (!document.checked_out_by.nil() && document.checked_out_by != gs.getUserID())
    return false;

  var perm = new GlideRecord("dms_document_user_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("user", gs.getUserID());
  perm.addQuery("type", "Owner");
  perm.query();
  if (perm.hasNext())
    return true;

  var perm = new GlideRecord("dms_document_group_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("group", getMyGroups());
  perm.addQuery("type", "Owner");
  perm.query();
  if (perm.hasNext())
    return true;

  return false;
};

DocumentManagementSecurity.canEditDocumentSecurity = function(id) {
  if (gs.hasRole("document_management_admin"))
    return true;

  var document = DocumentManagementSecurity.getDocument(id);
  if (document.owner == gs.getUserID())
    return true;

  if (gs.getUser().isMemberOf(document.owning_group))
    return true;

  var perm = new GlideRecord("dms_document_user_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("user", gs.getUserID());
  perm.addQuery("type", "Owner");
  perm.query();
  if (perm.hasNext())
    return true;

  var perm = new GlideRecord("dms_document_group_permission");
  perm.addQuery("document", document.sys_id);
  perm.addQuery("group", getMyGroups());
  perm.addQuery("type", "Owner");
  perm.query();
  if (perm.hasNext())
    return true;

  return false;
};

DocumentManagementSecurity.canDeleteDocumentID = function(id) {
  var doc = DocumentManagementSecurity.getDocument(id);
  return DocumentManagementSecurity.canDeleteDocumentRecord(doc);
};

DocumentManagementSecurity.canWriteDocumentID = function(id) {
  if (id == "")
    return true;

  var doc = DocumentManagementSecurity.getDocument(id);
  return DocumentManagementSecurity.canWriteDocumentRecord(doc);
};

DocumentManagementSecurity.canReadDocumentID = function(id) {
  if (id == "")
    return true;
    
  var doc = DocumentManagementSecurity.getDocument(id);
  return DocumentManagementSecurity.canReadDocumentRecord(doc);
};

DocumentManagementSecurity.getDocument = function(id) {
  var doc = new GlideRecord("dms_document");
  doc.get(id);
  return doc;
};

DocumentManagementSecurity.isUserADocumentApprover = function(document){
  var gr = new GlideRecord("approval_sequence");
  gr.addQuery("document_id", document.sys_id);
  gr.addQuery("user", gs.getUserID());
  gr.query();
  return gr.hasNext();
};

DocumentManagementSecurity.isUserADocumentReviewer = function(document){
	if(!document.reviewers)
		return false;
	
	var position = document.reviewers.indexOf(gs.getUser().getID());
	if(position>=0)
		return true;
	return false;
};

DocumentManagementSecurity.doesDocumentHaveUserPermission = function(documentId){
	var db = new DocumentManagementDB();
	var userPermissions = db.getUserPermissionsByDocumentId(documentId);
	if(userPermissions.length>0){
		return true;
	} else {
		return false;
	}
};

DocumentManagementSecurity.doesDocumentHaveGroupPermission = function(documentId){
	var db = new DocumentManagementDB();
	var groupPermissions = db.getUserPermissionsByDocumentId(documentId);
	if(groupPermissions.length>0){
		return true;
	} else {
		return false;
	}
};

DocumentManagementSecurity.canWriteApprovalSequence = function(approvalSequence){

	if (gs.hasRole("document_management_admin"))
    	return true;

	var db = new DocumentManagementDB();
	var document = db.getDocumentById(approvalSequence.document_id,true);
    	
	if (document.owner == gs.getUserID())
    	return true;
    	
	var perm = new GlideRecord("dms_document_user_permission");
	perm.addQuery("document", approvalSequence.document_id);
	perm.addQuery("user", gs.getUserID());
	perm.addQuery("type", "Owner");
	perm.query();
	if (perm.hasNext())
		return true;
	
	var perm = new GlideRecord("dms_document_group_permission");
	perm.addQuery("document", approvalSequence.document_id);
	perm.addQuery("group", getMyGroups());
	perm.addQuery("type", "Owner");
	perm.query();
	if (perm.hasNext())
		return true;

	return false;
};

DocumentManagementSecurity.canDeleteApprovalSequence = function(approvalSequence){
	return DocumentManagementSecurity.canWriteApprovalSequence(approvalSequence);
}