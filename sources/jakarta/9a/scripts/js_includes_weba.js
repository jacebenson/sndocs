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
        var docum