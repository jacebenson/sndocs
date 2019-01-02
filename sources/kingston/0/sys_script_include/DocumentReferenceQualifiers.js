var DocumentReferenceQualifiers = Class.create();

DocumentReferenceQualifiers.getUserPermissionQualifier = function(){
    return "roles=document_management_user";
};

DocumentReferenceQualifiers.getGroupPermissionQualifier = function(){
    return "roles=document_management_user";
};

DocumentReferenceQualifiers.getApproverQualifier = function(){
	return "";
};

DocumentReferenceQualifiers.getUserQualifier = function(){
    return "roles=document_management_user";
};