(function () {
	'use strict';

	angular.module('sn.itsm.vcab.common')
	.factory('cancellablePromise', function ($q) {
		return function (promise) {
			var cancelled = false;
			var proxyPromise = $q(function (resolve, reject) {
				promise.then(function (r) {
					if (!cancelled)
						resolve(r);
				}, function (r) {
					if (!cancelled)
						reject(r);
				});
			});
			proxyPromise.cancel = function () {
				cancelled = true;
			};
			return proxyPromise;
		};
	});
} ());