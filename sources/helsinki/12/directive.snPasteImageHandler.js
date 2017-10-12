/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snPasteImageHandler.js */
angular.module('sn.common.attachments').directive('snPasteImageHandler', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    replace: true,
    link: function(scope, element, attrs) {
      var handleFiles = $parse(attrs.snPasteImageHandler);
      element.bind("paste", function(e) {
        e = e.originalEvent || e;
        var item = e.clipboardData.items[0];
        if (!item.kind)
          return;
        if (item.kind !== "file")
          return;
        var file = item.getAsFile();
        file.name = "Pasted File - " + new Date();
        handleFiles(scope, {
          file: file
        });
        e.preventDefault();
        e.stopPropagation();
      });
    }
  };
});;