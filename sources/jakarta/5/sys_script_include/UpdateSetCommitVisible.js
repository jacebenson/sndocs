var UpdateSetCommitVisible = Class.create();
UpdateSetCommitVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return ((((gr.state == "previewed" || gr.state == "partial") &&
			gr.remote_base_update_set.nil() &&
			!GlidePreviewProblemHandler.hasUnresolvedProblems(gr.sys_id))) &&
			this._isCurrentDomainSafe());
	},

    type: 'UpdateSetCommitVisible'
});