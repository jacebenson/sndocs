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
          webaEle[we