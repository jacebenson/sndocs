/*
 * Task State Management Utility
 * primarily used by the Task Active State Management business rule to set the active
 * field based on state changes
 * Can be called by any server script to determine inactive states, default work, or default
 * close states for a given table
 */

/*
 * Usage:
 * var stateUtil = new TaskStateUtil(current);
 * var closeState = stateUtil.getDefaultCloseState();
 * var workState = stateUtil.getDefaultWorkState();
 */

var TaskStateUtil = Class.create();
TaskStateUtil.prototype = {
   
   /*
    * static properties and default values
    */
   ATTR_INACTIVE_STATES : "close_states",
   ATTR_DEFAULT_WORK : "default_work_state",
   ATTR_DEFAULT_CLOSE : "default_close_state",
   SYSTEM_DEFAULT_CLOSE : 3, // task closed complete state
   SYSTEM_DEFAULT_WORK : 2, // task work in progress state
   SYSTEM_INACTIVE_STATES : [3, 4, 7], // task default inactive/close states
   
   /*
    * Init
    * called by new TaskStateUtil(gr)
    * @param task GlideRecord
    */
   initialize : function(/*GlideRecord*/ task) {
	   
      this.task = task;
	   
      if (!task || !task.isValidRecord())
		 if (!task.isNewRecord())
			 return;
      
      this.stateElement = task.getElement('state');

      // get optional attributes or use default values
      this._getTableStates();	   
      this._getDefaultWork();
      this._getDefaultClose();
      
   },
   
   /*
    * Get the active status of a given state
    * @param state value of the state field choice
    * @return boolean true if state is an active state
    */
   isStateInactive : function(state) {
      state = state + "";
      var arrUtil = new ArrayUtil();
      if (arrUtil.contains(this.inactiveStates, state))
         return true;
      
      return false;
   },
   
   /*
    * Get the value for the default work state, defaults to 2 if not specified
    * @return int
    */
   getDefaultWorkState : function() {
      return this.defaultWork;
   },
   
   /*
    * Get the value for the default close state, defaults to 3 if not specified
    * @return int
    */
   getDefaultCloseState : function() {
      return this.defaultClose;
   },
   
   /*
    * Get the list of inactive state values
    * @return array
    */
   getInactiveStates : function() {
      return this.inactiveStates;
   },
	
/**
	 * Sets the default work state using the passed-in value.
	 * However, if the 'default_work_state' its value is used in preference to the passed-in value.
	 *
	 * @param The value to use for the default work state
	 * @return A self-reference to allow for method chaining
	 */
	setDefaultWorkState: function(defaultWorkState) {

		// See if a value exists for the default work state attribute
		var value = this.stateElement.getAttribute(this.ATTR_DEFAULT_WORK);

		// If it does then use it, else use the passed-in value
		if (value)
			this.defaultWork = value;
		else
			this.defaultWork = defaultWorkState;

		// Allow the method to be chained with other methods
		return this;
	},

	/**
	 * Decides whether the 'task closer' business rule should be run or not
	 * @return boolean Whether the business rule should be allowed to run or not
	 */
	runTaskCloser: function() {

		// Make sure record has been made inactive
		var taskMadeInactive = this.task.active.changesTo(false);

		// Make sure record is in an 'open' state
		var inOpenState = true;
		var closeStates = this.inactiveStates || this.SYSTEM_INACTIVE_STATES;
		for (var index1 = 0; index1 < closeStates.length; ++index1)
			if (this.task.state == closeStates[index1])
				inOpenState = false;

		// Make sure record belongs to a supported table
		var inSupportedTable = true;
		var ignoreTables = ['dmn_demand', 'idea'];
		for (var index2 = 0; index2 < ignoreTables.length; ++index2)
			if (this.task.sys_class_name == ignoreTables[index2])
				inSupportedTable = false;

		// Decide if the business rule should be run or not
		return (taskMadeInactive && inOpenState && inSupportedTable);
	},

	/**
	 * Decides whether the 'mark closed' business rule should be run or not
	 * @return boolean Whether the business rule should be allowed to run or not
	 */
	runMarkClosed: function() {

		// Has the record been moved into a 'close' state
		var inCloseState = false;
		var closeStates = this.inactiveStates || this.SYSTEM_INACTIVE_STATES;
		for (var index1 = 0; index1 < closeStates.length; ++index1)
			if (this.task.state.changesTo(closeStates[index1]))
				inCloseState = true;

		// Check to see if record belongs to a table for which rule should not be run
		var inSupportedTable = true;
		var ignoreTables = ['problem', 'incident', 'dmn_demand', 'idea'];
		for (var index2 = 0; index2 < ignoreTables.length; ++index2)
			if (this.task.sys_class_name == ignoreTables[index2])
				inSupportedTable = false;

		// Decide if the business rule should be run or not
		return (inCloseState && inSupportedTable);
	},

	/**
	 * Decides whether the 'task reopener' business rule should be run or not
	 * @return boolean Whether the business rule should be allowed to run or not
	 */
	runTaskReopener: function() {

		// Is the record in a 'close' state but active is true
		var inCloseState = false;
		var closeStates = this.inactiveStates || [3, 4];
		for (var index1 = 0; index1 < closeStates.length; ++index1)
			if (this.task.state == closeStates[index1])
				inCloseState = true;
		var activeClosed = this.task.active.changesTo(true) && inCloseState;

		// Is the record in the default 'open' state but active is false
		var openState = this.stateElement.getAttribute(this.ATTR_DEFAULT_WORK) || 1;
		var inactiveOpen = (!this.task.active || this.task.active.changesTo(false)) && (this.task.state == openState);

		// Does record belong to a supported table
		var inSupportedTable = true;
		var ignoreTables = ['dmn_demand', 'idea'];
		for (var index2 = 0; index2 < ignoreTables.length; ++index2)
			if (this.task.sys_class_name == ignoreTables[index2])
				inSupportedTable = false;

		// Decide if the business rule should be run or not
		return ((activeClosed || inactiveOpen) && inSupportedTable);
	},	
   
   /*
    * private methods used during init
    */
   _getTableStates : function() {
      var attribute = this.stateElement
      .getAttribute(this.ATTR_INACTIVE_STATES);
      
      if (!attribute)
         return;
      
      var states = attribute.split(";");
      this.inactiveStates = states;
   },
   
   _getDefaultWork : function() {
      var value = this.stateElement.getAttribute(this.ATTR_DEFAULT_WORK);
      if (value)
         this.defaultWork = value;
      else
         this.defaultWork = this.SYSTEM_DEFAULT_WORK;
   },
   
   _getDefaultClose : function() {
      var value = this.stateElement.getAttribute(this.ATTR_DEFAULT_CLOSE);
      if (value)
         this.defaultClose = value;
      else
         this.defaultClose = this.SYSTEM_DEFAULT_CLOSE;
   },
   
   type : "TaskStateUtil"
};