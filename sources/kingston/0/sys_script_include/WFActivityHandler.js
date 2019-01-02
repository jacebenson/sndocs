gs.include('PrototypeServer');

var WFActivityHandler = Class.create();
WFActivityHandler.prototype = {
   
   ANYEVENT_HANDLER: 'onAnyEvent',
   UNHANDLEDEVENT_HANDLER: 'onUnhandledEvent',
   
   initialize: function() {
      
   },
   
   run: function(eventName, eventParms) {
      // execute?
      if (activity.state == 'executing' && eventName != 'cancel')
         this.execute();
      else
         this.handleEvent(eventName, eventParms);

	  // tests Workflow.java to see if there was an error in executing the javascript
      // if there is an error and logging is on, the exception will go to workflow log
      // automatically. This call will place the detail string into the failure of the 
	  // wf_executing record
      if (workflow.hasFailed()) 
          this.setResultFaulted(workflow.getExceptionDetail());
   },
   
   // Override onExecute to change the execute handling
   execute: function(eventParms) {
      try {
         workflow.debug("executing activity {0}", [activity.name]);
         this.onExecute(eventParms);
      } catch (ex) {
		 workflow.fault('Execption in Activity Handler:' + JSUtil.describeObject(ex));
         activity.state = 'faulted';
         activity.result = 'error';
         this.handlerError('onExecute', ex);
      }
   },

   setResultFaulted: function(reason) {
       activity.result = 'error';
       activity.state  = 'faulted';

       if (reason) 
           activity.fault_description = reason;
   },
   
   setResultFailed: function(reason) {
       activity.result = 'failure';

       if (reason) {
           activity.fault_description = reason;
           this.debug('Error: ' + reason);
       }
   },

   setResultSuccessful: function() {
       activity.result = 'success';
   },

   setActivityOutput: function(output) {
       activity.output = output;
   },

   // Handle an event for this activity
   //
   // If onAnyEvent is defined, it is called first
   // If on<eventName>Event is defined, it is called
   // If on<eventName>Event is not defined and onUnhandledEvent is defined, onUnhandledEvent is called
   //
   handleEvent: function(eventName, eventParms) {
      try {
         if (!eventName)
            return;
         
         var eventHandlerName = 'on' + eventName.substring(0, 1).toUpperCase() + eventName.substring(1);
         
         // Is the any event handler defined? (called before handling ANY event)
         if (this[this.ANYEVENT_HANDLER])
            this[this.ANYEVENT_HANDLER](eventName);
         
         // Handler for the event specified?
         if (this[eventHandlerName])
            this[eventHandlerName](eventName, eventParms);
         else if (this[this.UNHANDLEDEVENT_HANDLER])
            this[this.UNHANDLEDEVENT_HANDLER](eventName, eventParms);
         else
            this.debug('Event {0} has no handler and is being ignored', [eventName]);
         
      } catch (ex) {
		 workflow.fault('Execption in Activity Handler:' + JSUtil.describeObject(ex));
         activity.state = 'faulted';
         activity.result = 'error';
         this.handlerError(eventHandlerName, ex);
      }
   },
   
   onExecute: function(eventParms) {
      // the concrete Activity implementation should override this
   },
   
   onCancel: function(eventName, eventParms) {
      activity.state = 'cancelled';
      activity.result = 'cancelled';
      return;
   },
   
   runScript: function(script, identifierKey) {
      if (!script)
         return null;
	  // the variable answer is set within interpretString and
	  // defaulted to null inside the workflow.interpretString
	  // answer returns with the script result or and error that could/should be
	  // tested for and dispositioned in the calling function.
	  // interpret will not cache/compile the script
	  var answer = workflow.interpretString(script, identifierKey); 
      return answer;
   },
   
   // If a string starts with javascript: eval it
   js: function(str) {
	   return workflow.strEval(str);
   },
   
   info: function(msg, args) {
      args = this._convertArgsToArray(args);
      workflow.info(msg, args);
   },
   
   warn: function(msg, args) {
      args = this._convertArgsToArray(args);
      workflow.warn(msg, args);
   },
   
   debug: function(msg, args) {
      args = this._convertArgsToArray(args);
      workflow.debug(msg, args);
   },
   
   error: function(msg, args, ex) {
      args = this._convertArgsToArray(args);
      workflow.error(msg, args);

      if (ex)
         workflow.fault(ex);
   },
   
   handlerError: function(handlerName, ex) {
      var table = "undefined";
      var value = "undefined";

      if (current) {
          table = current.getTableName();
          value = current.getDisplayValue();
      }

      this.error('Javascript error in: {0}, handler {1}, for {2}:{3}', [activity.name, handlerName, table, value], ex);
   },
   
   _convertArgsToArray: function(args) {
      if (typeof(args) == "undefined")
         return [];
      
      if (typeof(args) == "string")
         return [args];
      
      return args;
   },

   generate: function(activityId, order, startAtDspValue, noCreateFlag) {
      var actObj = workflow.generate(activityId, order, startAtDspValue, noCreateFlag);
      this._saveGenerateObj(activityId, actObj);
      return actObj.duration;
   },

   // activity definitions override this method to implement pre-generation of tasks and approvals
   _generate: function(order) {
      // default action is to ignore this request
   },
   
   // return the pre-generation object for an activity
   _getGenerateObj: function(activityId) {
      var genObj = workflow.scratchpad.generate;
      if (!genObj)
         return null;
      
      return genObj[activityId];
   },
   
   // save the pre-generation object for an activity (the object is returned by the activity's _generate method)
   _saveGenerateObj: function(activityId, actObj) {
      var genObj = workflow.scratchpad.generate;
      if (!genObj)
         genObj = {};
      
      genObj[activityId] = actObj;
      workflow.scratchpad.generate = genObj;
   },
   
   // remove the pre-generation object
   _removeGenerateObj: function(activityId) {
      var genObj = workflow.scratchpad.generate;
      if (genObj) {
         delete genObj[activityId];
         workflow.scratchpad.generate = genObj;
      }
   },
   
   type: 'WFActivityHandler'
};