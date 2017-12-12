(function ($scope) {
	var data = $scope.data || $scope.getRealData(); //this does not have to be a function but can be a simple variable or another javascript object  
	data.cardData = input.card_data || options.card_data || $scope.data;
	data.cardData = JSON.parse(data.cardData);
})();