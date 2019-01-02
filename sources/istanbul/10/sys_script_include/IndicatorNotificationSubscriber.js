var IndicatorNotificationSubscriber = Class.create();
IndicatorNotificationSubscriber.prototype = {
    initialize: function() {
    },
	
	canSubscribe: function(notification) {
		var gr = new GlideRecord("pa_m2m_indicator_notification_users");
		gr.addQuery("notification", notification.sys_id);
		gr.addQuery("user", gs.getUserID());
		gr.query();
		return !gr.hasNext();
	},

    type: 'IndicatorNotificationSubscriber'
}