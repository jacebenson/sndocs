var AddTestTemplateAjax = Class.create();
AddTestTemplateAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	addTemplate: function() {
		var testId = this.getParameter('sysparm_test_id');
		var tableId = this.getParameter('sysparm_table_id');
		var templateId = this.getParameter('sysparm_template_id');
		var testName = this.getParameter('sysparm_test_name');
		
		if (!tableId)
			return;
		
		var templateStepIds = this._getTemplateSteps(templateId);
		
		var tableGR = this._getTableRecord(tableId);
		var testTableName = tableGR.name;
			
		if (!testId)
			testId = this._createANewTest(testName, templateStepIds);
		else
			this._setTestDescription(testId, templateStepIds);
		
		var nextOrder = this._getNextOrder(testId);
		
		var i;
		for (i = 0; i < templateStepIds.length; i++) {
			this._createStep(testId, templateStepIds[i], testTableName, nextOrder);
			nextOrder++;
		}
		return testId;
	},
	
	
	_createStep: function(testId, stepConfigId, testTableName, order) {
		var gr = new GlideRecord('sys_atf_step');
		gr.initialize();
		gr.test = testId;
		gr.order = order;
		gr.step_config = stepConfigId;
		if (gr.inputs.getVariablesRecord().isValidField('table'))
			gr.inputs.table = testTableName;
		gr.insert();
	},
	
	_getNextOrder: function(testId) {		
		var ga = new GlideAggregate('sys_atf_step');
		ga.addQuery('test', testId);
		ga.addAggregate('MAX', 'order');
		ga.groupBy('test');
		ga.query();
		var next = 1;
		if (ga.next())
			return parseInt(ga.getAggregate('MAX', 'order'), 10) + next;
		return next;
	},
	
	_createANewTest: function(testName, templateStepIds) {
		var atfTestGR = new GlideRecord('sys_atf_test');
		atfTestGR.initialize();
		atfTestGR.name = testName;
		atfTestGR.description = this._generateReminderMessage(templateStepIds);
		atfTestGR.insert();
		return atfTestGR.getUniqueValue();
	},
	
	_getStepTemplateReminderMap: function() {
		var stepReminderBySysId = {};
		var gr = new GlideRecord('sys_atf_step_config');
		gr.query();
		while (gr.next()) {
			stepReminderBySysId[gr.getUniqueValue()] = gr.getValue('template_reminder');
		}
		return stepReminderBySysId;
	},
	
	_generateReminderMessage: function(stepConfigIds) {
		var stepReminder = this._getStepTemplateReminderMap();
		var i;
		var message = "Test generated from template. To complete this test do the following:\n";
		for (i = 1; i <= stepConfigIds.length; i++) {
			message += i + ". " + stepReminder[stepConfigIds[i-1]] + "\n";
		}
		return message;
	},
	
	_getTableRecord: function(tableId) {
		var gr = new GlideRecord('sys_db_object');
		gr.get(tableId);
		return gr;
	},
	
	_getTemplateSteps: function(templateId) {
		var gr = new GlideRecord('sys_atf_test_template');
		gr.get(templateId);
		var steps = gr.template;
		return steps.split(',');
	},
	
	_getTestRecord: function(testId) {
		var gr = new GlideRecord('sys_atf_test');
		gr.get(testId);
		return gr;
	},
	
	_setTestDescription: function(testId, stepConfigIds) {
		var testGR = this._getTestRecord(testId);
		var desc = testGR.description;
		if (desc != "")
			desc += "\n" + this._generateReminderMessage(stepConfigIds);
		else
			desc = this._generateReminderMessage(stepConfigIds);
		testGR.setValue('description', desc);
		testGR.update();
	},
	
    type: 'AddTestTemplateAjax'
});