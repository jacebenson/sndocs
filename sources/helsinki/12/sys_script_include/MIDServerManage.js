var MIDServerManage = Class.create();

MIDServerManage.ECC_PRIORITY = '0';

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
	
	validate: function(agent_name) {
		var gr = this.ensureAgent(agent_name);
		if (gr) {
			gr.setValue('validated', 'true');
			gr.update();
			
			this.system_msg(agent_name, 'restartService');
			
			gs.addInfoMessage('MID server being validated');
		}
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
    
    type: 'MIDServerManage'
}