gs.info("Started the execution of the fix script - Manage Content's HRCriteria M2M Info ");
var manageContent = new GlideRecord('sn_hr_core_link');
manageContent.query();
while(manageContent.next()){
  var returnResult = checkAndReturnHRCriteriaRelatedList(manageContent.getValue('sys_id'));
  if(returnResult.hasRelatedList){  	
  	  manageContent.user_selection_query = returnResult.resultQuery;
	  manageContent.user_selection_table = 'sys_user';
	  manageContent.user_selection_type  = 'hr_criteria';
  	  manageContent.update();
  	}
}
gs.info("Completed the execution of the fix script - Manage Content's HRCriteria M2M Info ");

function checkAndReturnHRCriteriaRelatedList(manageContentSysId){
var sendResult={
	hasRelatedList : false,
	resultQuery:''
};
hrCriteriaSysid =[];
var hrCriteriaM2MLinkTable = new GlideRecord('sn_hr_core_m2m_link_template');
hrCriteriaM2MLinkTable.addEncodedQuery('hr_criteriaISNOTEMPTY^hr_link='+manageContentSysId);
hrCriteriaM2MLinkTable.query();
if(hrCriteriaM2MLinkTable.hasNext()){
	sendResult.hasRelatedList=true;
	while(hrCriteriaM2MLinkTable.next()){
		hrCriteriaSysid.push(hrCriteriaM2MLinkTable.getValue('hr_criteria'));
	}
    sendResult.resultQuery = hrCriteriaSysid.join();
}	
return sendResult;
}