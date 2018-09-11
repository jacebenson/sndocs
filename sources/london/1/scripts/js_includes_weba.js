/*! RESOURCE: /scripts/js_includes_weba.js */
/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function() {
  function subscribe() {
    if (window.NOW.webaConfig.subscribed == true)
      return;
    var ambClient = getAMB();
    if (ambClient == undefined || ambClient == "")
      return;
    var webaChannelId = "/weba/config";
    var webaCh = ambClient.getChannel(webaChannelId);
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
    ambClient.connect();
    window.NOW.webaConfig.subscribed = true;
  }

  function getAMB() {
    var ambClient = window.NOW.webaConfig.ambClient;
    if (ambClient == undefined || ambClient == "")
      window.NOW.webaConfig.ambClient = (window.g_ambClient) ? window.g_ambClient : ((window.amb) ? window.amb.getClient() : "");
    return window.NOW.webaConfig.ambClient;
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
    removeWebaTracker();
    removeWebaScript();
    removeWebaElements();
  }

  function removeWebaTracker() {
    var document = window.parent.document;
    var trackerScriptId = "webaTracker";
    var trackEle = document.getElementById(trackerScriptId);
    trackEle.parentNode.removeChild(trackEle);
  }

  function removeWebaScript() {
    var document = window.parent.document;
    var asyncTrackEle = document.getElementById('webaScript');
    if (asyncTrackEle == undefined)
      return;
    var src = asyncTrackEle.src;
    if (src != undefined && src.indexOf("piwik") > 0)
      asyncTrackEle.parentNode.removeChild(asyncTrackEle);
  }

  function removeWebaElements() {
    var document = window.parent.document;
    var webaEle = document.getElementsByClassName("weba");
    var webaSize = webaEle.length - 1;
    while (webaSize >= 0) {
      webaEle[webaSize].parentNode.removeChild(webaEle[webaSize]);
      webaSize--;
    }
  }

  function updateTracker(oldConfig, newConfig) {
    if (!trackerExists())
      return;
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var updateScript = "_paq.push(['setSiteId', " + newConfig.siteId + "]);" + "_paq.push(['setTrackerUrl', " + "'" + newConfig.trackerURL + "'" + "]);";
    var uEle = window.document.createElement("script");
    uEle.text = updateScript;
    uEle.className = "weba";
    head.appendChild(uEle);
  }

  function insertTracker(newConfig) {
    var document = window.parent.document;
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
    insertEventTracker(category, key, value, additionalValue);
    subscribe();
  }

  function insertEventTracker(category, key, value, additionalValue) {
    if (!isConfigValid(window.NOW.webaConfig))
      return;
    if (!trackerExists())
      insertTracker(window.NOW.webaConfig);
    var eventItems = ["trackEvent", category, key, value, additionalValue];
    var eventScript = "_paq.push(" + JSON.stringify(eventItems) + ");";
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    var scriptEle = window.document.createElement("script");
    scriptEle.className = "weba";
    scriptEle.text = eventScript;
    head.appendChild(scriptEle);
  }

  function trackerExists() {
    var document = window.parent.document;
    var trackEle = document.getElementById("webaTracker");
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
    var trackerScriptId = "webaTracker";
    var document = window.parent.document;
    var trackEle = document.getElementById(trackerScriptId);
    if (trackEle != undefined && trackEle != null)
      return trackEle;
    trackEle = document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function getUserId() {
    if (window.NOW.user_id != undefined && window.NOW.user_id != "")
      return window.NOW.user_id;
    else if (window.NOW.session_id != undefined)
      return window.NOW.session_id;
    else {
      var userObj = window.NOW.user;
      if (userObj != undefined)
        return userObj.userID;
    }
  }

  function generateTrackerScript(webaConfig) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var userId = getUserId();
    var script = "var _paq = _paq || [];";
    script += "_paq.push(['setUserId', '" + userId + "']);";
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() {_paq.push(['setTrackerUrl','" + trackerURL + "']);" +
      "_paq.push(['setSiteId', " + webaConfig.siteId + "]);" +
      "var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; " +
      "g.defer=true; g.src='" + webaConfig.webaScriptPath + "'; " +
      "g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
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