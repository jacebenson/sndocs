var AssessmentUtilsAJAX = Class.create();
AssessmentUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	getAssessment : function(){
		var surveyId = this.getParameter('sysparm_surveyId');
		var surveyInfo = new AssessmentUtils().getAssessment(surveyId);
		return surveyInfo;
	},
	
	getTemplateMinMax : function() {
		var template = this.getParameter('sysparm_template');

		var templateMinMax = new AssessmentUtils().getTemplateMinMax(template);
		var result = this.newItem("result");
		result.setAttribute("min", templateMinMax.min);
		result.setAttribute("max", templateMinMax.max);
	},

	getFilterTables : function() {
		var table = this.getParameter('sysparm_table');
		var parentTables = (new TableUtils(table)).getTables();

		var value = [];
		var label = [];
		var labelsAndValues = [];
		var labelsSeen = {};

		var dd = new GlideRecord('sys_dictionary');
		var qc = dd.addQuery('name', table);
		for (var i = 1; i < parentTables.size(); i++) {
			qc.addOrCondition('name', parentTables.get(i));
		}
		var qc2 = dd.addQuery('internal_type', 'glide_list');
		qc2.addOrCondition('internal_type', 'reference');

		dd.query();

		var tableLabelRecord = new GlideRecord(table);
		var tableLabel = tableLabelRecord.getLabel();
		var tableDisValue = tableLabel + ' [' + table + ']';
		labelsAndValues.push({
			'label' : tableDisValue,
			'value' : table
		});
		labelsSeen[tableDisValue] = true;

		while (dd.next()) {
			var actValue = '';
			if (dd.internal_type == 'glide_list' || dd.internal_type == 'reference')
				actValue = dd.reference + '';

			var tab = new GlideRecord("sys_db_object");
			tab.get("name", actValue);

			var disValue = tab.label + " [" + actValue + "]";
			if (!labelsSeen[disValue]) {
				labelsAndValues.push({
					'label' : disValue,
					'value' : actValue
				});
				labelsSeen[disValue] = true;
			}
		}

		// sort by label
		labelsAndValues.sort(function(objA, objB) {
			if (objA.label < objB.label)
				return -1;
			else if (objA.label == objB.label)
				return 0;
			else
				return 1;
		});

		for (var j = 0; j < labelsAndValues.length; j++) {
			label.push(labelsAndValues[j].label);
			value.push(labelsAndValues[j].value);
		}
		var result = this.newItem("result");
		result.setAttribute("value", value);
		result.setAttribute("label", label);
	},

	getReferenceFields : function() {
		var table = this.getParameter('sysparm_table');
		var parentTables = (new TableUtils(table)).getTables();

		var filter_table = this.getParameter('sysparm_filter_table');

		var value = [];
		var label = [];
		var dd = new GlideRecord('sys_dictionary');
		var qc = dd.addQuery('name', table);
		for (var i = 1; i < parentTables.size(); i++) {
			qc.addOrCondition('name', parentTables.get(i));
		}
		dd.addQuery('reference', filter_table);
		dd.orderBy('name');
		dd.query();

		while (dd.next()) {
			label.push(dd.column_label + '');
			value.push(dd.element + '');
		}
		var result = this.newItem("result");
		result.setAttribute("value", value);
		result.setAttribute("label", label);
	},

	getTableFields : function() {
		var sortCombos = function(o1, o2, fields) {
			var field = fields.pop();
			if (o1[field] < o2[field])
				return -1;
			else if (o1[field] > o2[field])
				return 1;
			else if (fields.length == 0)
				return 0;
			else {
				return sortCombos(o1, o2, fields);
			}
		};

		var filter_table = this.getParameter('sysparm_filter_table');
		
		if (!filter_table)
			return;

		var dd = new GlideRecord(filter_table);
		dd.initialize();
		var fields = dd.getFields();
		var combos = [];
		for (var i = 0; i < fields.size(); i++) {
			var field = fields.get(i);
			var descriptor = field.getED();
			var combo = {
				value : field.getName(),
				label : field.getLabel(),
				display : descriptor.isDisplay(),
				reference : descriptor.getReference(),
				referenceKey : descriptor.getReferenceKey()
			};
			combos.push(combo);
		}
		combos.sort(function(a, b) {
			return sortCombos(a, b, [ 'display', 'value', 'label' ]);
		});

		var fieldsProcessed = {};
		for (var j = 0; j < combos.length; j++) {
			if (!combos[j].value || fieldsProcessed[combos[j].value])
				continue;
			var result = this.newItem('result');
			result.setAttribute('value', combos[j].value);
			result.setAttribute('label', combos[j].label);
			result.setAttribute('display', combos[j].display);
			result.setAttribute('referenceKey', combos[j].referenceKey);
			result.setAttribute('reference', combos[j].reference);
			fieldsProcessed[combos[j].value] = true;
		}
	},

	getMetricTypeTable : function() {
		var metricType = this.getParameter('sysparm_metric_type');
		var gr = new GlideRecord('asmt_metric_type');
		if (gr.get(metricType))
			return String(gr.table);
		else
			return '';
	},

	isFieldCompatible : function(field, metricTypeTable, metricTypeTables) {
		var fieldTable = field.getReference();
		var fieldTables = GlideDBObjectManager.getTables(fieldTable);
		return fieldTables.contains(metricTypeTable) || metricTypeTables.contains(fieldTable);
	},

	getCompatibleFields : function() {
		var table = this.getParameter('sysparm_table');
		var tableDescriptor = GlideTableDescriptor.get(table);
		var fields = tableDescriptor.getActiveFieldNames();
		var value = '';
		var current = new GlideRecord('asmt_condition');
		if (current.get(this.getParameter('sysparm_id')))
			value = current.assessment_record_field;

		var metricTypeTable = this.getMetricTypeTable();
		var metricTypeTables = GlideDBObjectManager.getTables(metricTypeTable);
		for (var i = 0; i < fields.size(); ++i) {
			var fieldName = fields.get(i);
			var field = tableDescriptor.getElementDescriptor(fieldName);
			if (field.getInternalType() == "reference" && this
					.isFieldCompatible(field, metricTypeTable, metricTypeTables)) {
				var item = this.newItem('field');
				item.setAttribute('name', fieldName);
				item.setAttribute('label', field.getLabel());
				item.setAttribute('value', fieldName == value);
			}
		}
	},

	getFilters : function() {
		var id = this.getParameter('sysparm_id');

		var table = this.getParameter('sysparm_base_table');
		var groupField = this.getParameter('sysparm_group_field');
		var condition = this.getParameter('sysparm_condition');

		var filterTable = this.getParameter('sysparm_filter_table');
		var filterCondition = this.getParameter('sysparm_filter_condition');
		var showAllGroups = this.getParameter('sysparm_show_all_groups');

		var allOptions = (new AssessmentUtils())
				.getFilters(id, table, groupField, condition, filterTable, filterCondition, showAllGroups);
		var maxChoiceValues = GlideProperties.getInt("com.snc.assessment.decision_matrix_filter_max_entries",allOptions.length);
		maxChoiceValues = maxChoiceValues <= allOptions.length? maxChoiceValues:allOptions.length;
		for (var i = 0; i < maxChoiceValues; i++) {
			var item = this.newItem('group');
			item.setAttribute('display', allOptions[i].display);
			item.setAttribute('value', allOptions[i].value);
		}
	},
	
	createPreview : function() {
		try {
			var metricType = new AssessmentUtils().createAssessment(this.getParameter('sysparm_info'), this
					.getParameter('sysparm_method'), 'draft', this.getParameter('sysparm_surveyid'));
			var instance = new SNC.AssessmentCreation().createPreview(metricType, gs.getUserID());

			var item = this.newItem('preview');
			item.setAttribute('previewTypeId', metricType);
			item.setAttribute('instanceId', instance);
		} catch (e) {
			gs.log('AssessmentUtilsAjax:createSurvey: exception: ' + e);
		}
	},
	
	removePreview : function() {
		try {
			var type = this.getParameter('sysparm_type');
			var ac = new SNC.AssessmentCreation();

			var instances = new GlideRecord('asmt_assessment_instance');
			instances.addQuery('metric_type', type);
			instances.query();
			while (instances.next())
				ac.removePreview(instances.getUniqueValue());

			new AssessmentUtils().removeAssessment(type);
		} catch (e) {
			gs.log('AssessmentUtilsAjax:removePreview: exception: ' + e);
		}
	},
	
	checkAttachmentQuestions: function() {
		var result = {};
		var assessmentId = this.getParameter('sysparm_assessment_id');
		var question = new GlideRecord('asmt_assessment_instance_question');
		question.addQuery('instance', assessmentId);
		question.addQuery('metric.datatype', 'attachment');
		question.addQuery('metric.mandatory', true);
		question.query();
		while(question.next()) {
			var attachment = new GlideRecord('sys_attachment');
			attachment.addQuery('table_name', 'asmt_assessment_instance_question');
			attachment.addQuery('table_sys_id', question.sys_id + '');
			attachment.setLimit(1);
			attachment.query();
			result[question.sys_id + ''] = attachment.hasNext();				
		}
		var item = this.newItem("result");
		item.setAttribute("value", new JSON().encode(result));
	},
	
	checkAllowImage: function()
	{
		var template = this.getParameter('templateID');
		var gr = new GlideRecord('asmt_template');
		gr.get('sys_id',template);
		var allowed = gr.getValue('allow_image');
		return allowed; 
	},

	type : 'AssessmentUtilsAJAX'
});