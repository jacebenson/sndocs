/*! RESOURCE: /scripts/app.$sp/app.config.js */
var debug = false;
angular.module('sn.$sp').config(function(
  $compileProvider,
  $controllerProvider,
  $locationProvider,
  lazyLoaderProvider,
  $provide,
  $httpProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
  $httpProvider.interceptors.push('spInterceptor');
  lazyLoaderProvider.set({
    register: $controllerProvider.register,
    directive: $compileProvider.directive,
    factory: $provide.factory,
    value: $provide.value,
    service: $provide.service
  });
});;