var MegaphoneBroadcastInsert = Class.create();
MegaphoneBroadcastInsert.prototype = {
    initialize: function() {
    },
	
	//Used by the event engine to insert a message from HI
	fromEvent: function(eventxml) {
		try{
			var xml = gs.xmlToJSON(eventxml);
			var obj = xml.sys_broadcast_message;
			var msg = new GlideRecord('sys_broadcast_message');
			msg.addQuery('dc_sys_id', obj.dc_sys_id);
			msg.query();
			var isNewMessage = !msg.hasNext();
			
			if(isNewMessage) {
				msg.initialize();
			}
			else {
				msg.next();
			}
			
			for (var field in obj){
				if (typeof obj[field] != "function"){
					if(msg.isValidField(field)) {
						var value = unescape(obj[field]);
						if(field === 'notify_users_after_date' || field === 'notify_users_until_date') {
							var gdt = new GlideDateTime(value);
							msg[field] = gdt;
						}
						else {
							msg[field] = value;
						}
					}
					else {
						gs.warn("Unknown megaphone field: " + field);
					}
				}
			}
			
			if(isNewMessage) {
				msg.insert();
			}
			else {
				msg.update();
			}
		}
		catch(ex) {
			gs.warn("Error inserting megaphone message. " + ex);
		}
	},
	
    type: 'MegaphoneBroadcastInsert'
};