var SubscribedUserAjax = Class.create();
SubscribedUserAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   getSubscriptionCount: function() {
      if (gs.getProperty("glide.notification.use_legacy_subscription_model", "true") == "false")
	    return 0;
	   
      var count = new GlideAggregate("cmn_notif_message");  
	  count.addQuery('notification',this.getParameter('sysparm_sys_id'));
	  count.addAggregate('COUNT');
	  count.query();
	   
	  var subscribers = 0;
	  if (count.next())
		subscribers = count.getAggregate('COUNT');
	   
	  return subscribers;   
   }
});