var HRMigrationUtil = Class.create();
HRMigrationUtil.prototype = {
    initialize: function() {
    
	},  
	
	updateRecord: function(dictionary){
		var error = false;
		try{
			dictionary.update();
		}
		catch(err){
			error = true;
		}
		return error;
	},
	
	insertRecord : function(dictionary){
		var error = false;
		try{
			dictionary.insert();
		}
		catch(err){
			error = true;
		}
		return error; 
	},
    
    type: 'HRMigrationUtil'
};