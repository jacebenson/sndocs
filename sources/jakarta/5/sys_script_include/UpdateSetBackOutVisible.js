var UpdateSetBackOutVisible = Class.create();
UpdateSetBackOutVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return (gr.canWrite() &&
			(new GlideUpdateManager2()).allowVersionBackout(gr.sys_id) &&
			this._isCurrentDomainSafe());
	},

    type: 'UpdateSetBackOutVisible'
});