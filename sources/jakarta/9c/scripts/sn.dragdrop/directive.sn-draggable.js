/*! RESOURCE: /scripts/sn.dragdrop/directive.sn-draggable.js */
angular.module("sn.dragdrop").directive("snDraggable", function($compile, $parse, jqyouiDraggableDirective) {
  "use strict";

  function isMobile() {
    if (navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)) {
      return true;
    } else {
      return false;
    }
  }

  function link(scope, element, attrs) {
    function handleNativeStart(e) {
      if (attrs.dndCustomPayload) {
        var payload = $parse(attrs.dndCustomPayload)(scope);
        e.originalEvent.dataTransfer.setData('text', angular.toJson(payload));
      } else {
        var type = attrs.snDraggable;
        var payload = $parse(attrs.dndPayload)(scope);
        e.originalEvent.dataTransfer.setData('text', angular.toJson({
          type: type,
          payload: payload
        }));
      }
    }
    scope.handleJQueryStart = function(element, ui) {
      if (attrs.dndCustomPayload) {
        var payload = $parse(attrs.dndCustomPayload)(scope);
        ui.helper.data("dnd-payload", angular.toJson(payload));
      } else {
        var payload = $parse(attrs.dndPayload)(scope);
        var type = attrs.snDraggable;
        ui.helper.data("dnd-payload", angular.toJson({
          type: type,
          payload: payload
        }));
      }
    }
    if (isMobile()) {
      jqyouiDraggableDirective[0].link(scope, element, attrs);
    } else {
      element.bind('dragstart', handleNativeStart);
    }
  }
  return {
    restrict: "A",
    compile: function(tElement, tAttrs) {
      if (isMobile()) {
        var jqyouiOptions = {
          helper: tAttrs.dndHelper || 'clone',
          revert: tAttrs.dndRevert || 'invalid'
        };
        var draggableOptions = {
          onStart: "handleJQueryStart",
          helper: tAttrs.dndPlaceholder || 'keep'
        };
        tAttrs.$set("drag", "true");
        tAttrs.$set("jqyouiOptions", angular.toJson(jqyouiOptions));
        tElement.attr("jqyoui-draggable", angular.toJson(draggableOptions));
      } else {
        tAttrs.$set("draggable", "true");
      }
      return link;
    }
  }
});