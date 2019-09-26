/*! RESOURCE: /scripts/app.guided_tours/js_guided_tours_includes.js */ ! function r(e, n, t) {
  function o(i, f) {
    if (!n[i]) {
      if (!e[i]) {
        var c = "function" == typeof require && require;
        if (!f && c) return c(i, !0);
        if (u) return u(i, !0);
        var a = new Error("Cannot find module '" + i + "'");
        throw a.code = "MODULE_NOT_FOUND", a
      }
      var p = n[i] = {
        exports: {}
      };
      e[i][0].call(p.exports, function(r) {
        return o(e[i][1][r] || r)
      }, p, p.exports, r, e, n, t)
    }
    return n[i].exports
  }
  for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
  return o
}({
  1: [function(require, module, exports) {
    "use strict";
    var obj, _ajaxTransport = require(2),
      _ajaxTransport2 = (obj = _ajaxTransport) && obj.__esModule ? obj : {
        default: obj
      };
    var tourUrl = "/api/now/guided_tours/loader/tour",
      LOAD_TOURS_ON_TOP = "top-load-tours";

    function getConfig() {
      var config = {};
      try {
        window.top && (config.top = window.top), config.NOW = window.top.NOW, config.isTop = window.top === window, config.user = top.NOW && top.NOW.user ? top.NOW.user.name : null, config.userLoggedIn = !(!config.user || "guest" === config.user), config.designerMode = top && top.gtdDesignerMode
      } catch (e) {
        return null
      }
      return config
    }
    var config, cachedContexts = new Map;

    function loadToursIfPresent(config) {
      if (top.NOW.isGtdEnabledForStandardUI && (top !== window || !NOW.guidedToursService))
        if (0 <= decodeURIComponent(location.search).indexOf("mode=preview")) CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config);
        else {
          var context = function() {
            var currentPage = location.pathname;
            if (0 <= location.pathname.indexOf("nav_to.do")) {
              var _currentPage = decodeURIComponent(location.search);
              if (0 === _currentPage.indexOf("?uri=")) return (_currentPage = _currentPage.replace("?uri=", "")).substr(1, _currentPage.indexOf(".do") - 1)
            }
            return (currentPage = location.pathname).substr(1, currentPage.indexOf(".do") - 1)
          }();
          0 <= ["navpage", "gtb"].indexOf(context) || config.userLoggedIn && (cachedContexts.has(context) ? config.tours = cachedContexts.get(context) : (cachedContexts.set(context, ""), function(context, cb) {
            (new _ajaxTransport2.default).get(tourUrl + "?name=" + context, function(e, d) {
              !e && d.result && d.result.length ? cb && cb(null, d.result) : cb && cb(e)
            })
          }(context, function(e, d) {
            d && (cachedContexts.set(context, d), config.tours = d, CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config))
          })))
        }
    }

    function loadAsParent(config) {
      var state = null;
      if (CustomEvent.on(LOAD_TOURS_ON_TOP, function(config) {
          ! function() {
            try {
              if (top === window)
                if (NOW && NOW.guidedToursService);
                else {
                  var script = document.createElement("script");
                  script.src = "/scripts/app.guided_tours/guided_tours_player.js", script.type = "text/javascript", script.async = "true";
                  var firstScript = document.getElementsByTagName("script")[0];
                  firstScript.parentNode.insertBefore(script, firstScript)
                }
            } catch (e) {
              console && console.log("An error has occured. Guided Tours could not be loaded!")
            }
          }()
        }), sessionStorage && (state = sessionStorage.getItem("guided_tour:tour.state"))) return config.tourState = state, void CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config);
      loadToursIfPresent(config), CustomEvent.observe("page_loaded_fully", function() {
        setTimeout(function() {
          loadToursIfPresent(getConfig())
        }, 1e3)
      }), CustomEvent.observe("gtd_child_iframe_loaded", function() {
        setTimeout(function() {
          loadToursIfPresent(getConfig())
        }, 1e3)
      })
    }(config = getConfig()).designerMode || (config && config.isTop ? loadAsParent(config) : CustomEvent.fireTop("gtd_child_iframe_loaded"))
  }, {
    2: 2
  }],
  2: [function(require, module, exports) {
    "use strict";
    var _createClass = function(Constructor, protoProps, staticProps) {
      return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
    };

    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
      }
    }
    var Service = function() {
      function Service() {
        ! function(instance, Constructor) {
          if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
        }(this, Service)
      }
      return _createClass(Service, [{
        key: "send",
        value: function(url, data, cb) {
          window.jQuery.ajax(url, {
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            method: "POST",
            processData: !1
          }).done(function(d) {
            return cb && cb(null, d.result)
          }).fail(function(e) {
            e && 200 === e.status ? cb && cb(null, e) : cb && cb(e)
          })
        }
      }, {
        key: "get",
        value: function(url, cb) {
          window.jQuery.getJSON(url).done(function(res) {
            cb && cb(null, res)
          }).fail(function(e) {
            cb && cb(e)
          })
        }
      }]), Service
    }();
    module.exports = Service
  }, {}]
}, {}, [1]);;