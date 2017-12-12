var NotificationPreferencesAjax = Class.create();
NotificationPreferencesAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	preferences: {},
	devices: [],
	existingPreferences: {},
	tableReadRules: {},
	

	gatherNotifPreferenceData: function(userId, notification) {		
		this.isLegacy = gs.getProperty("glide.notification.use_legacy_subscription_model", false);
		this.showAdvanced = gs.getProperty("glide.notification.show_advanced_notif_message_fields", true);
		this.hideInactiveDevices = gs.getProperty("glide.notification.hide_inactive_devices", false);
		
		var data = {
			"devices" : this.gatherDevices(userId),
			"notifications" : this.gatherNotifications(),
			"subscriptions" : this.gatherSubscriptions(userId),
			"show_advanced" : this.showAdvanced,
			"isExpressInstance" : this.isExpressInstance(),
			"notification" : this.getNotificationData(notification),
			"showSpecificSubscriptions" : this.shouldShowSpecificSubscriptions(notification),
            "registeredPushMsgNotifs" : this.getNotificationsFilteredByRegisteredPushMessage(userId)
		};
		
		var json = new JSON();
		return json.encode(data);
	},
	
	gatherNotifPreferenceDataAjax: function() {
	 return this.gatherNotifPreferenceData(this.getParameter("sysparm_user"),
										   this.getParameter("sysparm_action"),
										   this.getParameter("sysparm_notification"));	
	},
	
	isExpressInstance: function() {
		return GlideUtil.isExpressInstance();
	},
	
	gatherSubscriptions: function(userId) {
		var subscriptions = [];
		if (this.isLegacy == "true")
			return;
		
		var gr = new GlideRecord("sys_notif_subscription");
		if (!gr.isValid())
			return;
		
		gr.addQuery("user", userId);
		gr.query();
		while (gr.next()) {
			var canPush = JSUtil.nil(gr.notification.message_list);
			var tableLabel = gs.getMessage("No Table");
			if (gr.notification.collection) {
				var table = GlideTableDescriptor.get(gr.notification.collection);
				tableLabel = table.getLabel();
				if (tableLabel == "label")
					tableLabel = gs.getMessage("No Table");
			}

			subscriptions.push({
					"devices": gr.devices + "",
					"active" : gr.active+ "",
					"sys_id" : gr.sys_id + "",
					"notification" : gr.notification + "",
					"notificationName" : gr.notification.name + "",
					"conditions" : gr.condition + "",
					"name" : GlideStringUtil.escapeHTML(gr.name) + "",
					"table" : GlideStringUtil.escapeHTML(tableLabel) + "",
					"canPush" : (!JSUtil.nil(gr.notification.message_list)) + "",
					"push_only" : gr.notification.push_message_only.toString(),
					"subscribable" : gr.notification.subscribable.toString()
				
			});
			
			if (gr.filter != "" || gr.schedule != "")
					this.showAdvanced = true;
		}
		return subscriptions;
	},
	
	gatherDevices: function(userId) {
		var gr = new GlideRecord("cmn_notif_device");
		gr.addQuery("user", userId);
		if (this.hideInactiveDevices == "true")
			gr.addQuery("active", true);
		gr.orderByDesc("primary_email");
		gr.query();
		while (gr.next()) {
			this.devices.push({
				notifications : {},
				sys_id : gr.sys_id.toString(),
				name : GlideStringUtil.escapeHTML(gr.name) + "",
				primary_email : gr.primary_email.toString(),
				type : gr.type.toString(),
				active: gr.active.toString()
			});
		}

		this.gatherDevicePreferences();
		return JSON.stringify(this.devices);
	},
	
	gatherDevicePreferences: function() {
		for (var i = 0; i < this.devices.length; i++) {
			var gr = new GlideRecord("cmn_notif_message");
			gr.query("device", this.devices[i].sys_id);
			while (gr.next()) {				
				this.devices[i].notifications[gr.notification] = {
					"subscribed" : gr.notification_filter == 'c1bfa4040a0a0b8b001eeb0f3f5ee961'? false : true,
					"sys_id" : gr.sys_id.toString()
				};
				this.existingPreferences[gr.notification.toString()] = true;																  
			}
		}
	},
	
	gatherNotifications: function() {
		var gr = new GlideRecord("sysevent_email_action");
		gr.addActiveQuery();
		gr.orderBy("name");		
		gr.query();
		while (gr.next()) {
			var tableLabel = gs.getMessage("No Table");
			if (gr.collection) {
				if (!this.canReadTable(gr.collection) && !this.existingPreferences[gr.sys_id.toString()])
					continue;
	
				var table = new GlideTableDescriptor.get(gr.collection);
				tableLabel = table.getLabel();
				if (tableLabel == "label")
					tableLabel = gs.getMessage("No Table");
				
			}
			this.preferences[gr.sys_id] = {
				"name" : GlideStringUtil.escapeHTML(gr.name) + "",
				"mandatory" : gr.mandatory.toString(),
				"push_only" : gr.push_message_only.toString(),
				"canPush" : (!JSUtil.nil(gr.message_list)) + "",
				"table" : tableLabel
			};
			
		}
		
		return this.preferences;
	},
	  
    getNotificationsFilteredByRegisteredPushMessage: function(userId) {
        // Ensure PushMessageQualifier is a function before using it
		// This is necessary only during upgrades while the push plugin is not yet active
		if (typeof PushMessageQualifier !== 'function')
			return;
		
		var pushQual = new PushMessageQualifier();
        var filteredNotifs = [];
        var gr = new GlideRecord("cmn_notif_device");
        gr.addQuery('user',userId);
        gr.addActiveQuery();
        gr.query();
        while(gr.next()) {
            var pushMsgIds = pushQual.getPushApplicationPushMessages(gr.push_app);
            var notifIds = pushQual.getRawNotificationList(pushMsgIds); 
			filteredNotifs.push({"device_sys_id":gr.getUniqueValue(),"notification_sys_id":notifIds});
        }
        
        return filteredNotifs;
    },
        
	getNotificationData: function(notificationId) {
		if (!notificationId) {
			// No data to get if there is no id to check
			return "";
		}

		var gr = new GlideRecord("sysevent_email_action");
		if (!gr.get(notificationId)) {
			gs.warn("Attempt to find notification preferences for non-existant " +
					"sysevent_email_action: '" + notificationId + "' failed");
			return "";
		}
		
		return {
			"sys_id" : notificationId,
			"name" : gr.getValue("name")
		};
	},
	
	shouldShowSpecificSubscriptions: function(notificationId) {
		if (!notificationId) {
			// No subscription to get if there is no notification
			return false;
		}

		// Return "true" if this user has at least one subscription
		// for this notification
		var gr = new GlideRecord("sys_notif_subscription");
		gr.addQuery("notification", notificationId);
		gr.addQuery("user", gs.getUserID());
		gr.query();
		return gr.hasNext();
	},
	
	/*
	 *  See if user has read access to the table, keep the results so we don't have to redo the canRead() as it is expensive
	 *
	 */
	canReadTable: function(table) {
		if (this.tableReadRules[table])
			return this.tableReadRules[table] == "true";
		var gr = new GlideRecord(table);

		if (gr.isValid()) {
			if(gr.canRead()) {
				this.tableReadRules[table] = "true";
				return true;
			}
		}
		// Enterprise wants Notifications for invalid tables to go to "No Table"
		else if (!GlideUtil.isExpressInstance()) {  
			this.tableReadRules[table] = "true";
			return true;
		} 
		this.tableReadRules[table] = "false";
		return false;
	},
	
	
    type: 'NotificationPreferencesAjax'
});