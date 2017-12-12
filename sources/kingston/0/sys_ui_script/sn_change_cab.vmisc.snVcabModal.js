(function ($) {
	'use strict';

	function getCtrlId (id) {
		return 'vcabModal_' + id;
	}

	angular.module('sn.itsm.vcab.misc')
	.constant('VcabModalCloseReasons', {
		OK: 'ok',
		CANCEL: 'cancel',
		UNKNOWN: undefined
	})
	.controller('VcabModalInstanceCtrl', function ($scope, VcabModalCloseReasons, data) {
		$scope.title = data.title;
		$scope.okBtnLabel = data.okBtnLabel;
		$scope.cancelBtnLabel = data.cancelBtnLabel;
		$scope.instance = data.instance;

		var Ctrl = data.ownerCtrl;

		function enableButtons() {
			$scope.enableButtons = true;
		}
		enableButtons();

		$scope.ok = function () {
			$scope.enableButtons = false;
			Ctrl._canClose(VcabModalCloseReasons.OK).then(function () {
				Ctrl.close(VcabModalCloseReasons.OK);
				enableButtons();
			}, enableButtons);
		};
		$scope.cancel = function () {
			$scope.enableButtons = false;
			Ctrl._canClose(VcabModalCloseReasons.CANCEL).then(function () {
				Ctrl.close(VcabModalCloseReasons.CANCEL);
				enableButtons();
			}, enableButtons);
		};
	})
	.directive('snVcabModal', function (getTemplateUrl, $uibModal, i18n, $rootScope, getController) {
		return {
			restrict: 'E',
			scope: {
				id: '@',
				title: '@',
				okBtnLabel: '@?',
				cancelBtnLabel: '@?',
				widgetData: '=',
				open: '=?'
			},
			templateUrl: getTemplateUrl('vcab_sn_vcab_modal.xml'),
			link: function ($scope, el, attrs, Ctrl) {
				if (!$scope.okBtnLabel)
					$scope.okBtnLabel = i18n.getMessage('Ok');
				if (!$scope.cancelBtnLabel)
					$scope.cancelBtnLabel = i18n.getMessage('Cancel');

				$scope.$watch('open', function () {
					if ($scope.open)
						Ctrl.open();
				});
				$scope.$on('$destroy', function () {
					getController.deregister(getCtrlId($scope.id));
				});
			},
			controller: function ($scope, $q) {
				var Ctrl = this;
				getController.register(getCtrlId($scope.id), Ctrl);
				this.open = function () {
					function onClose(reason) {
						$scope.mInstance = null;
						$scope.open = false;
						$rootScope.$broadcast('vcabmodal.closed', {id: $scope.id, reason: reason});
					}
					if (Ctrl.isOpen())
						return;
					$scope.mInstance = $uibModal.open({
						templateUrl: 'vcab-modal.html',
						controller: 'VcabModalInstanceCtrl',
						resolve: {
							data: function () {
								return {
									title: $scope.title,
									okBtnLabel: $scope.okBtnLabel,
									cancelBtnLabel: $scope.cancelBtnLabel,
									instance: $scope.widgetData,
									ownerCtrl: Ctrl
								};
							}
						}
					});
					$scope.mInstance.result.then(onClose, onClose);
				};
				this.onBeforeClose = function (cb) {
					if (!$scope.onBeforeCloseL)
						$scope.onBeforeCloseL = [];
					$scope.onBeforeCloseL.push(cb);
					return function dereg() {
						$scope.onBeforeCloseL.some(function (cb1, idx) {
							if (cb1 === cb) {
								$scope.onBeforeCloseL.splice(idx, 1);
								return true;
							}
						});
					};
				};
				this._canClose = function (reason) {
					var def = $q.defer();
					var promisesCount = 0;
					var resultsGotCount = 0;
					if ($scope.onBeforeCloseL)
						$scope.onBeforeCloseL.forEach(function (cb) {
							var p = cb(reason);
							if (p) {
								promisesCount++;
								p.then(function () {
									resultsGotCount++;
									if (promisesCount === resultsGotCount)
										def.resolve();
								}, function () {
									def.reject();
								});
							}
						});
					if (promisesCount === 0)
						def.resolve();
					return def.promise;
				};
				this.close = function (reason) {
					if ($scope.mInstance)
						$scope.mInstance.close(reason);
				};
				this.isOpen = function () {
					return !!$scope.mInstance;
				};
			}
		};
	})
	.factory('vcabModal', function (getController) {
		return {
			getInstanceCtrl: function (id) {
				return getController(getCtrlId(id));
			}
		};
	});
} (jQuery));