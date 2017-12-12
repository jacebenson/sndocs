var SysMessageAjax = Class.create();

SysMessageAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    isPublic: function() {
        return true;
    },

  process: function() {
    	var numKeys = parseInt(this.getParameter("sysparm_keys"));
	    var maxKeys = GlideProperties.getInt("glide.security.sysmessageajax.max_keys", 1000);
	    if (numKeys > maxKeys) {
			gs.log("Too many keys for SysMessageAjax!");
			return;
	    }
	  
    	for (var i = 0; i < numKeys; i++) {
            var key = this.getParameter("key" + i);
    	    var message = GlideSysMessage.getClientMessage(key);

    	    var item = this.newItem("item");
            item.setAttribute("key", key);
            item.setAttribute("value", message);
    	}

        // prefetch only if enabled
        if (!GlideSysMessage.usePrefetch())
            return;

        // prefetch only if client asked for it
        var pf = this.getParameter('sysparm_prefetch');
        if (pf != 'true')
            return;
        
        var prekeys = GlideSysMessage.getPrefetch();
        var it = prekeys.iterator();
        while (it.hasNext()) {
            var key = it.next();
            var value = GlideSysMessage.getMessage(key);
            var item = this.newItem("preitem");
            item.setAttribute("key", key);
            item.setAttribute("value", value);
        }
  },

  type: "SysMessageAjax"
});