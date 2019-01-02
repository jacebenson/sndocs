var case_master_detail_module = angular.module('ManageContentModule', ['sn.ngUserSelection']);
case_master_detail_module.controller('ManageContentController', function($scope, $attrs, $http) {
	
	$scope.hasContentWriter=g_user.hasRoleExactly('sn_hr_core.content_writer');
	var result_table=document.getElementById("sn_hr_core_link.user_selection_table");
	var result_query=document.getElementById("sn_hr_core_link.user_selection_query");
	var result_user_selection_type=document.getElementById("sn_hr_core_link.user_selection_type");
	
	 $scope.sendingExistingValueConfig = {
		 hasExistingValue:false,
		 existingFilterTable:"",
		 existingFilterQuery:"",
		 existingFilterBy:""
		 
	 };
	  
	 $scope.startingDirective = function(){
		if(result_query!=""&&result_table.value!=""&&result_user_selection_type.value!=""){
		 $scope.sendingExistingValueConfig = {
		 hasExistingValue:true,
		 existingFilterTable:result_table.value,
		 existingFilterQuery:result_query.value,
		 existingFilterBy:result_user_selection_type.value
	     };
		}
		 
	 };
	
	$scope.$watch('resultQuery', function(){
		
		if($scope.resultCount==-2){
			g_form.clearMessages();
			g_form.addInfoMessage('You may experience delays in loading the list on clicking "show users selected" link.');
		}
		
		if($scope.resultCount > 500000) {
			var contentType = g_form.getValue('sn_hr_core_link.content_type');
			if (contentType.localeCompare('dac4a34d0b00030036e62c7885673ad5') == 0)
				g_form.addInfoMessage('Sending emails to such a large number of users at a time may delay other emails that need to be sent. You should consider sending emails to a smaller group of users at one time');
		}
		
		if(!$scope.sendingExistingValueConfig.hasExistingValue){
			result_table.value=$scope.resultQueryTable;
			result_query.value=$scope.resultQuery;
			result_user_selection_type.value=$scope.resultselectedoption;
		}
	});
});