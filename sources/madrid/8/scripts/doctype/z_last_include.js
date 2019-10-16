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
  addLateLoadEvent(function expireGetReferenceCache() {
    if (window.g_event_handlers_localCache) {
      jslog("Clearing event handlers reference cache");
      window.g_event_handlers_localCache = {};
    }
    window.g_event_handlers_queryTracking = false;
  });
  addAfterPageLoadedEvent(function() {
    var gaBatchQueue = window.NOW.GlideAjaxBatchRequestQueue;
    if (gaBatchQueue)
      gaBatchQueue.processQueue();
    var timeoutDuration = window.NOW.batch_glide_ajax_disable_time;
    if (!timeoutDuration || timeoutDuration < 0)
      timeoutDuration = 1000;
    setTimeout(function() {
      gaBatchQueue.processQueue();
      window.NOW.batch_glide_ajax_requests = false;
    }, timeoutDuration);
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