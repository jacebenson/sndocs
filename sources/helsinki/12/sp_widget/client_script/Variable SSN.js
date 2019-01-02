function ($scope) {
	var ssn = $scope.data.ssn;
	var ssn_area = '';
	var ssn_group = '';
	var ssn_serial = '';
	var ssnAreaLen = 3;
	var ssnGroupLen = 2;
	var ssnSerialLen = 4;
	if(ssn){
		ssn_area = ssn.substr(0,ssnAreaLen);
		ssn_group = ssn.substr(ssnAreaLen,ssnGroupLen);
		ssn_serial = ssn.substr(ssn.length - ssnSerialLen);
	}
	$scope.ssn = {
		area: ssn_area,
		group: ssn_group,
		serial: ssn_serial
	};

	$scope.$watch('ssn.area', watch);
	$scope.$watch('ssn.group', watch);
	$scope.$watch('ssn.serial', watch);
	function watch(nv, ov) {
		var s = $scope.ssn;
		// needs validation
		$scope.page.field.value = s.area + s.group + s.serial;
	}
}