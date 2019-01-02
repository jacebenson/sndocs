gs.include("PrototypeServer");

var SubscriptionUtil = Class.create();

/*
	 This isn't a generic subscription class, this can only be used to subscribe and unsubscribe cmdb_ci notifications.
*/

SubscriptionUtil.prototype = {
  initialize: function() {
    this.isLegacy = gs.getProperty("glide.notification.use_legacy_subscription_model") != "false";
  },

  isSubscribed: function(cmdb_ci) {
      return this._getSubscriptionRecord(cmdb_ci).hasNext();
  },

  subscribe: function(cmdb_ci) {
     if (this.isLegacy)
        this._subscribeNotifMessage(cmdb_ci);
     else {
        this._subscribe(cmdb_ci);
     }
  },
	
  _subscribe: function(cmdb_ci) {
	  var gr = new GlideRecord("sys_notif_subscription");
	  gr.user = gs.getUserID();
	  gr.name = "Subscription to " + cmdb_ci.name;
	  gr.devices = this._getPrimaryEmail();
	  gr.notification = this._getCIAffected();
	  gr.affected_record = cmdb_ci.sys_id;
	  gr.affected_table = "cmdb_ci";
	  gr.insert();  
  },

  _subscribeNotifMessage: function(cmdb_ci) {
     var gr = new GlideRecord('cmn_notif_message');
     gr.user = gs.getUserID();
     gr.configuration_item = cmdb_ci.sys_id;
     gr.device = this._getPrimaryEmail();
     gr.notification = this._getCIAffected();
     gr.insert();
  },

  unsubscribe : function(cmdb_ci) {    
    var gr = this._getSubscriptionRecord(cmdb_ci);
    if (gr.next())
      gr.deleteRecord();
  },

  _getCIAffected : function() {
     var gr = new GlideRecord('sysevent_email_action');
     gr.addQuery('event_name', 'ci.affected');
     gr.query();
     if (gr.next())
       return gr.sys_id + '';

     return '';
  },

  _getSubscriptionRecord: function( cmdb_ci) {
      if (this.isLegacy)
        return this._getNotifMessageSubscriptionRecord(cmdb_ci);
	  else 
		return this._getNotifSubscriptionRecord(cmdb_ci);
  },
	
  _getNotifSubscriptionRecord: function(cmdb_ci) {
	  var gr = new GlideRecord("sys_notif_subscription");
      gr.addQuery("user", gs.getUserID());
      gr.addQuery("affected_record", cmdb_ci.sys_id);
      gr.query();
      return gr;
  },

  _getNotifMessageSubscriptionRecord: function(cmdb_ci) {
     var gr = new GlideRecord('cmn_notif_message');
     gr.addQuery('user', gs.getUserID());
     gr.addQuery('configuration_item', cmdb_ci.sys_id);
     gr.query();
     return gr;
  },

  _getPrimaryEmail : function() {
    var user_id = gs.getUserID();
    var gr = new GlideRecord('cmn_notif_device');
    gr.addQuery('user', user_id);
    gr.addQuery('primary_email', true);
    gr.query();
    if (gr.next())
       return gr.sys_id + '';

    gr.initialize();
    gr.user = user_id;
    gr.name = gs.getMessage('Primary email');
    gr.primary_email = true;
    gr.type = 'Email';
    gr.email_address = gs.getUser().getEmail();
    return gr.insert();
  }
}