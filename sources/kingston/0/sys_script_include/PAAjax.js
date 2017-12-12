var PAAjax = Class.create();

PAAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
	retrieveBreakdownSource: function() {

		// Check the type of dependent value. If dependent field is referring to dimensions then query for dimension in pa_breakdowns else query for breakdown source field directly
		var ref = this.getParameter('sysparm_ref');
		var ge = new GlideCompositeElement(ref);
		var ed = ge.getTargetED();
		var dependent = ed.getDependent();

		var gr = new GlideRecordSecure("pa_breakdowns");

		if (typeof dependent !== 'undefined' && dependent) {
			dependent = dependent.substring(0, dependent.indexOf('.'));
			ge = new GlideCompositeElement(ed.getTableName() + '.' + dependent);
			ed = ge.getTargetED();
			if (ed && ed.isReference()) {
				var dependentTableName = ed.getReference();
				if (dependentTableName == 'pa_dimensions') {
					gr.get('dimension', this.getValue());
					this.getRootElement().setAttribute("table", gr.dimension.facts_table);
					this.getRootElement().setAttribute("condition", gr.dimension.conditions);
					return;
				}
			}
		}

		gr.get(this.getValue());
		// if breakdown is External breakdown set different table and conditions
		if (gr.type == 3) {
			this.getRootElement().setAttribute("table", "pa_ext_elements");
			this.getRootElement().setAttribute("condition", "breakdown="+gr.sys_id);
			return;
		}
		this.getRootElement().setAttribute("table", this._getBreakdownSourceTargetTable(gr));
		this.getRootElement().setAttribute("condition", this._getBreakdownSoureConditions(gr));
	},

	getTableListViews: function () {
		var table = this.getValue();
		this.getRootElement().setAttribute('views', new SNC.PADBView().getTableListViews(table));
	},

	_getIndicatorFrequency: function(id) {
		if (id == null)
			return -1;
		var gr = new GlideRecord('pa_cubes');
		if (!gr.get(id))
			return -1;
		return gr.frequency;
	},

	_getSysPropertyIndex: function(frequency) {
		if (frequency == 10)
			return 0;
		else if (frequency == 20)
			return 1;
		else if (frequency == 30)
			return 2;
		else if (frequency == 35)
			return 3;
		else if (frequency == 40)
			return 4;
		else if (frequency == 50)
			return 5;
		else if (frequency == 60)
			return 6;
		else if (frequency == 65)
			return 7;
		else if (frequency == 70)
			return 8;
		else if (frequency == 80)
			return 9;
		else if (frequency == 85)
			return 10;
		else
			return -1;
	},

	_getScorePeriods: function() {
		return gs.getProperty('com.snc.pa.dc.keep_scores_for.frequency');
	},

	_getSnapshotPeriods: function() {
		return gs.getProperty('com.snc.pa.dc.keep_snapshots_for.frequency');
	},

	_getBreakdownSourceTargetTable: function(gr) {
		if (!gr.dimension)
			return null;

		var factsTable = gr.dimension.facts_table;
		var field = gr.dimension.field;
		if (field == 'sys_id')
			return factsTable;

		if (field.endsWith('.sys_id'))
			field = field.substring(0, String(field).length - 7);

		return this._getTargetTable(factsTable, field);
	},

	_getBreakdownSoureConditions: function(gr) {
		if (!gr.dimension)
			return null;

		var field = gr.dimension.field;
		if (field == 'sys_id')
			return gr.dimension.conditions;

		if (field.endsWith('.sys_id'))
			field = field.substring(0, String(field).length - 7);

		var targetTable = this._getBreakdownSourceTargetTable(gr);
		if (!targetTable)
			return null;

		var factsTable = gr.dimension.facts_table;
		return this._getEncodedConditions(factsTable, field, gr.dimension.conditions);
	},

	_getTargetTable: function(factsTable, field) {
		var ge = new GlideCompositeElement(factsTable + '.' + field);
		ed = ge.getTargetED();
		if (!ed || !ed.isReference())
			return null;

		var ref = ed.getReference();
		return ref;
	},

	_getEncodedConditions: function(factsTable, field, baseConditions) {
		var index = field.lastIndexOf('.');
		var conditions;
		if (index < 0) {
			conditions = 'SUBQUERY';
			conditions += 'sys_id' + ',' + field + ',' + factsTable;
			conditions += '^' + baseConditions + '^';
			conditions += 'ENDSUBQUERY';
			return conditions;
		}

		var partialField = field.substring(0, index);
		var lastField = field.substring(index + 1, String(field).length);
		var targetTable = this._getTargetTable(factsTable, partialField);
		var subConditions = this._getEncodedConditions(factsTable, partialField, baseConditions);
		conditions = 'SUBQUERY';
		conditions += 'sys_id' + ',' + lastField + ',' + targetTable;
		conditions += '^(' + subConditions + ')^';
		conditions += 'ENDSUBQUERY';
		return conditions;
	},

	getDefaultScorePeriod: function() {
		var cube = this.getParameter('sysparm_cube');
		var frequency = this._getIndicatorFrequency(cube);
		var index = this._getSysPropertyIndex(frequency);
		if (index == -1)
			return -1;
		var periods = this._getScorePeriods().split(';');
		return periods[index];
	},

	getDefaultSnapshotPeriod: function() {
		var cube = this.getParameter('sysparm_cube');
		var frequency = this._getIndicatorFrequency(cube);
		var index = this._getSysPropertyIndex(frequency);
		if (index == -1)
			return -1;
		var periods = this._getSnapshotPeriods().split(';');
		return periods[index];
	},

	checkFilter: function() {
		var filter = this.getParameter('sysparm_filter');
		return !(new PAUtils().hasRestrictedOperatorsInConditions(filter));
	},

	getStartOfWeek: function() {
		var value = gs.getProperty('glide.ui.filter.first_day_of_week');
		if (!value)
			return '2';
		return value;
	},

	checkFormula: function () {
		var f = new SNC.PAFormula(this.getParameter('sysparm_formula').toString(), this.getParameter('sysparm_id').toString());
		this.getRootElement().setAttribute('answer', f.isValid());
		this.getRootElement().setAttribute('error', f.getError());
		this.getRootElement().setAttribute('sys_id', this.getParameter('sysparm_id'));
	},

	type: "PAAjax"
});