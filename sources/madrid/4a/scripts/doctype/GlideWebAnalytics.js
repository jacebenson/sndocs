/*! RESOURCE: /scripts/doctype/GlideWebAnalytics.js */
var GlideWebAnalytics = (function() {
  function subscribe() {
    window.snWebaConfig = window.snWebaConfig || {};
    if (window.snWebaConfig.subscribed && window.snWebaConfig.subscribed == true)
      return;
    var ambClient = getAMB();
    if (ambClient == undefined || ambClient == "")
      return;
    var webaChannelId = "/weba/config";
    var webaCh = ambClient.getChannel(webaChannelId);
    webaCh.subscribe(function(response) {
      if (window.snWebaConfig == undefined || window.snWebaConfig == null)
        window.snWebaConfig = {};
      var oldConfig = {
        siteId: (window.snWebaConfig.siteId) ? window.snWebaConfig.siteId : "0",
        trackerURL: (window.snWebaConfig.trackerURL) ? window.snWebaConfig.trackerURL : ""
      };
      window.snWebaConfig.siteId = response.data.weba_site_id;
      window.snWebaConfig.trackerURL = response.data.weba_rx_url;
      window.snWebaConfig.webaScriptPath = response.data.weba_script_path;
      handleConfigUpdate(oldConfig, window.snWebaConfig);
    });
    ambClient.connect();
    window.snWebaConfig.subscribed = true;
  }

  function getAMB() {
    var ambClient = window.snWebaConfig.ambClient;
    if (ambClient)
      return ambClient;
    window.snWebaConfig.ambClient = (window.g_ambClient) ? window.g_ambClient : ((window.amb) ? window.amb.getClient() : "");
    return window.snWebaConfig.ambClient;
  }

  function handleConfigUpdate(oldConfig, newConfig) {
    if (shouldRemoveTracker(oldConfig, newConfig))
      removeTracker();
    else if (shouldUpdateTracker(oldConfig, newConfig))
      updateTracker(oldConfig, newConfig);
    else if (shouldInsertTracker(oldConfig, newConfig))
      insertTracker(newConfig);
  }

  function shouldRemoveTracker(oldConfig, newConfig) {
    if (newConfig.siteId == "0" || newConfig.trackerURL == "")
      return true;
    return false;
  }

  function shouldUpdateTracker(oldConfig, newConfig) {
    if (oldConfig.siteId && oldConfig.siteId != "0" && oldConfig.siteId != newConfig.siteId)
      return true;
    if (oldConfig.trackerURL && oldConfig.trackerURL != newConfig.trackerURL)
      return true;
    return false;
  }

  function shouldInsertTracker(oldConfig, newConfig) {
    if (oldConfig.siteId == undefined || oldConfig.siteId == "0")
      return true;
    if (oldConfig.trackerURL == undefined || oldConfig.trackerURL == "")
      return true;
    return false;
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

  function insertTracker(newConfig, additionalData) {
    var document = window.parent.document;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (trackerExists())
      return;
    if (!isConfigValid(newConfig))
      return;
    var trackerScript = generateTrackerScript(newConfig, additionalData);
    var trackerElement = getOrCreateTracker();
    trackerElement.text = trackerScript;
    head.appendChild(trackerElement);
  }

  function applyTracker(additionalData) {
    insertTracker(window.snWebaConfig, additionalData);
    subscribe();
  }

  function applyTrackEvent(category, key, value, additionalValue) {
    insertEventTracker(category, key, value, additionalValue);
    subscribe();
  }

  function insertEventTracker(category, key, value, additionalValue) {
    if (!isConfigValid(window.snWebaConfig))
      return;
    if (!trackerExists())
      insertTracker(window.snWebaConfig);
    if (typeof category != "string" || typeof key != "string" || typeof value != "string")
      return;
    if (additionalValue)
      additionalValue = (typeof additionalValue == "number") ? additionalValue : 0;
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
    if (trackEle)
      return true;
    return false;
  }

  function isConfigValid(newConfig) {
    var zero = "0";
    var webaSiteId = (newConfig && newConfig.siteId) ? newConfig.siteId : zero;
    var trackerURL = (newConfig && newConfig.trackerURL) ? newConfig.trackerURL : "";
    if (webaSiteId == null || webaSiteId == "")
      return false;
    if (webaSiteId == zero)
      return false;
    if (trackerURL == null || trackerURL == "")
      return false;
    return true;
  }

  function getOrCreateTracker() {
    var trackerScriptId = "webaTracker";
    var document = window.parent.document;
    var trackEle = document.getElementById(trackerScriptId);
    if (trackEle)
      return trackEle;
    trackEle = document.createElement("script");
    trackEle.id = trackerScriptId;
    trackEle.type = "text/javascript";
    return trackEle;
  }

  function getUserId(additionalData) {
    if (window.NOW && window.NOW.user_id && window.NOW.user_id != "")
      return window.NOW.user_id;
    else if (additionalData && additionalData.userId) {
      return additionalData.userId;
    } else if (window.NOW && window.NOW.session_id)
      return window.NOW.session_id;
    else {
      var userObj = (window.NOW) ? window.NOW.user : null;
      if (userObj && userObj.userID)
        return userObj.userID;
    }
    return "";
  }

  function generateTrackerScript(webaConfig, additionalData) {
    var trackerURL = webaConfig.trackerURL;
    if (trackerURL.endsWith("/"))
      trackerURL = webaConfig.trackerURL.substring(0, trackerURL.length - 1);
    var userId = getUserId(additionalData);
    var script = "var _paq = _paq || [];";
    if (userId && userId != "") {
      script += "_paq.push(['setUserId', '" + userId + "']);";
    }
    script += "_paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);";
    script += "(function() {_paq.push(['setTrackerUrl','" + trackerURL + "']);" +
      "_paq.push(['setSiteId', " + webaConfig.siteId + "]);" +
      "var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.async=true; " +
      "g.defer=true; g.src='" + webaConfig.webaScriptPath + "'; " +
      "g.id='webaScript';s.parentNode.insertBefore(g,s); })();";
    return script;
  }
  var api = {
    trackPage: function(additionalData) {
      if (window.document.readyState == "complete")
        applyTracker(additionalData);
      else
        window.addEventListener("load", function() {
          applyTracker(additionalData);
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
})();;