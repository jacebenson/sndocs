/*! RESOURCE: /scripts/sn/common/util/service.snResource.js */
angular.module('sn.common.util').factory('snResource', function($http, $q, priorityQueue, md5) {
    'use strict';
    var methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'jsonp', 'trace'],
        queue = priorityQueue(function(a, b) {
            return a.timestamp - b.timestamp;
        }),
        resource = {},
        pendingRequests = [],
        inFlightRequests = [];
    return function() {
        var requestInterceptors = $http.defaults.transformRequest,
            responseInterceptors = $http.defaults.transformResponse;
        var next = function() {
            var request = queue.peek();
            pendingRequests.shift();
            inFlightRequests.push(request.hash);
            $http(request.config).then(function(response) {
                request.deferred.resolve(response);
            }, function(reason) {
                request.deferred.reject(reason);
            }).finally(function() {
                queue.poll();
                inFlightRequests.shift();
                if (queue.size > 0)
                    next();
            });
        };
        angular.forEach(methods, function(method) {
            resource[method] = function(url, data) {
                var deferredRequest = $q.defer(),
                    promise = deferredRequest.promise,
                    deferredAbort = $q.defer(),
                    config = {
                        method: method,
                        url: url,
                        data: data,
                        transformRequest: requestInterceptors,
                        transformResponse: responseInterceptors,
                        timeout: deferredAbort.promise
                    },
                    hash = md5(JSON.stringify(config));
                pendingRequests.push(hash);
                queue.add({
                    config: config,
                    deferred: deferredRequest,
                    timestamp: Date.now(),
                    hash: hash
                });
                if (queue.size === 1)
                    next();
                promise.abort = function() {
                    deferredAbort.resolve('Request cancelled');
                };
                return promise;
            };
        });
        resource.addRequestInterceptor = function(fn) {
            requestInterceptors = requestInterceptors.concat([fn]);
        };
        resource.addResponseInterceptor = function(fn) {
            responseInterceptors = responseInterceptors.concat([fn]);
        };
        resource.queueSize = function() {
            return queue.size;
        };
        resource.queuedRequests = function() {
            return queue.all;
        };
        return resource;
    };
});;