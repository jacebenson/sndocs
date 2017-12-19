var MIDExtensionContext = Class.create();

MIDExtensionContext.prototype = {
	CLUSTER_MEMBER_M2M: 'ecc_agent_cluster_member_m2m',
	CLUSTER_TABLE: 'ecc_agent_cluster',
	ECC_AGENT_CAPABILITY_M2M: 'ecc_agent_capability_m2m',
	AGENT_TABLE: 'ecc_agent',
	ECC_QUEUE_TABLE: 'ecc_queue',
	LOAD_BALANCE: 'Load Balance',
	FAILOVER: 'Failover',
	type: 'MIDExtensionContext',

	initialize: function(gr, formData) {
		// Get the real record of extended tables. This is necessary because
		// the script can be invoked on records on the base context table (such
		// as by the business rule "Failover MID Server Extension").
		var gru = GlideScriptRecordUtil.get(gr);
		var realGr = gru.getRealRecord();
		this.contextGr = realGr;

		if (JSUtil.notNil(formData))
			for (var key in formData)
				realGr.setValue(key, this.decodeHTML(formData[key]));

		// Add known parameters from the base table.
		this.payloadDoc = new GlideXMLDocument(MIDExtensionConstants.PARAMETERS);
		this.addParameter(MIDExtensionConstants.PARAMETER_CONTEXT_SYS_ID, realGr.sys_id);
		this.addParameter(MIDExtensionConstants.PARAMETER_CONTEXT_NAME, realGr.name);
		this.addParameter(MIDExtensionConstants.PARAMETER_EXTENSION_NAME, realGr.extension.name);
		this.addParameter(MIDExtensionConstants.PARAMETER_EXTENSION_CLASS_NAME, realGr.extension.class_name);
		
		// Add all fields from extended tables as context data.
		var contextData = {};
		var fields = realGr.getFields();
		for (index = 0; index < fields.size(); index++) {
			var elem = fields.get(index);
			// skip if field is from the base table
			var descriptor = elem.getED();
			if (descriptor.getTableName() == MIDExtensionConstants.CONTEXT_TABLE)
				continue;

			// skip if nil value
			var name = elem.getName() + '';
			var value = elem.getElementValue(name);
			if (JSUtil.nil(value))
				continue;

			if (descriptor.isReference())
				contextData[name] = MIDExtensionRelatedListUtil.getReferenceData(descriptor, value);
			else
				contextData[name] = value + '';
		}

		// Add all related lists data.
		MIDExtensionRelatedListUtil.getAllRelatedData(realGr, contextData);

		// Add parameter as JSON string.
		this.addParameter(MIDExtensionConstants.PARAMETER_CONTEXT_DATA, JSON.stringify(contextData));
	},

	decodeHTML: function(htmlEncoded) {
		return htmlEncoded.replace(/&apos;/g, "'")
							.replace(/&quot;/g, '"')
							.replace(/&gt;/g, '>')
							.replace(/&lt;/g, '<')
							.replace(/&amp;/g, '&');
	},

	addParameter: function(name, value) {
		var el = this.payloadDoc.createElement(MIDExtensionConstants.PARAMETER);
		el.setAttribute(MIDExtensionConstants.PARAMETER_NAME, name);
		el.setAttribute(MIDExtensionConstants.PARAMETER_VALUE, value);
	},

	start: function() {
		this.sendCommand(MIDExtensionConstants.COMMAND_START);
	},

	stop: function() {
		this.sendCommand(MIDExtensionConstants.COMMAND_STOP);
	},

	restart: function() {
		this.sendCommand(MIDExtensionConstants.COMMAND_RESTART);
	},

	testParameters: function() {
		return this.sendCommand(MIDExtensionConstants.COMMAND_TEST_PARAMETERS);
	},

	updateParameters: function() {
		this.sendCommand(MIDExtensionConstants.COMMAND_UPDATE_PARAMETERS);
	},

	sendCommand: function sendCommand(command) {
		var agentSysId;
		var agentGr;
		switch (command) {
			case MIDExtensionConstants.COMMAND_START:
				// if already started and mid server is up then don't do anything
				if (this.isExecuting() && JSUtil.notNil(this.getCurrentMidserver()))
					return null;

				// if no MID server can be selected, mark it offline
				agentSysId = this.selectMidServer();
				if (JSUtil.nil(agentSysId)) {
					this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_OFFLINE;
					this.contextGr.error_message = 'MID Server down';
					this.contextGr.update();
					return null;
				}

				// got a MID server to start it on
				this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STARTING;
				this.contextGr.executing_on = agentSysId;
				this.contextGr.error_message = '';
				break;
			case MIDExtensionConstants.COMMAND_STOP:
				// if already stopped then don't do anything
				if (this.contextGr.status == MIDExtensionConstants.CONTEXT_STATUS_STOPPED)
					return null;

				// if offline, go ahead and update to stopped
				if (this.contextGr.status == MIDExtensionConstants.CONTEXT_STATUS_OFFLINE) {
					this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STOPPED;
					this.contextGr.update();
					return null;
				}

				// attempt to stop
				agentSysId = this.contextGr.executing_on;
				this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_STOPPING;
				break;
			case MIDExtensionConstants.COMMAND_RESTART:
				// use current assigned MID server if it's up
				// select new one if not assigned or down
				agentSysId = this.reselectMidServer();

				// if no MID server can be selected, mark it offline
				if (JSUtil.nil(agentSysId)) {
					this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_OFFLINE;
					this.contextGr.error_message = 'MID Server down';
					this.contextGr.update();
					return null;
				}

				// attempt to restart
				this.contextGr.status = MIDExtensionConstants.CONTEXT_STATUS_RESTARTING;
				this.contextGr.error_message = '';
				break;
			case MIDExtensionConstants.COMMAND_TEST_PARAMETERS:
				// use current assigned MID server if it's up
				// select new one if not assigned or down
				agentSysId = this.reselectMidServer();

				if (JSUtil.nil(agentSysId))
					return null;
				break;
			case MIDExtensionConstants.COMMAND_UPDATE_PARAMETERS:
				// if not already started then don't do anything
				if (!this.isExecuting())
					return null;

				agentSysId = this.contextGr.executing_on;
				break;
		}
		// only update context record if command is not test parameters;
		// this is important because we send dirty data from the form that
		// we don't want to save
		if (command != MIDExtensionConstants.COMMAND_TEST_PARAMETERS)
			this.contextGr.update();

		agentGr = new GlideRecord(this.AGENT_TABLE);
		agentGr.get(agentSysId);
		
		this.addParameter(MIDExtensionConstants.PARAMETER_EXTENSION_COMMAND, command);

		var classNameTokens = this.contextGr.extension.class_name.split('.');
		var className = classNameTokens[classNameTokens.length - 1];
		var gr = new GlideRecord(this.ECC_QUEUE_TABLE);
		gr.payload = this.payloadDoc.toString();
		gr.agent = 'mid.server.' + agentGr.name;
		gr.topic = 'MIDExtension' + ':' + className;
		gr.name = this.contextGr.extension.name + ':' + this.contextGr.name + '(' + this.contextGr.sys_id + ')';
		gr.state = 'ready';
		gr.queue = 'output';
		var ecc_queue_id = gr.insert();
		return ecc_queue_id;
	},

	isExecuting: function() {
		return this.contextGr.status == MIDExtensionConstants.CONTEXT_STATUS_STARTED ||
				this.contextGr.status == MIDExtensionConstants.CONTEXT_STATUS_WARNING;
	},

	getCurrentMidserver: function() {
		// return the current assigned MID server if it's up
		var agentSysId = this.contextGr.executing_on;
		if (JSUtil.notNil(agentSysId)) {
			agentGr = new GlideRecord(this.AGENT_TABLE);
			agentGr.get(agentSysId);
			if (agentGr.status == MIDExtensionConstants.AGENT_STATUS_UP)
				return agentSysId ;
		}
		return null;
	},

	reselectMidServer: function() {
		// use current assigned MID server if it's up
		// select new one if not assigned or down
		var agentSysId = this.getCurrentMidserver();
		return JSUtil.notNil(agentSysId) ? agentSysId : this.selectMidServer();
	},

	selectMidServer: function() {
		// if specific server is selected, make sure that it's up
		if (this.contextGr.execute_on == MIDExtensionConstants.CHOICE_MID_SERVER) {
			var agentGr = new GlideRecord(this.AGENT_TABLE);
			agentGr.get(this.contextGr.mid_server);
			return (agentGr.status == MIDExtensionConstants.AGENT_STATUS_UP) ?
				this.contextGr.mid_server : null;
		}

		// if selecting from cluster, collect the list of up servers in the cluster
		var agentsGr;
		var agents = [];
		if (this.contextGr.execute_on == MIDExtensionConstants.CHOICE_MID_SERVER_CLUSTER) {
			var clusterGr = new GlideRecord(this.CLUSTER_TABLE);
			clusterGr.get(this.contextGr.mid_server_cluster);
			agentsGr = new GlideRecord(this.CLUSTER_MEMBER_M2M);
			agentsGr.addQuery('cluster', this.contextGr.mid_server_cluster);
			agentsGr.query();
			while (agentsGr.next()) {
				if (agentsGr.agent.status == MIDExtensionConstants.AGENT_STATUS_UP)
					agents.push('' + agentsGr.agent);
			}
		}

		// if no MID server is available, return null and the context
		// will be marked offline
		if (agents.length == 0)
			return null;

		// randomly pick one from the list
		var pick = Math.floor(Math.random() * agents.length);
		return agents[pick];
	}
};