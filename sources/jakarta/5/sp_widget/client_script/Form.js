function ($scope, $rootScope, $timeout, spUtil, $location, $window, nowAttachmentHandler, $log, spAriaUtil) {
	$scope.mandatory = [];
	$scope.errorMessages = [];
	$scope.data.show_sql = false;
	$scope.saveButtonSuffix = spUtil.getAccelerator('s');
	$scope.adminMenu = {
		encodedPageUrl: encodeURIComponent($location.url()),
		getClientScriptCount: function() {
			var count = 0;
			if ($scope.data.f.client_script) {
				count += $scope.data.f.client_script.onChange.length;
				count += $scope.data.f.client_script.onLoad.length;
				count += $scope.data.f.client_script.onSubmit.length;
			}
			return count;
		}
	};

	$scope.getUIActions = function(type) {
		if ($scope.data.disableUIActions)
			return [];
		if (type) {
			return $scope.data.f._ui_actions.filter(function(action) {
				//We handle the primary action button separately.
				return !action.primary && action['is_' + type];
			});
		} else {
			return $scope.data.f._ui_actions;
		}
	}

	$scope.getPrimaryAction = function() {
		var primaryActions = $scope.data.f._ui_actions.filter(function(action) {
			return action.primary;
		});
		return (primaryActions.length) ? primaryActions[0] : null;
	}

	$scope.getUIActionContextMenu = function(event) {
		var menu = [];
		if (event.ctrlKey)
			return menu;

		var contextActions = $scope.getUIActions('context');
		contextActions.forEach(function(action) {
			menu.push([action.name, function() {
				$scope.triggerUIAction(action);
			}]);
		});

		if (contextActions.length > 0)
			menu.push(null);
		menu.push([$scope.data.exportPDFMsg, function() {exportPDF("");}]);
		menu.push([$scope.data.exportPDFLandMsg, function() {exportPDF('true');}]);

		return menu;
	}

	function exportPDF(landscape) {
		$window.open("/" + $scope.data.f.table + ".do?PDF&landscape=" + landscape + "&sys_id=" + $scope.data.sys_id + "&sysparm_view=" + $scope.data.f.view);
	}

	//trigger the primary UI Action on save (if there is one)
	var deregister = $scope.$on('$sp.save', function() {
		var primaryAction = $scope.getPrimaryAction();
		if (primaryAction)
			$scope.triggerUIAction(primaryAction);
	});
	$scope.$on('$destroy', function() {deregister()});

	$scope.triggerUIAction = function(action) {
		if ($scope.data.disableUIActions && !action.primary) {
			return;
		}

		var activeElement = document.activeElement;
		if (activeElement) {
			activeElement.blur();
		}

		$timeout(function() {
			if (g_form) {
				g_form.submit(action.action_name || action.sys_id);
			}
		});
	}

	$scope.$on("spModel.uiActionComplete", function(evt, response) {
		var sysID = (response.isInsert) ? response.sys_id : $scope.data.sys_id;
		loadForm($scope.data.table, sysID).then(constructResponseHandler(response));
	});

	function constructResponseHandler(response) {
		return function() {
			var message;
			var eventName = "sp.form.record.updated";
			if (response.isInsert) {
				message = $scope.data.recordAddedMsg;
				var search = $location.search();
				search.sys_id = response.sys_id;
				search.spa = 1;
				$location.search(search).replace();
			} else
				message = $scope.data.updatedMsg;

			$scope.data.hideRelatedLists = hideRelatedLists();
			$scope.$emit(eventName, $scope.data.f._fields);
			$rootScope.$broadcast(eventName, $scope.data.f._fields);
			$scope.status = message;
			spUtil.addTrivialMessage(message);
			$timeout(clearStatus, 2000);
		}
	}

	var ctrl = this;
	// switch forms
	var unregister = $scope.$on('$sp.list.click', onListClick);
	$scope.$on("$destroy", function() {
		unregister();
	})

	function onListClick(evt,arg) {
		loadForm(arg.table, arg.sys_id);
	}

	function loadForm(table, sys_id){
		var f = {};
		$scope.data.table = f.table = table;
		$scope.data.sys_id = f.sys_id = sys_id;
		f.view = $scope.data.view;
		return $scope.server.update().then(setupAttachmentHandler);
	}

	function openRelatedList(e, queryString){
		// todo: Open this in a modal
		$location.search(queryString);
		e.preventDefault();
	}

	$scope.$on('spModel.fields.rendered', function() {
		if (ctrl.panels)
			ctrl.panels.removeClass('shift-out').addClass('shift-in');
	});

	var g_form;
	$scope.$on('spModel.gForm.initialized', function(e, gFormInstance) {
		if (gFormInstance.getTableName() == $scope.data.f.table)
			g_form = gFormInstance;
	});

	// Show or hide related lists
	$scope.$watch('data.f._related_lists', function(){
		$scope.data.hideRelatedLists = hideRelatedLists();
	}, true);

	function hideRelatedLists() {
		if (!$scope.data.f._related_lists)
			return true;

		if ($scope.options.hideRelatedLists == true)
			return true;

		if ($scope.data.sys_id == '-1')
			return true;

		// If all related lists are visible=false then hide
		if ($scope.data.f._related_lists.length > 0) {
			for (var i in $scope.data.f._related_lists) {
				var list = $scope.data.f._related_lists[i];
				if (list.visible) {
					return false;
				}
			}
		}
		return true;
	}

	function clearStatus() {
		$scope.status = "";
	}

	function setupAttachmentHandler(){
		$scope.attachmentHandler = new nowAttachmentHandler(appendDone, appendError);

		$timeout(function() {
			var sizeLimit = 1024 * 1024 * 24; // 24MB
			$scope.attachmentHandler.setParams($scope.data.table, $scope.data.f._attachmentGUID, sizeLimit);
		});

		$scope.$on('dialog.upload_too_large.show', function(e){
			$log.error($scope.data.largeAttachmentMsg);
			spUtil.addErrorMessage($scope.data.largeAttachmentMsg);
		});
	}
	setupAttachmentHandler();

	function appendDone() {
		// don't know here whether upload succeeded, so can't show msg either way
		$scope.$broadcast("sp.attachments.update", $scope.data.f._attachmentGUID);
		spAriaUtil.sendLiveMessage($scope.data.attachmentSuccessMsg);
	}

	function appendError(error) {
		$scope.errorMessages.push(error);
		spUtil.addErrorMessage(error.msg + error.fileName);
	}
}