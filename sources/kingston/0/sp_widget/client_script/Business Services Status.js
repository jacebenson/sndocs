function($scope) {
	for (var x in $scope.data.dates) {
		var dateStr = moment($scope.data.dates[x]).format('ll').split(',')[0];
		//Now we need to parse the date number into a real number so the screen reader reads it correctly
		var dateObj = {
			month: $scope.data.monthTranslations[dateStr.split(" ")[0]],
			day: parseInt(dateStr.split(" ")[1])
		}
		$scope.data.dates[x] = dateObj;
	}
}

