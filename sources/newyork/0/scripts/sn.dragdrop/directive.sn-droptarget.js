/*! RESOURCE: /scripts/sn.dragdrop/directive.sn-droptarget.js */
angular.module("sn.dragdrop").directive("snDroptarget", function($compile, $parse, jqyouiDroppableDirective, $rootScope) {
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
    var dropHandler = $parse(attrs.dndOnDrop);
    var fileHandler;
    var overHandler;
    var outHandler;
    var parentWindow;
    var targetWindow;
    if (attrs.dndOnFile)
      fileHandler = $parse(attrs.dndOnFile);
    if (attrs.dndOnOver)
      overHandler = $parse(attrs.dndOnOver);
    if (attrs.dndOnOut)
      outHandler = $parse(attrs.dndOnOut);
    var enterCount = 0;
    element.bind("dragstart", function(e) {
      parentWindow = e.currentTarget;
    })
    element.bind("dragenter", function(e) {
      if (e.preventDefault)
        e.preventDefault();
      enterCount++;
      if (enterCount > 1)
        return;
      e.originalEvent.dataTransfer.dropEffect = 'move';
      element.addClass('sn-droptarget-hover');
      if (parentWindow !== e.currentTarget && overHandler) {
        scope.$apply(
          overHandler(scope, {
            element: element,
            ui: {}
          })
        );
      }
    })
    element.bind("dragleave", function(e) {
      enterCount--;
      if (enterCount > 0)
        return;
      element.removeClass('sn-droptarget-hover');
      enterCount = 0;
      if (outHandler) {
        scope.$apply(
          outHandler(scope, {
            element: element,
            ui: {}
          })
        );
      }
    })
    element.bind("drop", function(e) {
      e.preventDefault();
      e.stopPropagation();
      element.removeClass('sn-droptarget-hover');
      enterCount = 0;
      targetWindow = e.currentTarget;
      if (parentWindow === targetWindow) {
        return;
      }
      var dt = e.originalEvent.dataTransfer;
      if (!dt || isMobile()) return;
      if (fileHandler && dt.files.length > 0) {
        var text = dt.getData("text");
        scope.$apply(function() {
          fileHandler(scope, {
            files: dt.files
          })
        });
        return;
      }
      var data = {};
      try {
        data = angular.fromJson(dt.getData("text"));
      } catch (e) {
        data.payload = dt.getData("text");
        data.type = (data.payload.substring(0, 7) === 'http://' || data.payload.substring(0, 8) === 'https://') ? 'link' : 'text';
      }
      scope.$apply(
        dropHandler(scope, {
          element: element,
          ui: {},
          data: data
        })
      );
    })
    element.bind("dragover", function(e) {
      return false;
    })
    element.bind("dragend", function(e) {
      parentWindow = undefined;
      return;
    })
    scope.onDrop = function(event, ui) {
      angular.element(event.target).removeClass('sn-droptarget-hover');
      var data = angular.fromJson(ui.helper.data("dnd-payload"));
      dropHandler(scope, {
        element: event.target,
        ui: ui,
        data: data
      });
    }
    scope.onOver = function(event, ui) {
      angular.element(event.target).addClass('sn-droptarget-hover');
      if (overHandler) {
        overHandler(scope, {
          element: element,
          ui: {}
        })
      }
    }
    scope.onOut = function(event, ui) {
      angular.element(event.target).removeClass('sn-droptarget-hover');
      if (outHandler) {
        outHandler(scope, {
          element: element,
          ui: {}
        })
      }
    }
    jqyouiDroppableDirective[0].link(scope, element, attrs)
  }
  return {
    restrict: "A",
    compile: function(tElement, tAttrs) {
      if (isMobile()) {
        var options = {
          onDrop: "onDrop",
          onOver: "onOver",
          onOut: "onOut",
          multiple: tAttrs.snMultiple
        };
        tAttrs.$set("drop", "true");
        tElement.attr("jqyoui-droppable", angular.toJson(options));
      }
      return link;
    }
  }
});