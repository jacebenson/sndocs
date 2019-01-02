(function() {
 if(!input){
		//Get options and generate data object for client script
		data.hide_relevancy = options.hide_relevancy == 'true'|| false; 
		options.sort_fields = options.sort_fields ? options.sort_fields : 'sys_view_count,sys_updated_on,short_description';
		options.sort_field_params = options.sort_field_params || 'Views:desc,Newest:desc,Alphabetical:desc';

		var relevancyObj = {};
		relevancyObj.id = 'relevancy';
		relevancyObj.order_desc = true;

		//Generate sort values based on fields selected in options
		var items = [];
		var fieldList = options.sort_fields.split(",");
		var filedParams = options.sort_field_params.split(",");

		fieldList.forEach(function(key,i){
			var params = filedParams[i] ? filedParams[i].split(":") : [];
			var obj = {};
			obj.id = key+'';
			obj.label = gs.getMessage(params[0]) || "";
			obj.order_desc = params[1] ? params[1] == 'desc' : false;
			items.push(obj);
		});

		data.sort_items = items;
		data.relevency_data = relevancyObj;
	} else {
		if(input.requestType =="setUserPreference"){
			var order = input.preferOrder;
			if(order!=""){
				gs.getUser().savePreference('knowledge.portal_search.sort.field',order);
			}
		}
	}
})();