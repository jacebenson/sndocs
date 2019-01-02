var TaskTableList = Class.create();
TaskTableList.prototype = {
    initialize: function() {
    },
	
	process: function() {
		var extensions = [];
		extensions = new GlideTableHierarchy("task").getAllExtensions();
		return extensions;
	},
	
    type: 'TaskTableList'
};