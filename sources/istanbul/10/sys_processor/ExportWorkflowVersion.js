var sysid = g_request.getParameter('sysparm_sys_id');
gs.log('** Exporting Workflow Version ' + sysid);

// name all the related lists
var exporter = new ExportWithRelatedLists('wf_workflow_version', sysid);
exporter.addRelatedList('wf_stage', 'workflow_version');
exporter.addRelatedList('wf_activity', 'workflow_version');
exporter.addRelatedList('wf_condition', 'activity.workflow_version');
exporter.addRelatedList('wf_transition', 'to.workflow_version');
exporter.addRelatedList('wf_transition', 'from.workflow_version');
exporter.addRelatedList('wf_workflow_instance', 'workflow_version');

//get activity IDS so  we can get variables from sys_variable_value for each activity
var activityIds = [];
var allActivities = new GlideRecord('wf_activity');
allActivities.addQuery('workflow_version', sysid);
allActivities.query(); 
var activityIdsCondition = '';
while (allActivities.next()) {
    if (activityIdsCondition.length > 0)
        activityIdsCondition += ',';
    activityIdsCondition += allActivities.getValue('sys_id');
}

var msg = activityIdsCondition.length > 0 ? 'Activities exported: ' + activityIdsCondition : ' no activities exported in workflow';
if (activityIdsCondition.length > 0){
   exporter.addQuerySet('sys_variable_value', 'document_keyIN' + activityIdsCondition);
}

gs.log(msg);

// get the workflow parent id to get the workflow record and it's input variables
var wfVersion = new GlideRecord('wf_workflow_version');
wfVersion.get(sysid);
var wfParentId = wfVersion.getValue('workflow');

if (!JSUtil.nil(wfParentId)) {
    exporter.addQuerySet('wf_workflow', 'sys_id=' + wfParentId);
    exporter.addQuerySet('var_dictionary', 'model_id=' + wfParentId);
}

// get the workflow parent id to get the workflow record and it's input variables
// for sc variables
exporter.addQuerySet('wf_variable', 'workflow=' + sysid);
exporter.exportRecords(g_response);

var wfName = !JSUtil.nil(wfVersion.getValue('name')) ? wfVersion.getValue('name') + ' - ' + sysid : sysid;
gs.log('Workflow Version Exported - ' + wfName);