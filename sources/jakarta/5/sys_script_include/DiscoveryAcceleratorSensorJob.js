var DiscoveryAcceleratorSensorJob = Class.create();
DiscoveryAcceleratorSensorJob.prototype = {
    initialize: function() {
    },

	process: function() {
		try {
			gs.getSession().putProperty("disable.labels", true);
			SNC.DiscoveryAccelerator.processProbeComplete(current);
		} catch(e) {
		  gs.logError("DiscoveryAccelerator for " + current.topic + " failed for ECC queue record "+current.sys_id+" - "+e);
		  // Don't want this record to sit in ready state:
		  if (current.state != "processed") {
			current.state = "error";
			current.error_string = "Exception during sensor processing: "+e;
			current.setWorkflow(false);
			current.update();
			current.setWorkflow(true);
		  }
		}

		// Let the LabelEngine do it's job
		gs.getSession().clearProperty("disable.labels");
	},	
	
    type: 'DiscoveryAcceleratorSensorJob'
};