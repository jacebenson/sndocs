var PushMessageQualifier = Class.create();
PushMessageQualifier.prototype = {
	
	getNotifications: function(applicationSysId) {
		var pushMsgIds = [];
		var notifIds = [];
		if (applicationSysId) {
			pushMsgIds = this.getPushApplicationPushMessages(applicationSysId);
			if (!pushMsgIds || pushMsgIds.length == 0 ) {
				return 'sys_id=NULL';
			}
			else {
              notifIds = this.getRawNotificationList(pushMsgIds);
			}
		}
		
		if (notifIds.length == 0) {
			return 'sys_id=NULL';
		}
		return 'sys_idIN' + notifIds;
	},
	
	getPushApplicationPushMessages: function(applicationSysId) {
		var pushMsgIds = [];
		var gr = new GlideRecord('sys_push_notif_msg');
		gr.addQuery('push_app',applicationSysId);
		gr.query();
		while (gr.next()) {
			pushMsgIds.push(gr.getUniqueValue());
		}
		return pushMsgIds;
	},
  
    getRawNotificationList: function(pushMsgIds) {
        var notifIds = [];
        var gr = new GlideRecord('sysevent_email_action');
        gr.addNotNullQuery('message_list');
        gr.addActiveQuery();
        gr.query();
        while (gr.next()) {
          var msgList = gr.getValue('message_list').split(',');
          for ( i = 0; i < msgList.length; i++) {
            for (x = 0; x < pushMsgIds.length; x++) {
              if (msgList[i] == pushMsgIds[x]) {
                notifIds.push(gr.getUniqueValue());
              }
            }
          }
        }
        
        return notifIds;
    },
	
	type: 'PushMessageQualifier',
};