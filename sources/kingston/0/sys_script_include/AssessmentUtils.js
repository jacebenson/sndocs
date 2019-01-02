var AssessmentUtils = Class.create();

AssessmentUtils.prototype = {
	initialize : function() {
	},
	
	getAssessment : function(metricTypeId) {

		var surveyInfo = {};

		//Read the metric type info
		var metricType = new GlideRecord('asmt_metric_type');
		metricType.addQuery('sys_id', metricTypeId);
		metricType.query();
		metricType.next();
		surveyInfo.name = metricType.getValue('name');
		surveyInfo.description = metricType.getValue('name');
		surveyInfo.surveyId = metricTypeId;
		surveyInfo.assignToUsers = this.getAssignToUsers(metricTypeId);


		// Read all the metrics(questions)
		var metrics = [];
		var metricInfo = new GlideRecord('asmt_metric');
		metricInfo.addQuery('metric_type', metricTypeId);
		metricInfo.orderBy('order');
		metricInfo.query();

		while (metricInfo.next()) {
			var metric = {};
			metric.name = metricInfo.getValue('name');
			metric.datatype = metricInfo.getValue('datatype');
			metric.depends_on = metricInfo.getValue('depends_on');
			metric.sys_id = metricInfo.getValue('sys_id');
			metric.auto_gen = metricInfo.getValue('auto_gen');
			metric.scored = metricInfo.getValue('scored');
			metric.active = metricInfo.getValue('active');
			metric.hasResult = this.metricHasResult(metricInfo.getValue('sys_id'));

			var options = {};
			switch (metricInfo.getValue('datatype')) {
				case 'scale':
				case 'choice':
					//Read all the answers (metric definitions)
					options = [];
					var answers = new GlideRecord('asmt_metric_definition');
					answers.addQuery('metric', metricInfo.getValue('sys_id'));
					answers.orderBy('order');
					answers.query();
					while (answers.next()) {
						options.push({
							"sys_id" : answers.getValue('sys_id'),
							"answer" : answers.getValue('display')
						});
					}
					break;

				case 'long':
				case 'percentage':
				case 'numericscale':
					options = {
						'min' : metricInfo.getValue('min'),
						'max' : metricInfo.getValue('max')
					};
					break;

				case 'string':
					options = {
						'textSize' : metricInfo.getValue('string_option')
					};
					break;

				case 'boolean':
					if (metric.scored == 1) {
						metric.datatype = 'attestation';
						options = {	'correct_answer' : metricInfo.getValue('correct_answer'), 'explain' : this.getDependentExplainText(metric.sys_id) };
					}

					break;

				case 'template':
					options = {
						'templateType' : metricInfo.getValue('template')
					};
					break;

				default:
					break;
			}

			metric.options = options;
			metrics.push(metric);
		}

		surveyInfo.metrics = metrics;
		return (new JSON()).encode(surveyInfo);
	},
	
	createAssessments: function(typeId, sourceId, userId, groupId) {
		return (new SNC.AssessmentCreation()).createAssessments(typeId, sourceId, userId, false, groupId);
	},
	
	// Get assessments for this type, source, user, and delete if they are not started, otherwise close
	removeAssessments: function(typeId, groupId, userId) {
		var gr = GlideRecord('asmt_assessment_instance');
		gr.addQuery('assessment_group', groupId);
		gr.addQuery('user', userId);
		gr.query();
		while (gr.next()) {
			if (gr.state == 'ready')
				this.deleteInstance(gr);
			else
				this.closeInstance(gr);		
		}
	},
	
	// Close all assessments in this group.
	closeAssessments: function(groupId) {
		var gr = GlideRecord('asmt_assessment_instance');
		gr.addQuery('assessment_group', groupId);
		gr.query();
		while (gr.next()) 
			this.closeInstance(gr);		
	},
	
	deleteInstance: function(grInst) {
		if (grInst.sys_id) { // Checking record and id are valid
			var delQuestions = GlideRecord('asmt_assessment_instance_question');
			delQuestions.addQuery('instance', grInst.sys_id);
			delQuestions.query();
			delQuestions.deleteMultiple();			
		}
		grInst.deleteRecord();
	},
	
	closeInstance: function(grInst) {
		if (grInst.state != 'complete')
			grInst.state = 'canceled';
		if (grInst.due_date > gs.daysAgo(1))
			grInst.due_date = gs.daysAgo(1);
		grInst.update();		
	},
	
	metricHasResult : function(metricId) {
		var metric = new GlideRecord('asmt_metric_result');
		metric.addQuery('metric', metricId);
		metric.setLimit(1);
		metric.query();
		return metric.hasNext();
	},

	getDependentExplainText : function(metricId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('depends_on', metricId);
		metric.addQuery('auto_gen', true);
		metric.query();
		metric.next();
		return metric.getValue("name");
	},

	getAssignToUsers : function(metricTypeId) {
		var ctd_name = new GlideRecord('asmt_metric_type');
		ctd_name.get(metricTypeId);
		var name = ctd_name.getValue('name');

		var cat = new GlideRecord('asmt_metric_category');
		cat.addQuery('metric_type', metricTypeId);
		cat.addQuery('name', name);
		cat.orderBy('order');
		cat.query();
		cat.next();
		var catId = cat.sys_id;

		var users = [];
		var catUserGr = new GlideRecord('asmt_m2m_category_user');
		catUserGr.addQuery('metric_category', catId);
		catUserGr.orderBy('user');
		catUserGr.query();
		while (catUserGr.next()) {
			users.push({
				"user" : catUserGr.getValue("user"),
				"name" : catUserGr.getDisplayValue("user")
			});
		}
		return users;
	},

	getAllCategoryUsers : function(type_id) {
		var ids = [];
		var catUserGr = new GlideAggregate('asmt_m2m_category_user');
		catUserGr.addQuery('metric_category.metric_type', type_id);
		catUserGr.orderBy('user');
		catUserGr.setUnique(true);
		catUserGr.query();
		while (catUserGr.next())
			ids.push(catUserGr.getValue("user"));

		return ids.join(",");
	},

	getTypeFilter : function() {
		var view = gs.getSession().getClientData("asmt_view");
		if (view)
			return "evaluation_method=" + view;
		else
			return "";
	},

	checkRecord : function(current, metricType) {
		var mt = new GlideRecord('asmt_metric_type');
		mt.get(metricType);
		var condition = mt.condition;
		
		var sourceRecord = new GlideRecord(current.getTableName());
		sourceRecord.addQuery('sys_id', current.sys_id);
		sourceRecord.addEncodedQuery(condition);
		sourceRecord.query();
		
		var gr = new GlideRecord("asmt_assessable_record");
		gr.addQuery("source_id", current.sys_id);
		gr.addQuery("source_table", current.getTableName());
		gr.addQuery("metric_type", metricType);
		gr.query();
		
		// if the source record does not match the metric type condition
		if (!sourceRecord.hasNext()) {
			// if the metric type has enforce condition set to true and
			// there is a matching assessable record, delete it
			if (mt.enforce_condition && gr.hasNext()) {
				gr.next();
				gr.deleteRecord();
			}
			return;
		}
		
		// if the source record matches the metric type condition
		// and there is no assessable record, create one
		if (sourceRecord.hasNext() && !gr.hasNext()) {
			gr.source_id = current.sys_id;
			gr.source_table = current.getTableName();
			gr.name = current.name;
			gr.metric_type = metricType;
			gr.insert();
		}
	},
	
	checkDeleteRecord: function(current, metricType, showError) {
		var gr = new GlideRecord('asmt_metric_result');
		gr.addQuery('metric.metric_type', metricType);
		gr.addQuery('source_id', current.sys_id);
		gr.addQuery('source_table', current.getTableName());
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			if (showError)
				gs.addErrorMessage(gs.getMessage('Items with related metric results cannot be deleted'));
			return false;
		}

		gr = new GlideRecord('asmt_category_result');
		gr.addQuery('metric_type', metricType);
		gr.addQuery('source_id', current.sys_id);
		gr.addQuery('source_table', current.getTableName());
		gr.setLimit(1);
		gr.query();
		if (gr.next()) {
			if (showError)
				gs.addErrorMessage(gs.getMessage('Items with related category results cannot be deleted'));
			return false;
		}

		gr = new GlideRecord('asmt_assessable_record');
		gr.addQuery('metric_type', metricType);
		gr.addQuery('source_id', current.sys_id);
		gr.addQuery('source_table', current.getTableName());
		gr.deleteMultiple();
		
		gr = new GlideRecord('asmt_assessment_instance_question');
		gr.addQuery('instance.metric_type', metricType);
		gr.addQuery('source_id', current.sys_id);
		gr.addQuery('source_table', current.getTableName());
		gr.deleteMultiple();
		return true;
	},

	domainsAreEqual : function(domain1, domain2) {
		if (this.domainNormalize(domain1) == this.domainNormalize(domain2))
			return true;
		return false;
	},

	domainNormalize : function(domainValue) {
		var domain = '';
		if ((domainValue === undefined) || domainValue.nil())
			return domain;
		if (domainValue.indexOf('global') >= 0)
			return domain;
		// When domainValue is Java string then rihno errors out because of
		// ambiguity. Java String has both replace(CharSequence,CharSequence)
		// and replace(String,String).
		return j2js(domainValue).replace(/^\s+|\s+$/g, ''); // trim
	},

	domainIsGlobal : function(domainValue) {
		return (this.domainNormalize(domainValue) == '');
	},

	defaultMatrix : function(current) {
		var gr = new GlideRecord("asmt_decision_matrix");
		gr.addQuery("isdefault", true);
		gr.addQuery("metric_type", "881df17dd7240100fceaa6859e610366");
		gr.query();
		if (!gr.hasNext()) {
			gr = new GlideRecord("asmt_decision_matrix");
			gr.addQuery("metric_type", "881df17dd7240100fceaa6859e610366");
			gr.query();
		}

		if (gr.next())
			return gr.sys_id.toString();
		else
			return null;
	},

	hasAssessmentRoles : function(roles) {
		var isAdmin = gs.hasRole('admin') || gs.hasRole('assessment_admin');
		if (isAdmin)
			return true;
		try {
			var Roles = roles.split(',');
			for (var i = 0; i < Roles.length; i++) {
				if (gs.hasRole(Roles[i]))
					return true;
			}
		} catch (e) {
			gs.log('AssessmentUtils:hasAssessmentRoles: Exception: ' + e);
		}
		return false;
	},

	createStakeholders : function(categoryUserSys, assessmentSys) {
		var stakeholder = new GlideRecord("asmt_m2m_stakeholder");
		stakeholder.addQuery("category_user", categoryUserSys);
		stakeholder.addQuery("assessment_record", assessmentSys);
		stakeholder.query();
		if (!stakeholder.hasNext()) {
			stakeholder.initialize();
			stakeholder.category_user = categoryUserSys;
			stakeholder.assessment_record = assessmentSys;
			stakeholder.insert();
		}
	},

	getMetricTypeFilters : function(metricTypeId) {
		var metricType = new GlideRecord('asmt_metric_type');

		metricType.get(metricTypeId);
		var table = metricType.table + '';
		var condition = metricType.condition + '';
		var groupField = metricType.display_field + '';
		var filterTable = metricType.filter_table + '';
		var filterCondition = metricType.filter_condition + '';
		var showAllGroups = metricType.display_all_filters;

		return this.getFilters(metricTypeId, table, groupField, condition, filterTable, filterCondition, showAllGroups);
	},

	getFilters : function(metricTypeId, table, groupField, condition, filterTable, filterCondition, showAllGroups) {

		var uniqueGroups = {};
		if (filterTable == '')
			return [];

		var groupIsReference = false;
		if (table != filterTable)
			groupIsReference = true;
		else {
			var type = new GlideRecord(table);
			var refFieldType = type.getElement(groupField).getED().getInternalType();
			if (refFieldType == 'glide_list' || refFieldType == 'reference')
				groupIsReference = true;
		}

		if (!groupIsReference) {
			var gr1 = new GlideAggregate(table);
			gr1.addEncodedQuery(filterCondition);
			gr1.groupBy(groupField);
			gr1.query();
			while (gr1.next()) {
				var value = gr1[groupField] || '';
				uniqueGroups[value] = true;
			}
		} else if (showAllGroups == 'true' || showAllGroups == true) {
			var gr2 = new GlideRecord(filterTable);
			gr2.addEncodedQuery(filterCondition);
			gr2.query();
			uniqueGroups[''] = true;
			while (gr2.next())
				uniqueGroups[gr2.sys_id + ''] = true;
		} else {
			var acceptableValuesMap = {};
			var gr3 = new GlideRecord(filterTable);
			gr3.addEncodedQuery(filterCondition);
			gr3.query();
			while (gr3.next())
				acceptableValuesMap[gr3.sys_id + ''] = true;

			var gr4 = new GlideAggregate(table);

			var domain = this.getMetricDomain(metricTypeId);
			if (domain != null)
				gr4.addQuery('sys_domain', domain);
			if (condition)
				gr4.addEncodedQuery(condition);
			gr4.groupBy(groupField);
			gr4.query();

			while (gr4.next()) {
				var groupValues = gr4[groupField];
				if (!groupValues && !filterCondition) {
					uniqueGroups[''] = true;
					continue;
				}

				groupValues = groupValues.split(',');
				for (var i = 0; i < groupValues.length; i++) {
					if (groupValues[i] in acceptableValuesMap)
						uniqueGroups[groupValues[i]] = true;
				}
			}
		}

		var allOptions = [];
		for ( var key in uniqueGroups) {
			if (key === undefined || key == null)
				continue;
			if (key == '') {
				allOptions.push({
					display : '(empty)',
					value : '(empty)'
				});
			} else if (!groupIsReference) {
				allOptions.push({
					display : key,
					value : key
				});
			} else
				allOptions.push(this._getReferenceOption(key, filterTable));
		}

		// Sort by display
		allOptions.sort(function(a, b) {
			if (a.display < b.display)
				return -1;
			else if (a.display > b.display)
				return 1;
			else
				return 0;
		});

		return allOptions;
	},

	_getReferenceOption : function(value, table) {
		var gr = new GlideRecord(table);
		gr.get(value);
		var display = gr.getDisplayValue();
		return {
			display : display,
			value : value
		};
	},

	getMetricDomain : function(id) {
		if (!GlidePluginManager.isRegistered('com.glide.domain'))
			return null;

		var gr = new GlideRecord('asmt_metric_type');
		gr.get(id);
		return gr.sys_domain + '';
	},

	// Survey Instance Table URL
	getAssessmentInstanceURL : function(/* String */instance) {
		var gr = new GlideRecord("asmt_assessment_instance");
		var type = '';
		if (gr.get(instance)) {
			var asmtRec = new GlideRecord("asmt_metric_type");
			asmtRec.addQuery("sys_id", gr.getValue("metric_type"));
			asmtRec.query();
			if (asmtRec.next())
				type = asmtRec.getValue("sys_id");
		}
		var instanceURL = gs.getProperty("glide.servlet.uri");
		var overrideURL = gs.getProperty("glide.email.override.url");
		var url = "";
		if(this.redirectToPortal() == 'true'){
			if(asmtRec.allow_public)
				url = instanceURL + this.defaultServicePortal + '?id=public_survey&instance_id='+instance;
			else
				url = instanceURL + this.defaultServicePortal + '?id=take_survey&instance_id='+instance;
		}
		else{
			if (overrideURL)
				instanceURL = overrideURL;
			else
				instanceURL = instanceURL + "nav_to.do";

			url = instanceURL + '?uri=assessment_take2.do%3Fsysparm_assessable_type=' + type + '%26sysparm_assessable_sysid=' + instance;
		}
		
		return url;
	},

	// External Survey URL; includes processor that will auto create instance for
	// unassigned Survey/Assessments
	getAssessmentTypeURL : function(/* String */type) {
		var url = gs.getProperty('glide.servlet.uri');
		var isSurveyPublic = false;
		var eval_method = "";
		var typeGr = new GlideRecord("asmt_metric_type");
		if(typeGr.get(type)){
			isSurveyPublic = typeGr.allow_public;
			eval_method = typeGr.evaluation_method;
		}
		if(eval_method == "survey" && this.redirectToPortal()=="true"){
			if(isSurveyPublic)
				url += this.defaultServicePortal + '?id=public_survey&type_id=' + type;
			else
				url += this.defaultServicePortal + '?id=take_survey&type_id=' + type;
		}
		else{
			if(isSurveyPublic)
				url += 'assessment_take2.do?sysparm_assessable_type=' + type;
			else
				url += 'nav_to.do?uri=assessment_take2.do%3Fsysparm_assessable_type=' + type;
		}
		
		return url;
	},

	redirectToPortal : function(){
		var isServicePortalActive = pm.isActive("com.glide.service-portal") 
								&& pm.isActive("com.glide.service-portal.survey");
		var emailRedirectProp = gs.getProperty("sn_portal_surveys.sp_survey.email_redirection", false);
		var hasDefaultPortal = false;
		var redirectToPortal = false;
		if(isServicePortalActive){
			var gr = new GlideRecord('sp_portal');
			gr.addQuery('default', 'true');
			gr.query();
			if (gr.next()) {
				hasDefaultPortal = true;
				this.defaultServicePortal = gr.getValue('url_suffix');
			}
		}
		redirectToPortal = isServicePortalActive && hasDefaultPortal && emailRedirectProp;
		return redirectToPortal;
	},

	//Hide button "Send Invitations" if there is no user or metric for the survey.
	hasUserAndMetric : function(metricType) {
		var countQuestions = 0;
		var countUsers = 0;
		var metricGr = new GlideRecord('asmt_metric');
		metricGr.addQuery('metric_type', metricType.sys_id);
		metricGr.setLimit(1);
		metricGr.query();
		countQuestions = metricGr.getRowCount();
		if (countQuestions == 0)
			return false;
		var gr = new GlideRecord('asmt_metric_category');
		gr.addQuery('metric_type', metricType.sys_id);
		gr.addJoinQuery('asmt_m2m_category_user', 'sys_id', 'metric_category');
		gr.setLimit(1);
		gr.query();
		countUsers = gr.getRowCount();
		return countUsers > 0;
	},

	// Hide Invite User if no questions
	hasSurveyQuestions : function(metricType) {
		var gr = new GlideRecord('asmt_metric');
		gr.addQuery('category.metric_type', metricType.sys_id);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},

	createAssessment : function(surveyInfo, method, state, surveyId, editMode) {

		editMode = (editMode == 'true');
		var metricTypeId = '';
		try {

			var surveyInfoObj = (new JSONParser()).parse(surveyInfo);
			var survey_name = surveyInfoObj.name;
			var description = surveyInfoObj.description;
			var metrics = surveyInfoObj.metrics;

			var metricType = new GlideRecord('asmt_metric_type');

			var preview = metricType.get(surveyId);

			if (editMode || preview) {
				metricTypeId = surveyId;

				metricType.name = survey_name;
				metricType.evaluation_method = method;
				metricType.publish_state = state;
				metricType.description = description;
				metricType.update();

				this.clearMetrics(metricTypeId);

			} else {
				metricType = new GlideRecord('asmt_metric_type');
				metricType.name = survey_name;
				metricType.evaluation_method = method;
				metricType.publish_state = state;
				metricType.description = description;

				//This is the pre-generated id.
				if (surveyId)
					metricType.setNewGuidValue(surveyId);

				//There is a business rule here to
				//create a default category if it does not exists.
				metricTypeId = metricType.insert();
			}

			var ctd_name = new GlideRecord('asmt_metric_type');
			ctd_name.get(metricTypeId);
			var name = ctd_name.getValue('name');

			//In a business rull, insert category if it does not exist.
			var defaultCategory = new GlideRecord('asmt_metric_category');
			defaultCategory.addQuery('metric_type', metricTypeId);
			defaultCategory.addQuery('name', name);
			defaultCategory.query();

			if (defaultCategory.next()) {

				for (var i = 0; i < metrics.length; i++) {

					var metricInfo = metrics[i];

					var metric = new GlideRecord('asmt_metric');

					var metric_sys_id = metricInfo.sys_id;
					if (metric_sys_id && editMode) {
						metric.addQuery('sys_id', metric_sys_id);
						metric.query();
						metric.next();
					} else {
						metric.initialize();
						metric.category = defaultCategory.sys_id;
					}

					if (metricInfo.active === "false")
						metric.active = false;
					else
						metric.active = true;

					metric.name = metricInfo.question;
					metric.question = metricInfo.question;
					metric.datatype = metricInfo.type;

					metric.order = i * 50 + 100;
					metric.scale = "high";
					var explain = "";
					var correct_answer = "";

					var options = metricInfo.options;

					switch (metricInfo.type) {
						case 'scale':
						case 'choice':
							metric.min = 0;
							metric.max = options.length - 1;
							break;

						case 'long':
						case 'percentage':
						case 'numericscale':
							metric.min = options.min;
							metric.max = options.max;
							break;

						case 'string':
							metric.string_option = options.textSize;
							break;

						case 'template':
							var minMax = this.getTemplateMinMax(options.templateType);
							metric.template = options.templateType;
							metric.min = minMax.min;
							metric.max = minMax.max;
							break;

						// datatype 'attestation' is only used on UI.
						case 'attestation':
							metric.datatype = 'boolean';
							metric.correct_answer = options.correct_answer;
							metric.mandatory = 1;
							correct_answer = options.correct_answer;
							explain = options.explain;

						case 'checkbox':
							metric.min = 0;
							metric.max = 1;
							break;

						default:
							break;
					}

					//clear the scored flag when user change from attestation to others.
					if (metricInfo.type === 'attestation')
						metric.scored = 1;

					
					//update scored and mandatory when question type changes
					if (metric.datatype != 'attestation' && metric.scored == true && metricInfo.type != 'attestation' && editMode) {
						var grr = new GlideRecord('asmt_metric');
						grr.get(metric.sys_id);
						if (grr.getValue('datatype') == 'boolean' && grr.getValue('scored') == true) {
							metric.scored = false;
							metric.mandatory = false;
						}
					}

					//insert asmt_metric
					var metricId = '';
					if (metric_sys_id && editMode) {
						metric.update();
						metricId = metric_sys_id;
					} else {
						metric.metric_type = metricTypeId;
						metricId = metric.insert();
					}

					// update or add answers for Choice and Likert
					if (metricInfo.type == 'scale' || metricInfo.type == 'choice') {
						for (var k = 0; k < options.length; k++) {
							var metricDef1 = new GlideRecord('asmt_metric_definition');

							var metricDef_sys_id = options[k].sys_id;
							if (metricDef_sys_id && editMode) {
								metricDef1.addQuery('sys_id', metricDef_sys_id);
								metricDef1.query();
								metricDef1.next();
							} else {
								metricDef1.initialize();
							}

							metricDef1.display = options[k].answer;
							metricDef1.value = k;
							metricDef1.order = k + 100;
							metricDef1.metric = metricId;

							if (metricDef_sys_id && editMode) {
								metricDef1.update();
							} else {
								//insert asmt_metric_definition
								metricDef1.insert();
							}
						}
					}

					// add a dependent question.
					if (method === 'attestation') {
						explain = explain.trim();
						if (!this.hasDependent(metricId))
							this.addDependentQuestion(metricId, correct_answer, explain);
						else
							this.updateDependentQuestion(metricId, correct_answer, explain);
					}

				}

				this.deleteEmptyMetrics(metricTypeId);
				this.deleteEmptyMetricDefs();
				this.deleteObsoleteDependents();

				this.setOrder(metricTypeId);
				return metricTypeId;
			}

		} catch (e) {
			gs.log('AssessmentUtils:createSurvey: Exception: ' + e);
		}
	},

	setOrder : function(metricTypeId) {
		var gr = new GlideRecord('asmt_metric');
		gr.addQuery('metric_type', metricTypeId);
		gr.orderBy('order');
		gr.query();
		while (gr.next()) {
			var order = gr.getValue('order');
			this.sortDependents(gr.getValue('sys_id'), order);
		}
	},

	sortDependents : function(metricId, order) {
		var gr = new GlideRecord('asmt_metric');
		gr.addQuery('depends_on', metricId);
		gr.orderByDesc('auto_gen');
		gr.orderBy('order');
		gr.query();
		while (gr.next()) {
			gr.setValue('order', ++order);
			gr.update();
		}
	},

	hasDependent : function(metricId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('depends_on', metricId);
		metric.addQuery('auto_gen', true);
		metric.query();
		return metric.hasNext();
	},

	// add a single dependent question to the underlying attestation question.
	addDependentQuestion : function(metricId, correct_answer, explain) {
		var gr = new GlideRecord('asmt_metric');
		gr.get(metricId);

		var q = new GlideRecord("asmt_metric");
		q.initialize();
		q.name = explain;
		q.question = explain;
		q.string_option = 'wide';
		q.datatype = 'string';
		q.auto_gen = 1;
		q.mandatory = 1;

		q.method = 'assessment';
		q.metric_type = gr.getValue('metric_type');
		q.category = gr.getValue('category');
		q.depends_on = metricId;

		if (correct_answer == "0")
			q.displayed_when_yesno = 1;
		else
			q.displayed_when_yesno = 0;

		q.weight = 10;
		q.max_weight = 20;
		q.order = 100;
		if (gr.active)
			q.active = 1;
		else
			q.active = 0;

		q.insert();
		
	},

	// update dependent question in case the correct answer has changed.
	updateDependentQuestion : function(metricId, correct_answer, explain) {
		var gr = new GlideRecord("asmt_metric");
		gr.get(metricId);

		var q = new GlideRecord("asmt_metric");
		q.addQuery('depends_on', metricId);
		q.addQuery('auto_gen', true);
		q.query();
		q.next();
		if (correct_answer == "0")
			q.displayed_when_yesno = 1;
		else
			q.displayed_when_yesno = 0;
		q.name = explain;
		q.question = explain;
		q.mandatory = 1;
		if (gr.active)
			q.active = 1;
		else
			q.active = 0;
		q.update();
	},

	deleteEmptyMetrics : function(metricTypeId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type', metricTypeId);
		metric.addQuery('name', '');
		metric.query();
		while (metric.next()) {
			//delete related answers
			this.deleteMetricDefs(metric.getValue('sys_id'));
			//delete dependent questions
			this.deleteDependentMetrics(metric.getValue('sys_id'));
			metric.deleteRecord();
		}
	},

	deleteObsoleteDependents : function(metricTypeId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type', metricTypeId);
		metric.addQuery('auto_gen', 1);
		metric.query();
		while (metric.next()) {
			var dependsOn = metric.getValue('depends_on');
			if (!this.attestationMetricExists(dependsOn))
				metric.deleteRecord();
		}
	},

	attestationMetricExists : function(sys_id) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('sys_id', sys_id);
		metric.addQuery('scored', 1);
		metric.query();
		return metric.hasNext();
	},

	deleteDependentMetrics : function(metricId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('depends_on', metricId);
		metric.deleteMultiple();
	},

	deleteMetricDefs : function(metricId) {
		var metricDef = new GlideRecord('asmt_metric_definition');
		metricDef.addQuery('metric', metricId);
		metricDef.deleteMultiple();
	},

	deleteEmptyMetricDefs : function() {
		var metricDef = new GlideRecord('asmt_metric_definition');
		metricDef.addQuery('metric', '');
		metricDef.deleteMultiple();
	},

	clearMetrics : function(metricTypeId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type', metricTypeId);
		//TODO: leave the dependent questions alone for now.
		metric.addNullQuery('depends_on');
		metric.query();
		while (metric.next()) {
			this.clearMetricDefs(metric.getValue('sys_id'));
			metric.setValue('name', '');
			metric.setValue('auto_gen', 0);
			metric.update();
		}
	},

	clearMetricDefs : function(metricId) {
		var metricDef = new GlideRecord('asmt_metric_definition');
		metricDef.addQuery('metric', metricId);
		metricDef.query();
		while (metricDef.next()) {
			metricDef.setValue('metric', '');
			metricDef.update();
		}
	},

	removeAssessment : function(metricTypeId) {
		try {
			var metricType = new GlideRecord('asmt_metric_type');
			metricType.get(metricTypeId);
			metricType.deleteRecord();
		} catch (e) {
			gs.log('AssessmentUtils:createSurvey: Exception: ' + e);
		}
		return;
	},

	// Do case insensitive condition check
	conditionCheck : function(current, condition) {
		var filter = new GlideFilter(condition, '');
		filter.setCaseSensitive(false);

		// check to see if current matches condition
		return filter.match(current, true);
	},

	getTemplateMinMax : function(template) {

		var gr = new GlideAggregate("asmt_template_definition");
		gr.addQuery("template", template);
		gr.addAggregate("MIN", "value");
		gr.addAggregate("MAX", "value");
		gr.groupBy('template');
		gr.query();

		gr.next();
		var min = gr.getAggregate("MIN", "value");
		var max = gr.getAggregate("MAX", "value");

		var result = {
			min : min,
			max : max
		};
		return result;
	},
	
	addSourcesToAssessment : function(sourceId, asmtId) {
		new SNC.AssessmentCreation().addSourcesToAssessment(sourceId, asmtId);
	},
	
	deleteMetricResults : function(record, metricTypeId) {
		var metric = new GlideRecord('asmt_metric');
		metric.addQuery('metric_type', metricTypeId);
		metric.query();
		while(metric.next()) {
			var amr = new GlideRecord('asmt_metric_result');
			amr.addQuery('metric', metric.sys_id + '');
			amr.addQuery('source_id', record.sys_id);
			amr.addQuery('source_table', record.getTableName());
			amr.query();
			amr.deleteMultiple();
		}
	},
	
	deleteCategoryResults : function(record, metricTypeId) {
		var catResult = new GlideRecord('asmt_category_result');
		catResult.addQuery('metric_type', metricTypeId);
		catResult.addQuery('source_id', record.sys_id);
		catResult.addQuery('source_table', record.getTableName());
		catResult.query();
		catResult.deleteMultiple();
	},
	
	//Util method to check for an integer. On server side js, it does not look like there is a common util method to do this
	isInteger : function(text) {
		if (text == null)
			return true;
		var validChars = "0123456789,-";
		return this._containsOnlyChars(validChars, text);
	},
	
	canDeleteMetric : function(metricGR){
		var metricResultGR = new GlideRecord('asmt_metric_result');
		var canDelete = true;
		if(metricGR != null){
			if(metricGR.datatype == 'attachment'){
				metricResultGR.addQuery('metric',metricGR.getUniqueValue());
				metricResultGR.query();
				var metricResultSysID = [];
				while(metricResultGR.next()){
					metricResultSysID.push(metricResultGR.getUniqueValue());
				}
				var attachmentGR = new GlideRecord('sys_attachment');
				attachmentGR.addQuery('table_name','asmt_metric_result');
				attachmentGR.addQuery('table_sys_id', 'IN',metricResultSysID.join());
				attachmentGR.query();
					if(attachmentGR.hasNext())
						canDelete = false;
			}else{
				var encodedQuery = 'metric.datatypeINdate,datetime,string^string_valueISNOTEMPTY^metric=';
				encodedQuery += metricGR.getUniqueValue();
				encodedQuery += '^NQmetric.datatype=reference^reference_value!=-1^metric=';
				encodedQuery += metricGR.getUniqueValue();
				encodedQuery += '^NQmetric.datatypeINchoice,imagescale,scale,multiplecheckbox,long,numericscale,percentage,ranking,template,boolean^actual_value!=-1^metric=';
				encodedQuery += metricGR.getUniqueValue();
				encodedQuery += '^NQmetric.datatype=checkbox^metric=';
				encodedQuery += metricGR.getUniqueValue();
				metricResultGR.addEncodedQuery(encodedQuery);
				metricResultGR.query();
				if(metricResultGR.hasNext())
					canDelete = false;
			}
		}
		return canDelete;
	},

	_containsOnlyChars : function(validChars, sText) {
		var IsNumber=true;
		var c;
		for (var i = 0; i < sText.length && IsNumber == true; i++) { 
			c = sText.charAt(i); 
			if (validChars.indexOf(c) == -1) {
				IsNumber = false;
			}
		}
		return IsNumber;   
	},

	type : 'AssessmentUtils'
};