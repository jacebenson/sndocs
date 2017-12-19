//
// Check to see if the user has failed to login too many times
// when the limit is reached, lock the user out of the system.
// Also create a trigger to unlock the user after 'N' minutes.
//

lockoutOnFailedLogin();

function lockoutOnFailedLogin() {
	var maxUnlockAttempts = gs.getProperty("glide.user.max_unlock_attempts", 5);
	var gr = new GlideRecord("sys_user");
	if (gr.get("user_name", event.parm1.toString())) {
		if (gr.failed_attempts > maxUnlockAttempts)
			return;

		gr.failed_attempts += 1;
		if (gr.failed_attempts > maxUnlockAttempts) {
			gr.locked_out = true;
			gr.update();
			gs.log("User " + event.parm1 + " locked out due to too many invalid login attempts");
			triggerUnlock(gr.sys_id);
		} else {
			gr.update();       
		}
	}
}

function triggerUnlock(userSysID) {
	var unlockIn = gs.getProperty("glide.user.unlock_timeout_in_mins", 15);
	var trigger = new GlideRecord("sys_trigger");
	trigger.name = "Unlock the user after "+ unlockIn + " mins";
	trigger.next_action = getTriggerTime(unlockIn);
	trigger.job_id.setDisplayValue('RunScriptJob');
	trigger.script = getTriggerScript(userSysID, gs.nowNoTZ());
	trigger.document = 'sys_user';
	trigger.document_key = userSysID;
	trigger.state = 0;
	trigger.trigger_type = 0;
	trigger.insert();
}

function getTriggerScript(userSysID, now) {
	var ret = ""
	+ "var gr = new GlideRecord('sys_user');\n"
	+ "gr.addQuery('sys_id', '" +userSysID+ "');\n"
	+ "gr.addQuery('locked_out', true);\n"
	+ "gr.addEncodedQuery('sys_updated_on <= "+now+"');\n"
	+ "gr.query();\n"
	+ "if (gr.next()) {\n"
		+ "gr.locked_out = false;\n"
		+ "gr.failed_attempts = 0;\n"
		+ "gr.update();\n"
		+ "gs.log('Auto-unlocking user '+gr.name);\n"
	+ "} else {\n"
		+ "gs.log('Unable to auto-unlock user with sys_id: "+userSysID+"');\n"
	+ "}";
	return ret;
}

function getTriggerTime(minutesToAdd) {
	var checkTime = new GlideDateTime(/*now*/);
	checkTime.addSeconds(minutesToAdd * 60);
	return checkTime;
}
