AutomationEccSensorConditions = {
    /*
     * Determine if the given ecc_queue record should be processed by the RBA sensor processor (note that this same
     * processor is also used by core automation for SOAP and REST)
     * @param eccGr: the GlideRecord ecc_queue record to inspect ('current' when run from a BR condition)
     * returns: true if sensor script should be run, otherwise false
     */
    automation: function(eccGr) {
        if (this._commonSkipConditions(eccGr))
            return false;
        
        // This field exists in javascript *only*, it is not a member of the GlideRecord, and will not persist across
        // execution contexts. This is used to ensure that only *one* sensor will process any given ecc_queue GR
        eccGr.isProcessed = true;
        return true;
    },
    
    /*
     * Determine if the given ecc_queue record should be processed by the Discovery sensor processor
     * @param eccGr: the GlideRecord ecc_queue record to inspect ('current' when run from a BR condition)
     * returns: true if sensor script should be run, otherwise false
     */
    discovery: function(eccGr) {
        // In addition to our common skip conditions, we don't want discovery to process a record that's intended for
        // runbook automation
        var agent_correlator = eccGr.agent_correlator + '';
		if (this._commonSkipConditions(eccGr) ||
                agent_correlator.indexOf('rba.') === 0)
            return false;
        
		// If the probe results are the same as the last time we ran discover, then we will not need to process this sensor
		// The ecc_queue will be marked processed if this is the case.
		var payload = SNC.ParameterEncrypter.decryptIfFullyEncrypted(eccGr.payload) + '';
		if (payload == 'processed' || new GlideXMLParameters(payload).get('snc_payload_processed')) {
			eccGr.state = 'processed';
			eccGr.processed = (new GlideDateTime()).getDisplayValue();
			eccGr.update();
			
			// Update discovery status completed count
			DiscoveryStatus.updateStatusCompletedCount(agent_correlator);
			
			// Update the device history completed count
			var dh = new DeviceHistoryJS();
			dh.reinitialize(eccGr.source + '', agent_correlator);
			dh.completed();
			
			return false;
		}
		
		// If the record is a PatternDebuggerProbe it should be processed synchronously
		// rather than put into the sys_trigger table for later processing
		// this is safe to do since the Pattern Debugger Sensor processes in less than 1 second
		if ((eccGr.topic + '') == 'PatternDebuggerProbe'){
			var job = new DiscoverySensorJob();
			job.process();
			
			return false;
		}
		
        // This field exists in javascript *only*, it is not a member of the GlideRecord, and will not persist across
        // execution contexts. This is used to ensure that only *one* sensor will process any given ecc_queue GR.
        eccGr.isProcessed = true;
        return true;
    },
    
	discoveryAccelerator: function(eccGr) {
		return (this.subnetDiscovery(eccGr) || this.midAutoConfig(eccGr));
	},
	
	/*
     * Determine if the given ecc_queue record should be processed by the midServer auto config processor
     * @param eccGr: the GlideRecord ecc_queue record to inspect ('current' when run from a BR condition)
     * returns: true if MidServerAutoConfig processor script should be run, otherwise false
     */
	midAutoConfig: function(eccGr) {
		if (this._commonSkipConditions(eccGr))
            return false;
		if (eccGr.topic != 'LightShazzam')
			return false;
		// This field exists in javascript *only*, it is not a member of the GlideRecord, and will not persist across
        // execution contexts. This is used to ensure that only *one* sensor will process any given ecc_queue GR
        eccGr.isProcessed = true;
        return true;
	},

    /*
     * Determine if the given ecc_queue record should be processed by the subnet discovery sensor processor
     * @param eccGr: the GlideRecord ecc_queue record to inspect ('current' when run from a BR condition)
     * returns: true if sensor script should be run, otherwise false
     */
    subnetDiscovery: function(eccGr) {
        if (this._commonSkipConditions(eccGr))
            return false;

		if (eccGr.name != 'Subnet Probe' || eccGr.topic != 'CommandPipeline')
			return false;

        // This field exists in javascript *only*, it is not a member of the GlideRecord, and will not persist across
        // execution contexts. This is used to ensure that only *one* sensor will process any given ecc_queue GR
        eccGr.isProcessed = true;
        return true;
    },

    /*
     * For local use, the set of common validations shared by all condition checks
     * @param eccGr: the GlideRecord ecc_queue record to inspect
     * returns: true if we should skip this ecc_queue record, false otherwise
     */
    _commonSkipConditions: function(eccGr) {
        // A hash of topics that we want to skip
        var badTopics = {
            'HeartbeatProbe': '',
            'config.file': '',
            'SystemCommand': '',
			'ConnectorProbe': ''
        };
        
        // If any of the below conditions evaluate to true, we should skip this ecc_queue GlideRecord
        if (!eccGr ||
                eccGr.isProcessed ||
                !eccGr.agent.startsWith('mid.server.') ||
                eccGr.queue != 'input' ||
                eccGr.state != 'ready' ||
                eccGr.topic.startsWith('queue.') ||
                eccGr.topic.startsWith('MIDExtension') ||
                eccGr.topic in badTopics)
            return true;
        
        return false;
    },		
	
	/*
     * The set of common validations for output ecc_queue updates during sensor processing
     * @param eccGr: the GlideRecord ecc_queue record to inspect
     * returns: true if we should skip this ecc_queue record, false otherwise
     */
	skipSensorConditions: function(eccGr) {
		// A hash of topics that we want to skip
        var skipTopics = {
            'HeartbeatProbe': '',
            'config.file': '',
            'SystemCommand': '',
			'ConnectorProbe': ''
        };
		
		if (!eccGr ||
            eccGr.topic.startsWith('queue.') ||
            eccGr.topic.startsWith('MIDExtension') ||
            eccGr.topic in skipTopics)
            return true;
        
		if (eccGr.state.changesFrom('processing'))
			return true
		
		if (eccGr.state.changesFrom('ready') && eccGr.state.changesTo('processing'))
			return true
		
		
        return false;
	}
};