function($scope, $window) {
	var c = this;

	var firstLoad = true;

	function injectCSS(){
		if(firstLoad){
			$('iframe#credential-doc').load( function() {
				$('iframe#credential-doc').contents().find("head")
					.append($("<style type='text/css'>  body>img {width:100%}  </style>"));
				firstLoad = false;
			});
		}
	}

	if(firstLoad ){
		$window.setInterval(injectCSS, 0);
	}
	
	c.showDoc = false;
	$scope.showUpdating = false;

	$scope.$watchGroup([ 'c.showDoc' ], function() {
		$window.onresize();
	});

	$window.onresize = function() {
		var footerHeight = 245;
		var h = $($window).height() - footerHeight;
		var docFrameId = '#docFrame-' + $scope.data.task.sys_id;
		$(docFrameId).height(h + 'px');
	};

	$scope.authenticateUser = function(sys_id, user_id, user_name) {
		var password = $scope.data.password;
		if (!password) {
			alert('${Please input your password!}');
		  var passwordId = '#password-' + $scope.data.task.sys_id;
			$(passwordId).focus();
			return;
		}
		$scope.showUpdating = true;
		$scope.data.action = 'authenticateUser';
		$scope.data.request = {
			sys_id : sys_id,
			user_id : user_id,
			user_name : user_name,
			password : password
		};

		$scope.server.update().then(function(data) {
			if (data.response.status == "success") {
				$scope.data.password = '';
				$scope.hidePop();
			} else {
				alert('${Password is incorrect!}');
				var passwordId = '#password-' + $scope.data.task.sys_id;
			  $(passwordId).focus();
			}
			$scope.showUpdating = false;
		});
	};

	/*    ------ IE Fixes -----
	* Returns true if end user's browser is IE 10,11or Edge
	* May need to update this check 
	* as per updates in browsers user-agent
	*/
	$scope.isIE = function() {
		return (/MSIE 10/i.test(navigator.userAgent)) || (/rv:11.0/i.test(navigator.userAgent)) || (/Edge\/\d./i.test(navigator.userAgent));
	};

	c.hidePop = function() {
		c.showDoc = false;
	};
}