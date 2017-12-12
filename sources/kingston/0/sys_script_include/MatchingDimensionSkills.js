var MatchingDimensionSkills = Class.create();
MatchingDimensionSkills.prototype = Object.extendsObject(AbstractMatchingDimension, {
	
	process : function(task, users, taskFieldValues, args){
		var skillsRequired = [];
		var selectedSkills = taskFieldValues;
		if(selectedSkills && selectedSkills.length > 0){
			skillsRequired = selectedSkills;
		}
		
		var returnUsers = {};
		if(skillsRequired.length == 0)
		{
			for(var i=0;i<users.length;i++){
				var ratingObj = {};
				ratingObj.rating = 1.0;
				ratingObj.displayValue = " 0 / 0";
				ratingObj.detailedDisplayValue = "Task has no skills"; 
				returnUsers[users[i]] = ratingObj;
			}
			return returnUsers;  
		}
		if(new CSMUtil().isDebugOn())
			gs.log(skillsRequired.join(),"this is skills");
		var skills = new GlideAggregate("sys_user_has_skill");
		skills.addEncodedQuery("skillIN" + skillsRequired.join());
		skills.addEncodedQuery("userIN"+ users.join());
		skills.addActiveQuery();
		skills.addAggregate("COUNT(DISTINCT", "skill");
		skills.addAggregate("MIN", "user.sys_id");
		skills.groupBy("user");
		skills.query();
		
		while(skills.next()){
			var skillCount = skills.getAggregate("COUNT(DISTINCT", "skill");
			var ratingObj = {};
			ratingObj.rating = Number(skillCount) * 1.0 / skillsRequired.length;
			ratingObj.value = skillCount;
			ratingObj.displayValue = skillCount + " / " + skillsRequired.length;
			ratingObj.detailedDisplayValue = this.getDetailedDisplayValue(skills.getAggregate("MIN", "user.sys_id"), skillsRequired); 
			returnUsers[skills.getAggregate("MIN","user.sys_id")] = ratingObj;
		}
		
		for(var i=0;i< users.length;i++)
		{
			if(!returnUsers[users[i]]){
				var ratingObj = {};
				ratingObj.rating = 0;
				ratingObj.value = 0;
				ratingObj.displayValue = "0 / " + skillsRequired.length;
				ratingObj.detailedDisplayValue = "No Matching Skills"; 
				returnUsers[users[i]] = ratingObj;
			}
		}

		return returnUsers;
	},
	
	getDetailedDisplayValue : function(user, skillsRequired){
		var skills = [];
		var skillGR = new GlideRecord("sys_user_has_skill");
		skillGR.addEncodedQuery("skillIN" + skillsRequired.join());
		skillGR.addEncodedQuery("userIN"+ user);
		skillGR.addActiveQuery();
		skillGR.query();
		while(skillGR.next())
			skills.push(skillGR.getDisplayValue('skill'));
		return skills.join(", ");
	},

    type: 'MatchingDimensionSkills'
});