var hrServiceWithLE = false;
var hrServiceWithApprovers = false;
var hrServiceWithActivities = false;
var hrServiceWithWorkflow = false;
var resultWF;
var HRCORESCOPE = "d4ac3fff5b311200a4656ede91f91af2";
copyApprovalOptions();
moveRecordsToScope();
var hrServicesWithActivities = getHrServicesWithActivities();
addFulfillmentType();

function moveRecordsToScope(){
	var grHRService = new GlideRecord('sn_hr_core_service');
	grHRService.addQuery('sys_scope','!=',HRCORESCOPE);
	grHRService.query();
	while(grHRService.next()){
		grHRService.sys_scope = HRCORESCOPE;
		grHRService.update();
	}
}

function addFulfillmentType(){
	var grHRService = new GlideRecord('sn_hr_core_service');
	grHRService.query();
	while(grHRService.next()){
		getConditions(grHRService);
		setHRServiceType(grHRService);
		resetConditions();
	}
}

function copyApprovalOptions() {
	var gr = new GlideRecord('sn_hr_core_service_activity');
	if (!gr.isValidField('approval_options'))
		return;
	gr.addQuery('activity_type', 'approval');
	gr.addNullQuery('approval_options');
	gr.addNotNullQuery('parent_service.approval_options');
	gr.query();
	while (gr.next()) {
		gr.approval_options = gr.parent_service.approval_options;
		gr.update();
	}
}





function getHrServicesWithActivities() {
	var hrServicesWithActivities = {};
		var grHRServiceActivity = new GlideAggregate("sn_hr_core_service_activity");
		grHRServiceActivity.groupBy("parent_service");
		grHRServiceActivity.query();
		
		while (grHRServiceActivity.next())
			hrServicesWithActivities[grHRServiceActivity.parent_service.sys_id] = true;
		
		return hrServicesWithActivities;
	}
	
	function getConditions(grHRService) {
		if (grHRService.le_type != undefined && grHRService.le_type != '')
			hrServiceWithLE = true;
		if (grHRService.approval_options != undefined
			&& grHRService.approval_options != '')
		hrServiceWithApprovers = true;
		if (hrServicesWithActivities[grHRService.sys_id] != undefined)
			hrServiceWithActivities = true;
		getWorkflow(grHRService.template);
	}
	
	function setHRServiceType(grHRService) {
		if (hrServiceWithLE && hrServiceWithActivities)
			grHRService.setValue('fulfillment_type', "custom");
		else if (hrServiceWithLE && (hrServiceWithApprovers||hrServiceWithWorkflow))
			grHRService.setValue('fulfillment_type', "custom");
		else if (hrServiceWithActivities && (hrServiceWithApprovers||hrServiceWithWorkflow))
			grHRService.setValue('fulfillment_type', "custom");
		else if (hrServiceWithActivities)
			grHRService.setValue('fulfillment_type', "service_activity");
		else if (hrServiceWithLE)
			grHRService.setValue('fulfillment_type', "lifecycle_event");
		else if (hrServiceWithApprovers && hrServiceWithWorkflow){
			grHRService.setValue('fulfillment_type', "custom");
			grHRService.setValue('workflow_detail',resultWF);
		}else if(hrServiceWithWorkflow){
			grHRService.setValue('fulfillment_type', "workflow");
			grHRService.setValue('workflow_detail',resultWF);
		}else if(hrServiceWithApprovers){
			grHRService.setValue('fulfillment_type', "custom");
		}
		else
			grHRService.setValue('fulfillment_type', "simple");
		grHRService.setWorkflow(false);
		grHRService.update();
	}
	
	function resetConditions() {
		hrServiceWithLE = false;
		hrServiceWithApprovers = false;
		hrServiceWithActivities = false;
		hrServiceWithWorkflow = false;
	}
	
	function getWorkflow(templateSysId){
		var validateWF =new sn_hr_core.hrFulfillmentTypeUtil();
		resultWF  = validateWF.getWorkflow(templateSysId);
		if(resultWF !=''){
			hrServiceWithWorkflow = true;
		}
	}
	