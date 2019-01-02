updateHRServiceMappingValues();
function updateHRServiceMappingValues(){
	var hrServiceMapping = new GlideRecord('sn_hr_integrations_service_mapping');
	hrServiceMapping.addNotNullQuery('outbound_service');
	hrServiceMapping.query();
	while(hrServiceMapping.next()){
		hrServiceMapping.outbound_request_type = "soap";
		hrServiceMapping.response_content_type = "xml";
		hrServiceMapping.update();
	}
}