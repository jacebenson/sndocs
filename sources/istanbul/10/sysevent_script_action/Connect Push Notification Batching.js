/*
 event.parm1 == sys_user sys_id
 event.parm2 == non-batched push notification message
*/

function batchNotifications() {
	var liveProfileGR = new GlideRecord("live_profile");
	liveProfileGR.addQuery("document", event.parm1);
	liveProfileGR.query();

	if(!liveProfileGR.next())
		return;

	var groupMemberGR = new GlideRecord("live_group_member");
	groupMemberGR.addQuery("group", current.group);
	groupMemberGR.addQuery("member", liveProfileGR.getValue("sys_id"));
	groupMemberGR.query();

	if(!groupMemberGR.next())
		return;

	var last_push_notified = new GlideDateTime();
	var messageTime = new GlideDateTime();
	last_push_notified.setValue(groupMemberGR.getValue("last_push_notified"));
	messageTime.setValue(current.getValue("sys_created_on"));

	if(!last_push_notified || messageTime.compareTo(last_push_notified) >= 0) {

		// Message was created after the last time we've notified the user
		var liveMessageAggregate = new GlideAggregate("live_message");
		liveMessageAggregate.addAggregate("COUNT");
		liveMessageAggregate.addQuery("sys_created_on", ">=", messageTime.toString());
		liveMessageAggregate.addQuery("group", current.group);

		liveMessageAggregate.query();
		liveMessageAggregate.next();

		var numMessages = liveMessageAggregate.getAggregate("COUNT");

		if(numMessages >= 5) {
			// We've gotta batch all these in one big push notification
			var liveGroupGR = new GlideRecord("live_group_profile");
			liveGroupGR.get(current.group);

			if(liveGroupGR.getValue("type") === "peer") {
				gs.eventQueue("connect.newmessage", current, event.parm1, current.getDisplayValue("profile") + ": You have " + numMessages + " New Messages");
			} else {
				gs.eventQueue("connect.newmessage", current, event.parm1, liveGroupGR.getDisplayValue("name") + ": You have " + numMessages + " New Messages");
			}
			groupMemberGR.setValue("last_push_notified", new GlideDateTime());

		} else {
			// Messages aren't coming in fast enough to batch, send individual push notification for this message
			gs.eventQueue("connect.newmessage", current, event.parm1, event.parm2);
			groupMemberGR.setValue("last_push_notified", messageTime);
		}

		groupMemberGR.update();
	}
}

batchNotifications();
