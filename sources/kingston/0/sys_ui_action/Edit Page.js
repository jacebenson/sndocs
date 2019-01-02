// save any updates
if (current.changes())
  current.update();


gs.setRedirect("edit_content.do?sysparm_sys_id=" + current.sys_id);