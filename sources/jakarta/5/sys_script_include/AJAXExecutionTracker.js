var AJAXExecutionTracker = Class.create();
AJAXExecutionTracker.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	/*String*/ stageNew: function() {
    	var trackerName = this.getParameter("sysparm_tracker_name");
    	var tracker = SNC.GlideExecutionTracker.stageNew(trackerName);
    	gs.print("stageNew: tracker = " + tracker);
    	gs.print("stageNew: trackerSysID = " + tracker.getSysID());
    	return tracker.getSysID();
    },

    /*String*/ getLastRunning: function() {
    	var tracker = SNC.GlideExecutionTracker.getLastRunning();
    	return tracker.getSysID();
    },

    /*String*/ createChild: function() {
    	var parentTrackerID = this.getParameter("sysparm_parent_tracker_id");
    	var childTrackerName = this.getParameter("sysparm_child_name");
    	var parentTracker = this._getTracker(parentTrackerID);
    	var childTracker = parentTracker.createChild(childTrackerName);
    	return childTracker.getSysID();
    },

    /*String*/ getOrCreateChild: function() {
    	var parentTrackerID = this.getParameter("sysparm_parent_tracker_id");
    	var childTrackerName = this.getParameter("sysparm_child_name");
    	var parentTracker = this._getTracker(parentTrackerID);
    	var childTracker = parentTracker.createChildIfAbsent(childTrackerName);
    	return childTracker.getSysID();
    },

    /*void*/ setMaxProgressValue: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var value = this.getParameter("sysparm_max_progress_value");
    	var tracker = this._getTracker(trackerID);
    	tracker.setMaxProgressValue(value);
    },

    /*void*/ updateProgressValue: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var value = this.getParameter("sysparm_progress_value");
    	var tracker = this._getTracker(trackerID);
    	tracker.updateProgressValue(value);
    },

    /*void*/ incrementProgressValue: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var tracker = this._getTracker(trackerID);
    	tracker.incrementProgressValue(1);
    },

    /*void*/ updatePercentComplete: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var value = this.getParameter("sysparm_percent_complete");
    	var tracker = this._getTracker(trackerID);
    	tracker.updatePercentComplete(value);
    },

    /*void*/ incrementPercentComplete: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var tracker = this._getTracker(trackerID);
    	tracker.incrementPercentComplete(1);
    },

	/*void*/ stage: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var tracker = this._getTracker(trackerID);
    	tracker.stage();
    },

	/*void*/ run: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var tracker = this._getTracker(trackerID);
    	tracker.run();
    },

    /*void*/ success: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var message = this.getParameter("sysparm_message");
    	var tracker = this._getTracker(trackerID);
    	if (message)
    		tracker.success(message);
    	else
    		tracker.success();
    },

    /*void*/ fail: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var message = this.getParameter("sysparm_message");
    	var tracker = this._getTracker(trackerID);
    	if (message)
    		tracker.fail(message);
    	else
    		tracker.fail();
    },

	/*void*/ updateMessage: function() {
    	var trackerID = this.getParameter("sysparm_tracker_id");
    	var message = this.getParameter("sysparm_message");
    	var tracker = this._getTracker(trackerID);
    	if (message)
    		tracker.updateMessage(message);
    },

    /*SNC.GLideExecutionTracker*/ _getTracker: function(/*String*/ trackerID) {
    	var tracker;
    	if (gs.nil(trackerID))
    		tracker = SNC.GlideExecutionTracker.getLastRunning();
    	else
    	 	tracker =SNC.GlideExecutionTracker.getBySysID(trackerID);
    	return tracker;
    },
	

	isPublic: function() {
        return false;
    },
	
    type: 'AJAXExecutionTracker'
});