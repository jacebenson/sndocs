var ScopeRegister = Class.create();
ScopeRegister.prototype = {
	initialize: function() {
		this.scopeApi = new GlideScopeAPI();
	},
	
	registerScope: function(scopeName) {
		// if nil scope name or 'global' then nothing to register
		if(scopeName == null || scopeName.length == 0 || scopeName == 'global')
			return true;
		   
		// first check if the scope is unique to this instance
		var scopeExistsInInstance = this.scopeApi.scopeExistsInInstance(scopeName);
		if(scopeExistsInInstance)
			return false;
		
		// we are unique to instance, so now lets check if I should even attempt to register the scope
		var doNotReserve = GlidePropertiesDB.get("glide.app.creator.local.scope", !GlideUtil.isProductionInstance());
		if(doNotReserve == 'true')
			return true;
		
		// we got the go ahead to register
		var scopeRegistered = this.scopeApi.registerScope(scopeName);
		if(!scopeRegistered) {
			// we are here if AppRepo was available, but it told use it could not register
			// the primary reason for being here is the scope is already registered in the AppRepo
			return false;
		}
		return true;
	},
	
	getLastErrorMessage: function() {
		return this.scopeApi.getLastErrorMessage();
	},
	
	type: 'ScopeRegister'
};