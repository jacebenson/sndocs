var AppFileTypeRegistry = {
	
	create : function createRegistry(defaultHandler) {
		
		var customHandlers = {};
		
		function getHandlerByKey(navigationKey) {
			if (!customHandlers[navigationKey])
				return defaultHandler;
			
			return customHandlers[navigationKey];
		}

		function addHandler(navigationKey, handler) {
			customHandlers[navigationKey] = handler;
		}
		
		return {
			registerHandler : function(navigationKey, handler) {
				addHandler(navigationKey, handler);
			},
			
			filesForKey : function(key) {
				return getHandlerByKey(key).filesForKey(key);
			}
		}
	}	
};