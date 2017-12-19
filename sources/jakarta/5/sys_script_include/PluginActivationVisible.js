var PluginActivationVisible = Class.create();
PluginActivationVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function() {
		return (gs.hasRole("admin")
				&& !gs.getUser().isReadOnlyUser()
				&& this._isCurrentDomainSafe());
	},

    type: 'PluginActivationVisible'
});