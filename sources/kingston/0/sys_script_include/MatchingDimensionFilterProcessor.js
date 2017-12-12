var MatchingDimensionFilterProcessor = Class.create();
MatchingDimensionFilterProcessor.prototype = {
    initialize: function() {
    
	},
	getFilterData:function(filterParam){
		var filterData = [];
		if(filterParam && filterParam.criteria_sys_id){
			var gr = new GlideRecord('matching_dimension');
			gr.get(filterParam.criteria_sys_id);
				gs.log("Vinay dimension found",gr.getValue('use_reference'));
				if(gr.getValue('use_reference')){
					var filterTable = gr.getValue("reference_table");
					var filterCond = gr.getValue("reference_filter");
					var filterFieldName = gr.getValue("reference_field");
					var filterGR = new GlideRecordSecure(filterTable);
					filterGR.addQuery(filterCond);
					filterGR.query();
					while(filterGR.next()){
						var filterDataObj = {};
						filterDataObj.id = filterGR.getValue('sys_id');
						filterDataObj.text = filterGR.getDisplayValue(filterFieldName);
						filterData.push(filterDataObj);
					}
				}	
		}
		return filterData;	
	},
    type: 'MatchingDimensionFilterProcessor'
};