var TaskActivityUtils = Class.create();
TaskActivityUtils.prototype = {
    initialize: function() {
    },
	
	parseEmailTemplate: function(subject, message, task) {
		subject = this._parseVariables(subject, task);
		message = this._parseVariables(message, task);
		
		var result = {};
		result['subject'] = subject;
		result['message'] = message;
		return result;
	},
	
	_parseVariables: function(text, task) {
		while (text.indexOf("${") != -1) {
			var begin = text.indexOf("${");
			var end = text.indexOf("}", begin);
			if (end == -1) {
				text = text.replace("${", "{");
				continue;
			}
			var field = text.slice(begin + 2, end);
			var replaceValue = task[field].getDisplayValue();
			if (replaceValue != undefined)
				text = text.replace("${" + field + "}", replaceValue);
			else
				text = text.replace("${" + field + "}", "{" + field + "}");
		}
		return text;
	},

    type: 'TaskActivityUtils'
};