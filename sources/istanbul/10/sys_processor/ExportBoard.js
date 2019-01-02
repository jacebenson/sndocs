var sysid = g_request.getParameter('sysparm_sys_id');
var exporter = new ExportWithRelatedLists('vtb_board', sysid);
exporter.addRelatedList('vtb_card', 'board');
exporter.addRelatedList('vtb_lane', 'board');
exporter.addRelatedList('vtb_board_member', 'board');

var taskIDs = '';
var vtbTasks = new GlideRecord('vtb_card');
vtbTasks.addQuery('board', sysid);
vtbTasks.query();
while (vtbTasks.next()) {
	if (taskIDs.length > 0)
		taskIDs += ',';
	taskIDs += vtbTasks.getValue('task');
}
if (taskIDs.length > 0)
	exporter.addQuerySet('vtb_task', 'sys_idIN' + taskIDs);

exporter.setAttachments(true);
exporter.exportRecords(g_response);