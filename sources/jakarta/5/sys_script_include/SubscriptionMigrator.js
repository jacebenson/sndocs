var SubscriptionMigrator = Class.create();
SubscriptionMigrator.prototype = {

	initialize: function() {
		this.jobName = 'Migrate Notification Subscriptions';
	},

	/**
	 * Get a list of all Subscribable notifications.
	 */
	migrateSubscriptions: function() {
		var subscriptionNotifications = new GlideRecord("sysevent_email_action");
		subscriptionNotifications.addQuery("subscribable", true);
		subscriptionNotifications.query();
		while (subscriptionNotifications.next()) {
			// Find all cmn_notif_messages that are associated with subscribable notificaitons
			var	notifPrefRecords = new GlideRecord("cmn_notif_message");
			notifPrefRecords.addQuery("notification", subscriptionNotifications.sys_id);
			notifPrefRecords.addNotNullQuery("user");
			notifPrefRecords.query();

			// Move each cmn_notif_message over
			while (notifPrefRecords.next()) {
				this._moveNotifPref(notifPrefRecords, subscriptionNotifications);
			}
		}

		// Migration is complete; allow new subscription to take effect
		this._disablePropertyGate();
	},

	/**
	 * This code actually migrates the old subscription model to the new one.
	 * @param notifPref - Notification preferences (from cmn_notif_message)
	 * @param subscriptionNotifications - Notifications that are subscriptions
	 */
	_moveNotifPref: function(notifPref, subscriptionNotifications ) {
		var UNSUBSCRIBE_FILTER_SYS_ID = "c1bfa4040a0a0b8b001eeb0f3f5ee961";
		var subscription = new GlideRecord("sys_notif_subscription");
		subscription.user = notifPref.user;
		subscription.schedule = notifPref.schedule;
		subscription.devices = notifPref.device;
		subscription.notification = notifPref.notification;
		subscription.display_name = notifPref.notification.name;

		// Do not move over the "Unsubscribe" filter as this means the subscription
		//   should be inactive
		if (UNSUBSCRIBE_FILTER_SYS_ID == notifPref.notification_filter) {
			// The filter told us this notification should be inactive
			subscription.active = false;
		} else {
			// Save the filter
			subscription.active = true;
			subscription.filter = notifPref.notification_filter;
		}

		if (notifPref.advanced == true && notifPref.notification.collection) {
			subscription.condition = notifPref.condition;
		}

		// Copy over the affected table and record
		if (subscriptionNotifications.item != "" && subscriptionNotifications.item_table != "") {
			var tableColumn = this._getAffectedRecord(notifPref, subscriptionNotifications.item_table);
			if (tableColumn != "") {
				subscription.affected_record = notifPref.getValue(tableColumn);
				subscription.affected_table = subscriptionNotifications.item_table;
			}
		}

		// Insert the new record and blow away the old one
		subscription.insert();
	},

	/**
	 * Returns a table column from a sys_dictionary that's a cmn_notif_message
	 * and is referencing the specified table
	 * @param notifPref - Notification preferences (from cmn_notif_message)
	 * @param item_table - The table the item is in
	 * @returns a table column from a sys_dictionary that's a cmn_notif_message
	 */
	_getAffectedRecord: function(notifPref, item_table) {
		var dic = new GlideRecord("sys_dictionary");
		dic.addQuery("name", "cmn_notif_message");	
		dic.addQuery("reference",item_table);
		dic.query();
		if (dic.next())
			return dic.element;

		return "";
	},

	/**
	 * Turns the property:
	 * glide.notification.use_legacy_subscription_model
	 * to false, thereby removing the property gate that was stopping the new
	 * model from taking effect.
	 */
	_disablePropertyGate: function() {
		var PROPERTY_NAME = "glide.notification.use_legacy_subscription_model";
		var sysPropertyGR = new GlideRecord("sys_properties");
		sysPropertyGR.addQuery("name", PROPERTY_NAME);
		sysPropertyGR.query();
		if (!sysPropertyGR.next()) {
			// Failed to find the existing property; create it from scratch
			sysPropertyGR.setValue("name", PROPERTY_NAME);
			sysPropertyGR.setValue("value", "false");
			sysPropertyGR.insert();
		} else {
			sysPropertyGR.setValue("value", "false");
			sysPropertyGR.update();
		}
	},
};