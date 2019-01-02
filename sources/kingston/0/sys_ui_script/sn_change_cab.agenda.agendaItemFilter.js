angular.module("sn.change_management.cab.agenda")
	.filter("agendaItemFilter", ['filterFilter', function(filterFilter) {
		function checkDuplicates(inputArray) {
			//Order by the order value of agenda items
			inputArray.sort(function(a, b){
		 		 return a.order.value-b.order.value;
		 	});
		 	
		 	//iterate through checking for duplicates
		 	var lookup = {};
		 	var uniqueList = [];
		 	for (var i=0; i < inputArray.length; i++) {
		 		var sysid = inputArray[i].sys_id.value;

		 		if (!(sysid in lookup)) {
		 			lookup[sysid] = 1;
		 			uniqueList.push(inputArray[i]);
		 		}
		 	}
		 	
		 	return uniqueList;
		}
		
		return function(items, state, userId) {
			if (!state || state == 'all')
				return items;

			var result = [];
			if (state == 'pending')
				return filterFilter(items, {'state': {'value': state}});
			
			if (state == 'mine') {     
				var requestedBy = filterFilter(items, {'task': {'record': {'requested_by': {'value': userId}}}});
				var assignedTo = filterFilter(items, {'task': {'record': {'assigned_to': {'value': userId}}}});
				var cabDelegate = filterFilter(items, {'task': {'record': {'cab_delegate': {'value': userId}}}});
				
				var combined = requestedBy.concat(assignedTo.concat(cabDelegate));
				
			 	return checkDuplicates(combined);
			}
			
			if (state == 'approved')
				return filterFilter(items, {'task': {'record': {'approval': {'value': 'approved'}}}});
		};
	}]);