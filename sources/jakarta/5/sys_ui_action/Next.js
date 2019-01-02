action.setRedirectURL(current);
current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);
gs.addInfoMessage("Use the related links to add questions, approvals and tasks"); 