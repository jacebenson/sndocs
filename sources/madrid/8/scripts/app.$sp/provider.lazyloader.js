/*! RESOURCE: /scripts/app.$sp/provider.lazyloader.js */
angular.module('sn.$sp').provider('lazyLoader', function() {
      "use strict";
      var config = {};
      var propsCache = {};
      var directivesCache = {};
      this.set = function(value) {
        config = value;
      };

      function directiveExists(name) {
        if (directivesCache[name]) {
          return true;
        }
        directivesCache[name] = true;
        return false;
      }

      function isProviderLoaded(provider) {
        if (provider.type === 'directive') {
          return directiveExists(provider.name);
        }
        if (propsCache[provider.name]) {
          return true;
        }
        propsCache[provider.name] = true;
        return false;
      }
      this.$get = ['$controller', '$templateCache', '$ocLazyLoad', function($controller, $templateCache, $ocLazyLoad) {
            return {
              directive: config.directive,
              directiveExists: directiveExists,
              controller: config.register,
              putTempla