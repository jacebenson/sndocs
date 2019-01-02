var AbstractUpdateUIActionUtil = Class.create();
AbstractUpdateUIActionUtil.prototype = {
    initialize: function() {
    },
	
	//Display the UI Action if the user has access and the system is not upgrading and the mutex is available
	shouldDisplay: function(gr) {
		return (this._userHasAccess(gr) && 
				!GlidePluginManager.isUpgradeSystemBusy() &&
				SNC.UpdateMutex.isAvailable());
	},
	
	//Inform the user if the user has access but the system is upgrading or the mutex is occupied
	shouldInformMissing: function(gr) {
		return (this._userHasAccess(gr) && 
				(GlidePluginManager.isUpgradeSystemBusy() || !SNC.UpdateMutex.isAvailable()));
	},

	//Determines if the user is in the global domain if domain delegated admin is being used
	_isCurrentDomainSafe: function() {
		if (gs.getProperty("glide.sys.domain.delegated_administration", "false") == "true")
			return (gs.getUser().getDomainID() == null || gs.getUser().getDomainID() == "global");

		return true;
	},

	_userHasAccess: function(gr) {
		gs.warn("AbstractUpdateUIActionUtil._userHasAccess needs override");
		return false;
	},

    type: 'AbstractUpdateUIActionUtil'
};