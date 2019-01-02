var UserTaskStatsUtil = Class.create();
UserTaskStatsUtil.prototype = {
    initialize: function() {
    },
	
	conditionCheck : function(current,previous){
		//1. if insert, check if assigned_to is not nil and update the num_tasks.
		//2. if update, and assigned_to not nil, update num_tasks for current and decrement for previous user.
		//3. on delete decrement for count for user.
		//4. state becomes closed, decrement for user.
		
		if(current.operation() == "delete"){
			if(!current.assigned_to.nil()){
				this.decrementTaskAssigned(current.assigned_to);
			}
			return false;
		}
		if(current.assigned_to.changes() && previous && !previous.assigned_to.nil()){
			this.decrementTaskAssigned(previous.assigned_to);
		}
		if(current.assigned_to.changes() || current.active.changes())
			return true;
		
		return false;
	},
	
	incrementTaskAssigned: function(user){
		var result = false;
		if(!user.nil()){
			var userTaskStats = new GlideRecord("user_task_stats");
			userTaskStats.addQuery("user",user);
			userTaskStats.query();
			if(userTaskStats.next()){
				userTaskStats.work_load = userTaskStats.work_load + 1;
				userTaskStats.last_work_assigned = new GlideDateTime();
				result = userTaskStats.update();
			}
			else{
				userTaskStats.initialize();
				userTaskStats.user = current.assigned_to;
				userTaskStats.work_load = 1;
				userTaskStats.last_work_assigned = new GlideDateTime();
				result = userTaskStats.insert();
			}
		}
		return result;
	},
	
	decrementTaskAssigned: function(user){
		var result = false;
		if(!user.nil()){
			var userTaskStats = new GlideRecord("user_task_stats");
			userTaskStats.addQuery("user",user);
			userTaskStats.query();
			if(userTaskStats.next()){
				var currentLoad = userTaskStats.work_load;
				if(currentLoad > 0)
				{
					userTaskStats.work_load = userTaskStats.work_load - 1;
					result = userTaskStats.update();
				}
			}
		}
		return result;
	},

    type: 'UserTaskStatsUtil'
};