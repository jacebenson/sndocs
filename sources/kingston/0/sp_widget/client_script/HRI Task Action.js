function($scope, $rootScope, $timeout, $window, nowServer, $http, $sce) {
	var c = this;
	
	$scope.showDoc = false;
	$scope.showUpdating = false;
	$scope.currentTask = {};
	$scope.showSigPad = false;
	$scope.disableFinishButton = true;
	$scope.acknowledgeType = '';
	$scope.document_revision = '';
	$scope.documentBody = $sce.trustAsHtml($scope.data.documentBody);
	$scope.url = $sce.trustAsResourceUrl($scope.data.task.url);
	/*
	 *Listening to $sp.sc_cat_item.submitted to get child case record.
	 *Post Processing includes: 
	 *Setting up tasks parent as child case's parent.
	 *Closing the task.
	 */
	$scope.$on("$sp.sc_cat_item.submitted", function(event, data){
		processRelatedRecord(data.sys_id);
	});
	
	$scope.$on("$sp.sc_order_guide.submitted", function(event, data){
		processRelatedRecord(data.sys_id);
	});

	$scope.$on('user.documents.uploaded', function(evt) {
		$scope.disableFinishButton = false;
  });
	
	$scope.$on('user.documents.absent', function(evt) {
		$scope.disableFinishButton = true;
  });
	
	function processRelatedRecord(relatedRecord){
		if(relatedRecord == null) 
			return;
		$scope.postProcessing(relatedRecord);
	}
	
	function showDocumentWindow(data) {

		if (data.document_revision && data.document_revision.length == 32 && data.attachment.length == 32) {
			$scope.attachmentUrl = '/sys_attachment.do?view=true&sys_id=' + data.attachment;
			$scope.document_name = data.document_name;
			$scope.acknowledgeType = data.type;
			$scope.acknowledgeType = $scope.acknowledgeType ? $scope.acknowledgeType : "credential";
			$scope.document_revision = data.document_revision;

			$scope.showDoc = true;

			$scope.showSigPad = false;
			if ($window.innerWidth <= 768)
				$scope.showSigPad = true;

			$timeout(function() {
				$('#password').focus();
				$('#password').val('');
			}, 100);
		} else
			alert('${Error: the document is missing or has not been setup correctly!}');
	}

	$scope.clearCanvas = function() {
		$window.sigPad.clearCanvas();
	};

	$scope.toggleSigPad = function() {
		$scope.showSigPad = !$scope.showSigPad;
		if (!$scope.showSigPad)
			$window.sigPad.clearCanvas();
	};

	$scope.$watchGroup([ 'showDoc', 'showSigPad', 'showOfferLetter' ], function() {
		$window.onresize();
	});

	$window.onresize = function() {
		var footerHeight = 522;

		if ($scope.data.task && $scope.data.task.hr_task_type == 'credential')
			footerHeight = 245;
		if ($scope.data.task && $scope.data.task.hr_task_type == 'e_signature')
			footerHeight = $scope.showSigPad ? 522 : 245;

		var h = $($window).height() - footerHeight;
		$('#docFrame').height(h + 'px');
	};

	$scope.getTasks = function(sys_id) {
		$scope.data.action = "getTasks";
		$scope.data.sys_id = sys_id;
		$scope.server.update();
	};

	$scope.authenticateUser = function(sys_id, user_id, user_name) {
		var password = $scope.data.password;
		if (!password) {
			alert('${Please input your password!}');
			$('#password').focus();
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
			if (data.response.status == "success")
				$scope.data.password = '';
			else {
				alert('${Password is incorrect!}');
				$('#password').focus();
			}
			$scope.showUpdating = false;
		});
	};

	$scope.clickOnTaskLink = function() {
		$timeout(function() {
			$scope.disableFinishButton = false;
		}, 1000);
	};

	$scope.iHaveFinished = function(sys_id, user_id) {
		$scope.setTaskFinished(sys_id, user_id);
	};
	
	$scope.skipTask = function(taskId){
		$scope.setTaskSkipped(taskId);
	};
	
	/*    ------ IE Fixes -----
	* Returns true if end user's browser is IE 10,11or Edge
	* May need to update this check 
	* as per updates in browsers user-agent
	*/
	$scope.isIE = function() {
		return (/MSIE 10/i.test(navigator.userAgent)) || (/rv:11.0/i.test(navigator.userAgent)) || (/Edge\/\d./i.test(navigator.userAgent));
	};

	$scope.saveSignature = function(sys_id, user_id) {
		var w;
		if ($scope.showDoc)
			w = $window.sigPad2;
		else
			w = $window.sigPad;
		var data = angular.fromJson(w.getSignatureString());
		var image = w.getSignatureImage();

		if (data.length == 0) {
			alert('${You need to sign first.}');
			return;
		}

		$scope.showUpdating = true;
		if ($scope.data.task.hr_task_type == "sign_document") {
				$scope.showUpdating = true;
				$scope.data.action = 'setDocumentBody';
				$scope.data.request = {
					sys_id : sys_id,
					user_id : user_id
				};

				$scope.server.update().then(function(data) {
					saveSignature('sn_hr_core_task', sys_id, image, data).then(function(response) {
						if (response && response.data.status.length == 32)
							$scope.getTasks(sys_id);
						else {
							console.log('Error:' + response.data);
							$scope.showUpdating = false;
						}
						w.clearCanvas();
					});
				});
		} else {
				saveSignature('sn_hr_core_task', sys_id, image, data).then(function(response) {
				if (response && response.data.status.length == 32)
					$scope.setTaskFinished(sys_id, user_id, response.data.status);
				else {
					console.log('Error:' + response.data);
					$scope.showUpdating = false;
				}			
				w.clearCanvas();
			});
		}
	};

	$scope.retrieveSignatureImage = function(sys_id) {
		$scope.showUpdating = true;
		retrieveSignatureImage('sn_hr_core_task', sys_id).then(function(response) {
			if (response && response.data.length == 32)
				$scope.image_data = "/sys_attachment.do?view=true&sys_id=" + response.data;
			else
				console.log('Error: no signature image retrieved');

			$scope.showUpdating = false;
		});
	};
	
	$scope.postProcessing = function(childCaseId){
		$scope.data.action = "postProcessing";
		$scope.data.childCaseId = childCaseId;
		$scope.server.update();
	};

	$scope.setTaskFinished = function(sys_id, user_id, signature) {
		$scope.showUpdating = true;
		$scope.data.action = 'setTaskFinished';
		$scope.data.request = {
		    sys_id : sys_id,
		    user_id : user_id,
		    signature : signature
		};

		$scope.server.update().then(function(data) {
			$scope.showDoc = false;
			$scope.showUpdating = false;
		});
	};
	
	$scope.setTaskSkipped = function(taskId){
		$scope.data.action = 'setTaskSkipped';
		$scope.data.request = {
		    taskId : taskId
		};
		$scope.server.update();
	};

	$scope.hidePop = function() {
		$window.sigPad.clearCanvas();
		$scope.showDoc = false;
	};

	function saveSignature(table, document, image, data) {
		var n = {
		    action : 'acceptSignatureImage',
		    table : table,
		    document : document,
		    sp : true,
		    time : new Date().getTime()
		};

		var da = {
		    image : image,
		    data : data
		};

		var dataURL = '';
		Object.keys(n).forEach(function(t) {
			dataURL += "&" + t + "=" + n[t];
		});

		return $http.post(nowServer.getURL('SignatureANGProcessor', dataURL), da);
	}

	function retrieveSignatureImage(table, document) {
		var n = {
		    action : 'retrieveSignatureImage',
		    table : table,
		    document : document,
		    sp : true,
		    time : new Date().getTime()
		};

		var dataURL = '';
		Object.keys(n).forEach(function(t) {
			dataURL += "&" + t + "=" + n[t];
		});
		return $http.post(nowServer.getURL('SignatureANGProcessor', dataURL));
	}

}