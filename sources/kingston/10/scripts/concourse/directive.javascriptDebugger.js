/*! RESOURCE: /scripts/concourse/directive.javascriptDebugger.js */
angular.module("sn.concourse").directive('javascriptDebugger', function(getTemplateUrl) {
  return {
    restrict: 'E',
    scope: {
      label: '@',
      moreinfo: '@',
      type: '@'
    },
    templateUrl: getTemplateUrl('concourse_javascript_debugger.xml'),
    controller: function($scope) {
      $scope.visible = isDebugPanelVisible();
      $scope.showJsDebugger = function() {
        var isVisible = isDebugPanelVisible();
        if (!isVisible)
          initDebugIframe();
        var jqueryLayout = document.getElementById('edge_south_debug').parentNode;
        if (jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1) {
          jqueryLayout.className += " navpage-bottom-hidden";
        } else {
          jqueryLayout.className = jqueryLayout.className.replace(' navpage-bottom-hidden', '');
        }
        isVisible = !isVisible;
        var debuggerFrame = getTopWindow()['javascript_debugger'];
        var cevt = debuggerFrame.CustomEvent;
        if (!cevt && debuggerFrame.contentWindow)
          cevt = debuggerFrame.contentWindow.CustomEvent;
        if (cevt && cevt.fire) {
          cevt.fire(isVisible ? 'debuggerTools.visible' : 'debuggerTools.hidden');
        }
      };

      function isDebugPanelVisible() {
        var jqueryLayout = document.getElementById('edge_south_debug').parentNode;
        if (jqueryLayout) {
          return jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1;
        } else {
          return false;
        }
      }

      function initDebugIframe() {
        var footerTrayFrm = document.getElementById('javascript_debugger');
        if (!footerTrayFrm.isLoaded) {
          footerTrayFrm.src = 'concourseJsDebug.do?sysparm_doctype=true&sysparm_stack=no';
          footerTrayFrm.isLoaded = true;
          debugToolSplitterContext.init();
          var debugToolsSplitterH = document.getElementById('debugToolsSplitterH');
          if (debugToolsSplitterH)
            debugToolsSplitterH.observe('mousedown', debugToolSplitterContext.mouseDownHandler);
        }
      }

      function getTopWindow() {
        var topWindow = window.self;
        try {
          while (topWindow.GJSV && topWindow != topWindow.parent && topWindow.parent.GJSV) {
            topWindow = topWindow.parent;
          }
        } catch (e) {}
        return topWindow;
      }
      var debugToolSplitterContext = function() {
        var isDragSplitter = false;
        var footerTray = null;
        var splitter_h = null;
        var ghostSplitter = null;
        var glassPane = null;
        var minCloseHeight = 15;
        var minHeight = 38;
        var me = null;

        function setGhost() {
          var dims = footerTray.getDimensions();
          var rect = splitter_h.getClientRects();
          ghostSplitter.setStyle('width:' + dims.width + 'px;left:' + rect.left + 'px;display:block;');
        }

        function hideGhost() {
          ghostSplitter.setStyle('display:none;top:-100px;');
          glassPane.setStyle('display:none;width:0px;height:0px;');
        }

        function mouseMoveHandler(e) {
          if (isDragSplitter !== true) return;
          var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop - 3;
          var size = glassPane.getDimensions().height - mouseY;
          if (size >= minCloseHeight)
            ghostSplitter.setStyle('top:' + mouseY + 'px');
        }

        function mouseDownHandler(e) {
          if (e.element().id == 'debugToolsSplitterH') {
            Event.stop(e);
            footerTray = $('footerTray');
            splitter_h = $('debugToolsSplitterH');
            ghostSplitter = $('ghostSplitter');
            glassPane = $('glassPane');
            if (glassPane == null) {
              var div = document.createElement('div');
              div.id = 'glassPane';
              div.className = 'glass-pane';
              document.body.appendChild(div);
              glassPane = $('glassPane');
            } else {
              glassPane.setStyle('display:block;height:100%;width:100%;');
            }
            glassPane.observe('mouseup', me.endDragHandler);
            glassPane.observe('mouseout', me.endDragHandler);
            glassPane.observe('mousemove', me.mouseMoveHandler);
            isDragSplitter = true;
            setGhost();
            me.mouseMoveHandler(e);
          }
        }

        function endDragHandler(e) {
          if (isDragSplitter === true) {
            isDragSplitter = false;
            var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop;
            mouseY = glassPane.getDimensions().height - mouseY;
            if (mouseY < minCloseHeight) {
              debuggerTools.toggleJSDebugger();
            } else {
              mouseY = (mouseY < minHeight) ? minHeight : mouseY + 5;
              footerTray.setStyle('height:' + mouseY + 'px');
              footerTray.restoreHeight = mouseY;
            }
            hideGhost();
          }
          if (glassPane) {
            glassPane.stopObserving('mouseup', me.endDragHandler);
            glassPane.stopObserving('mouseout', me.endDragHandler);
            glassPane.stopObserving('mousemove', me.mouseMoveHandler);
          }
          footerTray = null;
          splitter_h = null;
          ghostSplitter = null;
          glassPane = null;
        }
        return {
          init: function() {
            me = this;
          },
          mouseDownHandler: mouseDownHandler,
          endDragHandler: endDragHandler,
          mouseMoveHandler: mouseMoveHandler
        };
      }();
    }
  }
});;