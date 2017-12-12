function(scope,element,attrs){
	if(scope.options.template == 'kb_facet_dropdown_select'){
		//initate and bind to select2
		setTimeout(function(){
			var selectID = $("#select_filter_"+scope.data.instanceid).select2({
				minimumResultsForSearch: scope.options.min_result_count || 10,
				placeholder: "${Filter}"
			});
		}, 0);
	}
}