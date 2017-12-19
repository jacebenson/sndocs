var sysid = g_request.getParameter('sysparm_sys_id');
gs.log('** Exporting Activity Element ** ' + sysid);

// get the activity
var elementActivity = new GlideRecord('wf_element_activity');
elementActivity.get(sysid);

// name all the related lists
var exporter = new ExportWithRelatedLists('wf_element_activity', sysid);
exporter.addRelatedList('wf_condition_default', 'activity_definition');
exporter.addQuerySet('wf_versionable', 'wf_element_definition=' + sysid);
exporter.exportRecords(g_response);


var activityName = !JSUtil.nil(elementActivity.getValue('name')) ? elementActivity.getValue('name') + ' - ' + sysid : sysid;
gs.log('Element Activity Exported - ' + activityName);