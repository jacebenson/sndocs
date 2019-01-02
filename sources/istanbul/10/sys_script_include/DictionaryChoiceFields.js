var DictionaryChoiceFields = Class.create();
DictionaryChoiceFields.prototype = {
	initialize: function() {
	},
	process: function(tableName) {
		var glideAggregate = new GlideAggregate('sys_choice');
		glideAggregate.addQuery('inactive', false).addOrCondition('inactive', '');
		glideAggregate.addQuery('name', tableName);
		glideAggregate.addAggregate('MIN', 'element');
		glideAggregate.query();
		
		answer=new Array();
		while(glideAggregate.next())
			answer.push(glideAggregate.element+"");
		return answer;
	},
	type: 'DictionaryChoiceFields'
}