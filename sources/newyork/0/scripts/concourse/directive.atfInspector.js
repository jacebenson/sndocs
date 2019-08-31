/*! RESOURCE: /scripts/concourse/directive.atfInspector.js */
angular.module("sn.concourse").directive('atfInspector', ['snCustomEvent', 'userPreferences', function(snCustomEvent, userPreferences) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      moreinfo: '@',
      type: '@'
    },
    controller: function($scope, $http, $window) {
      snCustomEvent.observe('atf_inspector_toggle_event', function(status) {
        if (status) {
          enableATFInspector($window);
        } else {
          disableATFInspector($window);
        }
      });

      function enableATFInspector($window) {
        var absPath = decodeURIComponent($window.location.href);
        if (absPath.indexOf('atf_page_inspector') == -1) {
          userPreferences.setPreference('glide.atf_inspector.switch.on', true).then(function() {
            var encodedURL = encodeURIComponent("&sysparm_url=");
            var encodedStack = encodeURIComponent('sysparm_stack=no');
            window.location.assign(window.location.href.replace('?uri=', '?uri=/$atf_page_inspector.do?' + encodedStack + encodedURL));
          });
        }
      }

      function disableATFInspector() {
        var absPath = decodeURIComponent($window.location.href);
        if (absPath.indexOf('atf_page_inspector') != -1) {
          userPreferences.setPreference('glide.atf_inspector.switch.on', false).then(function() {
            var curPath = absPath.substr(absPath.indexOf('sysparm_url=') + 12);
            $window.location.assign('/nav_to.do?uri=' + curPath);
          });
        }
      }
    }
  }
}]);;