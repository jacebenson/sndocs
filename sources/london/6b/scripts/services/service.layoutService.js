/*! RESOURCE: /scripts/services/service.layoutService.js */
angular.module('homeApp').factory('LayoutService', ['HomeServerService', function(server) {
  "use strict";
  var layouts;
  var currentLayout;
  return {
    fetchLayouts: function(pageId) {
      var url = "angular.do?sysparm_type=home_layout_processor&type=getlayouts";
      if (typeof g_autoRequest != 'undefined' && 'true' === g_autoRequest)
        url = url + '&sysparm_auto_request=' + g_autoRequest;
      url = url + '&pageid=' + pageId;
      return server.get(url).then(function(resp) {
        layouts = resp.layouts;
        currentLayout = resp.currentLayout;
      });
    },
    getLayouts: function() {
      return layouts;
    },
    getCurrentLayout: function() {
      return currentLayout;
    }
  }
}]);;