var WorkflowCoordinator = Class.create();
WorkflowCoordinator.prototype = {
	
    initialize: function(parameters, reloadedFlows, activityId) {

		// create the functionality as protected closure using Module
		this.coordinator = (function(parameters, reloadedFlows, activityId) {

				if (!parameters)
					parameters = {};
				
				var settings = {
						workflow: '-no-workflow-set',		
					      retain: true,
							 max: 100,
						poolsize: 10,
							next: 0,             // (internal) next flow to run
						 running: 0, 			// number of flows running 
					   errormode: 'stop'
				};
			
				var errorMessage = "";
				var activityId = executing.activity.sys_id+'';
				
				integerizeParameters(parameters);
				//debug( 'parameters:' + JSUtil.describeObject(parameters) );
				
				$extend(settings, parameters);		// consider $.extend()
			
				if (activityId)
					settings.activityId = activityId;
				
				if (!current)
					return error('Not running from a valid workflow. No current record.');
				
				//debug(JSUtil.describeObject(settings, 'settings'));
				
				// assume one set of empty inputs if none given.
			    var flows = [];
			    if (reloadedFlows)
					flows = reloadedFlows;
				else {
					// load inputs from array.  If none, then just use count. If count > inputs
			    	// duplicate them to fill count
					//
					if (parameters.count)
						if (parameters.count < 1)
							return error("Invalid count");
			
			    	addRequestedFlows();
				}
			
				// discard the orig params now that they are in a 'flow' object, so we don't reload them twice
				if (settings.inputs)
					delete settings.inputs;
				
				function addRequestedFlows() {
					var numInputs = parameters.inputs && parameters.inputs instanceof Array ? parameters.inputs.length : 0;
					var inp = 0;
					var cnt = parameters.count && parameters.count > 0 
								? parameters.count 
								: numInputs;

					debug("inputs: " + numInputs + "  count: " + cnt);

					for (var i = 0; i < cnt; i++) {
						var wfInputs = numInputs == 0 ? {} : parameters.inputs[inp++];
						if (!add(wfInputs))
							return;
						
						if (inp >= numInputs)
							inp = 0;
					}
				}
			
				/** 
				 * Add a workflow with parameters to the list of flows to be launched
				 * 
				 * @param inputs - the input variables to the flow
				 * @param workflow [optional] -the workflow id used to find the workflow version to run
				 * 
				 * @return builder, do more adds, or start()
				 */
				function add(inputs, workflow) {

					if (flows.length >= settings.max) {
						error('Number of flows requested ' + (flows.length+1) + ' exceeds max:' + settings.max);
						return null;
					}
			
					var index = flows.length;
					var flow = new Flow(index, workflow, inputs);
					flows.push(flow);

					return this;
				}

				/**
				 * Return the number of valid flows to be run.
				 */
				function getNumFlows() {
					return flows.length;
				}
			
				function setMax(max) {
					if (isNaN(max+''))
						return error('Max value invalid:' + max);
                    else
					    settings.max = parseInt(max+'');
				}
			
				function setPoolsize(poolsize) {
					if (isNaN(poolsize+''))
						return error('Poolsize value invalid:' + poolsize);
                    else
					    settings.poolsize = parseInt(poolsize+'');
				}
				
				function setWorkflow(workflow) {
					settings.workflow = workflow;
				}
				
				
				/**
				 * Start the batch of flows.  This will run up to 'poolsize' simulaneous flows immediately
				 * and then return. The remaining flows in the queue will be launched as pooled flows
				 * finish, until the queue is exhausted.
				 * 
				 * @param: the executing activity that owns this coordinator
				 * @return int the number of flows initially started.
				 */
				function start(executing) {
					if (errorMessage != '')
						return 'error';
			
					if (flows.length < 1 || settings.running > 0) 
						return error('Cannot start: no flows or already running?   flows:' + flows.length + '  running:' + settings.running);
					
					if (settings.poolsize < 1 || settings.poolsize > settings.max) {
						error('Invalid pool configuraiton, using max for poolsize ' + JSUtil.describeObject(settings));
						settings.poolsize = settings.max;
					}
			
					if (flows.length > settings.max)
						return error('Number of flows requested ' + flows.length + ' exceeds max:' + settings.max);
						
					settings.totalFlows = flows.length;
					
					var numToStart = settings.poolsize < flows.length ? settings.poolsize : flows.length;
					
					debug('starting ' + numToStart + ' initial flows of ' + flows.length + ' total');
			
					settings.parent     = executing.context.sys_id+'';
					settings.originator = executing.sys_id+'';
					
					for (var i = 0; i < numToStart && i < flows.length; i++) {
						var newFlow = startFlow(flows[i]);
						if (newFlow == null && settings.errormode == 'stop') {
							save(activityId);
							return error('Did not start all flows');				
						}
					}
				
					// place ourself in the holding area (which is currently scratchpad under our activity id but
					// will hopefully be a hidden activity variable.
					save(activityId);
					
					if (hasNext() || settings.running > 0)
						return 'waiting';
			
					return 'finished';
				}
				
				/**
				 * Cancels all subf-lows, and will not run any more flows
				 */
				function cancel(reason) {
					settings.reason = reason;
					var workflowHelper = new Workflow();
			
					var context = new GlideRecord('wf_context');
					context.addQuery('sys_id', 'IN', getRunningFlows());
					context.query();
					
					while (context.next())
						workflowHelper.cancelContext(context);
				}
				
				/**
				 * Indicates the number of flows that are currently running.
				 *
				 * @return boolean the # of running flows.
				*/
				function getRunningCount() {
					return settings.running;
				}
				
				/**
				 * Indicates whether there are more flows that need to be run (pooled)
				 *
				 * @return boolean true if more flows need to run.
				*/
				function hasNext() {
					if (isCancelled()) 
						return false;
					
					return settings.next < flows.length;
				}
			
				/**
				 * @return boolean true if the coordinator was cancelled.
				 */
				function isCancelled() {
					return (typeof(settings.reason) !== 'undefined');
				}
			
				
				/**
				 * Tells if a flow is running
				 * 
				 * @param index the index of the flow to ask about.
				 * 
				 * @return boolean true if a given (sub)flow has started
				 */
				function isRunning(index) {
					return getFlow(index).status == 'running';
				}
				
				/**
				 * Tells if a flow is finished
				 * 
				 * @param index the index of the flow to ask about.
				 * 
				 * @return boolean true if a given (sub)flow has ended
				 */
				function isFinished(index) {
					return getFlow(index).status == 'finished';
				}
				
			
				/**
				 * Serialize the data for this object into the running workflow. 
				 * If <strong>depot</strong> is provided, then the data is saved 
				 * to that with the given nameOrId, otherwise it is saved to <strong>
				 * activity.scratchpad.coordinator</strong> by default.
				 */
				function save(nameOrId, depot) {
					var data = {
							settings: settings,
							   flows: flows
					};

					// if caller provided a depot to save to, use that
					//
					if (depot) {
						depot[nameOrId] = data;
						return;
					}
					
					// if an in-flight || launcher is using workflow scratchpad then 
					// keep using it, otherwise use this activity's scratchpad
					//
					if (workflow.scratchpad.coordinator && workflow.scratchpad.coordinator[nameOrId]) {
						workflow.scratchpad.coordinator[nameOrId] = data;
						return;
					}
					
					if (!activity.scratchpad.coordinator) 
						activity.scratchpad.coordinator = {}; 
			
					activity.scratchpad.coordinator = data; 
				}
			
				/**
				 * Indicates that a subflow has finished.
				 *
				 * Sets the result status of a subflow that finished.  
				 * Note: this function places 'index' into the event parameter
				 *       packet to indicate which flow has completed.
				 * 
				 * @param ev : a result packet from the event which holds:
				 *              <li> context    - subflow contet sys_id
				 *              <li> status     - subflow context 'state'
				 *              <li> isComplete - true if the context is complete (?)
				 *   	       <li> result     - subflow context 'result'
				 *
				 * @return string "continue" if flows are still running, "finished" if all are done.
				 *
				 */
				function onFinish(ev) {
					var index = findFlow(ev.context);
					
					debug( 'onFinish() [' + index + ']:' + JSUtil.describeObject(ev, 'eventData')
						 + ' - ' + JSUtil.describeObject(settings, 'settings') );
					
					ev.index = index;
					if (index == -1) {
						debug('onFinish - error on ' + ev.context);
						return 'error';
					}
					
					var flow = getFlow(index);
					settings.running--;
					flow.status = ev.status;
					flow.output = ev.returnValue ? ev.returnValue : {};
			
					// put the coordinator,index, and flow into rhino for use in the completion scripts
					workflow.prepareScriptVariable('coordinator',  this);
					workflow.prepareScriptVariable('index',        index);
					workflow.prepareScriptVariable('flow',         flow);
					
					// assumption: getting here means the flow is done whether or not it finished OK
					var error = false;
					if (settings.next < settings.totalFlows && settings.next < settings.max) {
						debug("onFinish - starting a nother flow:" + settings.next);
						error = startFlow( flows[settings.next] ) == null;
					}

			
					// Make sure the counts and states are valid and saved
					updatePool(settings.retain);
			
					if (error && settings.errormode === 'stop') {
						debug('onFinish() [' + index + ']: error');
						return 'error';		
					}
			
					if (settings.running > 0) {
						debug('onFinish() [' + index + ']: continuing');
						return 'continuing';
					}
					
					debug('onFinish() [' + index + ']: finished');
					return 'finished';
			
					
					function updatePool(toWorkflowScratchpad) {
						if (toWorkflowScratchpad) {
							if (!workflow.scratchpad.coordinator)
								workflow.scratchpad.coordinator = {};
							
							save(settings.activityId, workflow.scratchpad.coordinator);
							
							if (activity.scratchpad.coordinator)
								delete activity.scratchpad.coordinator;
							return;
						}
						
						save(settings.activityId);
					}
				}
			
				
				/**
				 * Returns the error message if any error occurred.  If no errors then this returns
				 * an empty string.
				 * 
				 * @return string the error message or empty
				 */
				function getError() {
					return errorMessage;
				}
			
				/**
				 * Returns the index of a flow by looking it up by contextId
				 * 
				 * @param contextId - the context sys_id to find the internal index of
				 * @return int the index of the flow or -1 if not found
				 */
				function findFlow(contextId) {
					for (var i = 0; i < flows.length; i++) 
						if (flows[i] && flows[i].contextId)
							if (flows[i].contextId == contextId)
								return i;
			
					error("Cannot find flow for context " + contextId);
					return -1;
				}
				
			
				/* 
				 * Internal functions 
				 */
				
			
				/**
				 * @private
				 * @return the context sys_id or  null if the context is not started 
				 */
				function startFlow(flow) {
					var workflowId = ensureWorkflow(flow);
			
					debug('startFlow(' + workflowId + ')  owner:' + settings.owner + '  inputs:' + JSUtil.describeObject(flow.inputs) );
					
					settings.next++;
							
					var context = workflow.startSubflow(workflowId, current, flow.inputs, settings.originator+'');
					if (gs.nil(context)) {
						error("Error launching workflow: " + workflowId + ":" + JSUtil.describeObject(flow.inputs));
						flow.contextId = null;
						flow.status = "error";
						return null;
					}
					else {
						flow.contextId = context.sys_id+'';
						flow.status = "running";
						settings.running++;
						debug('subflow started:' + flow.contextId + ' - ' + JSUtil.describeObject(settings, 'settings'));
					}
					
					return flow.contextId;
				}
				
				
				/**
				 * @private
				 */
				function ensureWorkflow(flow) {
					// if workflow provided in the 'flow' use that.
					var wf = '';
					if (flow.workflow && flow.workflow !== '-no-workflow-set')
						wf = flow.workflow;
					else
						// must be in settings, use that
						if (settings.workflow)
							wf = settings.workflow;
						else
							return error("No workflow");
			
					
					// if it's a sys id, then we're good, use it.
					return getWorkflowForIdentifier(wf);
				}
			
				/**
				 * If a workflow ID is provdided use it else assume its a name and get the ID
				 *
				 * @private  
				 */
				function getWorkflowForIdentifier(wf) {
					wf = wf+'';
				
					// assume its a name and find it.. and get the sys_id
					var workflow = new GlideRecord('wf_workflow');
			
					// if it is valid ID then use it.
					if (GlideStringUtil.isEligibleSysID(wf+'')) 
						if (workflow.get(wf))
							return wf;
					
					// try by name.
					workflow.addQuery('name', wf);
					workflow.query();
					
					if (!workflow.next())
						return "Invalid workflow:" + wf;
			
					if (workflow.hasNext())
						warn('Warning, more than one workflow named:' + wf + ' found.  Using first:' + workflow.sys_id);

					return workflow.sys_id+'';
				}
			
				
				/**
				 * @private
				 */
				function getFlow(idx) {
					if (isNaN(idx+'')) 
						error("IllegalArgumentException: (index) " + idx);
										
					idx = parseInt(idx+'');
					if (idx > settings.totalFlows-1)
						error("Index out of bounds.  totalFlows=" + totalFlows + " index=" + idx);
			
					return flows[idx];
				}
			
				/**
				 * @private return array of IDs of any flows we launched, that are running
				 */
				function getRunningFlows() {
					var runningFlows = [];
				
					for (var i = 0; i < flows.length; i++)
						if (flows[i].status === 'running')
							runningFlows.push( flows[i].contextId );
					
					return runningFlows;
				}
				
				function integerizeParameters(params) {
					if (params.max) {
						if (isNaN(params.max))
							return error("Illegal parameter: max - non integer value:" + params.max);
						else
							params.max = parseInt(params.max);
					}
					
					if (params.poolsize) {
						if (isNaN(params.poolsize))
							return error("Illegal parameter: poolsize - non integer value:" + params.poolsize);
						else
							params.poolsize = parseInt(params.poolsize);
					}
					
					if (params.count) {
						if (isNaN(params.count))
							return error("Illegal parameter: count - non integer value:" + params.count);
						else
							params.count = parseInt(params.count);
					}
				}	
				

				/**
				 * @private record an error and return 'error' to caller
				 */
				function error(msg) {
					errorMessage += msg + "\n";
					if (workflow)
						workflow.error('WorkflowCoordinator:' + msg);
					else
						gs.logError(msg, 'WorkflowCoordinator');

					return "error";
				}

				/**
				 * @private record an warning
				 */
				function warn(msg) {
					errorMessage += msg + "\n";
					if (workflow)
						workflow.warn('WorkflowCoordinator:' + msg);
					else
						gs.logWarning(msg, 'WorkflowCoordinator');
				}
				
				/**
				 * @private
				 */
				function debug(msg) {
					if (workflow)
						workflow.info('WorkflowCoordinator:' + msg);
					else
						gs.log('WorkflowCoordinator:' + msg);
					
					return msg;
				}

                /**
                 * @private
                 *
                 * Simple obj merge routine, similar to jQuery extend, different than prototype in that it overwrites.
                 *
                 * @param target fields are copied 'into' this object
                 * @param source fields are copied 'from' this object.
                 */
                function $extend(target, source) {
                    for (var x in source)
                        if (x != undefined)
                            target[x] = source[x];
                }


                /**
                 * An internal, data Class that holds the details of the flows being executed.
				 * 
                 *Fields:
                 * @param index     - the index of this flow in the queue
                 * @param workflow  - the ID of the wf_workflow used to start this flow
                 * @param inputs    - any inputs provided to the launched flow
                 * @param status    - status of the workflow context
                 * @param contextId - (internal) added by the startFlow method. 'onFinish()' events use
                 *                    this to locate their internal 'flow' object.
                 */
                function Flow(index, workflow, inputs) {
                    return {
                           index: index,
                          inputs: inputs,
                          status: 'pending',
                        workflow: workflow
                        // contextId  - transparent
                    }
                };

				// Return the interface (Module pattern)
				return {
						 type: 'WorkflowCoordinator',		// JavaScript class name compliance
					
						  add: add,
						start: start,
					   cancel: cancel,
			  getRunningCount: getRunningCount,
					isRunning: isRunning,
				   isFinished: isFinished,
				  isCancelled: isCancelled,
					  hasNext: hasNext,
					  getFlow: getFlow,
					   setMax: setMax,
				  setPoolsize: setPoolsize,
				  setWorkflow: setWorkflow,
					 findFlow: findFlow,
				  getNumFlows: getNumFlows,
					 onFinish: onFinish,
						 save: save,			// actually private- here for unit testing for now.
					 getError: getError
				};

		}).apply(this, arguments);
		
		
		// map the coordinator fields to our outer class
		for (var x in this.coordinator)
			this[x] = this.coordinator[x];
	},	
	
	type: 'WorkflowCoordinator'
};


