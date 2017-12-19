var GuidedSetupPublicUtilSNC = Class.create();
GuidedSetupPublicUtilSNC.prototype = {

    initialize: function() {
		this.gswUtil = new GuidedSetupUtilSNC();
		this.TABLE_CONTENT = this.gswUtil.TABLE_CONTENT;
    },

	createInitialStatusForContent: function (contentGr) {
		return this.gswUtil.createInitialStatusForContent2(contentGr);
	},

    type: 'GuidedSetupPublicUtilSNC'
};