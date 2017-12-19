var PublicAPI = (function() {	
	return {
		getStudioVersion: function() {
			var gr = new GlideRecord('sys_store_app'),
				appId = '5d9789f3eb51310007e48c1cf106fe9e';
			if (gr.get(appId))
				return  gr.getValue('version');
			return void 0;
		},
		getUserPreference: function(userId, prefName) {
			var gr = new GlideRecord('sn_devstudio_user_preferences');
			gr.addQuery('user', userId)
				.addOrCondition('user', '');			
			gr.query();

			var prefs = {};
			while (gr.next()) {
				if (gr.preference.name.toString() === prefName) 
					prefs[gr.getValue('user') || 'default'] = gr.getValue('value');
			}

			return prefs[userId] || prefs['default'];
		}
	};
})();