/**
 * Factory method to deserialize an instance of this object.
 * 
 * @param nameOrId - a name for this coordinator.  Default is name or sys_id of the activity that owns this coordinator.
 * @param [depot]- an optional depot (object) to load from. If not provided we load from <strong>activity.scratchpad</strong>.
 *                 If depot is present we load from <strong>depot[nameOrId]</strong>.
 *
 * @return an instance of WorkflowCoordinator pre-loaded with valid state.
 */
WorkflowCoordinator.load = function(nameOrId, depot) {

	// if the param given is not the exact name of a coordinator instance,
    // then try it as a sys_id or name of a launcher activity
    nameOrId = getActivityForIdentifier(nameOrId+'');
    if (workflow.scratchpad.coordinator && workflow.scratchpad.coordinator[nameOrId]) 
		return deserialize(workflow.scratchpad.coordinator[nameOrId], nameOrId);

	// if depot provided then use it.
	if (depot && depot[nameOrId]) {
        workflow.error('Cannot find parallel flow data in depot for activityId:' + nameOrId);
        return null;
    }
	
	// if it's in activity scratchpad (where it is by default) then use that!
    if (activity && activity.scratchpad.coordinator) 
		return deserialize(activity.scratchpad.coordinator, nameOrId);

	
	workflow.fault("Cannot find coordinator for " + nameOrId);
	return null;

	
	function deserialize(data, nameOrId) {
    	if (!data)
	    	workflow.error('Cannot find parallel flow data for activityId:' + nameOrId);
		return new WorkflowCoordinator(data.settings, data.flows, nameOrId);
	}

	function getActivityForIdentifier(activityId) {
	
		activityId = activityId+'';
	
		var activity = new GlideRecord('wf_activity');

		// if it is valid ID then use it.
		if (GlideStringUtil.isEligibleSysID(activityId)) 
			if (activity.get(activityId))
	        	return activityId;
		
		// try by name.
		activity.addQuery('name', activityId);
		activity.addQuery('workflow_version', context.workflow_version+'');
		activity.query();
		
    	if (!activity.next())
			return "Invalid activity:" + activityId;
		
		return activity.sys_id+'';
	}

};
