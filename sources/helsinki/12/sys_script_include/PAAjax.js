var PAAjax = Class.create();

PAAjax.prototype =  Object.extendsObject(AbstractAjaxProcessor, {
	retrieveBreakdownSource: function() {
		var gr = new GlideRecordSecure("pa_breakdowns");
		gr.get(this.getValue());
		this.getRootElement().setAttribute("table", gr.dimension.facts_table);
		this.getRootElement().setAttribute("condition", gr.dimension.conditions);
	},

	getTableListViews: function () {
		var table = this.getValue();
		this.getRootElement().setAttribute('views', new SNC.PADBView().getTableListViews(table));
	},
	
	_getIndicatorFrequency: function(id) {
		if (id == null)
			return -1;
		gr = new GlideRecord('pa_cubes');
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

	type: "PAAjax"
});