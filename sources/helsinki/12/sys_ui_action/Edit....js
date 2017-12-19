var uri = action.getGlideURI();
var path = uri.getFileFromPath();
uri.set('sysparm_m2m_ref', current.getTableName());
uri.set('sysparm_stack', 'no');
action.setRedirectURL(uri.toString('sys_m2m_template.do'));
