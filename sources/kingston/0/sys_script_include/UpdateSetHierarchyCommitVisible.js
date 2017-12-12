var UpdateSetHierarchyCommitVisible = Class.create();
UpdateSetHierarchyCommitVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return ((gr.state == "previewed" || gr.state == "partial") && gr.remote_base_update_set == gr.sys_id && 
			this._isCurrentDomainSafe() &&
			gr.canWrite() &&
			!GlidePreviewProblemHandler.hasUnresolvedProblemsForHierarchy(gr.sys_id));
	},

    type: 'UpdateSetHierarchyCommitVisible'
});