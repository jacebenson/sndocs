var AppVersion = (function() {
	return {
		get: function(appId) {
			var gr = new GlideRecord('sys_app');
			if (gr.get('sys_id', appId))
				return  gr.getValue('version');
			return void 0;
		}
	};
})();