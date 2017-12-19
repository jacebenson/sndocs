openAppFile();

function openAppFile() {
   var sysId = g_request.getParameter("sys_id");
   var sysSourceId = g_request.getParameter("sys_source_id");
   var file = new GlideRecord("sys_app_file");
   if (sysId != null) {
      file.addQuery("sys_id", sysId);
      file.query();
      if (file.next()) {
         g_response.sendRedirect(file.sys_source_table + ".do?sys_id=" + file.sys_source_id);
      }
   } else if (sysSourceId != null) {
      file.addQuery("sys_source_id", sysSourceId);
      file.query();
      if (file.next()) {
         g_response.sendRedirect("sys_app_file.do?sys_id=" + file.sys_id);
      }
   }
}