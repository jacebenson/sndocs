/*! RESOURCE: /scripts/js_includes_weba.js */
/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function() {
  function subscribe() {
    var webaChannelId = "/weba/config";
    var webaCh = window.amb.getClient().getChannel(webaChannelId);
    webaCh.subscribe(function(response) {
      if (window.NOW.webaConfig == undefined)
        window.NOW.webaConfig = {};
      var oldConfig = {
        siteId: window.NOW.webaConfig.siteId,
        trackerURL: window.NOW.webaConfig.trackerURL
      };
      window.NOW.webaConfig.siteId = response.data.weba_site_id;
      window.NOW.webaConfig.trackerURL = response.data.weba_rx_url;
      handleConfigUpdate(oldConfig, window.NOW.webaConfig);
    });
    window.amb.getClient().connect();
  }

  function handleConfigUpdate(oldConfig, newConfig) {
    if (newConfig.siteId == "0")
      removeTracker();
    else if (oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
      updateTracker(oldConfig, newConfig);
    else if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
      insertTracker(newConfig);
  }

  function removeTracker() {
    if (!trackerExists())
      return;
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var trackerScriptId = "weba";
    var trackEle = document.getElementById(trackerScriptId);
    head.removeChild(trackEle);
    var asyncTrackEle = document.getElementById('webaScript');
    if (asyncTrackEle == undefined)
      return;
    var src = asyncTrackEle.src;
    if (src != undefined && src.indexOf("piwik") > 0)
      head.removeChild(asyncTrackEle);
  }

  function updateTracker(oldConfig, newConfig) {
    var trackerScriptId = "weba";
    var trackEle = window.document.getElementById(trackerScriptId);
    var script = trackEle.text;
    if (script != undefined && script != "") {
      script = script.replace(oldConfig.siteId, newConfig.siteId);
      script = script.replace(oldConfig.trackerURL, newConfig.trackerURL);
      trackEle.text = script;
    }
  }

  function insertTracker(newConfig) {
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (trackerExists())
      return;
    if (!isConfigValid(newConfig))
      return;
    var trackerScript = generateTrackerScript(newConfig);
    var trackerElement = getOrCreateTracker();
    trackerElement.text = trackerScript;
    head.appendChild(trackerElement);
  }

  function applyTracker() {
    insertTracker(window.NOW.webaConfig);
    subscribe();
  }

  function applyTrackEvent(category, key, value, additionalValue) {
    if (!isConfigValid(window.NOW.webaConfig))
      return;
    if (!trackerExists())
      applyTracker();
    var eventItems = ["trackEvent", category, key, value, additionalValue];
    var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
    var head = document.head || document.getElementsByTagName('head')[0];
    var scriptEle = window.document.createElement("script");
    scriptEle.text = eventScript;
    head.appendChild(scriptEle);
  }

  function trackerExists() {
    var document = window.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var trackEle = window.document.getElementById("weba");
    if (trackEle != undefined && trackEle != null)
      return true;
    return false;
  }

  function isConfigValid(newConfig) {
    var zero = "0";
    var webaSiteId = (newConfig != undefined) ? newConfig.siteId : zero;
    var trackerURL = (newConfig != undefined) ? newConfig.trackerURL : "";
    if (webaSiteId == undefined || webaSiteId == "")
      return false;
    if (webaSiteId == zero)
      return false;
    if (trackerURL == undefined || trackerURL == "")
      return false;
    return true;
  }

  function getOrCreateTracker() {
    var trackerScriptId = "weba";
    var trackEle = window.document.getElementById(trackerScriptId);
    if (trackEle != undefined && trackEle != null)
      return trackEle;
    trackEle = window.document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function generateTrackerScript(webaConfig) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var script = "var _paq = _paq || [];";
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() { var u='TRACKER_SERVER_URL';_paq.push(['setTrackerUrl', u]);_paq.push(['setSiteId', SITE_ID]);var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; g.defer=true; g.src='WEBA_SCRIPT_PATH'; g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
    script = script.replace("TRACKER_SERVER_URL", trackerURL);
    script = script.replace("SITE_ID", webaConfig.siteId);
    script = script.replace("WEBA_SCRIPT_PATH", webaConfig.webaScriptPath);
    return script;
  }
  var api = {
    trackPage: function() {
      if (window.document.readyState == "complete")
        applyTracker();
      else
        window.addEventListener("load", function() {
          applyTracker();
        }, false);
    },
    trackEvent: function(category, key, value, additionalValue, delayInMs) {
      if (delayInMs == undefined)
        delayInMs = 3000;
      window.setTimeout(function() {
        applyTrackEvent(category, key, value, additionalValue);
      }, delayInMs);
    }
  }
  return api;
})();;;