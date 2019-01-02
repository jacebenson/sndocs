/**
	Throw Email Event for messages while offline, throttle and package to every [[collaboration.email_interval]] minutes.
	parm1 - sys_id of live_group_member
	parm2 - comma separated user sys_ids: live_profile, sys_user
*/
var idArray = event.parm2.split(",");
var profileID = idArray[0];
var userID = idArray[1];

var emailDelay = new GlideTime();
var minutesInterval = parseInt(gs.getProperty("collaboration.email_interval"), 10);
var hoursInterval = 0;
var delayString = "";
if(minutesInterval >= 60) {
	hoursInterval = math.floor(minutesInterval / 60);
	minutesInterval = minutesInterval % 60;
	if(hoursInterval < 10)
		delayString += "0";
	delayString += hoursInterval + ":";
} else
	delayString = "00:";
if(minutesInterval < 10)
	delayString += "0";
delayString += minutesInterval + ":00";

emailDelay.setValue(delayString);
var timeAgo = new GlideDateTime();
timeAgo.subtract(emailDelay);

var grGroupMember = new GlideRecord("live_group_member");
grGroupMember.addQuery("sys_id", event.parm1);
grGroupMember.query();

var grActivity = new GlideRecord("sys_user_presence");
grActivity.addQuery("user", userID);
grActivity.addQuery("sys_updated_on", ">=", timeAgo);
grActivity.query();

if(!grActivity.hasNext() && grGroupMember.next()) {
	var last_emailed = new GlideDateTime(grGroupMember.getValue("last_emailed"));
	// Provide 1 minute buffer to grab messages from
	emailDelay.setValue("00:01:00");
	timeAgo.subtract(emailDelay);

	if(timeAgo.compareTo(last_emailed) > 0) {
		// Ensures last email was sent outside the delay timer
		var grLiveGroup = new GlideRecord("live_group_profile");
		grLiveGroup.addQuery("sys_id", grGroupMember.getValue("group"));
		grLiveGroup.query();

		if(grLiveGroup.next()) {
			var grLiveMessage = new GlideRecord("live_message");

			grLiveMessage.addQuery("group", grGroupMember.getValue("group"));
			grLiveMessage.addQuery("profile", "!=", profileID);
			grLiveMessage.addQuery("sys_created_on", ">=", timeAgo.toString());
			grLiveMessage.orderBy("sys_created_on");
			grLiveMessage.query();

			if(grLiveMessage.hasNext()) {
				var messages = [];
				while(grLiveMessage.next()) {
					messages.push(grLiveMessage.getValue("sys_id"));
				}

				if(grLiveGroup.getValue("type") == "peer") {
					gs.eventQueue("collaboration.notify_offline_user", "", "", userID, messages.join(",") );
				} else {
					gs.eventQueue("collaboration.notify_offline_user.group", "", "", userID, messages.join(",") );
				}

				grGroupMember.setValue("last_emailed", new GlideDateTime());
				grGroupMember.update();
			}
		}
	}
}