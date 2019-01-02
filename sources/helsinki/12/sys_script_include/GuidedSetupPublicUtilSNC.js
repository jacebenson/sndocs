var GuidedSetupPublicUtilSNC = Class.create();
GuidedSetupPublicUtilSNC.prototype = {

    initialize: function() {
		this.gswUtil = new GuidedSetupUtilSNC();
		this.TABLE_CONTENT = this.gswUtil.TABLE_CONTENT;
		this.ATTR_WEIGHT = this.gswUtil.ATTR_WEIGHT;
    },

	createInitialStatusForContent: function (contentGr) {
		return this.gswUtil.createInitialStatusForContent(contentGr.getUniqueValue(), contentGr.getValue(this.ATTR_WEIGHT) * 1.00);
	},

    type: 'GuidedSetupPublicUtilSNC'
};