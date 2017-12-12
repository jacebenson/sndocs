(function() {			
	data.languageEnabled = pm.isActive('com.glide.i18n') && gs.getProperty('glide.ui.language_picker.enabled', 'true') == 'true';
})();