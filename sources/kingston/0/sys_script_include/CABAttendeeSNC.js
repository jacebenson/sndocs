var CABAttendeeSNC = Class.create();

CABAttendeeSNC.prototype = Object.extendsObject(sn_change_cab.CAB, {
	joinedMeeting: function() {
		if (!this._gr)
			return;
		
		this._gr.setValue("joined_at", new GlideDateTime());
		this._gr.setValue("attendance", "attending");
	},
	
	updateAttendingForTasks: function(updates) {
		if (!this._gr ||
			!updates ||
		    updates.length == 0)
			return;
		
		var attendingForTasks = (this._gr.attending_for_tasks.nil() ? [] : this._gr.attending_for_tasks.split(","));
		for (var i = 0; i < updates.length; i++) {
			var action = updates[i].action;
			var taskId = updates[i].taskId;
			if (action == "add" && attendingForTasks.indexOf(taskId) < 0)
				attendingForTasks.push(taskId);
			else if (action == "remove") {
				var j = attendingForTasks.indexOf(taskId);
				if (j >= 0)
					attendingForTasks.splice(j, 1);
			}
		}
		
		this._gr.attending_for_tasks = attendingForTasks.join(",");
	},
	
	canBeDeleted: function() {
		if (this._gr.getValue("reason") == CAB.REASON.ATTENDEE &&
		    this._gr.getValue("added") == "auto" &&
		    this._gr.attending_for_tasks.nil())
			return true;
		
		return false;
	},
	
	createCABDelegateNotifyEvent: function() {
		if (!this._gr || !this._gr.getUniqueValue())
			return;
		
		gs.eventQueue("sn_change_cab.meeting.attendees.delegate", this._gr);
	},
	
    type: 'CABAttendeeSNC'
});

CABAttendeeSNC.newAttendee = function(user) {
	var aGr = new GlideRecord(sn_change_cab.CAB.ATTENDEE);
	// Check if we have a string (sys_id) or GlideRecord object
	if (typeof user == "string")
		aGr.attendee = user;
	else if (user && typeof user.getRowCount == "function")
		aGr.attendee = user.getUniqueValue();
	
	return new sn_change_cab.CABAttendee(aGr);
};