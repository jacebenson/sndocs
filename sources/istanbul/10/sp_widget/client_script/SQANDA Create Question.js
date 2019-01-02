function($scope, $location, $timeout, spUtil, glideFormFactory, $rootScope) {

	$rootScope.$broadcast('sp.update.breadcrumbs', [
		{label: $scope.data.communityBreadcrumb, url: '?id=sqa_tagged_questions'},
		{label: $scope.page.title, url: '#'}
	]);

	$scope.tagList = "";

	$scope.update = function() {
		//Must be wrapped in timeout - need to wait for tagList to be updated
		//by the digest cycle before saving.
		$timeout(function() {
			if ($scope.data.f._fields.question.value === "") {
				spUtil.addErrorMessage($scope.data.mustSpecifyQuestionMsg);
				return;
			}

			if (g_form && g_form.submit() === false)
				return;

			var x = {};
			var d = $scope.data;
			x.method = "save";
			x.table = d.table;
			x.sys_id = d.sys_id;
			x._fields = d.f._fields;
			x.tagList = $scope.tagList;
			$scope.status = $scope.data.postingMsg;
			spUtil.get($scope, x).then(function(response) {
				$location.search({id: 'kb_social_qa_question', sys_id: response.data.sys_id});
			});
		});
	}

	var flatFields = [];
	angular.forEach($scope.data.f._fields, function(field) {
		flatFields.push(field);
	});

	var uiMessageHandler = function(g_form, type, message) {
		switch (type) {
			case 'addInfoMessage':
				spUtil.addInfoMessage(message);
				break;
			case 'addErrorMessage':
				spUtil.addErrorMessage(message);
				break;
			case 'clearMessages':
				break;
			default:
		}
	};

	var g_form = glideFormFactory.create($scope, $scope.data.f.table, $scope.data.f.sys_id, flatFields, null, {uiMessageHandler: uiMessageHandler});

	$scope.getGlideForm = function() {
		return g_form;
	}

	var timeoutPromise;
	$scope.$watch("data.f._fields.question.value", function(nv) {
		if (!nv || nv.length < 5) {
			$scope.data.questionSuggestions = [];
			return;
		}

		$timeout.cancel(timeoutPromise);
		timeoutPromise = $timeout(function() {
			var x = {};
			x.method = "search";
			x.query = nv;
			spUtil.get($scope, x).then(function(response) {
				$scope.data.questionSuggestions = response.data.questionSuggestions;
			});
		}, 1000);
	});
}