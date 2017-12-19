var ChangeConflictWorker = Class.create();
ChangeConflictWorker.prototype = {
    initialize: function() {
    },

	start: function(sysId) {
		var gr = new GlideRecord("change_request");
        if (!gr.get(sysId))
            return;
    
        var chker = new ChangeCheckConflicts(gr);
		chker.checkAndUpdate();
	},

    type: 'ChangeConflictWorker'
};