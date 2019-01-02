var GuidedSetupFieldNamesSNC = Class.create();
GuidedSetupFieldNamesSNC.prototype = {
    initialize: function() {
		this.gswUtil = new GuidedSetupUtilSNC();
    },

	process: function (table, containingTable, endPointMode) {
		if (endPointMode == this.gswUtil.END_POINT_TYPE.CONFIGURE_CHOICES)
			return this.gswUtil.getTableFields(table, true);
		else if (endPointMode == this.gswUtil.END_POINT_TYPE.CONFIGURE_LABEL)
			return this.gswUtil.getTableFields(table, false);
		else
			return [];
	},

    type: 'GuidedSetupFieldNamesSNC'
};
