var sysid = g_request.getParameter('sysparm_sys_id');
var exporter = new ExportWithRelatedLists('sys_remote_update_set', sysid);
exporter.addRelatedList('sys_remote_update_set', 'remote_base_update_set');
exporter.addRelatedList('sys_update_xml', 'remote_update_set.remote_base_update_set');

exporter.exportRecords(g_response);

var del = g_request.getParameter('sysparm_delete_when_done');
if (del == "true") {
  var ugr = new GlideRecord("sys_remote_update_set");
  ugr.addQuery("remote_base_update_set", sysid);
  ugr.query();
  while (ugr.next()) {
    ugr.deleteRecord();
  }
}