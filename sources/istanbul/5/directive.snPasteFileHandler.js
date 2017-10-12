/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/directive.snPasteFileHandler.js */
angular.module('sn.common.attachments').directive('snPasteFileHandler', function($parse) {
  'use strict';
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var snPasteFileHandler = $parse(attrs.snPasteFileHandler);
      element.bind("paste", function(event) {
        event = event.originalEvent || event;
        var item = event.clipboardData.items[0];
        if (!item)
          return;
        var file = item.getAsFile();
        if (!file)
          return;
        file.name = "Pasted File - " + new Date();
        snPasteFileHandler(scope, {
          file: file
        });
        event.preventDefault();
        event.stopPropagation();
      });
    }
  };
});;