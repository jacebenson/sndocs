var ATFStepDescriptionGenerator = Class.create();

ATFStepDescriptionGenerator.prototype = {
    initialize: function() {
    },
	
	getOpenFormDescription: function(prefix, table, view, record_id) {
		var description, td, label, value;
		// Find table label
		td = GlideTableDescriptor.get(table);
		if (td)
			label = td.getLabel();

		if (view) {
			if (gs.nil(record_id))
				description = gs.getMessage("{0} the '{1}' view of a new '{2}' form", [prefix, view, label]);
			else
				description = gs.getMessage("{0} the '{1}' view of the '{2}' form with id '{3}'", [prefix, view, label, record_id]);
		} else {
			if (gs.nil(record_id))
				description = gs.getMessage("{0} a new '{1}' form", [prefix, label]);
			else
				description = gs.getMessage("{0} the '{1}' form with id '{2}'", [prefix, label, record_id]);
		}
		return description;
	},

	getTimeoutDescription: function(timeout) {
		if (GlideStringUtil.nil(timeout))
			return "";

		var seconds = timeout.dateNumericValue();
		var description = "";
		if (seconds > 0)
			description = "\n" + gs.getMessage("With a failure timeout of {0}", timeout.getDisplayValue());

		return description;
	},
	
	/**
	 * Translates an encoded query, such as one from a conditions field, into a human readable format
	 */
	getConditionDescription: function(tableName, encodedQuery){
		var OR = GlideSysMessage.format("or");
		var AND = GlideSysMessage.format("and");
		var LINE_BREAK = "\n";
		var OR_SEPERATOR = " ." + OR + ". ";
		var AND_SEPERATOR = " .and. "; // not translated yet
		var NEW_QUERY_SEPERATOR = AND_SEPERATOR + OR + " ";
		var NEW_QUERY_PREFIX = LINE_BREAK + "-- " + OR + " --" + LINE_BREAK;
		var OR_PREFIX = LINE_BREAK + "  " + OR + " ";
		var AND_PREFIX = LINE_BREAK + AND + " ";

		var crumbs = new GlideQueryBreadcrumbs();
		var readableQuery =  crumbs.getReadableQuery(tableName, encodedQuery)
			.replace(NEW_QUERY_SEPERATOR, NEW_QUERY_PREFIX)
			.replace(OR_SEPERATOR, OR_PREFIX)
			.replace(AND_SEPERATOR, AND_PREFIX);

		return SNC.ATFVariableElementMapper.getDisplayValue(readableQuery);
	},

	getOperatorDescription: function(inputOperator){
		var retValue = "UNDEFINED";
		switch (inputOperator.toString())
		{
		   case 'contains':
				retValue = "contains";
				break;
		   case 'does_not_contain':
				retValue = "does not contain";
				break;
		   case 'exists':
				retValue = "is not empty";
				break;
			case 'equals':
				retValue = "is";
				break;
			case 'not_equals':
				retValue = "is not";
				break;
			case 'less_than':
				retValue = "less than";
				break;
			case 'less_than_equals':
				retValue = "less than or is";
				break;
			case 'greater_than':
				retValue = "greater than";
				break;
			case 'greater_than_equals':
				retValue = "greater than or is";
				break;
		}		
		return retValue;
	},
	
	limitTextToSpecifiedLength: function(inputText, limit){
		if (inputText == undefined || limit < 1)
			return inputText;
		inputText = inputText.toString();
		if (inputText.length > limit)
			inputText = inputText.substring(0, limit) + '...';
		return inputText;
	},
	
    type: 'ATFStepDescriptionGenerator'
};