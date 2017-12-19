var GuidedSetupPublicUtilSNC = Class.create();
GuidedSetupPublicUtilSNC.prototype = {

   initialize: function() {
		this.gswUtil = new GuidedSetupUtilSNC();
		this.TABLE_CONTENT = this.gswUtil.TABLE_CONTENT;
		this.ATTR_ROOT_PARENT = this.gswUtil.ATTR_ROOT_PARENT;
    },

	createInitialStatusForContent: function (contentGr) {
		return this.gswUtil.createInitialStatusForContent2(contentGr);
	},

	createInitialStatusForRoutine: function (rootContentId) {
		var gr = new GlideRecord(this.TABLE_CONTENT);
		gr.addQuery(this.ATTR_ROOT_PARENT, rootContentId); // for all children
		gr.query();
		while (gr.next()) {
			this.createInitialStatusForContent(gr);
		}
		if (gr.get(rootContentId)) { // for root itself
			this.createInitialStatusForContent(gr);
		}
	},

    type: 'GuidedSetupPublicUtilSNC'
};