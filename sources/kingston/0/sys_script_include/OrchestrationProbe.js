var OrchestrationProbe = Class.create();

OrchestrationProbe.prototype = {
   initialize: function(executingGR) {
      this.executingID = (executingGR ? executingGR.sys_id : executing.sys_id);
      this.activityID = (executingGR ? executingGR.activity.sys_id : executing.activity.sys_id);
      this.executingGRName = executingGR.name;
      this.contextID = (executingGR ? executingGR.context.sys_id : executing.context.sys_id);
      this.credential_tag = executingGR ? executingGR.vars.credential_tag : "";
      this.parameters = {};
      this.agent = "";
      this.output = "";
      this.probeName = null;
      this.executionParameters = "";
      this.source = "";
      this.target = "";
      this.name = "";
      this.skip_sensor = true;
      this.capabilities = [];

      this.infoMsg = null;
      this.warningMsg = null;
      this.errorMsg = null;
   },
   
   launch: function() {
      if (JSUtil.nil(this.source)) {
          this.errorMsg = 'There is no target for this activity to run against';
          return false;
      }

      if (!this.agent) {
          var midServer = this._findAgent(JSUtil.notNil(this.target) ? this.target : this.source);
          if (JSUtil.nil(midServer))
              return false;

          this.setAgent(midServer);
      }

      var probe = SncProbe.get(this.probeName);
      if (!probe) {
          this.errorMsg = "The probe '" + this.probeName + "' could not be found.";
          return false;
      }

	  //The business rule that injects credentials affinity expects this to be an 
	  //invalid IP address (such as "See Payload" because Shazzam scans multiple 
	  //targets as specified by the payload, not the source field). 
	  if (this.probeName == "Shazzam")
		  probe.setSource("See Payload");
	  else
		  probe.setSource(this.source);
	   
      probe.setCorrelator("rba." + this.contextID);

      if (this.name)
         probe.setName(this.name);

      this.parameters['skip_sensor'] = this.skip_sensor ? "true" : "false";
      this.parameters['workflow'] = this.executingID;

      if (!JSUtil.nil(this.credential_tag))
         this.parameters['credential_tag'] = this.credential_tag;

      var execId = this._logExecution();
      this.parameters['execution_sys_id'] = execId;

      for (var parmName in this.parameters)
         probe.addParameter(parmName, this.parameters[parmName]);

      if (this.output)
          probe.setOutput(this.output);

      probe.create(this.agent);
      return true;
   },
   
   _findAgent: function(target) {
      var midServerFinder = new MIDServerFinder();
      midServerFinder.setRangesByIPOrHostname(target);
      midServerFinder.setCapabilities(this.capabilities);

      var potentialServers = midServerFinder.getMIDServers();

      if (JSUtil.nil(potentialServers) || potentialServers.length == 0) {
          var defaultMidServer = GlideProperties.get("mid.server.rba_default");

          if (!JSUtil.nil(defaultMidServer)) {
              var gr = new GlideRecord('ecc_agent');
              gr.addQuery('name', defaultMidServer);
              gr.query();

              if (!gr.next()) {
                  this.errorMsg = gs.getMessage('The configured default MID Server (' + defaultMidServer + ') is not valid');
                  defaultMidServer = "";
              } else if ('' + gr.status != 'Up') {
                  this.errorMsg = gs.getMessage('The configured default MID Server (' + defaultMidServer + ') is not available');
                  defaultMidServer = "";
              }
          } else
              this.errorMsg = 'There is no MID Server configured to run this activity';

          if (gs.nil(this.errorMsg))
              this.infoMsg = gs.getMessage('The default MID Server is being used.  For more control over which MID server executes commands against a particular target, configure IP Ranges and Capabilities for your MID Servers.');
          return defaultMidServer;
      }

      // Randomly choose one
      var ms = new Date().getMilliseconds();
      var index = ms % potentialServers.length;
      return potentialServers[index];
   },

   addParameter: function(name, value) {
      this.parameters[name] = value;
   },
   
   addParameters: function(gr) {
      for (property in gr.vars) {
         if (property.startsWith('sys_'))
            continue;
         
         var v = gr.vars[property];
         if (!v)
            continue;
         
         this.addParameter(property, gr.vars[property]);
      }
   },

   getInfoMsg: function() {
      return this._wrapWithActivityName(this.infoMsg);
   },

   getWarningMsg: function() {
      return this._wrapWithActivityName(this.warningMsg);
   },

   getErrorMsg: function() {
      return this._wrapWithActivityName(this.errorMsg);
   },
    
   hasParameter: function(param) {
      return this.parameters.hasOwnProperty(param);
   },

   setCapabilities: function(capabilities) {
      this.capabilities = capabilities;
   },
   
   setName: function(name) {
      this.name = name;
   },
   
   setAgent: function(agent) {
      this.agent = agent;
   },

   setOutput: function(str) {
       this.output = str;
   },
   
   setSource: function(source) {
      this.source = source + '';
   },

   setTarget: function(target) {
      this.target = target + '';
   },

   setSkipSensor: function(skip) {
      this.skip_sensor = skip;
   },
   
   setProbeName: function(probeName) {
      this.probeName = probeName;
   },

   setExecutionAttributes: function(parameters) {
      this.executionParameters = parameters;
   },

   _wrapWithActivityName : function(msg) {
      return JSUtil.nil(msg) ? msg : this.executingGRName + ': ' + msg;
   },
   
   _getExecutionType: function() {
      var type = '';

      switch (this.probeName) {
         case 'SSHCommand':
         case 'SSHCommandLong':
            type = 'ssh';
            break;
         case 'Windows - Powershell':
            type = 'powershell';
            break;
         case 'JDBCProbe':
            type = 'jdbc';
            break;
         case 'JavascriptProbe':
            type = 'javascript';
            break;
         default:
            type = 'probe';
            break;
      }

      return type;
   },

   _logExecution: function() {
      try {
         var type = this._getExecutionType();

         if (type == 'probe')
            this.executionAttributes += (this.executionAttributes == '' ? 'probeName=' : ';probeName=') + this.probeName;

         return SNC.OrchestrationUsage.logExecution(this.contextID, this.activityID, type, this.source, this.executionAttributes);
      } catch (e) {
         gs.log('Error while attempting to log Orchestration Execution: ' + e.getMessage());
      }

   },

   type: "OrchestrationProbe"
};