var TourBuilderDetails = Class.create();
TourBuilderDetails.prototype = {
	
	_odf : new TourBuilderObjectDataFactory(),
	_uc : new TourBuilderUtility(),
	
	initialize: function() {
	},
	
	getTourDetails : function(args){
		var result = [];
		var _details = [];
		var detail_data =[];
		var _steps = [];
		var steps_data =[];
		var details = this._odf.getTourdetails({tour_id : args.tour_id});
		
		if(!gs.nil(details)) {
			var details_list = details.split(",");
			
			for(var k = 0; k < details_list.length; k++) {
				detail_data = this._odf.getEntityData({'sys_id': details_list[k], 'table': 'sys_embedded_tour_guide'});
				_details.push({"tour":detail_data});
				
				var steps = this._odf.getToursteps({tour_id : details_list[k]});
				var steps_list = steps.split(",");
				
				for(var i = 0; i < steps_list.length; i++) {
					steps_data = this._odf.getEntityData({'sys_id': steps_list[i], 'table': 'sys_embedded_tour_step', 'reference_table_name':'sys_embedded_tour_element','extract_reference_fields':['target_ref','action_target_ref']});
					_steps.push(steps_data);
				}
				
				result= _steps;
			}
		}
							
		return result;
	},
			
	getTourdetailsJSON : function(args){
		var resultObject = [];
		resultObject = {id :args.tour_id,steps : this.getTourdetails(args)};
		return new global.JSON().encode(resultObject);
	},
				
	type: 'TourBuilderDetails'
};