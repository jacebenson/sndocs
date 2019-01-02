var SPSurveyAPI = Class.create();
SPSurveyAPI.prototype = {
    initialize: function() {
    },

	getAssessmentInstance: function(gr) {
		function AssessmentInstance(gr) {
			this.state = gr.getValue('state');
			this.state_display = gr.getDisplayValue('state');
			this.allow_retake = gr.getDisplayValue('metric_type.allow_retake');
			this.sys_id = gr.getValue('sys_id');
			this.number = gr.getValue('number');
			this.due_date = gr.getValue('due_date');
			this.metric_type = gr.getValue('metric_type');
			this.display = gr.getDisplayValue('metric_type');
			this.description = gr.getDisplayValue('metric_type.description');
			this.trigger_id = gr.getValue('trigger_id');
			this.trigger_table = gr.getValue('trigger_table');
			this.trigger_display = gr.getDisplayValue('trigger_id').split(': ')[1];
			this.trigger_table_display = gr.getDisplayValue('trigger_id').split(': ')[0];
			this.trigger_description = gr.getDisplayValue('metric.description');
			this.percent_answered = gr.getValue('percent_answered');

			var dueIn = GlideDateTime.subtract(new GlideDateTime(this.due_date), new GlideDateTime()).getRoundedDayPart();
			this.due_display = (dueIn > 0) ? gs.getMessage('Expired') : (dueIn == 0) ? gs.getMessage('Due Today') : gs.getMessage('Due in') + ' ' + (0-dueIn) + 'd';

			this.can_retake = (this.state == 'complete' && this.allow_retake == 'true' && (dueIn <= 0));

			if (!!this.trigger_id && !!this.trigger_table) {
				var titleConfig = new GlideSysTitle(this.trigger_table);
				var titleGr = new GlideRecord(this.trigger_table);
				if(titleGr.get(this.trigger_id)){
					var trigger_desc = titleConfig.getTitle(titleGr);
					if (!trigger_desc)
						trigger_desc = titleGr.getDisplayValue();
					this.trigger_description = trigger_desc;
				}
			}
		}

		return new AssessmentInstance(gr);
	},

	getSurveys: function(maxLimit, showAll, data) {
		var gr = new GlideRecord('asmt_assessment_instance');
		gr.addQuery("metric_type.active", true);
		gr.addQuery("metric_type.publish_state", "published");
		gr.addQuery("preview", false);
		gr.addQuery('user', gs.getUserID());
		var sub = gr.addQuery('state', 'ready');
		sub.addOrCondition('state','wip');
		var sub1 = sub.addOrCondition('state','complete');
		sub1.addCondition("metric_type.allow_retake","true");
		sub1.addCondition("due_date", '>=', new GlideDateTime().getDisplayValue());
		gr.addQuery('metric_type.evaluation_method', 'survey');
		gr.orderByDesc('state');
		gr.orderBy('due_date');
		gr.orderBy('sys_created_on');
		gr.query();

		data.totalRecords = gr.getRowCount();
		data.instances = [];

		if (showAll)
			data.maxRecords = data.totalRecords;

		var count = 0;
		while (gr.next() && count < data.maxRecords) {
			var instance = this.getAssessmentInstance(gr);
			if (instance.state == 'complete' && instance.allow_retake == 'false')
				continue;
			data.instances.push(instance);
			count++;
		}
	},

	rearrangeDependentQuestions: function(questions) {
		var dependentsMap = {};
		var arrangedIdList = [];

		// Build dependentsMap
		questions.idList.forEach(function(id){ dependentsMap[id] = [] });
		questions.idList.forEach(function(id){
			var question = questions.idMap[id];
			if (!!question.depends_on && question.depends_on.length == 32) {
				var parentQuestion = questions.metricMap[question.depends_on];
				dependentsMap[parentQuestion].push(id);
			}
		});

		// Rearrange
		questions.idList.forEach(function(id) {
			var question = questions.idMap[id];
			if (!!question.depends_on && question.depends_on.length == 32)
				return;

			arrangedIdList.push(id);
			addDependents(id, arrangedIdList);
		});

		questions.idList = arrangedIdList;

		function addDependents(id, arrangedIdList) {
			if (id in dependentsMap && dependentsMap[id].length)
				dependentsMap[id].forEach(function(dependent) {
					arrangedIdList.push(dependent);
					addDependents(dependent, arrangedIdList);
				});
		}
	},

	loadSurvey: function(typeId, surveyId, data) {
		var surveyGR = new GlideRecord('asmt_assessment_instance');

		if (!surveyId && typeId)
			surveyId = new sn_assessment_core.AssessmentCreation().createOrGetAssessment(typeId, '', gs.getUserID());

		if(!surveyGR.get(surveyId)){
			return;
		}

		if(gs.getUserName() != "guest" && gs.getUserID() != surveyGR.getValue("user")){
			return;
		}

		/* Add intial data */
		data.instanceId = surveyId;
		data.instanceDuedate = surveyGR.getDisplayValue('due_date');
		data.introduction = surveyGR.getDisplayValue('metric_type.introduction');
		data.conclusion = surveyGR.getDisplayValue('metric_type.end_note');
		data.introduction = (data.introduction == 'null') ? '' : data.introduction;
		data.conclusion = (data.conclusion == 'null') ? '' : data.conclusion;
		data.title = surveyGR.getDisplayValue('metric_type') + '';
		data.state = surveyGR.getValue('state') + '';
		data._attachmentGUID = gs.generateGUID();
		data.trigger_id = surveyGR.getValue('trigger_id');
		data.trigger_table = surveyGR.getValue('trigger_table');
		data.trigger_display = surveyGR.getDisplayValue('trigger_id').split(': ')[1];
		data.allow_retake = surveyGR.metric_type.allow_retake + '';
		data.pagination = surveyGR.metric_type.portal_pagination + '';
		data.parameterizedMsgsMap = getMessages();

		var dueIn = GlideDateTime.subtract(new GlideDateTime(data.instanceDuedate), new GlideDateTime()).getRoundedDayPart();
		data.can_retake = (data.state == 'complete' && data.allow_retake == 'true' && (dueIn <= 0));

		if (!!surveyGR.getValue('signature') && !!surveyGR.getDisplayValue('signature.assertion') && surveyGR.getDisplayValue('metric_type.allow_public') != 'true') {
			data.signature = {
				label: surveyGR.getDisplayValue('signature.assertion'),
				sys_id: surveyGR.getValue('signature'),
				type: surveyGR.signature.type + '',
				username: gs.getUserName()
			};

			if (data.signature.type == 'full_name')
				data.signature.value = gs.getUserDisplayName();
		}

		//data.trigger_table_display = gr.getDisplayValue('trigger_id').split(': ')[0];
		if(data.trigger_id){
			var titleConfig = new GlideSysTitle(data.trigger_table);
			var titleGr = new GlideRecord(data.trigger_table);
			if(titleGr.get(data.trigger_id)){
				var trigger_desc = titleConfig.getTitle(titleGr);
				if (!trigger_desc)
					trigger_desc = titleGr.getDisplayValue();
				data.trigger_desc = trigger_desc;
			}
		}
		/* Fetch list of questions */
		var gr = new GlideRecord('asmt_assessment_instance_question');
		gr.addQuery('instance', surveyId);
		gr.orderBy('category.order');
		gr.orderBy('metric.order');
		gr.query();

		data.questions = {idList: [], idMap:{}, metricMap:{}};
		data.categories = {idList: [], idMap: {}};
		while (gr.next()) {
			var asmtQuestion = new AssessmentQuestion(gr);
			if (asmtQuestion.sys_id == null || asmtQuestion.metric == null)
				continue;

			data.questions.idList.push(asmtQuestion.sys_id);
			data.questions.idMap[asmtQuestion.sys_id] = asmtQuestion;
			data.questions.metricMap[asmtQuestion.metric] = asmtQuestion.sys_id;
		}

		/* Rearrange dependent questions */
		this.rearrangeDependentQuestions(data.questions);

		/* Category Mapping */
		data.questions.idList.forEach(function(id) {
			var question = data.questions.idMap[id];
			var category = question.category;

			if (category.sys_id in data.categories.idMap) {
				data.categories.idMap[category.sys_id].questions.push(question.sys_id);
			} else {
				data.categories.idList.push(category.sys_id);
				data.categories.idMap[category.sys_id] = category;
				data.categories.idMap[category.sys_id].questions = [question.sys_id];
			}
		});

		/* Sort Categories */
		data.categories.idList = data.categories.idList.sort(function(cat1, cat2) {
			return data.categories.idMap[cat1].order - data.categories.idMap[cat2].order;
		});

		/* Create template groups */
		var previousQType = '';
		var previousTemplateId = '';
		var templateGroupNumber = -1;
		data.templateGroups = [];

		data.questions.idList.forEach(function (questionId) {
			var question = data.questions.idMap[questionId];
			if (question.type == 'template') {
				if (previousQType == 'template' && previousTemplateId == question.template.sys_id) {
					data.templateGroups[templateGroupNumber].questions.push(questionId)
				} else {
					question.template.firstQuestion = true;
					var templateGroup = {questions:[questionId]};
					templateGroup.choices = question.template.choices.map(function(choice) {return choice.label});
					data.templateGroups[++templateGroupNumber] = templateGroup;
				}

				question.templateGroup = templateGroupNumber;
				previousTemplateId = question.template.sys_id;
			}
			else if (question.type == 'ranking') {
				question.choices.sort(function(a, b) {return a.order - b.order});
				if (question.randomize && question.choices.reduce(function (x, y) {return x && y.value == '-1'}, true))
					question.choices = randomizeChoices(question.choices);
			}
			previousQType = question.type;
		});


		function loadImageChoices(choice, gr) {
			choice.selected_image = gr.getDisplayValue('selected_image');
			choice.unselected_image = gr.getDisplayValue('unselected_image');
		}

		function getNotApplicableChoice(uniqueId) {
			return {label: gs.getMessage('Not Applicable'), value: '-1', sys_id: uniqueId + '_NOTAPPLICABLESYSID'};
		}

		/* Helpder function that fetches the choices for questions that have them */
		function fetchChoices(allowNA, metric, type, value, metricDefinitionId) {
			var choices = allowNA ? [getNotApplicableChoice(metric)] : [];
			var gr = new GlideRecord('asmt_metric_definition');
			gr.addQuery('metric', metric);
			gr.orderBy('order');
			gr.query();
			while (gr.next()) {
				var choice = {label: gr.getDisplayValue('display'),
								sys_id: gr.getUniqueValue(),
								value: gr.getValue('value'),
								order: gr.getValue('order')};

				if (type == 'multiplecheckbox')
					choice.selected = (value == choice.value);
				if(type == 'ranking'){
					if(choice.sys_id == metricDefinitionId)
						choice.value = parseInt(value) > 0 ? value : "-1";
					else
						choice.value = "-1";
				}

				if (type == 'imagescale')
					loadImageChoices(choice, gr)

				choices.push(choice);
			}
			return choices;
		}

		function hasSelectedImageOnly(choices) {
			return choices.map(function(choice){
				return !!choice.selected_image && !choice.unselected_image;
			})
			.reduce(function(x, y){
				return x && y;
			}, true);
		}

		function hasAllUnSelectedImages(choices)
		{
			return choices.map(function(choice){
				return choice.unselected_image;
			})
			.reduce(function(x, y){
				return x && y;
			}, true);
		}

		function hasAllSelectedImages(choices){
			return choices.map(function(choice){
				return choice.selected_image;
			})
			.reduce(function(x, y){
				return x && y;
			}, true);
		}

		function randomizeChoices(choices) {
			var swap = function(arr, a, b) {
				var temp = arr[a];
				arr[a] = arr[b];
				arr[b] = temp;
			}

			var start = 0;
			if (choices.length >= 1 && choices[0].sys_id.indexOf('NOTAPPLICABLE') != -1)
				start = 1;

			for (var i=start; i<choices.length; i++) {
				var index = i + parseInt(Math.random() * (choices.length - i));
				swap(choices, i, index);
			}
			return choices;
		}

		function getTemplateData(gr, allowNA) {
			var template = {};
			var grTemplate = gr.metric.template;
			template.name = grTemplate.name + '';
			template.number = grTemplate.number + '';
			template.sys_id = grTemplate.sys_id + '';
			template.allow_image = (grTemplate.allow_image + '') == 'true';

			template.choices = allowNA ? [getNotApplicableChoice(template.sys_id)] : [];

			var templateChoiceGR = new GlideRecord('asmt_template_definition');
			templateChoiceGR.addQuery('template', template.sys_id);
			templateChoiceGR.orderBy('value');
			templateChoiceGR.query();

			while (templateChoiceGR.next()) {
				var choice = {label: templateChoiceGR.getDisplayValue('display'),
											value: templateChoiceGR.getDisplayValue('value'),
											sys_id: templateChoiceGR.getUniqueValue()};

				if (template.allow_image)
					loadImageChoices(choice, templateChoiceGR);

				template.choices.push(choice);
			}

			return template;
		}

		function AssessmentQuestion(gr) {
			this.sys_id = gr.getValue('sys_id');
			this.metric = gr.getValue('metric');
			this.category = {display: gr.getDisplayValue('category'), sys_id: gr.getValue('category'), order: parseInt(gr.category.order+'')};
			this.mandatory = Boolean(gr.getElement('metric.mandatory'));
			this.value = gr.getValue('value');
			this.details = gr.metric.details + '';
			this.randomize = ((gr.metric.randomize_answers + '') == 'true');

			this.label = gr.getDisplayValue('metric.question');
			this.attributes = "";
			this.type = gr.metric.datatype+'';
			this.name = 'ASMTQUESTION:' + this.sys_id;
			var allowNA = gr.getDisplayValue('metric.allow_not_applicable') == 'true';

			this.depends_on = gr.metric.depends_on + '';
			if (this.depends_on) {
				this.displayed_when = gr.metric.displayed_when + '';
				this.displayed_when_yesno = gr.metric.displayed_when_yesno + '';
				this.displayed_when_template = gr.metric.displayed_when_template + '';
				this.displayed_when_checkbox = gr.metric.displayed_when_checkbox + '';
			}

			switch (this.type) {
				case 'imagescale':
					this.choice = 0;
					this.choices = fetchChoices(allowNA, this.metric, this.type);
					this.selectedImageOnly = hasSelectedImageOnly(this.choices);
					this.unSelectedImageAllPresent = hasAllUnSelectedImages(this.choices);
					break;
				case 'multiplecheckbox':
					var metric = gr.metric + '';
					var value = gr.value + '';
					var found = false;
					data.questions.idList.forEach(function(questionId) {
						var question = data.questions.idMap[questionId];
						if (question.metric == metric) {
							question.choices.forEach(function(choice) {
								if (choice.value == value)
									choice.selected = true;
							});
							found = true;
						}
					});
					if (found) {
						// Null sys_id will be skipped from adding into the "data.questions" array
						this.sys_id = null;
						return null;
					}
					this.choices = fetchChoices(allowNA, this.metric, this.type, value);
					break;
				case 'ranking':
					var metricDefinitionId = gr.getValue("metric_definition");
					var metric = gr.metric + '';
					var value = gr.value + '';
					var found = false;
					data.questions.idList.forEach(function(questionId) {
						var question = data.questions.idMap[questionId];
						if (question.metric == metric) {
							question.choices.forEach(function(choice) {
								if (choice.sys_id == metricDefinitionId)
									choice.value = parseInt(value) > 0 ? value : "-1";
							});

							found = true;
						}
					});
					if (found) {
						// Null sys_id will be skipped from adding into the "data.questions" array
						this.sys_id = null;
						return null;
					}
					this.choices = fetchChoices(false, this.metric, this.type, value,metricDefinitionId);
					break;
				case 'attachment':
					break;
				case 'checkbox':
					this.value = gr.string_value + '' || 'false';
					break;
				case 'choice':
					this.choice = 0;
					this.choices = fetchChoices(allowNA, this.metric, this.type);
					this.value = this.value || '';
					if ((gr.metric.randomize_answers + '') == 'true')
						this.choices = randomizeChoices(this.choices);
					break;
				case 'date':
					this.value = gr.getDisplayValue('string_value');
					break;
				case 'datetime':
					this.value = gr.getDisplayValue('string_value');
					break;
				case 'duration':
					break;
				case 'scale':
					this.choice = 0;
					this.choices = fetchChoices(allowNA, this.metric, this.type);
					if ((gr.metric.randomize_answers + '') == 'true')
						this.choices = randomizeChoices(this.choices);
					break;
				case 'long': case 'percentage':
					this.minValue = parseInt(gr.metric.min);
					this.maxValue = parseInt(gr.metric.max);
					break;
				case 'numericscale':
					this.choice = 0;
					this.choices = fetchChoices(allowNA, this.metric, this.type);
					if ((gr.metric.randomize_answers + '') == 'true')
						this.choices = randomizeChoices(this.choices);
					break;
				case 'rating':
					break;
				case 'string':
					this.value = gr.getDisplayValue('string_value');
					this.multiLine = ('multiline' == (gr.metric.string_option + ''));
					break;
				case 'template':
					this.template = {firstQuestion: false};
					this.template = getTemplateData(gr, allowNA);
					this.selectedImageOnly = hasSelectedImageOnly(this.template.choices);
					this.unSelectedImageAllPresent = hasAllUnSelectedImages(this.template.choices);
					this.selectedImageAllPresent = hasAllSelectedImages(this.template.choices);
					this.choices = this.template.choices;
					break;
				case 'reference':
					this.value = gr.getValue('reference_id') || '';
					this.refTable = gr.metric.reference_table+'';

					if (this.refTable.length && this.value.length == 32) {
						var refGR = new GlideRecord(this.refTable);
						refGR.get(this.value);
						if (refGR)
							this.displayValue = refGR.getDisplayValue();
					}

					this.ed = {name: 'reference', reference:this.refTable};
					break;
				case 'boolean':
					var id = this.sys_id;
					this.choices = [{label:gs.getMessage('Yes'), value:1, sys_id: id + '_YESSYSID'}, {label:gs.getMessage('No'), value:0, sys_id: id + '_NOSYSID'}];
					if (allowNA)
						this.choices = [getNotApplicableChoice(this.sys_id)].concat(this.choices);
					break;
				default:
					break;
			}
		}
		
		function getMessages(){
			var messagesMap = {};
			messagesMap.mandatory = gs.getMessage('Mandatory');
			return messagesMap;
		}
	},
	isSurveyPublic : function(typeId){
		var metricType = new GlideRecord('asmt_metric_type');
		if (metricType.get(typeId))
			return metricType.allow_public;
		return false;
	},
	isSurveyInstancePublic : function(surveyId){
		var surveyInstance = new GlideRecord('asmt_assessment_instance');
		if (surveyInstance.get(surveyId))
			return this.isSurveyPublic(surveyInstance.getValue('metric_type'));
		return false;
	},
    type: 'SPSurveyAPI'
};