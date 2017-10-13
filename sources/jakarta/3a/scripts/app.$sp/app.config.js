/*! RESOURCE: /scripts/app.$sp/app.config.js */
angular.module('sn.$sp').config(function(
  $compileProvider,
  $controllerProvider,
  $locationProvider,
  lazyLoaderProvider,
  $provide,
  $httpProvider,
  $ariaProvider,
  tooltipsConfProvider) {
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
  $ariaProvider.config({
    ariaHidden: true,
    ariaChecked: true,
    ariaReadonly: true,
    ariaDisabled: true,
    ariaRequired: true,
    ariaInvalid: true,
    ariaValue: true,
    tabindex: false,
    bindKeydown: true,
    bindRoleForClick: true
  });
  tooltipsConfProvider.configure({
    'smart': true,
    'size': 'large',
    'speed': 'slow'
  });
});;