var UpdateSetPreviewVisible = Class.create();
UpdateSetPreviewVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return ((gr.state == 'loaded' || gr.state == 'backedout') &&
			gr.remote_base_update_set.nil() &&
			this._isCurrentDomainSafe() &&
			gr.canWrite());
	},

    type: 'UpdateSetPreviewVisible'
});