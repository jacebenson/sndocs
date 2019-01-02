var SurveyCoreUtils = Class.create();

SurveyCoreUtils.prototype = {
	initialize: function() {
	},

	assessmentHasResult: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_result');
		gr.addQuery('source_id', metricTypeId);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},

	assessmentsWithResult: function() {
		var gr = new GlideRecord('asmt_metric_type');
		var list = '';
		gr.addJoinQuery('asmt_metric_result', 'sys_id', 'source_id');
		gr.query();
		while (gr.next())
			list += gr.sys_id + ',';
		return list;
	},

	isSurvey: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.evaluation_method == 'survey';
	},

	isQuiz: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.evaluation_method == 'quiz';
	},

	isTestPlan: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.evaluation_method == 'testplan';
	},

	isAttest: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.evaluation_method == 'attestation';
	},

	isAsmt: function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.evaluation_method == 'assessment';
	},

	surveyIsPublic: function(metricTypeId){
		var gr = new GlideRecord('asmt_metric_type');
		if (!gr.get(metricTypeId))
			return false;

		return gr.allow_public;
	},

	getTriggerConditionMetricType:function() {
		var mt = [];
		var metricType = new GlideRecord('asmt_metric_type');
		metricType.addActiveQuery();
		metricType.query();
		while(metricType.next()) {
			if(metricType.evaluation_method != 'survey' || metricType.schedule_period == 0){
				mt.push(metricType.getValue('sys_id'));
			}
		}
		return 'sys_idIN' + mt.join(',');
	},

	type: 'SurveyCoreUtils'
};