/*! RESOURCE: /scripts/concourse/directive.concourseMainPane.js */
angular.module('sn.concourse').directive('concourseMainPane', function(getTemplateUrl, snCustomEvent, concoursePaneExtensionRegistry) {
  return {
    restrict: 'A',
    scope: {
      initialUrl: '@',
      test: '@',
      enableExtensions: '@'
    },
    link: function(scope, element) {
      init();

      function init() {
        var isIE9 = navigator.userAgent.indexOf('MSIE9') != -1;
        if (isIE9) {
          loadForIE9();
          return;
        }
        loadUrl(scope.initialUrl);
      }

      function loadForIE9() {
        var hash = window.location.hash;
        if (hash != '' && hash.indexOf('#/nav_to.do?uri=') == 0) {
          var uri = hash.substr(16);
          uri = decodeURIComponent(uri);
          if (uri.length > 1) {
            loadUrl(url);
          }
        }
      }

      function loadUrl(url) {
        getFrame().attr('src', url);
      }
      getFrame().bind('load', function() {
        showFrame();
      });
      snCustomEvent.observe('sn.spa.intercept', function(srcInfo) {
        if (scope.enableExtensions !== 'true')
          return;
        var type = srcInfo.type;
        var url = srcInfo.window.location.href;
        if (!concoursePaneExtensionRegistry.hasHandler(type))
          return;
        hideFrame();
        concoursePaneExtensionRegistry.process(type, getPaneExtensionContainer(), url, {
          startTime: srcInfo.window.g_loadTime
        });
        if ("stop" in srcInfo.window)
          srcInfo.window.stop();
        else
          srcInfo.document.execCommand("Stop");
        srcInfo.document.write('<!--');
      });

      function getPaneExtensionContainer() {
        return element.find('.extension-pane-container');
      }

      function getFrame() {
        return element.find('iframe[name=gsft_main]');
      }

      function hideFrame() {
        getFrame().hide();
        getPaneExtensionContainer().show();
      }

      function showFrame() {
        getPaneExtensionContainer().hide();
        getFrame().show();
      }
    }
  }
});;