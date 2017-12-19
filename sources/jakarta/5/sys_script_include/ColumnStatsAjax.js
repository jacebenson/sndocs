var ColumnStatsAjax = Class.create();
ColumnStatsAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	start: function() {
		return new SNC.ColumnStatsAPI().collectColumnStats();
	},

    type: 'ColumnStatsAjax'
});