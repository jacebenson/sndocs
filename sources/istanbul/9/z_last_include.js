/*! RESOURCE: /scripts/doctype/z_last_include.js */
(function() {
  NOW.xperf.loadedFunctionsBegin = NOW.xperf.now();
  if (window.initAngularForm) {
    initAngularForm();
  }
  addLoadEvent(function() {
    GlideUI.get().fireNotifications();
    jslog("fireAllChangeHandlers start");
    fireAllChangeHandlers();
    jslog("fireAllChangeHandlers end");
  });
  runBeforeRender();
  runAfterAllLoaded();
  CustomEvent.fireAll('page_loaded_fully', window);
  NOW.xperf.loadedFunctionsEnd = NOW.xperf.now();
  var ms = Math.round(NOW.xperf.loadedFunctionsEnd - NOW.xperf.loadedFunctionsBegin);
  CustomEvent.fire('page_timing', {
    name: 'LOADF',
    ms: ms,
    win: window
  });
})();;