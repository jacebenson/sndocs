var UpdateSetHierarchyPreviewVisible = Class.create();
UpdateSetHierarchyPreviewVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return ((gr.state == 'loaded' || gr.state == 'backedout') &&
			gr.remote_base_update_set == gr.sys_id &&
			this._isCurrentDomainSafe() &&
			gr.canWrite());
	},

    type: 'UpdateSetHierarchyPreviewVisible'
});