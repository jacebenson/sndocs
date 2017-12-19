current.doRedirect = true;
action.setRedirectURL(current);
current.insert();
gs.include('ActionUtils');
var au = new ActionUtils();
au.postInsert(current);