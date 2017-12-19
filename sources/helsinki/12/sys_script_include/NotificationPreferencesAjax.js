var NotificationPreferencesAjax = Class.create();
NotificationPreferencesAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	preferences: {},
	devices: [],
	existingPreferences: {},
	tableReadRules: {},
	
	gatherNotifPreferenceData: function(user_id) {
		this.isLegacy = gs.getProperty("glide.notification.use_legacy_subscription_model", false);
		this.showAdvanced = gs.getProperty("glide.notification.show_advanced_notif_message_fields", true);
		this.hideInactiveDevices = gs.getProperty("glide.notification.hide_inactive_devices", false);
		var data = {
			"devices" : this.gatherDevices(user_id),
			"notifications" : this.gatherNotifications(),
			"subscriptions" : this.gatherSubscriptions(user_id),
			"show_advanced" : this.showAdvanced,
			"isExpressInstance" : this.isExpressInstance()
		};
		
		var json = new JSON();
		return json.encode(data);
	},
	
	gatherNotifPreferenceDataAjax: function() {
	 return this.gatherNotifPreferenceData(this.getParameter("sysparm_user"));	
	},
	
	isExpressInstance: function() {
		return GlideUtil.isExpressInstance();
	},
	
	gatherSubscriptions: function(user_id) {
		var subscriptions = [];
		if (this.isLegacy == "true")
			return;
		
		var gr = new GlideRecord("sys_notif_subscription");
		if (!gr.isValid())
			return;
		
		gr.addQuery("user", user_id);
		gr.query();
		while (gr.next()) {
			var canPush = JSUtil.nil(gr.notification.message_list);
			var tableLabel = "No Table";
			if (gr.notification.collection) {
				var table = GlideTableDescriptor.get(gr.notification.collection);
				tableLabel = table.getLabel();
				if (tableLabel == "label")
					tableLabel = "No Table";
			}
			subscriptions.push({
					"devices": gr.devices + "",
					"active" : gr.active+ "",
					"sys_id" : gr.sys_id + "",
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
	
	gatherDevices: function(user_id) {
		var gr = new GlideRecord("cmn_notif_device");
		gr.addQuery("user", user_id);
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
			var gr = new GlideRecord("cmn_notif_message");;
			gr.query("device", this.devices[i].sys_id);
			while (gr.next()) {				
				this.devices[i].notifications[gr.notification] = {
					"subscribed" : gr.notification_filter == 'c1bfa4040a0a0b8b001eeb0f3f5ee961'? false : true,
					"sys_id" : gr.sys_id.toString()
				}
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
			var tableLabel = "No Table";
			if (gr.collection) {
				if (!this.canReadTable(gr.collection) && !this.existingPreferences[gr.sys_id.toString()])
					continue;
	
				var table = new GlideTableDescriptor.get(gr.collection);
				tableLabel = table.getLabel();
				if (tableLabel == "label")
					tableLabel = "No Table";
				
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
	
	/*
	 *  See if user has read access to the table, keep the results so we don't have to redo the canRead() as it is expensive
	 *
	 */
	canReadTable: function(table) {
			if (this.tableReadRules[table])
				return this.tableReadRules[table] == "true";
		
			var gr = new GlideRecord(table);
		    if (gr.isValid() && !gr.canRead()){
				this.tableReadRules[table] = "false";
				return false;
			}
		
			this.tableReadRules[table] = "true"
			return true;
	},
	
    type: 'NotificationPreferencesAjax'
});