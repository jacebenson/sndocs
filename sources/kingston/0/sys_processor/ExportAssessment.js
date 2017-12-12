var sysid = g_request.getParameter('sysparm_sys_id');
var exporter = new ExportWithRelatedLists('asmt_metric_type', sysid);
exporter.addRelatedList('asmt_metric_category', 'metric_type');
exporter.addRelatedList('asmt_assessable_record', 'metric_type');
exporter.addRelatedList('asmt_metric', 'category.metric_type');
exporter.addRelatedList('asmt_metric_definition', 'metric.category.metric_type');
exporter.addRelatedList('asmt_m2m_category_assessment', 'category.metric_type');
exporter.addRelatedList('asmt_m2m_category_user', 'metric_category.metric_type');
exporter.addRelatedList('asmt_m2m_stakeholder', 'assessment_record.metric_type');
exporter.addRelatedList('asmt_decision_matrix', 'metric_type');
exporter.addRelatedList('asmt_m2m_xcategory_matrix', 'metric_category.metric_type');
exporter.addRelatedList('asmt_m2m_ycategory_matrix', 'metric_category.metric_type');
exporter.addRelatedList('asmt_condition', 'assessment');

var templateIDs = '';
var metrics = new GlideRecord('asmt_metric');
metrics.addQuery('metric_type', sysid);
metrics.query();
while (metrics.next()) {
    if(metrics.getValue('template')){
        if (templateIDs.length > 0)
            templateIDs += ',';
        templateIDs += metrics.getValue('template');
    }
}
if (templateIDs.length > 0){
    exporter.addQuerySet('asmt_template', 'sys_idIN' + templateIDs);
    exporter.addQuerySet('asmt_template_definition', 'templateIN' + templateIDs);
}

var metricType = new GlideRecord('asmt_metric_type');
metricType.get(sysid);
if(metricType.getValue('job')){
	exporter.addQuerySet('sys_trigger', 'sys_id=' + metricType.getValue('job'));
}

var triggerCondition = new GlideRecord('asmt_condition');
triggerCondition.addQuery('assessment', sysid);
triggerCondition.query();
if(triggerCondition.next()){
	exporter.addQuerySet('sys_script', 'sys_id=' + triggerCondition.getValue('business_rule'));
}

exporter.exportRecords(g_response);