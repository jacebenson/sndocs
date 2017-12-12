var AbstractMatchingDimension = Class.create();
AbstractMatchingDimension.prototype = {
	initialize: function() {
	},
	
	process : function(task, users){
		var returnUsers = {};
		for(var i=0;i<users.length;i++){
			returnUsers[users[i]] = 1.0;
		}
		return returnUsers;
	},
	
	type: 'AbstractMatchingDimension'
};