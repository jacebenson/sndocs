var MIDServerManage = Class.create();

MIDServerManage.ECC_PRIORITY = '0';
MIDServerManage.SELECTION_CRITERIA = {
	"CAPABILITY": {
		"TABLE": "ecc_agent_capability_m2m",
		"ALL": "eeab973fd7802200bdbaee5b5e610381" },
	"APPLICATION": {
		"TABLE": "ecc_agent_application_m2m",
		"ALL": "35aa573fd7802200bdbaee5b5e610375" },
	"IP_RANGE": {
		"TABLE": "ecc_agent_ip_range_m2m",
		"ALL": "2e0c973fd7802200bdbaee5b5e6103fd"}
};

MIDServerManage.prototype = {
    restart: function(agent_name) {
        this.system_msg(agent_name, 'restart');
        gs.addInfoMessage('MID Server JVM restarting');
    },
	
    restartService: function(agent_name) {
        this.system_msg(agent_name, 'restartService');
        gs.addInfoMessage('MID Server restarting');
    },
    
    stop: function(agent_name) {
        this.system_msg(agent_name, 'stop');
        gs.addInfoMessage('MID Server stopping');
    },

    pauseMid: function(agent_name) {
        this.system_msg(agent_name, 'pauseMid');
        gs.addInfoMessage('MID Server ' + agent_name + ' paused');
    },

    resumeMid: function(agent_name) {
        this.system_msg(agent_name, 'resumeMid');
        gs.addInfoMessage('MID Server ' + agent_name + ' resuming');
    },

    autoUpgrade: function(agent_name) {
        var gr = this.ensureAgent(agent_name);
        if (gr)
            this.system_msg(agent_name, 'autoUpgrade');
    },

    threaddump: function(agent_name) {
        this.system_msg(agent_name, 'threaddump');
        gs.addInfoMessage('Getting MID Server thread dump');
    },    
	
    upgrade: function(agent_name) {
        this.system_msg(agent_name, 'upgradeNow');
        gs.addInfoMessage('MID Server upgrading');
    },
    
    grab_logs: function(agent_name, logs) {
        var logs_array = logs.split(',');
        for (var i = 0; i < logs_array.length; i++) {
            var log = logs_array[i];
            this.system_msg(agent_name, 'grabLog', log);
        }
        gs.addInfoMessage('Grabbing MID Server Logs');
    },
    
    test_probe: function(agent_name, probe_id, topic, ename, source) {
        var probe = SncProbe.getById(probe_id);
        probe.setTopic(topic);
        probe.setName(ename);
        probe.setSource(source);
        probe.setEccPriority(MIDServerManage.ECC_PRIORITY);
        probe.addParameters(probe_id);
        return probe.create(agent_name);
    },
	
    resetQueryWindow: function(agent_name) {
        this.system_msg(agent_name, 'resetQueryWindow');
        gs.addInfoMessage('MID Server resetting query window');
    },
	
	rekey: function(agent_name) {
		this.cancelSystemMsg(agent_name, 'delete_mid_keypair');
		
		var gr = this.ensureAgent(agent_name);
		if (gr) {
			gr.setValue('validated', 'rekey');
			gr.update();
			
			this.system_msg(agent_name, 'delete_mid_keypair', 'Rekey');
			gs.addInfoMessage('MID Server undergoing rekey');
		}
	},
	
	invalidate: function(agent_name) {
		this.cancelSystemMsg(agent_name, 'delete_mid_keypair');
		
		var gr = this.ensureAgent(agent_name);
		if (gr) {
			gr.setValue('validated', 'false');
			gr.update();
			
			this.system_msg(agent_name, 'delete_mid_keypair', 'Invalidate');
			gs.addInfoMessage('MID server being invalidated');
		}
	},
	
	installNmap: function(agent_name, nmap_url, nmap_npcap_version, nmap_safe_scripts) {
		// triger SystemCommand to install Nmap with interactive priority
		var probe = new SncProbe();
		probe.topic = 'SystemCommand';
		probe.source = 'installNmap';
		probe.eccPriority = '0';
		probe.addParameter('nmap_installer_url', nmap_url);
		probe.addParameter('nmap_npcap_version', nmap_npcap_version);
		probe.addParameter('nmap_safe_scripts', nmap_safe_scripts);
	    return probe.createForMidServer(agent_name, null);
	},
	
	uninstallNmap: function(agent_name) {
		// triger SystemCommand to uninstall Nmap with interactive priority
		var probe = new SncProbe();
		probe.topic = 'SystemCommand';
		probe.source = 'uninstallNmap';
		probe.eccPriority = '0';
	    return probe.createForMidServer(agent_name, null);
	},
	
	validate: function(agent_name) {
		var gr = this.ensureAgent(agent_name);
		if (gr) {			
			// Check current mid server version
			var version = gr.getValue('version') + '';
			
			// For some old version mid servers(GP0 to GP7 or HP0 to HP3), they don't have the code to set validate 
			// field and we still allow customer to use them. So we simply set validate to true otherwise go through
			// the validating process. See PRB683751
			if (this.needsValidatingProcess(version))
				gr.setValue('validated', 'validating');
			else
				gr.setValue('validated', 'true');
			
			gr.update();
			this.system_msg(agent_name, 'restartService');
			gs.addInfoMessage('MID server being validated');
		}
	},
	
	// Pass in a mid version and return if this mid needs to go through the validating process.
	// If return false, when validating mid server, we'll simply set the validate field to true
	// instead of setting it to validating and let mid sever set it to true.
	// EXAMPLE of pinVersion: helsinki-03-16-2016__patch2-06-15-2016_06-30-2016_1135.zip
	needsValidatingProcess: function(version) {
		if ((version.indexOf('helsinki') == -1) && (version.indexOf('geneva') == -1))
			return true;
		return false;
	},
	
	isAgentValid: function(agent_id) {
		// if this property is set to true, then the MID server will always be considered valid
		if (JSUtil.toBoolean(gs.getProperty('glide.ecc_agent.validated.override')))
			return true;
		
		if (!agent_id)
			return false;

		if (~agent_id.indexOf('mid.server.')) {
			var agent = MIDServer.getByName(agent_id);
			if (agent)
				agent_id = agent.sysID;
			else
				return false;
		}

		var gr = new GlideRecord('ecc_agent');
		if (!gr.get(agent_id))
			return false;

		return JSUtil.getBooleanValue(gr, 'validated');
	},
	
	cancelSystemMsg: function(agent_name, cmd, name) {
		var gr = new GlideRecord('ecc_queue');
		gr.addQuery('agent', 'mid.server.' + agent_name);
		gr.addQuery('topic', 'SystemCommand');
		gr.addQuery('source', cmd);
		if (name)
			gr.addQuery('name', name);
		gr.query();
		
		while (gr.next()) {
			gr.state = 'processed';
			gr.update();
		}
	},
	
    system_msg: function(agent_name, cmd, name) {
        var probe = new SncProbe();
        probe.setTopic('SystemCommand');
        probe.setSource(cmd);
        probe.setEccPriority(MIDServerManage.ECC_PRIORITY);

        if (name)
            probe.setName(name);
        
        probe.create(agent_name);
    },
		
	ensureAgent: function(agent_name) {
		var gr = new GlideRecord('ecc_agent');
		gr.addQuery('name', agent_name);
		gr.query();
		if (!gr.next())
			gs.addInfoMessage('Agent' + agent_name + ' cannot be found in the MID server table');
		else
			return gr;
	},

	hasBehavior: function(agent) {
		var sc = MIDServerManage.SELECTION_CRITERIA;
		for (var criteria in sc) {
			var gr = new GlideRecord(sc[criteria].TABLE);
			gr.addQuery("agent", agent);
			gr.query();
			if (gr.next())
				return true;
		}

		return agent;
	},

	hasNmapCapability: function(agent) {
		var capGr = new GlideRecord('ecc_agent_capability');
		capGr.addQuery('capability', 'Nmap');
		capGr.query();
		if(!capGr.next())
			return false;
		
		var midCapGr = new GlideRecord('ecc_agent_capability_m2m');
		midCapGr.addQuery('agent', agent);
		midCapGr.addQuery('capability',capGr.getValue('sys_id'));
		midCapGr.query();
		return midCapGr.hasNext();	
	},

	setSelectionCriteria: function(agent, capabilities, applications, ipRanges) {
		var gr;
		// First clear all selection criteria
		var sc = MIDServerManage.SELECTION_CRITERIA;
		for (var criteria in sc) {
			gr = new GlideRecord(sc[criteria].TABLE);
			gr.addQuery("agent", agent);
			gr.query();
			gr.deleteMultiple();
		}

		// Add 'ALL' type for each selection criteria if applicable
		// If not applicable, we are done since we have already deleted the criteria
		if (capabilities === 'true') {
			gr = new GlideRecord(sc.CAPABILITY.TABLE);
			gr.agent = agent;
			gr.capability = sc.CAPABILITY.ALL;
			gr.insert();
		}

		if (applications === 'true') {
			gr = new GlideRecord(sc.APPLICATION.TABLE);
			gr.agent = agent;
			gr.application = sc.APPLICATION.ALL;
			gr.insert();
		}

		if (ipRanges === 'true') {
			gr = new GlideRecord(sc.IP_RANGE.TABLE);
			gr.agent = agent;
			gr.ip_range = sc.IP_RANGE.ALL;
			gr.insert();
		}
	},

	clearCookies: function(agent_name) {
		this.system_msg(agent_name, 'clear_cookies');
		gs.addInfoMessage('MID Server clearing cookies');
	},

	/**
	 * Insert or update an issue based on MID, source and message.  Existing resolved issues are ignored.
	 *
	 */
	createOrUpdateIssue: function(midSysId, issueSource, issueMessage) {
		var issueSysId;

		var issue = new GlideRecord('ecc_agent_issue');
		issue.addQuery('mid_server', midSysId);
		issue.addQuery('source', issueSource);
		issue.addQuery('message', issueMessage);
		issue.addQuery('state', '!=', 'resolved');
		issue.query();

		if (issue.next()) {
			issueSysId = issue.getValue('sys_id');
			// issue exists, just update last_detected and count
			issue.setValue('last_detected', new GlideDateTime());
			issue.setValue('count', (+ issue.getValue('count')) + 1);
			issue.update();
		} else {
			issue.initialize();
			issue.setValue('mid_server', midSysId);
			issue.setValue('source', issueSource);
			issue.setValue('message', issueMessage);
			issue.setValue('last_detected', new GlideDateTime());
			issueSysId = issue.insert();
		}

		return issueSysId;
	},
	
	/**
	 * Resolve all open (acknowledged, new) issues for a given MID Server, source and (optionally) message.
	 * If a message is given, only issues that match the message will be resolved.
	 *
	 */
	resolveExistingIssues: function(midSysId, issueSource, issueMessage) {
		var openIssues = new GlideRecord('ecc_agent_issue');
		openIssues.addQuery('mid_server', midSysId);
		openIssues.addQuery('source', issueSource);
		openIssues.addQuery('state', '!=', 'resolved');
		if (JSUtil.notNil(issueMessage))
			openIssues.addQuery('message', issueMessage);
		openIssues.query();
		openIssues.setValue('state', 'resolved');
		openIssues.updateMultiple();
	},

    type: 'MIDServerManage'
};