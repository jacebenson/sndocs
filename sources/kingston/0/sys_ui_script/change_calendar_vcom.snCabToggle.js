
(function () {
	'use strict';
	angular.module('sn.itsm.vcab.common').directive('snCabToggle', function () {
		return {
			restrict: 'E',
			scope: {
				name: '@',
				value: '=',
				idFor: '@'
			},
			template: '<div class="input-switch">'
				+'<input ng-attr-id="{{$id}}" type="checkbox" name="{{name}}" ng-model="value" ng-attr-aria-labelledby = "{{idFor}}"/>'
				+'<label aria-hidden="true" class="switch" ng-attr-for="{{$id}}"></label>'
			+'</div>'
		};
	});
}());