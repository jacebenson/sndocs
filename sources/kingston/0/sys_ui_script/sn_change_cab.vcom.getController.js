(function () {
	'use strict';

	var instances = {};

	angular.module('sn.itsm.vcab.common')
	.factory('getController', function () {
		var f = function (id) {
			return instances[id];
		};
		f.register = function (id, ctrl) {
			instances[id] = ctrl;
		};
		f.deregister = function (id) {
			instances[id] = undefined;
		};
		return f;
	});

} ());