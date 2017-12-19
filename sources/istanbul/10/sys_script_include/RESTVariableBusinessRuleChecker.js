var RESTVariableBusinessRuleChecker = Class.create();
RESTVariableBusinessRuleChecker.prototype = {
	businessRuleDisplayCount: 3,
	
    initialize: function(businessRuleDisplayCount) {
		if (businessRuleDisplayCount != undefined && businessRuleDisplayCount > 0)
			this.businessRuleDisplayCount = businessRuleDisplayCount;
    },

	check: function(grMessage, restMethod) {				
		this._checkAssociatedBusinessRules(grMessage, restMethod);
	},

	_checkAssociatedBusinessRules: function(grMessage, restMethod) {		
		// Get all available Http methods for this rest message		
		grMethod = new GlideRecord('sys_rest_message_fn');
		grMethod.addQuery('rest_message', grMessage.sys_id);
				
		if (restMethod != undefined)
			grMethod.addQuery('function_name', restMethod);
			
		grMethod.query();
				
		while (grMethod.next()) {
			// Get all rest variables for this rest method
			var restClient = new sn_ws.RESTMessageV2(grMessage.name, grMethod.function_name);
			var restVariables = restClient.getVariables();			

			// Get any business rules that are attached to this rest message & method
			var grBusinessRule = new GlideRecord('sys_script');	
			grBusinessRule.addQuery('rest_service', grMessage.sys_id);
			grBusinessRule.addQuery('rest_method', grMethod.sys_id);
			grBusinessRule.query();

			// Evaluate each business rule to see if it contains all of the rest variables
			var exceptionList = [];
			var arrayUtil = new ArrayUtil();
			
			while (grBusinessRule.next()) {				
				var operators = [ 'EQUALTO', 'SAMEAS' ];
				var brVariableNames = [];			
				var brVariables = grBusinessRule.rest_variables.split('^');
				
				// Parse business rule variable names
				for(var i = 0; i < brVariables.length; i++ ) {
					var brv = brVariables[i];

					for (var j = 0; j < operators.length; j++) {
						var opIndex = brv.indexOf(operators[j]);

						if (opIndex == -1)
							continue;

						brVariableNames.push(brv.substring(0, opIndex));
					}
				}
				
				for (var k = 0; k < restVariables.length; k++) {
					if (!arrayUtil.contains(brVariableNames, restVariables[k])) {
						exceptionList.push({ sys_id: grBusinessRule.getValue('sys_id'), name: grBusinessRule.getValue('name') });
						break;
					}
				}				
			}

			// If needed, display any exceptions found
			var businessRuleCount = grBusinessRule.getRowCount();
			if (exceptionList.length > 0) {
				var exceptionMessage = '';			
				
				for (var l = 0; l < exceptionList.length; l++) {
					exceptionMessage += (exceptionMessage != '' ? ', ' : '');
					
					// Only display the specified number of business rules
					if (l >= this.businessRuleDisplayCount) {
						exceptionMessage += '(' 
										 + (businessRuleCount - this.businessRuleDisplayCount)
 										 + ' ' + gs.getMessage('more') + ')';
						break;
					}
					
					exceptionMessage += '<a href="sys_script.do?sys_id=' 
									 + exceptionList[l].sys_id + '">' 
									 + exceptionList[l].name
									 + '</a>';			
				}
				
				gs.addInfoMessage(gs.getMessage('RESTVariableBusinessRuleChecker.UnmatchedBusinessRules', 
												 [grMethod.function_name, grMessage.name])
								   + ' ' + exceptionMessage);
			}	
		}		
	},
	
    type: 'RESTVariableBusinessRuleChecker'
};