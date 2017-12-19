var MigrateSurveyToAssessment = Class.create();
MigrateSurveyToAssessment.prototype = {
	initialize: function() {
		this.domain = 'global';
		this.assessable = null;
	},
	
	// Public entry level migrate function with an assessable record to tie the survey onto.
	migrateSurvey : function(surveyId) {
		var surveyMaster = this._getGlideRecordById('survey_master', surveyId);

		if (surveyMaster && surveyMaster.isValidRecord()) {
			var surveyName = surveyMaster.name;
			var metricTypeId = this._setMetricType(surveyMaster);	
		
			// Link the survey master to the metricTypeId of the migrated survey
			surveyMaster.assessment = metricTypeId;
			surveyMaster.update();
			
			// Get the assessment objects			
			var metricCategoryId = this._getMetricCategory(metricTypeId);
			this._setAssessable(metricTypeId, metricTypeId);
			
			// Migrate the records from survey to the Assessment objects
			this._migrateSurveyQuestionRecords(surveyId, metricTypeId, metricCategoryId);
			this._migrateSurveyInstanceRecords(surveyId, metricTypeId, metricCategoryId);

			//After migrating all the survey instances, we can set the Send Notification flag back to true.
			var metricType = new GlideRecord("asmt_metric_type");
			if(metricType.get(metricTypeId)){
				metricType.notify_user = true;
				metricType.update();
			}
		}
	},
	
	// Check to see if a Survey has already been migrated,  Returns true if it has, false otherwise.
	surveyIsMigrated : function(surveyId) {
		var surveyMaster = this._getGlideRecordById('survey_master', surveyId);
		var metricType = new GlideRecord('asmt_metric_type');
		metricType.addQuery('name', surveyMaster.name);	
		metricType.setLimit(1);
		metricType.query();
		return metricType.hasNext();
	},
	
	_setMetricType : function(surveyMaster) {
		var metricType = new GlideRecord('asmt_metric_type');
		metricType.initialize();
		metricType.name = surveyMaster.name;
		metricType.introduction = surveyMaster.introduction;
		metricType.end_note = surveyMaster.end_note;
		metricType.table = 'asmt_metric_type';
		var metricTypeId = metricType.setNewGuid();
		metricType.condition = 'sys_id=' + metricTypeId;
		metricType.scale_factor = 10;
		
		metricType.evaluation_method = 'survey';
		metricType.description = surveyMaster.name;
		metricType.display_field = 'name';
		metricType.publish_state = 'published';
		//We want to set the Send Notification flag to false, so when migrating survey instances, it won't generate any emails.
		metricType.notify_user = false;
		metricType.insert();
		return metricTypeId;
	},
	
	_setAssessable : function(sourceId, metricTypeId) {
		var assessableRecord = new GlideRecord("asmt_assessable_record");
		assessableRecord.addQuery("source_id", sourceId);
		assessableRecord.addQuery("metric_type", metricTypeId);
		assessableRecord.setLimit(1);
		assessableRecord.query();
		if (assessableRecord.next()) 
			this.assessable = assessableRecord;
	},

	_setAssessmentCategoryRecord : function(metricCategoryId) {
		var categoryAssessment = new GlideRecord('asmt_m2m_category_assessment');
		categoryAssessment.initialize();
		categoryAssessment.category = metricCategoryId;
		if (this.assessable)
			categoryAssessment.assessment_record = this.assessable.sys_id;
		return categoryAssessment.insert();
	},
	
	_setAssessment : function(metricTypeId) {
		var assessment = new GlideRecord('asmt_assessment');
		assessment.metric_type = metricTypeId;	
		assessment.sys_domain = this.domain;
		return assessment.insert();
	},
	
	_setAssessmentInstance : function(surveyInstance, groupId, metricTypeId) {
		var assessmentInstance = new GlideRecord('asmt_assessment_instance');
		assessmentInstance.user = surveyInstance.taken_by;
		assessmentInstance.due_date = surveyInstance.taken_on;
		assessmentInstance.setValue('taken_on',surveyInstance.getValue('taken_on'));
		assessmentInstance.metric_type = metricTypeId;	
		assessmentInstance.assessment_group = groupId;
		assessmentInstance.state = 'wip';
		assessmentInstance.sys_domain = this.domain;
                var taskSurvey = new GlideRecord('task_survey');
                taskSurvey.addQuery('instance', surveyInstance.getUniqueValue());
                taskSurvey.query();
                if(taskSurvey.next()) {
                   var taskGr = new GlideRecord('task');
                   if(taskGr.get(taskSurvey.task)) {
                      assessmentInstance.trigger_table = taskGr.sys_class_name;
                      assessmentInstance.trigger_id = taskGr.getUniqueValue();
                   }
                }
		return assessmentInstance.insert();
	},
	
	_setAssessmentInstanceQuestion : function(surveyInstance, instanceId, metricTypeId, groupId, categoryId) {
		var surveyResponse = new GlideRecord('survey_response');
		surveyResponse.addQuery('instance', surveyInstance.sys_id);
		surveyResponse.query();

		while (surveyResponse.next()) {
			var metric = this._getMetric(surveyResponse.question, metricTypeId);	
			if (metric) {
				var instanceQuestion = new GlideRecord('asmt_assessment_instance_question');
				instanceQuestion.metric = metric.sys_id;
				instanceQuestion.category = categoryId;
				instanceQuestion.instance = instanceId;
				instanceQuestion.sys_domain = this.domain;
				if (this.assessable) {
					instanceQuestion.source_id = this.assessable.source_id;
					instanceQuestion.source_table = this.assessable.source_table;
				}
				if (surveyResponse.answer_integer)
					instanceQuestion.value = surveyResponse.answer_integer;
				else
					instanceQuestion.value = 0;
				if ((metric.datatype == 'boolean' || metric.datatype == 'checkbox') && (surveyResponse.response == 'Yes' || surveyResponse.response == 'true') )
					instanceQuestion.value = 1;
				if (metric.datatype == 'choice' || metric.datatype == 'scale') {
					var choice = new GlideRecord('question_choice');
					choice.addQuery('question', surveyResponse.question.sys_id);
					choice.addQuery('value', surveyResponse.response);
					choice.query();
					if (choice.next()) {
						var metricDefinition = new GlideRecord('asmt_metric_definition');
						metricDefinition.addQuery('display', choice.text);
						metricDefinition.addQuery('metric', metric.sys_id);
						metricDefinition.query();
						if (metricDefinition.next()) {
							instanceQuestion.value = metricDefinition.value;
						}
					}
				}

				if ('string,datetime'.indexOf(metric.datatype) >= 0)
					instanceQuestion.string_value = surveyResponse.response;

				else if ('checkbox'.indexOf(metric.datatype) >= 0) {
					if (surveyResponse.response == 'true' || surveyResponse.response == 'on' || surveyResponse.response == 'Yes')
						instanceQuestion.string_value = 'true';
					else
						instanceQuestion.string_value = 'false';
				}

				instanceQuestion.insert();
			}
		}
	},
	
	_setCategoryUsers : function(surveyInstance, categoryId) {		
		var categoryUser = new GlideRecord('asmt_m2m_category_user');
		categoryUser.initialize();
		categoryUser.user = surveyInstance.taken_by;
		categoryUser.name = surveyInstance.taken_by.name + '(' + surveyInstance.survey.name + ')';
		categoryUser.metric_category = categoryId;
		categoryUser.domain = this.domain;
		categoryUser.insert();
	},

	_migrateSurveyQuestionRecords : function(surveyId, metricTypeId, metricCategoryId) {
		var question = new GlideRecord('survey_question_new');
		
		question.addQuery('master', surveyId);
		question.query();
		while (question.next()) {
			var datatype = this._getAssessmentDatatype(question, metric);
			if (datatype) {
				var metric = new GlideRecord('asmt_metric');
				metric.name = question.question_text;
				metric.mandatory = question.mandatory;
				metric.question = question.question_text;
				metric.order = question.order;
				metric.category = metricCategoryId;
				metric.metric_type = metricTypeId;
				metric.datatype = datatype;
				if (datatype == 'long') {
					metric.max = question.scale_max;
					metric.min = question.scale_min;
				}
				else {
					metric.max = 1;
					metric.min = 0;
				}
				if (datatype == 'string')
					this._setStringOption(question, metric);
				
				metric.method = 'assessment';
				metric.scale = 'high';
				metric.allow_not_applicable = 0;
				metric.domain = this.domain;
				var metricId = metric.insert();
				
				this._migrateQuestionChoices(question.sys_id, metricId);
			}
			else
				gs.addInfoMessage(gs.getMessage('Cannot migrate question: {0}', question.question_text));
		}
	},
	
	_migrateQuestionChoices : function(questionId, metricId) {
		var choice = new GlideRecord('question_choice');
		choice.addQuery('question', questionId);
		choice.orderBy('order');
		choice.orderBy('text');
		choice.query();
		
		var value = 1;
		while (choice.next()) {
			var metricDefinition = new GlideRecord('asmt_metric_definition');
			metricDefinition.initialize();
			metricDefinition.display = choice.text;
			metricDefinition.metric = metricId;
			metricDefinition.value = value++;  // value must be a decimal
			metricDefinition.insert();
		}
		
		if (value > 1) {
			var metric = this._getGlideRecordById('asmt_metric', metricId);
			metric.min = 1;
			metric.max = value - 1;
			metric.update();
			var question = this._getGlideRecordById('survey_question_new', questionId);
			gs.addInfoMessage(gs.getMessage('Review migration of choices for question: {0}', question.question_text));
		}
	},
	
	_migrateSurveyInstanceRecords : function(surveyId, metricTypeId, metricCategoryId) {
		var surveyInstance = new GlideRecord('survey_instance');
		surveyInstance.addQuery('survey', surveyId);
		surveyInstance.query();
		while (surveyInstance.next()) {
			var assessmentGroupId = this._setAssessment(metricTypeId);
			var assessmentInstanceId = this._setAssessmentInstance(surveyInstance, assessmentGroupId, metricTypeId);
			this._setAssessmentInstanceQuestion(surveyInstance, assessmentInstanceId, metricTypeId, assessmentGroupId, metricCategoryId);
			
			var assessmentInstance = this._getGlideRecordById('asmt_assessment_instance', assessmentInstanceId);
			assessmentInstance.state = 'complete';
			assessmentInstance.update();
			
			this._setCategoryUsers(surveyInstance, metricCategoryId);
		}
	},
	
	// Get the metric from the name and the metric type
	_getMetric : function(questionId, metricTypeId) {
		var gr = this._getGlideRecordById('survey_question_new', questionId);
		if (gr) {
			var metric = new GlideRecord('asmt_metric');
			metric.addQuery('name', gr.question_text);
			metric.addQuery('metric_type', metricTypeId);
			metric.addQuery();
			metric.setLimit(1);
			metric.query();
			if (metric.next()) 
				return metric;
		}
		return null;
	},
	
	_getAssessmentDatatype : function(survey_question) {
		switch (Number(survey_question.type)) {
			case 1: // YES_NO
				return 'boolean';
			case 2: // TEXTAREA
				return 'string';
			case 3: // RADIO_CHOICES
				return 'scale';
			case 4: // Numeric scale
				return 'long';
			case 5: // CHOICE_LIST:
				return 'choice';
			case 6: // TEXTFIELD:
				return 'string';
			case 7: // CHECKBOX
				return 'checkbox';
			case 8: // REFERENCE
				return null;
			case 9: // DATE
				return 'date';
			case 10: // DATE_TIME
				return 'datetime';
			case 11: // LABEL
				return null;
			case 12: // BREAK
				return null;
			case 14: // RENDER_MACRO
				return null;
			case 15: // RENDER_UI_PAGE
				return null;
			case 16: // WIDE_TEXTFIELD
				return 'string';
			case 17: // RENDER_MACRO_WITH_LABEL
				return null;
			case 18: // LOOKUP_SELECT_BOX
				return null;
			case 19: // CONTAINER_START
				return null;
			case 20: // CONTAINER_END
				return null;
			case 21: // LIST_COLLECTOR
				return null;
			case 22: // LOOKUP_RADIO_CHOICES
				return null;
			case 23: // HTML
				return null;
			default:
				return null;
		}
	},
	
	_setStringOption : function(survey_question, metric) {
		switch (Number(survey_question.type)) {
			case 2: // TEXTAREA
				metric.string_option = 'multiline';
				return;
			case 6: // TEXTFIELD:
				metric.string_option = 'short';
				return;
			case 16: // WIDE_TEXTFIELD
				metric.string_option = 'wide';
				return;
			default:
				return;
		}
	},
	
	// Convenience method
	_getGlideRecordById : function(table, id) {		
		var gr = new GlideRecord(table);
		if (gr.get(id))
			return gr;
		return null;
	},
	
	_getMetricCategory : function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric_category');
		gr.addQuery('metric_type', metricTypeId);
		gr.query();
		if (gr.next())
			return gr.sys_id;
		
		return "";
	},
	
	type: 'MigrateSurveyToAssessment'
	
};