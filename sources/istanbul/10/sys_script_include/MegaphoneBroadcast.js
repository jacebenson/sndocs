var MegaphoneBroadcast = Class.create();
MegaphoneBroadcast.prototype = {
	initialize: function(messageSysId) {
		this.message = null;
		var msg = new GlideRecord('sys_broadcast_message');
		msg.get(messageSysId);
		
		if(msg.isValidRecord()) {
			this.message = msg;
			this.sys_id = messageSysId;
		}
	},
	
	broadcastMessage: function() {
		if(this.message === null || !this.message.isValidRecord()) {
			gs.warn("Did not find the message.");
			return;
		}
		
		if(this._isActive()) {
			this._alertLoggedInUsers();
			this._sendEmail();
		}
	},
	
	_isActive: function() {
		var now = new GlideDateTime();
		return(now >= this.message.notify_users_after_date && now <= this.message.notify_users_until_date);
	},
	
	//Alert users that are currently logged in
	_alertLoggedInUsers: function() {
		if(!this.message.logged_in)
			return;
		
		var roles = this.message.user_filter;
		if(this.message.any_roled_user)
			roles = "";
		try {
			SNC.MegaphoneBroadcast.addMegaphoneMessageToAllLoggedInSessionsOnAllNodes(this.sys_id);
		}
		catch(ex) {
			gs.warn("Unable to alert logged in users for megaphone message: " + this.message.sys_id);
		}
	},
	
	_sendEmail: function() {
		if(!this.message.email)
			return;
		
		if(this.message.email_sent)
			return;
		
		SNC.MegaphoneBroadcast.broadcastEmail(this.sys_id);
	},
	
	type: 'MegaphoneBroadcast'
};