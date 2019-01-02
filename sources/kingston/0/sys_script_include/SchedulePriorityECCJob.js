gs.include("Schedule");
var SchedulePriorityECCJob = Class.create();
SchedulePriorityECCJob.prototype = Object.extendsObject(Schedule,{
	initialize: function(label, document, script) {
		Schedule.prototype.initialize.call(this);
		this.time = new GlideDateTime();
		this.setDocument(document);
		this.trigger_type = 0;
		this.script = script;
		this.label = label;
		this.priority = document.priority;
		this.runAsUser = document.sys_created_by;
	},

	setTime: function(time) {
		this.time = time;
	},

	schedule: function() {
		var t = this._getTrigger();
		
		if (!gs.nil(this.document))
			t.document = this.document;
		
		if (!gs.nil(this.script))
			t.script = this.script;
		
		if (!gs.nil(this.label))
			t.label = this.label;
		
		// get the priority from current
		if (!gs.nil(this.priority)) {
			if (this.priority == 0) //interactive
				t.priority = gs.getProperty('glide.ecc.async.priority.interactive', 50);
			if (this.priority == 1) //expedited
				t.priority = gs.getProperty('glide.ecc.async.priority.expedited', 105);
			if (this.priority == 2) //standard
				t.priority = gs.getProperty('glide.ecc.async.priority.standard', 110);
		}

		t.job_context = 'fcRunAs=' + this.runAsUser;
		t.trigger_type = this.trigger_type;
		t.next_action = this.time;
		gs.print("Scheduling: " + this.label + " for: " + t.next_action.getDisplayValue());
		return t.insert();
	},

	type: 'SchedulePriorityECCJob'
});