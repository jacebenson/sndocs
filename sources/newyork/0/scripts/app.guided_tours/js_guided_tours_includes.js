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
    var _ajaxTransport2 = _interopRequireDefault(require(3)),
      _dataService2 = _interopRequireDefault(require(4)),
      _url = require(7),
      _guidedToursManager2 = _interopRequireDefault(require(5));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      }
    }
    var LOAD_TOURS_ON_TOP = "top-load-tours";

    function getConfig() {
      var config = {};
      try {
        window.top && (config.top = window.top), config.NOW = window.top.NOW, config.isTop = window.top === window, config.user = top.NOW && top.NOW.user ? top.NOW.user.name : null, config.userLoggedIn = !(!config.user || "guest" === config.user), config.designerMode = top && top.NOW && top.NOW.gtd && top.NOW.gtd.gtdDesignerMode
      } catch (e) {
        return null
      }
      return config
    }

    function _loadTours() {
      try {
        if (top === window)
          if (NOW && NOW.guidedToursService);
          else {
            var versionUpdate = window.g_builddate ? window.g_builddate : Date.now(),
              script = document.createElement("script");
            script.src = "/scripts/app.guided_tours/guided_tours_player.js?v=" + versionUpdate, script.type = "text/javascript", script.async = "true";
            var firstScript = document.getElementsByTagName("script")[0];
            firstScript.parentNode.insertBefore(script, firstScript)
          }
      } catch (e) {
        console && console.log("An error has occured. Guided Tours could not be loaded!\n %s", e)
      }
    }
    var cachedContexts = new Map;

    function loadToursIfPresent(config) {
      if (top.NOW.isGtdEnabledForStandardUI && ((top !== window || !NOW.guidedToursService) && config.userLoggedIn))
        if (0 <= decodeURIComponent(location.search).indexOf("mode=preview")) CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config);
        else {
          var stateGTours = sessionStorage.getItem("guided_tour:tour.state"),
            stateHopscotch = sessionStorage.getItem("hopscotch.tour.state");
          if (stateGTours || stateHopscotch) CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config);
          else {
            var context = (0, _url.getContext)();
            0 <= ["navpage", "gtb"].indexOf(context) || (cachedContexts.has(context) ? config.tours = cachedContexts.get(context) : (cachedContexts.set(context, ""), function(context, cb) {
              new _dataService2.default(new _ajaxTransport2.default).getToursForPage(context, null, cb)
            }(context, function(e, d) {
              d && (cachedContexts.set(context, d), config.tours = d, CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config))
            })))
          }
        }
    }! function() {
      top.NOW.guided_tours || (top.NOW.guided_tours = new _guidedToursManager2.default(_loadTours));
      var config = getConfig();
      config.designerMode || (config && config.isTop ? function(config) {
        var state = null;
        if (CustomEvent.on(LOAD_TOURS_ON_TOP, function(config) {
            _loadTours()
          }), sessionStorage && (state = sessionStorage.getItem("guided_tour:tour.state"))) return config.tourState = state, CustomEvent.fireTop(LOAD_TOURS_ON_TOP, config);
        loadToursIfPresent(config), CustomEvent.observe("page_loaded_fully", function() {
          setTimeout(function() {
            loadToursIfPresent(getConfig())
          }, 1e3)
        }), CustomEvent.observe("gtd_child_iframe_loaded", function() {
          setTimeout(function() {
            loadToursIfPresent(getConfig())
          }, 1e3)
        })
      }(config) : CustomEvent.fireTop("gtd_child_iframe_loaded"))
    }()
  }, {
    3: 3,
    4: 4,
    5: 5,
    7: 7
  }],
  2: [function(require, module, exports) {
    "use strict";
    module.exports = {
      events: {
        hopscotch: {
          tourStart: "hopscotch.tour.start",
          tourEnd: "hopscotch.tour.end"
        },
        external: {
          pageLoaded: "gtd-sp-page-loaded",
          childFrameLoaded: "gtd_child_iframe_loaded"
        },
        page: {
          loaded: "page_loaded_fully"
        },
        tourService: {
          tourWillStart: "tourWillStart",
          tourStarted: "tourStarted",
          tourWillEnd: "tourWillEnd",
          tourEnded: "tourEnded",
          started: "started",
          completed: "completed",
          failed: "failed",
          dismissed: "dismissed",
          stepStarted: "step_started",
          abandoned: "abandoned",
          inTransit: "in_transit",
          welcomeModalDismissed: "welcome_modal_dismissed",
          welcomeModalEndedTour: "welcome_modal_ended_tour",
          allTerminalEvents: ["completed", "failed", "dismissed", "abandoned"]
        },
        embeddedHelp: {
          TOUR_END: "embedded_help:tour.end",
          TOUR_START: "embedded_help:tour.start",
          TOUR_STATE: "embedded_help:tour:state"
        }
      },
      reasons: {
        none: "none",
        unknown: "unknown",
        explicit: "explicit",
        timeout: "timeout",
        elementHidden: "element_hidden",
        elementNotPresent: "element_not_present",
        navigatedOutOfApp: "navigated_out_of_application"
      },
      storeKeys: {
        tourStatus: "TOURSTATUS"
      },
      sessionKeys: {
        isNextNewPage: "guided_tour:tour_sp.isNextNewPage"
      },
      preference: {
        useConcourse: "use.concourse"
      },
      eventStream: "gt-event"
    }
  }, {}],
  3: [function(require, module, exports) {
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
  }, {}],
  4: [function(require, module, exports) {
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
    var tourUrl = "/api/now/guided_tours/tours",
      templates_tourIdUrl = function(id) {
        return tourUrl + "/" + id + "?detail=high"
      },
      templates_tourPageUrl = function(context) {
        return tourUrl + "?page_id=" + context
      },
      DataService = function() {
        function DataService(transport) {
          ! function(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
          }(this, DataService), this.transport = transport
        }
        return _createClass(DataService, [{
          key: "getTourById",
          value: function(id, cb) {
            this.transport.get(templates_tourIdUrl(id), function(err, data) {
              err && cb && cb("Error getting tour guide info"), data && data.result ? cb && cb(null, data.result) : cb && cb("No Guided Tour Info")
            })
          }
        }, {
          key: "getToursForPage",
          value: function(context, filterFunc, cb) {
            this.transport.get(templates_tourPageUrl(context), function(err, data) {
              if (!err && data.result && data.result.length) {
                var tourList = data.result;
                filterFunc && (tourList = tourList.filter(filterFunc)), cb && cb(null, tourList)
              } else cb && cb(err)
            })
          }
        }]), DataService
      }();
    module.exports = DataService
  }, {}],
  5: [function(require, module, exports) {
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
    var _ajaxTransport2 = _interopRequireDefault(require(3)),
      _dataService2 = _interopRequireDefault(require(4)),
      _url = require(7),
      _constants2 = _interopRequireDefault(require(2)),
      _i18n2 = _interopRequireDefault(require(6));

    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      }
    }
    var events = _constants2.default.events.tourService,
      guidedToursEvents_TOUR_STARTED = "tourStarted",
      guidedToursEvents_STEP_STARTED = "stepStarted",
      guidedToursEvents_TOUR_ABANDONED = "tourAbandoned",
      guidedToursEvents_TOUR_FAILED = "tourFailed",
      guidedToursEvents_TOUR_COMPLETED = "tourCompleted",
      guidedToursEvents_TOUR_ENDED = "tourEnded",
      guidedToursEvents_TOUR_DISMISSED = "tourDismissed",
      GuidedToursManager = function() {
        function GuidedToursManager(_loadTours) {
          ! function(instance, Constructor) {
            if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
          }(this, GuidedToursManager), this.api = {
            startTour: this.startTour.bind(this),
            endTour: this.endTour.bind(this),
            applyListFilter: this.applyListFilter.bind(this),
            getAllTours: this.getAllTours.bind(this),
            loadPlayer: _loadTours
          }, this.events = {
            on: this._on,
            off: this._off
          }, this._filterFunc, this._tourService, this._dataService = new _dataService2.default(new _ajaxTransport2.default)
        }
        return _createClass(GuidedToursManager, [{
          key: "startTour",
          value: function(tourId, argument_1, argument_2) {
            var stepNum = 1 < arguments.length && void 0 !== argument_1 ? argument_1 : 0,
              cbFunc = argument_2;
            this._tourService ? this._tourService.currentTour ? cbFunc && cbFunc({
              success: !1,
              message: _i18n2.default.getMessage("Cannot start a new tour while another tour is in progress.")
            }) : top.NOW.isEmbeddedHelpActive ? CustomEvent.fireTop(top.EmbeddedHelpEvents.GT_API_START_TOUR, tourId, stepNum, cbFunc) : this._tourService.startTour(tourId, stepNum, cbFunc) : this._start_tour_task = {
              tourId: tourId,
              stepNum: stepNum,
              cbFunc: cbFunc
            }
          }
        }, {
          key: "endTour",
          value: function() {
            this._tourService && (top.NOW.isEmbeddedHelpActive ? CustomEvent.fireTop(top.EmbeddedHelpEvents.GT_API_END_TOUR) : this._tourService.endTour())
          }
        }, {
          key: "getAllTours",
          value: function(cbFunc) {
            this._tourService && this._dataService.getToursForPage((0, _url.getContext)(), this._filterFunc, cbFunc)
          }
        }, {
          key: "applyListFilter",
          value: function(filterFunc) {
            this._filterFunc = filterFunc
          }
        }, {
          key: "_registerEvents",
          value: function(tourService) {
            var _this = this;
            if (this._tourService = tourService, this._tourService.on(events.tourStarted, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_STARTED, args)
              }), this._tourService.on(events.stepStarted, function(args) {
                return _this._trigger(guidedToursEvents_STEP_STARTED, args)
              }), this._tourService.on(events.abandoned, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_ABANDONED, args)
              }), this._tourService.on(events.failed, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_FAILED, args)
              }), this._tourService.on(events.completed, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_COMPLETED, args)
              }), this._tourService.on(events.tourEnded, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_ENDED, args)
              }), this._tourService.on(events.dismissed, function(args) {
                return _this._trigger(guidedToursEvents_TOUR_DISMISSED, args)
              }), this._start_tour_task) {
              var _start_tour_task = this._start_tour_task,
                tourId = _start_tour_task.tourId,
                stepNum = _start_tour_task.stepNum,
                cbFunc = _start_tour_task.cbFunc;
              this._start_tour_task = null, this.startTour(tourId, stepNum, cbFunc)
            }
          }
        }, {
          key: "_on",
          value: function(event, cbFunc) {
            CustomEvent && CustomEvent.on(event, cbFunc)
          }
        }, {
          key: "_off",
          value: function(event, func) {
            CustomEvent && (func && "function" == typeof func ? CustomEvent.un(event, func) : CustomEvent.unAll(event))
          }
        }, {
          key: "_trigger",
          value: function(event, args) {
            CustomEvent.fireTop(event, args)
          }
        }]), GuidedToursManager
      }();
    module.exports = GuidedToursManager
  }, {
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    7: 7
  }],
  6: [function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: !0
    });
    var _createClass = function(Constructor, protoProps, staticProps) {
      return protoProps && defineProperties(Constructor.prototype, protoProps), staticProps && defineProperties(Constructor, staticProps), Constructor
    };

    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor)
      }
    }
    var gtbGetMsg = {},
      found = !1;
    if (window.GwtMessage) gtbGetMsg = new window.GwtMessage;
    else {
      for (var i = 0; i < window.frames.length; i++) try {
        if (window.frames[i].getMessage && window.frames[i].getMessages) {
          gtbGetMsg.getMessage = window.frames[i].getMessage, gtbGetMsg.getMessages = window.frames[i].getMessages, found = !0;
          break
        }
      } catch (e) {}
      if (!found) {
        var spI18 = top.NOW && top.NOW.gtdConfig ? top.NOW.gtdConfig.i18n : null;
        spI18 ? (gtbGetMsg.getMessage = spI18.getMessage, gtbGetMsg.getMessages = spI18.getMessages, found = !0) : (gtbGetMsg.getMessage = function() {
          return arguments.length <= 0 ? void 0 : arguments[0]
        }, gtbGetMsg.getMessages = function(arr) {
          return arr.reduce(function(acc, current) {
            return acc[current] = current, acc
          }, {})
        })
      }
    }
    var i18n = function() {
      function i18n() {
        ! function(instance, Constructor) {
          if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function")
        }(this, i18n)
      }
      return _createClass(i18n, null, [{
        key: "getMessages",
        value: function() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
          try {
            return gtbGetMsg.getMessages.apply(gtbGetMsg, args)
          } catch (e) {
            return args
          }
        }
      }, {
        key: "getMessage",
        value: function() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
          try {
            return gtbGetMsg.getMessage.apply(gtbGetMsg, args)
          } catch (e) {
            return args[0]
          }
        }
      }]), i18n
    }();
    exports.default = i18n
  }, {}],
  7: [function(require, module, exports) {
    "use strict";
    module.exports = {
      isStepUrlMatchingForCurrentWindow: function(stepUrl, isMapped) {
        var splt = stepUrl.split("?"),
          currentStepUrl = splt[0],
          params = 1 < splt.length ? splt[1].split("&") : [],
          url = window.location.href,
          urlContainsId = 0 <= url.indexOf("id=");
        if (!isMapped && urlContainsId)
          for (var i = 0; i < params.length; i++)
            if (params[i].startsWith("id=")) return -1 < url.indexOf(currentStepUrl) && -1 < url.indexOf(params[i]);
        return -1 < url.indexOf(currentStepUrl)
      },
      getContext: function() {
        var currLocation = top.window.location,
          currentPage = currLocation.pathname;
        return 0 <= currentPage.indexOf("nav_to.do") && 0 === (currentPage = decodeURIComponent(currLocation.search)).indexOf("?uri=") ? (currentPage = currentPage.replace("?uri=", "")).substr(1, currentPage.indexOf(".do") - 1) : (currentPage = currLocation.pathname).substr(1, currentPage.indexOf(".do") - 1)
      }
    }
  }, {}]
}, {}, [1]);;