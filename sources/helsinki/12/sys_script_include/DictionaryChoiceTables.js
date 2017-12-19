var DictionaryChoiceTables = Class.create();
DictionaryChoiceTables.prototype = {
	initialize: function() {
	},
	process: function(tableName) {
		var glideAggregate = new GlideAggregate('sys_choice');
		glideAggregate.addQuery('inactive', false).addOrCondition('inactive', '');
		glideAggregate.addAggregate('MIN', 'name');
		glideAggregate.query();
		
		answer=new Array();
		answer.push("");
		while(glideAggregate.next())
			answer.push(glideAggregate.name+"");
		return answer;
	},
	type: 'DictionaryChoiceTables'
}