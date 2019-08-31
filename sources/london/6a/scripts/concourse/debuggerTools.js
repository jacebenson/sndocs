/*! RESOURCE: /scripts/concourse/debuggerTools.js */
var debuggerTools = function() {
  var minHeight = 38;

  function restoreHeight() {
    if (!isDebugPanelVisible())
      return;
    var panel = document.getElementById('edge_south_debug') || document.getElementById('footerTray');
    if (panel.getHeight() <= minHeight)
      toggleTrayCollapsed();
  }

  function toggleTrayCollapsed() {
    if (!isDebugPanelVisible())
      return;
    var jqueryLayout = document.getElementById('edge_south_debug');
    var minimize = false;
    if (jqueryLayout) {
      var myLayout = $j(document.body).layout();
      var height = minHeight - 7;
      minimize = (jqueryLayout.getHeight() > height);
      myLayout.sizePane("south", minimize ? height : myLayout.restoreHeight);
    } else {
      var footerTray = document.getElementById('footerTray');
      minimize = (footerTray.getHeight() > minHeight);
      footerTray.style.height = (minimize ? minHeight : footerTray.restoreHeight) + 'px';
    }
  }

  function initDebugIframe() {
    var javascriptDebugger = document.getElementById('javascript_debugger');
    if (!javascriptDebugger.isLoaded) {
      javascriptDebugger.src = 'concourseJsDebug.do?sysparm_doctype=true&sysparm_stack=no';
      javascriptDebugger.isLoaded = true;
      debugToolSplitterContext.init();
      var debugToolsSplitterH = document.getElementById('debugToolsSplitterH');
      if (debugToolsSplitterH)
        debugToolsSplitterH.observe('mousedown', debugToolSplitterContext.mouseDownHandler);
    }
  }

  function selectFieldWatcherTab() {
    var wndw = getJsDebugWindow();
    if (!wndw || !wndw.selectFieldWatcherTab)
      setTimeout(selectFieldWatcherTab, 100);
    else
      wndw.selectFieldWatcherTab();
  }

  function isDebugPanelVisible() {
    var jqueryLayout = document.getElementById('edge_south_debug');
    if (jqueryLayout) {
      return window.getComputedStyle(jqueryLayout, null).height != "0px";
    } else {
      var footerTrayRow = document.getElementById('footerTrayRow');
      if (footerTrayRow)
        return (footerTrayRow.className.indexOf('footer-tray-hidden') == -1);
      else
        return false;
    }
  }

  function toggleJSDebugger() {
    var isVisible = isDebugPanelVisible();
    if (!isVisible)
      initDebugIframe();
    var jqueryLayout = document.getElementById('edge_south_debug').parentElement;
    if (jqueryLayout) {
      if (jqueryLayout.className.indexOf("navpage-bottom-hidden") == -1)
        jqueryLayout.className += " navpage-bottom-hidden";
      else
        jqueryLayout.className = jqueryLayout.className.replace(" navpage-bottom-hidden", "");
    } else {
      var footerTrayRow = document.getElementById('footerTrayRow');
      if (footerTrayRow)
        footerTrayRow.toggleClassName('footer-tray-hidden');
    }
    isVisible = !isVisible;
    var debuggerFrame = getTopWindow()['javascript_debugger'];
    var cevt = debuggerFrame.CustomEvent;
    if (!cevt && debuggerFrame.contentWindow)
      cevt = debuggerFrame.contentWindow.CustomEvent;
    if (cevt && cevt.fire) {
      cevt.fire(isVisible ? 'debuggerTools.visible' : 'debuggerTools.hidden');
    }
  }

  function showFieldWatcher() {
    toggleJSDebugger();
    selectFieldWatcherTab();
  }

  function getJsDebugWindow() {
    return document.getElementById('javascript_debugger').contentWindow;
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
  return {
    restoreHeight: restoreHeight,
    toggleTrayCollapsed: toggleTrayCollapsed,
    isDebugPanelVisible: isDebugPanelVisible,
    toggleJSDebugger: toggleJSDebugger,
    showJSDebugger: toggleJSDebugger,
    showFieldWatcher: showFieldWatcher,
    getJsDebugWindow: getJsDebugWindow
  };
}();

function jslog(msg, src, dateTime) {
  if (window.console && window.console.log)
    console.log(msg);
  if (debuggerTools.isDebugPanelVisible()) {
    if (!src)
      src = "navpage.do";
    if (typeof getFormattedTime == "function") {
      msg = '<div class="debug_line"><span class="log-time CLIENT">' + getFormattedTime(dateTime) + '</span><span class="log-category">' + src + '</span><span class="log-message">' + msg + "</span></div>";
    } else {
      msg = '<div class="debug_line"><span class="log-time CLIENT">' + getTimeFormatted(dateTime) + '</span><span class="log-category">' + src + '</span><span class="log-message">' + msg + "</span></div>";
    }
    var wndw = debuggerTools.getJsDebugWindow();
    if (typeof wndw != undefined && wndw.addJsLogMessage)
      wndw.addJsLogMessage(msg);
  }
}

function getTimeFormatted(dateTime) {
  var d = new Date();
  var hour = d.getHours();
  var minute = d.getMinutes();
  var second = d.getSeconds();
  var millisecond = d.getMilliseconds();
  if (10 > hour)
    hour = "0" + hour;
  if (10 > minute)
    minute = "0" + minute;
  if (10 > second)
    second = "0" + second;
  if (100 > millisecond) {
    if (10 > millisecond)
      millisecond = "0" + millisecond;
    millisecond = "0" + millisecond;
  }
  var formattedTime = hour + ":" + minute + ":" + second + " (" + millisecond + ")";
  return formattedTime;
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
    ghostSplitter.setAttribute('style', 'width:' + dims.width + 'px;left:' + rect.left + 'px;display:block;');
  }

  function hideGhost() {
    ghostSplitter.setAttribute('style', 'display:none;top:-100px;');
    glassPane.setAttribute('style', 'display:none;width:0px;height:0px;');
  }

  function mouseMoveHandler(e) {
    if (isDragSplitter !== true) return;
    var mouseY = e.pageY || e.clientY + document.documentElement.scrollTop - 3;
    var size = glassPane.getDimensions().height - mouseY;
    if (size >= minCloseHeight)
      ghostSplitter.setAttribute('style', 'top:' + mouseY + 'px');
  }

  function mouseDownHandler(e) {
    if (e.element().id == 'debugToolsSplitterH') {
      Event.stop(e);
      footerTray = document.getElementById('footerTray');
      splitter_h = document.getElementById('debugToolsSplitterH');
      ghostSplitter = document.getElementById('ghostSplitter');
      glassPane = document.getElementById('glassPane');
      if (glassPane == null) {
        var div = document.createElement('div');
        div.id = 'glassPane';
        div.className = 'glass-pane';
        document.body.appendChild(div);
        glassPane = document.getElementById('glassPane');
      } else {
        glassPane.setAttribute('style', 'display:block;height:100%;width:100%;');
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
        footerTray.setAttribute('style', 'height:' + mouseY + 'px');
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
}();;