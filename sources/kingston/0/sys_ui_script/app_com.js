angular.module("sn.app_common", ["sn.app_common.snapi","sn.app_common.time","sn.app_common.sanitize"]);

angular.module("sn.app_common.snapi", [])
	.constant('SNAPI', {
		SERVICE: {
			TABLE: '/api/now/table/',
			NOTIFICATION: '/api/now/session/notification'
		}
	});

angular.module("sn.app_common.time", [])
	.constant('TIME', {
		SECOND: 1000,
		MINUTE: 60000,
		HOUR: 3600000,
		DAY: 86400000
	});

angular.module("sn.app_common.sanitize", [])
	.filter("sanitize", ['$sce', '$sanitize', function($sce, $sanitize) {
		return function(htmlRaw) {
			return $sce.trustAsHtml($sanitize(htmlRaw));
		};
	}]);