var WebServiceActivityHandler = Class.create();
WebServiceActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {

    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
        this.endpoint = '';
        this.variables = '';
        this.use_midserver = 'false';
        this.midserver = '';
        this.executionType = '';
    },

    onExecute: function() {
		var execId = '';
		var outputPayload = '';
        activity.state = 'waiting';
        try {
            this._getValues();
            this._processValues();

            if (activity.state == 'finished')
                return;

            if (gs.nil(this.web_service_message)) {
                this.setResultFailed('Message is not selected');
                activity.state = 'finished';
                return;
            }

            if (gs.nil(this.web_service_message_function)) {
                this.setResultFailed('Message function is not selected');
                activity.state = 'finished';
                return;
            }

            this.mo = this._getMessageObject();
            if (!this.mo) {
                this.setResultFailed('Error creating message object with given message and function parameters');
                activity.state = 'finished';
                return;
            }

            // Handle parameters sent to the web service message
            var params = this.getMessageParameters();
            if (params)
                for (var param in params) {
                    this.mo.setStringParameter(param, params[param]);
					outputPayload += param + ' ' + params[param];
				}

            var xmlParams = this.getXmlMessageParameters();
            if (xmlParams)
                for (var xmlParam in xmlParams) {
                    this.mo.setXMLParameter(xmlParam, xmlParams[xmlParam]);
					outputPayload += xmlParam + ' ' + xmlParams[xmlParam];
				}

			// Set authentication
			this.setAuthentication();
			
            // If there is an endpoint set, override the one in the message object
            if (!gs.nil(this.endpoint)) {
                this._setEndpoint();
				var ePoint = this.endpoint + '';
				outputPayload += ePoint;
			}

			var func = this.web_service_message_function + '';
			outputPayload += func;
			
            // If we're supposed to use a MID server, if one is not specified, find one using
            // the finder, otherwise just use the specified one
            if (this.use_midserver != 'false') {
                if (gs.nil(this.midserver)) {
                    var midSel = new MIDServerSelector();
                    midSel.setCapabilities([this.capability]);
                    var target = this._getTargetHost(this.endpoint);
                    if (gs.nil(target)) {
                        activity.state = 'finished';
                        return;
                    }
                    var mid = midSel.findAgent(target);
                    this.errorMsg = midSel.getError();
                    this.warningMsg = midSel.getWarning();
      
                    if (!gs.nil(this.warningMsg))
                        this.warn(this.warningMsg);

                    if (!gs.nil(this.errorMsg)) {
                        this.setResultFailed(this.errorMsg);
                        activity.state = 'finished';
                        return;
                    }
                    this.mo.setMIDServer(mid);
                } else
                    this.mo.setMIDServer(this.midserver);

                // Need these fields on the queue record to trigger the event for probe complete and have 
                // it come back to the handler method below
                this.mo.setEccParameter('skip_sensor', 'true');
                this.mo.setEccParameter('workflow', activity.sys_id);
                this.mo.setEccCorrelator('rba.' + activity.context.sys_id);
            }

            try {
                execId = SNC.OrchestrationUsage.logExecution(activity.context.sys_id, activity.activity.sys_id, 
                    this.executionType, this.endpoint, 'useMid=' + this.use_midserver);
                this.mo.setEccParameter('execution_sys_id', execId);
            } catch (e) {
                gs.log('Error logging orchestration execution in WebServiceActivityHandler: ' + e.getMessage());
            }

            this.response = this._launch();

            if (this.use_midserver == 'false') {
                var httpStatus = this._getStatusCode();

			    if (this._hasOtherErrors()) {
                    activity.state = 'finished';
                    return;
                }
			   
				// Failure outside of the 200 range
                if (httpStatus < 200 || httpStatus >= 300) {
                    var errorMsg = "Request failed with status code: " + httpStatus
									+ "\n" + this._getOutput();
                    this.setResultFailed(errorMsg);
                    workflow.error(errorMsg);
                    activity.state = 'finished';
                    return;
                }

				var inputPayload = this._getOutput() + '';
				// Update with I/O payload size here when we don't use the MID
				try {
					SNC.OrchestrationUsage.updateExecutionLog(execId, inputPayload, outputPayload);
				} catch (exep) {
					gs.log('Error updating orchestration execution in WebServiceActivityHandler: ' + exep.getMessage());
				}

                this.setActivityOutput(this._getOutput());
                this.processResults();
            }
        } catch (ex) {
            this.setResultFailed(ex);
            activity.state = 'finished';
        }
    },

    onProbe_complete: function() {
		if (!gs.nil(arguments) && !gs.nil(arguments[1]))
			SncRBSensorProcessor.validateProbeGlobals(arguments[1].ecc_id);
		
		activity.state = 'finished';

        this.setActivityOutput(this._getRawOutput());
        this.response = activity.output;
        var httpStatus = this._getHttpStatus();

		try {
			var execId = this._getExecLogId();
			var inputPayload = this._getRawOutput();
			var outputPayload = "";
			var ecc = new GlideRecord(GlideappIECC.ECC_QUEUE);
			ecc.addQuery(GlideappIECC.AGENT_CORRELATOR, 'rba.' + activity.context.sys_id);
			ecc.addQuery(GlideappIECC.ECC_QUEUE, GlideappIECC.OUTPUT);
			ecc.query();
			if (ecc.next()) {
				outputPayload = ecc.getValue("payload");
			}
			SNC.OrchestrationUsage.updateExecutionLog(execId, inputPayload, outputPayload);
		} catch (e) {
			gs.log('Error updating orchestration execution log in WebServiceActivityHandler: ' + e.getMessage());
		}
		
        var error = this._getError();
        if (error) {
            workflow.error(error);
            this.setResultFailed(error);
            return;
        }

        if (this._hasOtherErrors())
            return;

        this.processResults();
    },

    processResults: function() {
        activity.state = 'finished';

        this.setResultSuccessful();
        this.processResponse();

        var sensorScript = this.getSensorScript();
        if (!sensorScript)
            return;
     
        this._evalScript(sensorScript);
    },

    processResponse: function() {
    },

    getMessageParameters: function() {
        // Process the variables string, and add them to the web service message for substitution
        var messageParams = {};
        if (!gs.nil(this.variables)) {
            var params = this._processVars();
            for (var name in params) {
                messageParams[name] = params[name];
            }
        }
        return messageParams;
    },

    /**
     * Current planned usage for this method is for activities extending this activity
     */
    getXmlMessageParameters: function() {
        var xmlMessageParams = {};
        return xmlMessageParams;
    },
	
	/**
	 * Current planned usage for this method is for those needing to use this to extend SOAP Message or REST Message and give this
	 * method a body in the extended class to populate the fields accordingly
	 */
	setAuthentication: function() {
	},

    getSensorScript: function() {
        return this.js(activity.vars.sensor_script);
    },

    _checkOtherErrors: function() {
    },

    _getEccResultParameter: function(params, name) {
        var value = '';
        for (var i = 0; i < params.length; i++)
            if (params[i]['@name'] == name) {
                value = params[i]['@value'];
                break;
            }

        return value;
    },

    _getHttpStatus: function() {
        if (document.parameters && document.parameters.parameter)
            return this._getEccResultParameter(document.parameters.parameter, 'http_status_code');

        return 0;
    },

	_getExecLogId: function() {
        if (document.parameters && document.parameters.parameter)
            return this._getEccResultParameter(document.parameters.parameter, 'execution_sys_id');

        return '';
    },

    _getMessageObject: function() {
    },
  
    _getOutput: function() {
    },

    _getStatusCode: function() {
    },

    _getValues: function() {
    },

    _hasOtherErrors: function() {
    },

    _processValues: function() {
    },

    _setEndpoint: function() {
    },

    _evalScript: function(s) {
        var scriptId = activity.name + '.' + activity.sys_id;
        
        var answer = workflow.evaluateString(s, scriptId); // evaluate: cache/compile the script
 
        if (workflow.isFailed()) {
            workflow.error(answer);
            this.setResultFailed(answer);
        }
    },

    _getRawOutput: function() {
        if (!document.result)
            return '';

        var output = document.result.output;
        if (!output)
            output = '';

        return output;
    },


    _getError: function() {
        var error = document['@error'];
        if (error)
            return error;

      if (document.result) {
          var error = document.result['@error'];
          if (error)
             return error;

          error = document.result.error;
          if (error)
              return error;
        }

        return '';
    },

    _getTargetHost: function(url) {
        var host = '';
        try {
            var urlObj = new Packages.java.net.URL(url);
            host = urlObj.getHost() + '';
        } catch (e) {
            var err = 'Unable to parse the provided URL: ' + e;
            workflow.error(err);
            this.setResultFailed(err);
        }

        return host;
    },

    _processVars : function() {
        var pairs = this._split(this.variables, '\\', ',');
        var params = {};

        for (var i = 0; i < pairs.length; i++) {
            var s = pairs[i];
            var pair = this._split(s, '\\', '=');
            if (pair.length == 2)
                params[pair[0]] = pair[1];
            else
                workflow.warning("Unable to process parameter: " + s);
        }

        return params;
    },

    _split : function(origStr, escape, delimiter) {
        var parts = [];
        var str = "";
        var start = 0;
        var i = 0;

        for (i = 0; i < origStr.length; i++) {
            if (origStr[i] == delimiter) {
                if (i > 0 && origStr[i-1] == escape)
                    continue;

                str = origStr.substr(start, i - start);
                str = this._trim(str);
                str = this._cleanEscapeChar(str, escape, delimiter);
                parts.push(str);
                start = i + 1;
            }
        }

        str = origStr.substr(start, i - start);
        str = this._trim(str);
        str = this._cleanEscapeChar(str, escape, delimiter);
        parts.push(str);

        return parts;
    },

    _cleanEscapeChar : function(str, escapeChar, delimiter) {
        var newstr = str.replace(escapeChar + delimiter, delimiter);
        while (newstr != str) {
            str = newstr;
            newstr = str.replace(escapeChar + delimiter, delimiter);
        }
        return newstr; 
    },

    _trim : function(str) {
		return str.trim(); 
    },

    type: 'WebServiceActivityHandler'
});