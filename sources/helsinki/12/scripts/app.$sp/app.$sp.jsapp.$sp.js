/*! RESOURCE: /scripts/app.$sp/app.$sp.js */
angular.module("sn.$sp", [
  'oc.lazyLoad',
  'ngAnimate',
  'sn.common',
  'ngResource',
  'ngCookies',
  'sn.base',
  'ui.bootstrap',
  'sn.common.attachments',
  'sn.common.util',
  'sn.common.presence',
  'snm.auth.data',
  'snm.cabrillo',
  'snm.serviceCatalog.form',
  'snm.serviceCatalog.data',
  'sn.common.form',
  'sn.common.controls',
  'ui.tinymce',
  'ngSanitize',
  'as.sortable',
  'sp.dependencies',
  '720kb.tooltips'
]);
angular.module('snm.auth.data').provider('glideSystemProperties', function glideSystemPropertiesProvider() {
  'use strict';
  var systemPropertyCache = {};
  this.$get = function glideSystemProperties($window) {
    return {
      set: function(key, value) {
        systemPropertyCache[key] = value;
      },
      get: function(key) {
        return systemPropertyCache[key];
      }
    };
  };
});;