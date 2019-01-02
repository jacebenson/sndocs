var WorkflowValidateUtil = Class.create();
WorkflowValidateUtil.prototype = {
    initialize: function() {
        this.validator = new SNC.WorkflowValidator();
        this.SEVERITY_LEVEL_CRITICAL = -1;        
        this.SEVERITY_LEVEL_DATA = 0;
        this.SEVERITY_LEVEL_WARN = 1;

    },
	
	/**
	* These routines test what kind of v_wf_validation_report record it is.
	* This is used to color the columns based on the validation level.
	*/
	isData: function(gr /* GlideRecord('v_wf_validation_report') */) {
		return gr.level==this.validator.getLevelLabel(this.SEVERITY_LEVEL_DATA);
	},
	
	isCritical: function(gr /* GlideRecord('v_wf_validation_report') */) {
		return gr.level==this.validator.getLevelLabel(this.SEVERITY_LEVEL_CRITICAL);
	},

	isWarn: function(gr /* GlideRecord('v_wf_validation_report') */) {
		return gr.level==this.validator.getLevelLabel(this.SEVERITY_LEVEL_WARN);;
	},

  /**
    *  Top Level Return for single call to validate entire workflow
    * 
    *   return.result = 'valid'  OR 'invalid'
    *   return.data  = [of js summary objects described in individual calls, see headers]
    *   return.level = most critical level of summary elements
    *   return.type  = summary
    *   return.msg   = N Errors found in validating workflow
    * 
    **/
    validateWorkflow: function(wfVersion) {
        return this.validator.validateWorkflow(wfVersion);
    },

  /**
    *  Reports if this workflow references subflows that are no longer valid
    *
    * SUMMARY
    *   sum.result = valid or invalid
    *   sum.data = [] an array of DATA objects (see below) that invalid workflow activities
    *   sum.type =  SubFlowValidator
    *   sum.level = SEVERITY_LEVEL_DATA or SEVERITY_LEVEL_CRITICAL (see data below)
    *   sum.msg = either no valid subflows  OR the number of subflows valid out of total number of subflows
    * 
    * DATA
    *   test for valid result
    *      status[i].result == 'valid'
    *      status[i].msg   ==  ' 3 of 3 subflows are valid' or 'there are not subflows in this workflow'
    *      status[i].level == SEVERITY_LEVEL_DATA
    *   test for invalid result for this function
    *      status[i].result == 'invalid'
    *      status[i].msg   == ' no valid versions '   or  (2 of 3 subflows are invalid if mixed)
    *	   status[i].activity==  the sys_id of wf_activity where the subflow was expected to be
    *      status[i].level == SEVERITY_LEVEL_CRITICAL
    **/
    validateSubflows: function(wfVersion) {
        return this.validator.validateSubflows(wfVersion);
    },

  /**
    *  Reports if this workflow is a subflow in any other workflow
    *
    * SUMMARY
    *   sum.result = valid // this is either data or a warning
    *   sum.data = [] an array of DATA objects (see below) that are parent workflows
    *   sum.type =  ParentFlowValidator
    *   sum.level = SEVERITY_LEVEL_DATA or SEVERITY_LEVEL_WARN (see data below)
    *   sum.msg = Currently not a subflow  OR the number of workflows that references this version as a subflows
    * 
    * DATA
    *      status[i].result   == 'Valid is a subflow' or valid
    *      status[i].msg      == ' currently not a  '   or  (2 of 3 subflows are invalid if mixed)
    *	   status[i].workflow ==  the sys_id of wf_workflow that requires this workflow
    *      status[i].level    == SEVERITY_LEVEL_WARN / SEVERITY_LEVEL_DATA
    **/
    validateParentFlows: function(wfVersion) {
        return this.validator.validateParentFlows(wfVersion);
    },


   /**
    * Reports if the workflow can change to the table suggested in the tableName paramenter 
    *
    * SUMMARY
    *   sum.result = valid  or 'Invalid Activity' || 'Invalid Arguments' || 'Invalid Function' // this is either data or a warning
    *   sum.data = [] an array containing one data object see below
    *   sum.type =  TableChangeValidator
    *   sum.level = SEVERITY_LEVEL_DATA or SEVERITY_LEVEL_WARN (see data below)
    *   sum.msg = All activities are valid or there are 1 of 10 activities that are invalid for the table choice
    *
    * Sample DATA for sum.data[]
    *   test for valid result
    *       status[i].result == 'valid'
    *  test for invalid result for this function
    *       status[i].result == 'Invalid Activity' || 'Invalid Arguments' || 'Invalid Function'
    *       status[i].msg     // description of finding
    *       status[i].table   // wf_activity
    *       status[i].id      // sys_id of invalid activity
    **/
    canChangeTable: function(tableName, wfVersion) {
        return this.validator.canChangeTable(wfVersion, tableName);
    },

  /**
    * 
    * SUMMARY
    *   sum.result = valid  or 'Invalid Activity' || 'Invalid Arguments' || 'Invalid Function' // this is either data or a warning
    *   sum.data = [] an array containing one data object see below
    *   sum.type =  LowestCommonTable
    *   sum.level = SEVERITY_LEVEL_DATA
    *   sum.msg = the name of the lowest common table in workflow

    *   test for valid result
    *       status[i].result == 'valid'
    *       status[i].table  == '';       // new workflow with no current activities with table declared or the lowest level is Global
    *        status[i].table  ==  anything else; // a table that had been determined to be the lowest 
    *                                            // in the hierarchy of all tables associated with
    *                                            // with activities currently selected in the workflow version
    *   test for invalid result for this function
    *       status[i].result == 'Invalid Activity' || 'Invalid Arguments' || 'Invalid Function'
    **/
    findLowestCommonTable: function(wfVersion) {
        return this.validator.findLowestCommonTable(wfVersion);
    },
	
	/**
	 * Reports if there are multiple End activities in the workflow
	 *
	 * test for valid result
	 *     status[i].result = 'valid'
	 *     status[i].msg = 'Found only 1 End activity'
	 *     status[i].level = SEVERITY_LEVEL_DATA
	 * test for invalid result
	 *     status[i].result = 'warning'
	 *     status[i].msg    = 'X End activities found when only 1 was expected' // X is number of End activities found
	 *     status[i].level  = SEVERITY_LEVEL_WARN
	 *     status[i].id     // sys_id of invalid activity
	 */
	validateSingleEnd: function(wfVersion) {
        return this.validator.validateSingleEnd(wfVersion);
    },

   /**
    * Reports if there are conditions with no exit transitions on any activities in the workflow
    *
    * test for valid result
    *     status[i].result = 'valid'
    *     status[i].msg = 'All conditions have transitions'
    *     status[i].level = SEVERITY_LEVEL_DATA
    * test for invalid result
    *     status[i].result = 'warning'
    *     status[i].msg    = 'There are {0} activity conditions that have no transition
    *     status[i].level  = SEVERITY_LEVEL_WARN
    *     status[i].id     // sys_id of invalid activity
    */
    validateConditionWithoutTransition: function(wfVersion) {
        return this.validator.validateConditionWithoutTransition(wfVersion);
    },
	
  /**
    *  Reports if this workflow has any dangling transitions.
	*  A dangling transition is a transition that does not terminate on an activity.
    *
    * SUMMARY
    *   sum.result = valid // this is either data or a failure
    *   sum.data = [] an array of DATA objects (see below) 
    *   sum.type =  ValidateDanglingTransition
    *   sum.level = SEVERITY_LEVEL_DATA or SEVERITY_LEVEL_CRITICAL (see data below)
    *   sum.msg = No dangling transitions or the number of dangling transitions
    * 
    * DATA
    *      status[i].activity_name  == The name of the activity where the transition begins
	*      status[i].activity_sysid == The sys_id of the activity where the transition begins
    **/
    validateDanglingTransition: function(wfVersion) {
        return this.validator.validateDanglingTransition(wfVersion);
    },
	
	/**
	 * Reports if there are any activities in the workflow that have no transitions into them
	 *
	 * test for valid result
	 *     status[i].result = 'valid'
	 *     status[i].msg = 'All activities in this workflow have at least 1 inbound transition'
	 *     status[i].level = SEVERITY_LEVEL_DATA
	 * test for invalid result
	 *     status[i].result = 'warning'
	 *     status[i].msg    = 'There are X activities found that don't have any inbound transitions' // X is number of activities without inbound transitions
	 *     status[i].level  = SEVERITY_LEVEL_WARN
	 *     status[i].id     // sys_id of invalid activity
	 */
	validateTransitionIn: function(wfVersion) {
        return this.validator.validateTransitionIn(wfVersion);
    },	

	/**
	 * Reports if there are any activities that have script with current.update in them
	 *
	 * test for valid result
	 *     status[i].result = 'valid'
	 *     status[i].msg = 'The JavaScript in this workflow has no instances of 'current.update''
	 *     status[i].level = SEVERITY_LEVEL_INFO
	 * test for invalid result
	 *     status[i].result = 'warning'
	 *     status[i].msg    = 'There are {0} instances of 'current.update' in the JavaScript in this workflow'
	 *     status[i].level  = SEVERITY_LEVEL_WARN
	 *     status[i].id     // sys_id of invalid activity
	 */
	validateScriptForCurrentDotUpdate: function(wfVersion) {
        return this.validator.validateScriptForCurrentDotUpdate(wfVersion);
    },	

	/**
	 * Reports if there are workflows checked out to other users that are used by this workflow
	 *
	 * test for valid result
	 *     status[i].result = 'valid'
	 *     status[i].level = SEVERITY_LEVEL_INFO
	 * test for invalid result
	 *     status[i].result = 'warning'
	 *     status[i].level  = SEVERITY_LEVEL_WARN
	 */
	validateUpdateSetDependencies: function(wfVersion) {
        return this.validator.validateUpdateSetDependencies(wfVersion);
    },	
	
	/**
	 * Reports if there are workflows checked out to other users that call this workflow
	 *
	 * test for valid result
	 *     status[i].result = 'valid'
	 *     status[i].level = SEVERITY_LEVEL_INFO
	 * test for invalid result
	 *     status[i].result = 'warning'
	 *     status[i].level  = SEVERITY_LEVEL_WARN
	 */
	validateUpdateSetParentDependencies: function(wfVersion) {
        return this.validator.validateUpdateSetParentDependencies(wfVersion);
    },
    
    /**
     * Returns a list of workflow input variables that have
     * been deleted in an update set other than the one the user
     * is publishing the current workflow in.
     *
     * test for valid result
     *     status[i].result = 'valid'
     *     status[i].level = SEVERITY_LEVEL_INFO
     * test for invalid result
     *     status[i].result = 'warning'
     *     status[i].level  = SEVERITY_LEVEL_WARN
     */
    ValidateInputVarUpdateSetDependencies: function(wfVersion) {
        return this.validator.ValidateInputVarUpdateSetDependencies(wfVersion);
    },

    ValidateWorkflowEndStages: function(wfVersion) {
        return this.validator.ValidateWorkflowEndStages(wfVersion);
    },
	

    ValidateWorkflowStageColumn: function(wfVersion) {
        return this.validator.ValidateWorkflowStageColumn(wfVersion);
    },
	

    ValidateWorkflowStageValues: function(wfVersion) {
        return this.validator.ValidateWorkflowStageValues(wfVersion);
    },
	
	/**
    * For testing purposes, given a wf_workflow_version, run the 
    * ValidateWorkflow and print results to screen. Run from scripts
    * background
    *
    *  sample 
        var version = new GlideRecord('wf_workflow_version');
        version.get('6f226b901f203000791f39dc1e8b7088');

        var  util = new WorkflowValidateUtil();
        util.printValidatationResults(version);
    *
    */
    printValidationResults: function(wfVersion) { 
		gs.print(this.getValidationResults(wfVersion));
    },

	/**
	 * Returns the entire validation report as a string
	 */
	getValidationResults: function(wfVersion) { 
		var validationResults = this.validateWorkflow(wfVersion);
		var results = this.getResponseHeader(validationResults);
		
		for (var i = 0; i < validationResults.data.length; i++ ) 
			results += this.getResponseHeader( validationResults.data[i] );
		
		return results;
	},
	
    /**
     *  Prints to the screen the contents of a Response Header
     */
    printResponseHeader: function(validationResult) {
		gs.print(this.getResponseHeader(validationResult));
    },
	
	/**
	 * Returns a single validation report as a string
	 */
    getResponseHeader: function(validationResult) {
		var header = 
			'Validation type: ' + validationResult.type + '\n' +
			'Result: '          + validationResult.result + '\n' +
			'Data Count: '      + validationResult.data.length + '\n' +
			'Severity Level: '  + validationResult.level + '\n' +
			'Message: '         + validationResult.msg + '\n' +
			'==============================' '\n';
		return header;
    },

    type: 'WorkflowValidateUtil'
}