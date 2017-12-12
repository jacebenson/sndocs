var NotificationPreferenceUI = Class.create();
NotificationPreferenceUI.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	type: 'NotificationPreferenceUI',

	isCMS: function() {
		var transaction = GlideTransaction.get();
		return transaction && transaction.isVirtual();
	},

	isLegacySubscription: function() {
		return GlideProperties.getBoolean('glide.notification.use_legacy_subscription_model', false);
	},

	isMobile: function() {
		return gs.isMobile();
	},

	isConcourse: function() {
		return gs.getPreference('use.concourse') == 'true';
	},

	isPluginActive: function() {
		return GlidePluginManager.isActive('com.glide.notification.preference.ui');
	},

	isUIPropertyEnabled: function() {
		return GlideProperties.getBoolean('glide.notification.preference.ui.enabled', false);
	},

	enabled: function (options) {
		options = options || {};

		var check = function(opt, fn) {
			if (typeof opt != 'undefined')
				return opt;
			return fn.call();
		};

		if (check(options.cms, this.isCMS))
			return false;

		if (check(options.legacySubscription, this.isLegacySubscription))
			return false;

		if (check(options.mobile, this.isMobile))
			return false;

		return check(options.concourse, this.isConcourse) &&
			check(options.pluginActive, this.isPluginActive) &&
			check(options.uiPropertyEnabled, this.isUIPropertyEnabled);
	}
});