// save any updates
if (current.changes())
   current.update();

// redirect to us
gs.setRedirect("map_page.do?sysparm_sys_id=" + current.sys_id);