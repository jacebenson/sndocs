var hrCriteria = new GlideRecord('sn_hr_core_criteria');
hrCriteria.query();

while(hrCriteria.next()){
   var userCriteriaName = hrCriteria.name + ' (' + gs.getMessage("HR Criteria") + ')';
   var userCriteriaSysId = new global.HRSecurityUtils().createNewUserCriteria(hrCriteria.sys_id, userCriteriaName);
   if (userCriteriaSysId){
	   gs.info("Created new User Criteria: " + userCriteriaName + " from HR Criteria: " +   hrCriteria.name);
	   hrCriteria.related_user_criteria.setValue(userCriteriaSysId);
	   hrCriteria.update();
   }
}