/*! RESOURCE: /scripts/app.$sp/provider.lazyloader.js */
angular.module('sn.$sp').provider('lazyLoader', function() {
  "use strict";
  var config = {};
  var propsCache = {};
  var directivesCache = {};
  var promiseCache = {};
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
  this.$get = ['$controller', '$templateCache', '$window', '$q', '$ocLazyLoad', function($controller, $templateCache, $window, $q, $ocLazyLoad) {
    var head = $window.document.getElementsByTagName('head')[0];
    return {
      directive: config.directive,
      directiveExists: directiveExists,
      controller: config.register,
      putTemplates: function(templates) {
        for (var i in templates) {
          $templateCache.put(i, templates[i]);
        }
      },
      providers: function(provList) {
        var provider, script;
        for (var i in provList) {
          provider = provList[i];
          if (!isProviderLoaded(provider)) {
            eval("script=" + provider.script);
            config[provider.type](provider.name, script);
          }
        }
      },
      dependencies: function(depsList) {
        var deps = depsList.map(function(item) {
          var files = item.files.map(function(file) {
            var types = {
              script: 'js',
              link: 'css'
            };
            return {
              type: types[file.type],
              path: file.url
            }
          });
          if (files.length == 1)
            return files[0];
          var result = {
            files: files,
            serie: true
          };
          if (item.module.length > 0)
            result.module = item.module;
          return result;
        });
        return $ocLazyLoad.load(deps);
      }
    };
  }];
});;