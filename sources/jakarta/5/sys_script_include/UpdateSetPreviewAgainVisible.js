var UpdateSetPreviewAgainVisible = Class.create();
UpdateSetPreviewAgainVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return ((gr.state == 'previewed' || gr.state == 'partial') &&
			gr.remote_base_update_set.nil() &&
			this._isCurrentDomainSafe() &&
			gr.canWrite());
	},

    type: 'UpdateSetPreviewAgainVisible'
});