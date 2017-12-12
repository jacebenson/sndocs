var hr_ServicesUtil = Class.create();
hr_ServicesUtil.prototype = {
    initialize : function(_case, _gs) {
		if (!_case)
		    return;

	    this._case = _case;
	    this._gs = _gs || gs;
		this._hrCaseUtils = new sn_hr_core.hr_CaseUtils(this._case, this._gs);
    },
	
	/*
	* Return the HR Service sys_id for a given value
	* @param rpId The record producer that invoked this
	*/
	getServiceSysIdByProducerId : function(rpId) {
		var serviceGr = new GlideRecord("sn_hr_core_service");
		serviceGr.addActiveQuery();
		serviceGr.addQuery('producer', rpId);
		serviceGr.query();
		if (serviceGr.next())
			return serviceGr.getUniqueValue();
		return null;
	},
	
	/*
	* Create case from producer and a service
	* @param producer Structure passed by RP that holds questions and answers from RP
	* @param rpId     The record producer that invoked this
	*/
	createCaseFromProducer : function(producer, rpId) {
		var serviceSysId = this.getServiceSysIdByProducerId(rpId);
		if (serviceSysId)
			this.createCaseFromProducerByService(producer, serviceSysId);
	},

	/*
     * Fills in a HR Case with service and question fields. This is entry point for RP 
	 * driven case updates.  Lookup is done by service sys_id.
	 *
	 * @param producer structure passed by RP that holds questions and answers from RP
	 * @param service  sys_id of service being used (see sn_hr_core_service)
     */
	createCaseFromProducerByService : function(producer, service) {
		// Convert the producer to a question list object
	    var questions = this._getProducerQuestions(producer);

		// Set the proper HR Case fields 
		this.updateCase(service, questions, 'self_service');
		
	    // Set the redirect for the producer back to Case list
	    producer.redirect = 'sn_hr_core_case_list.do?sysparm_query=active%3Dtrue^opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORDERBYDESCnumber&sysparm_titleless=true';
	},

		
	/*
     * Fills in a HR Case with service and question fields. This is entry point for scripted 
	 * (i.e. non-RP) case updates.
	 *
	 * @param service sys_id of service being used (see sn_hr_core_service)
	 * @param questions a map of the questions and answer values
     */
	updateCase : function(service, questions, source) {
		// Set the proper HR Case fields 
		this._hrCaseUtils.populateCase(service, questions, source);
	},	
	
	/*
     * Retrieves all the variables in question form and values from the record producer instance
	 *
	 * @param producer object that holds the questions/answers from user input on an RP
	 * @Returns a map of the questions and values
     */
    _getProducerQuestions : function(producer) {
	    var questions = {};

	    for (var field in producer) {
		    if (field.match(/^IO/)) {
			    var variable = new GlideRecord("item_option_new");
				variable.addQuery('type', 'NOT IN', '11,19,20,24');  //Ignore display only variables (Container and Label types)
				variable.addQuery('sys_id', field.substring(2));
				variable.query();
			    if (variable.next()) {
				    var variableName = variable.name + "";
				    var answer = this._getDisplayValue(variable, producer[field]);
				    var displayValue = this._getDisplayValue(variable, producer[field], producer[field].getDisplayValue());
					
					questions[variableName] = this._hrCaseUtils.getQuestion(variable.question_text, variableName, answer, producer[field], variable.order, displayValue);
			    }
		    }
	    }
		
	    return questions;
    },
	
	/*
     * Gets display value for passed in variable
     *
     * @param variable The variable whose value is wanted
     * @param defaultAnswer The value to return if a display value could not be found
     * @return The value to display for the passed in variable
     */
    _getDisplayValue : function(variable, defaultAnswer, defaultDisplayValue) {
	    var value = defaultDisplayValue ? defaultDisplayValue : defaultAnswer;

	    var tableName = variable.reference.getDisplayValue();
	    if (!tableName)
		    return value;

	    var record = new GlideRecord(tableName);
	    return (record.get(defaultAnswer)) ? record.getDisplayValue() : value;
    },
	
	getProfileSubjectFilter: function() {
 		var refQual = "basic_apply_to=sn_hr_core_case";
 		
 		var tableList = new GlideTableHierarchy("sn_hr_core_benefit").getAllExtensions();
 		tableList = tableList.concat(new GlideTableHierarchy("sn_hr_core_beneficiary").getAllExtensions());
 		tableList = tableList.concat(new GlideTableHierarchy("sn_hr_core_direct_deposit").getAllExtensions());
 		tableList = tableList.concat(new GlideTableHierarchy("sn_hr_core_tuition_reimbursement").getAllExtensions());

 		if (tableList)
 			refQual += "^basic_query_fromIN" + tableList;
 			
 		return refQual;
	},
	
    type: 'hr_ServicesUtil'
};