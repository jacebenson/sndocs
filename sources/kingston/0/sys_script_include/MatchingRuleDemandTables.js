var MatchingRuleDemandTables = Class.create();
MatchingRuleDemandTables.prototype = {
	tableList : ["sn_customerservice_customer_interaction", "task"],
	
    initialize: function() {
    },
    
    process: function() {
		var taskTableList = j2js(GlideDBObjectManager.get().getTableExtensions("task"));
		
		for(var i = 0; i < taskTableList.length; i++)
			this.tableList.push(taskTableList[i]);
		
        return this.tableList;
    },
	
    type: 'MatchingRuleDemandTables'
};