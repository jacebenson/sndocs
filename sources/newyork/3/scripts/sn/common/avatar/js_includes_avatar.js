/*! RESOURCE: /scripts/sn/common/avatar/js_includes_avatar.js */
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/glide-amb-client-bundle.min.js */
! function(e, n) {
  if ("object" == typeof exports && "object" == typeof module) module.exports = n();
  else if ("function" == typeof define && define.amd) define([], n);
  else {
    var t = n();
    for (var i in t)("object" == typeof exports ? exports : e)[i] = t[i]
  }
}("undefined" != typeof self ? self : this, function() {
  return function(e) {
    var n = {};

    function t(i) {
      if (n[i]) return n[i].exports;
      var r = n[i] = {
        i: i,
        l: !1,
        exports: {}
      };
      return e[i].call(r.exports, r, r.exports, t), r.l = !0, r.exports
    }
    return t.m = e, t.c = n, t.d = function(e, n, i) {
      t.o(e, n) || Object.defineProperty(e, n, {
        configurable: !1,
        enumerable: !0,
        get: i
      })
    }, t.n = function(e) {
      var n = e && e.__esModule ? function() {
        return e.default
      } : function() {
        return e
      };
      return t.d(n, "a", n), n
    }, t.o = function(e, n) {
      return Object.prototype.hasOwnProperty.call(e, n)
    }, t.p = "", t(t.s = 8)
  }([function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(1),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e) {
      function n(n) {
        window.console && console.log(e + " " + n)
      }
      return {
        debug: function(e) {
          "debug" === o.default.logLevel && n("[DEBUG] " + e)
        },
        addInfoMessage: function(e) {
          n("[INFO] " + e)
        },
        addErrorMessage: function(e) {
          n("[ERROR] " + e)
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    n.default = {
      servletPath: "amb",
      logLevel: "info",
      loginWindow: "true",
      wsConnectTimeout: 1e4,
      overlayStyle: ""
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e, n, t) {
      var i = void 0,
        r = void 0,
        s = new o.default("amb.ChannelListener"),
        a = e;
      return {
        getCallback: function() {
          return r
        },
        getSubscriptionCallback: function() {
          return t
        },
        getID: function() {
          return i
        },
        setNewChannel: function(e) {
          a.unsubscribe(this), a = e, this.subscribe(r)
        },
        subscribe: function(e) {
          return r = e, i = a.subscribe(this), this
        },
        resubscribe: function() {
          return this.subscribe(r)
        },
        unsubscribe: function() {
          return a.unsubscribe(this), s.debug("Unsubscribed from channel: " + a.getName()), this
        },
        publish: function(e) {
          a.publish(e)
        },
        getName: function() {
          return a.getName()
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    n.default = function(e) {
      var n = [],
        t = 0;
      return {
        subscribe: function(e, i) {
          var r = t++;
          return n.push({
            event: e,
            callback: i,
            id: r
          }), r
        },
        unsubscribe: function(e) {
          for (var t = 0; t < n.length; t++) e === n[t].id && n.splice(t, 1)
        },
        publish: function(e, n) {
          for (var t = this._getSubscriptions(e), i = 0; i < t.length; i++) t[i].callback.apply(null, n)
        },
        getEvents: function() {
          return e
        },
        _getSubscriptions: function(e) {
          for (var t = [], i = 0; i < n.length; i++) n[i].event === e && t.push(n[i]);
          return t
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = u(t(3)),
      r = u(t(0)),
      o = u(t(1)),
      s = u(t(5)),
      a = u(t(6));

    function u(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function(e) {
      var n = !1,
        t = !1,
        u = new i.default({
          CONNECTION_INITIALIZED: "connection.initialized",
          CONNECTION_OPENED: "connection.opened",
          CONNECTION_CLOSED: "connection.closed",
          CONNECTION_BROKEN: "connection.broken",
          SESSION_LOGGED_IN: "session.logged.in",
          SESSION_LOGGED_OUT: "session.logged.out",
          SESSION_INVALIDATED: "session.invalidated"
        }),
        c = "closed",
        l = {},
        d = new r.default("amb.ServerConnection");
      ! function() {
        e.addListener("/meta/handshake", this, T), e.addListener("/meta/connect", this, I), e.addListener("/meta/subscribe", this, E), e.addListener("/meta/unsubscribe", this, E)
      }();
      var f = !0,
        g = null,
        h = "true" === o.default.loginWindow,
        p = null,
        b = {
          UNKNOWN_CLIENT: "402::Unknown client"
        },
        v = !1,
        m = {},
        w = !1,
        y = new s.default(e, m),
        C = !1,
        _ = "glide.amb.session.logout.overlay.style";

      function T(e) {
        void 0 !== e.ext && null !== e.ext[_] && void 0 !== e.ext[_] && (o.default.overlayStyle = e.ext[_]), setTimeout(function() {
          e.successful && O()
        }, 0)
      }

      function x(n) {
        if (n in l) return l[n];
        var t = new a.default(e, n, C);
        return l[n] = t, t
      }

      function k(e) {
        delete l[e]
      }

      function E(n) {
        n.ext && (!1 === n.ext["glide.amb.active"] && m.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (o.default.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(o.default.logLevel)))
      }

      function S() {
        for (var e in d.debug("Resubscribing to all!"), l) {
          var n = l[e];
          n && n.resubscribeToCometD()
        }
      }

      function L() {
        for (var e in d.debug("Unsubscribing from all!"), l) {
          var n = l[e];
          n && n.unsubscribeFromCometD()
        }
      }

      function I(e) {
        if (E(e), t) setTimeout(function() {
          n = !1, d.debug("Connection closed"), c = "closed", U(u.getEvents().CONNECTION_CLOSED)
        }, 0);
        else {
          var i = e.error;
          i && (p = i),
            function(e) {
              var n = e.ext;
              if (n) {
                var t = n["glide.session.status"];
                switch (v = !0 === n["glide.amb.login.window.override"], d.debug("session.status - " + t), t) {
                  case "session.logged.out":
                    f && (f = !1, d.debug("LOGGED_OUT event fire!"), L(), U(u.getEvents().SESSION_LOGGED_OUT), h && !v && m.loginShow());
                    break;
                  case "session.logged.in":
                    f || D();
                    break;
                  case "session.invalidated":
                  case null:
                    f && (f = !1, d.debug("INVALIDATED event fire!"), L(), U(u.getEvents().SESSION_INVALIDATED));
                    break;
                  default:
                    d.debug("unknown session status - " + t)
                }
              }
            }(e);
          var r = n;
          n = !0 === e.successful, !r && n ? N() : r && !n && (d.addErrorMessage("Connection broken"), c = "broken", w = !0, U(u.getEvents().CONNECTION_BROKEN))
        }
      }

      function O() {
        d.debug("Connection initialized"), C = !0, c = "initialized", U(u.getEvents().CONNECTION_INITIALIZED)
      }

      function N() {
        d.debug("Connection opened"), w ? m.getLastError() === m.getErrorMessages().UNKNOWN_CLIENT && (m.setLastError(null), M()) : y.initialize(R)
      }

      function R() {
        S(), c = "opened", U(u.getEvents().CONNECTION_OPENED)
      }

      function M() {
        var n = function() {
          d.debug("sending /amb_session_setup.do!");
          var n = new XMLHttpRequest;
          return n.open("GET", "/amb_session_setup.do", !0), n.setRequestHeader("Content-type", "application/json;charset=UTF-8"), n.setRequestHeader("X-UserToken", window.g_ck), n.setRequestHeader("X-CometD_SessionID", e.getClientId()), n
        }();
        n.onload = function() {
          200 === this.status && (w = !1, y.initialize(R))
        }, n.send()
      }

      function D() {
        f = !0, d.debug("LOGGED_IN event fire!"), S(), U(u.getEvents().SESSION_LOGGED_IN), m.loginHide()
      }

      function U(e) {
        try {
          u.publish(e)
        } catch (n) {
          d.addErrorMessage("error publishing '" + e + "' - " + n)
        }
      }
      return m.connect = function() {
        n ? console.log(">>> connection exists, request satisfied") : (d.debug("Connecting to glide amb server -> " + o.default.servletURI), e.configure({
          url: m.getURL(o.default.servletPath),
          logLevel: o.default.logLevel,
          connectTimeout: o.default.wsConnectTimeout
        }), e.handshake())
      }, m.reload = function() {
        e.reload()
      }, m.abort = function() {
        e.getTransport().abort()
      }, m.disconnect = function() {
        d.debug("Disconnecting from glide amb server.."), t = !0, e.disconnect()
      }, m.getURL = function(e) {
        return window.location.protocol + "//" + window.location.host + "/" + e
      }, m.unsubscribeAll = function() {
        L()
      }, m.resubscribeAll = function() {
        S()
      }, m.removeChannel = function(e) {
        k(e)
      }, m.getEvents = function() {
        return u.getEvents()
      }, m.getConnectionState = function() {
        return c
      }, m.getLastError = function() {
        return p
      }, m.setLastError = function(e) {
        p = e
      }, m.getErrorMessages = function() {
        return b
      }, m.isLoggedIn = function() {
        return f
      }, m.getChannelRedirect = function() {
        return y
      }, m.getChannel = function(e) {
        return x(e)
      }, m.getChannels = function() {
        return l
      }, m.getState = function() {
        return c
      }, m.getLoginWindowOverlayStyle = function() {
        return o.default.overlayStyle
      }, m.loginShow = function() {
        d.debug("Show login window");
        var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>',
          n = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog" style="' + o.default.overlayStyle + '">\n\t\t\t\t<div class="modal-dialog small-modal" style="width:450px">\n\t\t\t\t   <div class="modal-content">\n\t\t\t\t\t  <header class="modal-header">\n\t\t\t\t\t\t <h4 id="small_modal1_title" class="modal-title">Login</h4>\n\t\t\t\t\t  </header>\n\t\t\t\t\t  <div class="modal-body">\n\t\t\t\t\t  </div>\n\t\t\t\t   </div>\n\t\t\t\t</div>\n\t\t\t</div>';
        try {
          var t = new GlideModal("amb_disconnect_modal");
          t.renderWithContent ? (t.template = n, t.renderWithContent(e)) : (t.setBody(e), t.render()), g = t
        } catch (e) {
          d.debug(e)
        }
      }, m.loginHide = function() {
        g && (g.destroy(), g = null)
      }, m.loginComplete = function() {
        D()
      }, m.subscribeToEvent = function(e, t) {
        return u.getEvents().CONNECTION_OPENED === e && n && t(), u.subscribe(e, t)
      }, m.unsubscribeFromEvent = function(e) {
        u.unsubscribe(e)
      }, m.isLoginWindowEnabled = function() {
        return h
      }, m.setLoginWindowEnabled = function(e) {
        h = e
      }, m.isLoginWindowOverride = function() {
        return v
      }, m._metaConnect = I, m._metaHandshake = T, m._sendSessionSetupRequest = M, m._onChannelRedirectSubscriptionComplete = R, m._getChannel = x, m._removeChannel = k, m._connectionInitialized = O, m._connectionOpened = N, m
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = o(t(0)),
      r = o(t(2));

    function o(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function(e, n) {
      var t = void 0,
        o = e,
        s = new i.default("amb.ChannelRedirect");

      function a(e) {
        s.debug("_onAdvice:" + e.data.clientId);
        var t = n.getChannel(e.data.fromChannel),
          i = n.getChannel(e.data.toChannel);
        t && i ? (function(e, n) {
          for (var t = e.getChannelListeners(), i = 0; i < t.length; i++) t[i].setNewChannel(n)
        }(t, i), s.debug("published channel switch event, fromChannel:" + t.getName() + ", toChannel:" + i.getName())) : s.debug("Could not redirect from " + e.data.fromChannel + " to " + e.data.toChannel)
      }
      return {
        initialize: function(e) {
          var i = "/sn/meta/channel_redirect/" + o.getClientId(),
            u = n.getChannel(i);
          t && u === t ? t.subscribeToCometD() : (t && n.removeChannel(t.getName()), t = u, new r.default(t, n, e).subscribe(a)), s.debug("ChannelRedirect initialized: " + i)
        },
        _onAdvice: a
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function(e, n, t) {
      var i = null,
        r = null,
        s = [],
        a = [],
        u = new o.default("amb.Channel"),
        c = 0,
        l = t;
      return {
        subscribe: function(e) {
          if (e.getCallback()) {
            for (var t = 0; t < s.length; t++)
              if (s[t] === e) return u.debug("Channel listener already in the list"), e.getID();
            s.push(e);
            var o = e.getSubscriptionCallback();
            if (o && (r ? o(r) : a.push(o)), !i && l) try {
              this.subscribeToCometD()
            } catch (e) {
              return void u.addErrorMessage(e)
            }
            return ++c
          }
          u.addErrorMessage("Cannot subscribe to channel: " + n + ", callback not provided")
        },
        resubscribe: function() {
          i = null;
          for (var e = 0; e < s.length; e++) s[e].resubscribe()
        },
        _handleResponse: function(e) {
          for (var n = 0; n < s.length; n++) s[n].getCallback()(e)
        },
        unsubscribe: function(t) {
          if (t) {
            for (var r = 0; r < s.length; r++)
              if (s[r].getID() === t.getID()) {
                s.splice(r, 1);
                break
              } var o;
            s.length < 1 && i && "disconnecting" !== (o = e.getStatus()) && "disconnected" !== o && this.unsubscribeFromCometD()
          } else u.addErrorMessage("Cannot unsubscribe from channel: " + n + ", listener argument does not exist")
        },
        publish: function(t) {
          e.publish(n, t)
        },
        subscribeToCometD: function() {
          i = e.subscribe(n, this._handleResponse.bind(this), this.subscriptionCallback), u.debug("Successfully subscribed to channel: " + n)
        },
        subscriptionCallback: function(e) {
          u.debug("Cometd subscription callback completed for channel: " + n), u.debug("Listener callback queue size: " + a.length), r = e, a.map(function(e) {
            e(r)
          }), a = []
        },
        unsubscribeFromCometD: function() {
          null !== i && (e.unsubscribe(i), i = null, r = null, u.debug("Successfully unsubscribed from channel: " + n))
        },
        resubscribeToCometD: function() {
          u.debug("Resubscribe to " + n), this.subscribeToCometD()
        },
        getName: function() {
          return n
        },
        getChannelListeners: function() {
          return s
        },
        getListenerCallbackQueue: function() {
          return a
        },
        setSubscriptionCallbackResponse: function(e) {
          r = e
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = u(t(10)),
      r = u(t(4)),
      o = u(t(0)),
      s = u(t(2)),
      a = u(t(11));

    function u(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    n.default = function() {
      var e = new i.default.CometD;
      e.registerTransport("websocket", new i.default.WebSocketTransport, 0), e.registerTransport("long-polling", new i.default.LongPollingTransport, 1), e.unregisterTransport("callback-polling");
      var n = new a.default;
      e.registerExtension("graphQLSubscription", n);
      var t = new r.default(e),
        u = new o.default("amb.MessageClient"),
        c = !1;
      return {
        getServerConnection: function() {
          return t
        },
        isLoggedIn: function() {
          return t.isLoggedIn()
        },
        loginComplete: function() {
          t.loginComplete()
        },
        connect: function() {
          c ? u.addInfoMessage(">>> connection exists, request satisfied") : (c = !0, t.connect())
        },
        reload: function() {
          c = !1, t.reload()
        },
        abort: function() {
          c = !1, t.abort()
        },
        disconnect: function() {
          c = !1, t.disconnect()
        },
        isConnected: function() {
          return c
        },
        getConnectionEvents: function() {
          return t.getEvents()
        },
        subscribeToEvent: function(e, n) {
          return t.subscribeToEvent(e, n)
        },
        unsubscribeFromEvent: function(e) {
          t.unsubscribeFromEvent(e)
        },
        getConnectionState: function() {
          return t.getConnectionState()
        },
        getClientId: function() {
          return e.getClientId()
        },
        getChannel: function(e, i) {
          var r = i || {},
            o = r.subscriptionCallback,
            a = r.serializedGraphQLSubscription,
            c = t.getChannel(e);
          return n.isGraphQLChannel(e) && (a ? n.addGraphQLChannel(e, a) : u.addErrorMessage("Serialized subscription not present for GraphQL channel " + e)), new s.default(c, t, o)
        },
        removeChannel: function(e) {
          t.removeChannel(e), n.isGraphQLChannel(e) && n.removeGraphQLChannel(e)
        },
        getChannels: function() {
          return t.getChannels()
        },
        registerExtension: function(n, t) {
          e.registerExtension(n, t)
        },
        unregisterExtension: function(n) {
          e.unregisterExtension(n)
        },
        batch: function(n) {
          e.batch(n)
        }
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    }), n.amb = void 0;
    var i, r = t(9),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.amb = o.default
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = f(t(1)),
      r = f(t(0)),
      o = f(t(3)),
      s = f(t(4)),
      a = f(t(5)),
      u = f(t(2)),
      c = f(t(6)),
      l = f(t(7)),
      d = f(t(12));

    function f(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    var g = {
      properties: i.default,
      Logger: r.default,
      EventManager: o.default,
      ServerConnection: s.default,
      ChannelRedirect: a.default,
      ChannelListener: u.default,
      Channel: c.default,
      MessageClient: l.default,
      getClient: d.default
    };
    n.default = g
  }, function(e, n, t) {
    var i;
    i = function() {
      var e = {
          isString: function(e) {
            return void 0 !== e && null !== e && ("string" == typeof e || e instanceof String)
          },
          isArray: function(e) {
            return void 0 !== e && null !== e && e instanceof Array
          },
          inArray: function(e, n) {
            for (var t = 0; t < n.length; ++t)
              if (e === n[t]) return t;
            return -1
          },
          setTimeout: function(e, n, t) {
            return window.setTimeout(function() {
              try {
                e._debug("Invoking timed function", n), n()
              } catch (t) {
                e._debug("Exception invoking timed function", n, t)
              }
            }, t)
          },
          clearTimeout: function(e) {
            window.clearTimeout(e)
          }
        },
        n = function() {
          var n, t, i;
          this.registered = function(e, i) {
            n = e, t = i
          }, this.unregistered = function() {
            n = null, t = null
          }, this._debug = function() {
            t._debug.apply(t, arguments)
          }, this._mixin = function() {
            return t._mixin.apply(t, arguments)
          }, this.getConfiguration = function() {
            return t.getConfiguration()
          }, this.getAdvice = function() {
            return t.getAdvice()
          }, this.setTimeout = function(n, i) {
            return e.setTimeout(t, n, i)
          }, this.clearTimeout = function(n) {
            e.clearTimeout(n)
          }, this.convertToMessages = function(n) {
            if (e.isString(n)) try {
              return JSON.parse(n)
            } catch (e) {
              throw this._debug("Could not convert to JSON the following string", '"' + n + '"'), e
            }
            if (e.isArray(n)) return n;
            if (void 0 === n || null === n) return [];
            if (n instanceof Object) return [n];
            throw "Conversion Error " + n + ", typeof " + typeof n
          }, this.accept = function(e, n, t) {
            throw "Abstract"
          }, this.getType = function() {
            return n
          }, this.getURL = function() {
            return i
          }, this.setURL = function(e) {
            i = e
          }, this.send = function(e, n) {
            throw "Abstract"
          }, this.reset = function(e) {
            this._debug("Transport", n, "reset", e ? "initial" : "retry")
          }, this.abort = function() {
            this._debug("Transport", n, "aborted")
          }, this.toString = function() {
            return this.getType()
          }
        };
      n.derive = function(e) {
        function n() {}
        return n.prototype = e, new n
      };
      var t = function() {
          var t = new n,
            i = n.derive(t),
            r = 0,
            o = null,
            s = [],
            a = [];

          function u(e, n) {
            if (this.transportSend(e, n), n.expired = !1, !e.sync) {
              var t = this.getConfiguration().maxNetworkDelay,
                i = t;
              !0 === n.metaConnect && (i += this.getAdvice().timeout), this._debug("Transport", this.getType(), "waiting at most", i, "ms for the response, maxNetworkDelay", t);
              var r = this;
              n.timeout = this.setTimeout(function() {
                n.expired = !0;
                var t = "Request " + n.id + " of transport " + r.getType() + " exceeded " + i + " ms max network delay",
                  o = {
                    reason: t
                  },
                  s = n.xhr;
                o.httpCode = r.xhrStatus(s), r.abortXHR(s), r._debug(t), r.complete(n, !1, n.metaConnect), e.onFailure(s, e.messages, o)
              }, i)
            }
          }

          function c(e) {
            var n = ++r,
              t = {
                id: n,
                metaConnect: !1,
                envelope: e
              };
            s.length < this.getConfiguration().maxConnections - 1 ? (s.push(t), u.call(this, e, t)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), a.push([e, t]))
          }

          function l(n, t) {
            var i = e.inArray(n, s);
            if (i >= 0 && s.splice(i, 1), a.length > 0) {
              var r = a.shift(),
                o = r[0],
                u = r[1];
              if (this._debug("Transport dequeued request", u.id), t) this.getConfiguration().autoBatch && function(e) {
                for (; a.length > 0;) {
                  var n = a[0],
                    t = n[0],
                    i = n[1];
                  if (t.url !== e.url || t.sync !== e.sync) break;
                  a.shift(), e.messages = e.messages.concat(t.messages), this._debug("Coalesced", t.messages.length, "messages from request", i.id)
                }
              }.call(this, o), c.call(this, o), this._debug("Transport completed request", n.id, o);
              else {
                var l = this;
                this.setTimeout(function() {
                  l.complete(u, !1, u.metaConnect);
                  var e = {
                      reason: "Previous request failed"
                    },
                    n = u.xhr;
                  e.httpCode = l.xhrStatus(n), o.onFailure(n, o.messages, e)
                }, 0)
              }
            }
          }
          return i.complete = function(e, n, t) {
            t ? function(e) {
              var n = e.id;
              if (this._debug("Transport", this.getType(), "metaConnect complete, request", n), null !== o && o.id !== n) throw "Longpoll request mismatch, completing request " + n;
              o = null
            }.call(this, e) : l.call(this, e, n)
          }, i.transportSend = function(e, n) {
            throw "Abstract"
          }, i.transportSuccess = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !0, n.metaConnect), t && t.length > 0 ? e.onSuccess(t) : e.onFailure(n.xhr, e.messages, {
              httpCode: 204
            }))
          }, i.transportFailure = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !1, n.metaConnect), e.onFailure(n.xhr, e.messages, t))
          }, i.send = function(e, n) {
            n ? function(e) {
              if (null !== o) throw "Concurrent metaConnect requests not allowed, request id=" + o.id + " not yet completed";
              var n = ++r;
              this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
              var t = {
                id: n,
                metaConnect: !0,
                envelope: e
              };
              u.call(this, e, t), o = t
            }.call(this, e) : c.call(this, e)
          }, i.abort = function() {
            t.abort();
            for (var e = 0; e < s.length; ++e) {
              var n = s[e];
              n && (this._debug("Aborting request", n), this.abortXHR(n.xhr) || this.transportFailure(n.envelope, n, {
                reason: "abort"
              }))
            }
            var i = o;
            i && (this._debug("Aborting metaConnect request", i), this.abortXHR(i.xhr) || this.transportFailure(i.envelope, i, {
              reason: "abort"
            })), this.reset(!0)
          }, i.reset = function(e) {
            t.reset(e), o = null, s = [], a = []
          }, i.abortXHR = function(e) {
            if (e) try {
              var n = e.readyState;
              return e.abort(), n !== window.XMLHttpRequest.UNSENT
            } catch (e) {
              this._debug(e)
            }
            return !1
          }, i.xhrStatus = function(e) {
            if (e) try {
              return e.status
            } catch (e) {
              this._debug(e)
            }
            return -1
          }, i
        },
        i = function() {
          var e = new t,
            i = n.derive(e),
            r = !0;
          return i.accept = function(e, n, t) {
            return r || !n
          }, i.newXMLHttpRequest = function() {
            return new window.XMLHttpRequest
          }, i.xhrSend = function(e) {
            var n = i.newXMLHttpRequest();
            n.context = i.context, n.withCredentials = !0, n.open("POST", e.url, !0 !== e.sync);
            var t = e.headers;
            if (t)
              for (var r in t) t.hasOwnProperty(r) && n.setRequestHeader(r, t[r]);
            return n.setRequestHeader("Content-Type", "application/json;charset=UTF-8"), n.onload = function() {
              200 === n.status ? e.onSuccess(n.responseText) : e.onError(n.statusText)
            }, n.onerror = function() {
              e.onError(n.statusText)
            }, n.send(e.body), n
          }, i.transportSend = function(e, n) {
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", e);
            var t = this;
            try {
              var i = !0;
              n.xhr = this.xhrSend({
                transport: this,
                url: e.url,
                sync: e.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(e.messages),
                onSuccess: function(i) {
                  t._debug("Transport", t.getType(), "received response", i);
                  var o = !1;
                  try {
                    var s = t.convertToMessages(i);
                    0 === s.length ? (r = !1, t.transportFailure(e, n, {
                      httpCode: 204
                    })) : (o = !0, t.transportSuccess(e, n, s))
                  } catch (i) {
                    if (t._debug(i), !o) {
                      r = !1;
                      var a = {
                        exception: i
                      };
                      a.httpCode = t.xhrStatus(n.xhr), t.transportFailure(e, n, a)
                    }
                  }
                },
                onError: function(o, s) {
                  t._debug("Transport", t.getType(), "received error", o, s), r = !1;
                  var a = {
                    reason: o,
                    exception: s
                  };
                  a.httpCode = t.xhrStatus(n.xhr), i ? t.setTimeout(function() {
                    t.transportFailure(e, n, a)
                  }, 0) : t.transportFailure(e, n, a)
                }
              }), i = !1
            } catch (i) {
              r = !1, this.setTimeout(function() {
                t.transportFailure(e, n, {
                  exception: i
                })
              }, 0)
            }
          }, i.reset = function(n) {
            e.reset(n), r = !0
          }, i
        },
        r = function() {
          var e = new t,
            i = n.derive(e),
            r = 0;

          function o(e, n, t) {
            var i = this;
            return function() {
              i.transportFailure(e, n, "error", t)
            }
          }
          return i.accept = function(e, n, t) {
            return !0
          }, i.jsonpSend = function(e) {
            var n = document.getElementsByTagName("head")[0],
              t = document.createElement("script"),
              i = "_cometd_jsonp_" + r++;
            window[i] = function(r) {
              n.removeChild(t), delete window[i], e.onSuccess(r)
            };
            var o = e.url;
            o += o.indexOf("?") < 0 ? "?" : "&", o += "jsonp=" + i, o += "&message=" + encodeURIComponent(e.body), t.src = o, t.async = !0 !== e.sync, t.type = "application/javascript", t.onerror = function(n) {
              e.onError("jsonp " + n.type)
            }, n.appendChild(t)
          }, i.transportSend = function(e, n) {
            for (var t = this, i = 0, r = e.messages.length, s = []; r > 0;) {
              var a = JSON.stringify(e.messages.slice(i, i + r)),
                u = e.url.length + encodeURI(a).length,
                c = this.getConfiguration().maxURILength;
              if (u > c) {
                if (1 === r) {
                  var l = "Bayeux message too big (" + u + " bytes, max is " + c + ") for transport " + this.getType();
                  return void this.setTimeout(o.call(this, e, n, l), 0)
                }--r
              } else s.push(r), i += r, r = e.messages.length - i
            }
            var d = e;
            if (s.length > 1) {
              var f = 0,
                g = s[0];
              this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", s.join(" + ")), (d = this._mixin(!1, {}, e)).messages = e.messages.slice(f, g), d.onSuccess = e.onSuccess, d.onFailure = e.onFailure;
              for (var h = 1; h < s.length; ++h) {
                var p = this._mixin(!1, {}, e);
                f = g, g += s[h], p.messages = e.messages.slice(f, g), p.onSuccess = e.onSuccess, p.onFailure = e.onFailure, this.send(p, n.metaConnect)
              }
            }
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", d);
            try {
              var b = !0;
              this.jsonpSend({
                transport: this,
                url: d.url,
                sync: d.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(d.messages),
                onSuccess: function(e) {
                  var i = !1;
                  try {
                    var r = t.convertToMessages(e);
                    0 === r.length ? t.transportFailure(d, n, {
                      httpCode: 204
                    }) : (i = !0, t.transportSuccess(d, n, r))
                  } catch (e) {
                    t._debug(e), i || t.transportFailure(d, n, {
                      exception: e
                    })
                  }
                },
                onError: function(e, i) {
                  var r = {
                    reason: e,
                    exception: i
                  };
                  b ? t.setTimeout(function() {
                    t.transportFailure(d, n, r)
                  }, 0) : t.transportFailure(d, n, r)
                }
              }), b = !1
            } catch (e) {
              this.setTimeout(function() {
                t.transportFailure(d, n, {
                  exception: e
                })
              }, 0)
            }
          }, i
        },
        o = function() {
          var t, i = new n,
            r = n.derive(i),
            o = !0,
            s = !1,
            a = !0,
            u = null,
            c = null,
            l = !1,
            d = null;

          function f(e, n) {
            e && (this.webSocketClose(e, n.code, n.reason), this.onClose(e, n))
          }

          function g(e) {
            return e === c || e === u
          }

          function h(e, n, t) {
            for (var i = [], r = 0; r < n.messages.length; ++r) {
              var o = n.messages[r];
              o.id && i.push(o.id)
            }
            e.envelopes[i.join(",")] = [n, t], this._debug("Transport", this.getType(), "stored envelope, envelopes", e.envelopes)
          }

          function p(e, n, i) {
            var r = JSON.stringify(n.messages);
            e.webSocket.send(r), this._debug("Transport", this.getType(), "sent", n, "metaConnect =", i);
            var o = this.getConfiguration().maxNetworkDelay,
              s = o;
            i && (s += this.getAdvice().timeout, l = !0);
            for (var a = this, u = [], c = 0; c < n.messages.length; ++c) ! function() {
              var i = n.messages[c];
              i.id && (u.push(i.id), e.timeouts[i.id] = a.setTimeout(function() {
                t._debug("Transport", a.getType(), "timing out message", i.id, "after", s, "on", e), f.call(a, e, {
                  code: 1e3,
                  reason: "Message Timeout"
                })
              }, s))
            }();
            this._debug("Transport", this.getType(), "waiting at most", s, "ms for messages", u, "maxNetworkDelay", o, ", timeouts:", e.timeouts)
          }

          function b(e, n, i) {
            try {
              null === e ? (e = c || {
                envelopes: {},
                timeouts: {}
              }, h.call(this, e, n, i), function(e) {
                if (!c) {
                  var n = t.getURL().replace(/^http/, "ws");
                  this._debug("Transport", this.getType(), "connecting to URL", n);
                  try {
                    var i = t.getConfiguration().protocol;
                    e.webSocket = i ? new window.WebSocket(n, i) : new window.WebSocket(n), c = e
                  } catch (e) {
                    throw o = !1, this._debug("Exception while creating WebSocket object", e), e
                  }
                  a = !1 !== t.getConfiguration().stickyReconnect;
                  var r = this,
                    l = t.getConfiguration().connectTimeout;
                  l > 0 && (e.connectTimer = this.setTimeout(function() {
                    t._debug("Transport", r.getType(), "timed out while connecting to URL", n, ":", l, "ms"), f.call(r, e, {
                      code: 1e3,
                      reason: "Connect Timeout"
                    })
                  }, l));
                  var d = function(n) {
                    n = n || {
                      code: 1e3
                    }, t._debug("WebSocket onclose", e, n, "connecting", c, "current", u), e.connectTimer && r.clearTimeout(e.connectTimer), r.onClose(e, n)
                  };
                  e.webSocket.onopen = function() {
                    t._debug("WebSocket onopen", e), e.connectTimer && r.clearTimeout(e.connectTimer), g(e) ? (c = null, u = e, s = !0, r.onOpen(e)) : (t._warn("Closing extra WebSocket connection", this, "active connection", u), f.call(r, e, {
                      code: 1e3,
                      reason: "Extra Connection"
                    }))
                  }, e.webSocket.onclose = d, e.webSocket.onerror = function() {
                    d({
                      code: 1e3,
                      reason: "Error"
                    })
                  }, e.webSocket.onmessage = function(n) {
                    t._debug("WebSocket onmessage", n, e), r.onMessage(e, n)
                  }, this._debug("Transport", this.getType(), "configured callbacks on", e)
                }
              }.call(this, e)) : (h.call(this, e, n, i), p.call(this, e, n, i))
            } catch (n) {
              var r = this;
              this.setTimeout(function() {
                f.call(r, e, {
                  code: 1e3,
                  reason: "Exception",
                  exception: n
                })
              }, 0)
            }
          }
          return r.reset = function(e) {
            i.reset(e), o = !0, e && (s = !1), a = !0, u = null, c = null, l = !1
          }, r._notifySuccess = function(e, n) {
            e.call(this, n)
          }, r._notifyFailure = function(e, n, t, i) {
            e.call(this, n, t, i)
          }, r.onOpen = function(e) {
            var n = e.envelopes;
            for (var t in this._debug("Transport", this.getType(), "opened", e, "pending messages", n), n)
              if (n.hasOwnProperty(t)) {
                var i = n[t],
                  r = i[0],
                  o = i[1];
                d = r.onSuccess, p.call(this, e, r, o)
              }
          }, r.onMessage = function(n, t) {
            this._debug("Transport", this.getType(), "received websocket message", t, n);
            for (var i = !1, r = this.convertToMessages(t.data), o = [], s = 0; s < r.length; ++s) {
              var a = r[s];
              if ((/^\/meta\//.test(a.channel) || void 0 === a.data) && a.id) {
                o.push(a.id);
                var u = n.timeouts[a.id];
                u && (this.clearTimeout(u), delete n.timeouts[a.id], this._debug("Transport", this.getType(), "removed timeout for message", a.id, ", timeouts", n.timeouts))
              }
              "/meta/connect" === a.channel && (l = !1), "/meta/disconnect" !== a.channel || l || (i = !0)
            }
            for (var c = !1, f = n.envelopes, g = 0; g < o.length; ++g) {
              var h = o[g];
              for (var p in f)
                if (f.hasOwnProperty(p)) {
                  var b = p.split(","),
                    v = e.inArray(h, b);
                  if (v >= 0) {
                    c = !0, b.splice(v, 1);
                    var m = f[p][0],
                      w = f[p][1];
                    delete f[p], b.length > 0 && (f[b.join(",")] = [m, w]);
                    break
                  }
                }
            }
            c && this._debug("Transport", this.getType(), "removed envelope, envelopes", f), this._notifySuccess(d, r), i && this.webSocketClose(n, 1e3, "Disconnect")
          }, r.onClose = function(e, n) {
            this._debug("Transport", this.getType(), "closed", e, n), g(e) && (o = a && s, c = null, u = null);
            var t = e.timeouts;
            for (var i in e.timeouts = {}, t) t.hasOwnProperty(i) && this.clearTimeout(t[i]);
            var r = e.envelopes;
            for (var d in e.envelopes = {}, r)
              if (r.hasOwnProperty(d)) {
                var f = r[d][0];
                r[d][1] && (l = !1);
                var h = {
                  websocketCode: n.code,
                  reason: n.reason
                };
                n.exception && (h.exception = n.exception), this._notifyFailure(f.onFailure, e, f.messages, h)
              }
          }, r.registered = function(e, n) {
            i.registered(e, n), t = n
          }, r.accept = function(e, n, i) {
            return this._debug("Transport", this.getType(), "accept, supported:", o), o && !!window.WebSocket && !1 !== t.websocketEnabled
          }, r.send = function(e, n) {
            this._debug("Transport", this.getType(), "sending", e, "metaConnect =", n), b.call(this, u, e, n)
          }, r.webSocketClose = function(e, n, t) {
            try {
              e.webSocket && e.webSocket.close(n, t)
            } catch (e) {
              this._debug(e)
            }
          }, r.abort = function() {
            i.abort(), f.call(this, u, {
              code: 1e3,
              reason: "Abort"
            }), this.reset(!0)
          }, r
        },
        s = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", ".", "-", ":", "+", "=", "^", "!", "/", "*", "?", "&", "<", ">", "(", ")", "[", "]", "{", "}", "@", "%", "$", "#"],
        a = [0, 68, 0, 84, 83, 82, 72, 0, 75, 76, 70, 65, 0, 63, 62, 69, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 64, 0, 73, 66, 74, 71, 81, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 77, 0, 78, 67, 0, 0, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 79, 0, 80, 0, 0];
      return {
        CometD: function(n) {
          var t, s, a, u, c, l = this,
            d = n || "default",
            f = !1,
            g = new function() {
              var e = [],
                n = {};
              this.getTransportTypes = function() {
                return e.slice(0)
              }, this.findTransportTypes = function(t, i, r) {
                for (var o = [], s = 0; s < e.length; ++s) {
                  var a = e[s];
                  !0 === n[a].accept(t, i, r) && o.push(a)
                }
                return o
              }, this.negotiateTransport = function(t, i, r, o) {
                for (var s = 0; s < e.length; ++s)
                  for (var a = e[s], u = 0; u < t.length; ++u)
                    if (a === t[u]) {
                      var c = n[a];
                      if (!0 === c.accept(i, r, o)) return c
                    } return null
              }, this.add = function(t, i, r) {
                for (var o = !1, s = 0; s < e.length; ++s)
                  if (e[s] === t) {
                    o = !0;
                    break
                  } return o || ("number" != typeof r ? e.push(t) : e.splice(r, 0, t), n[t] = i), !o
              }, this.find = function(t) {
                for (var i = 0; i < e.length; ++i)
                  if (e[i] === t) return n[t];
                return null
              }, this.remove = function(t) {
                for (var i = 0; i < e.length; ++i)
                  if (e[i] === t) {
                    e.splice(i, 1);
                    var r = n[t];
                    return delete n[t], r
                  } return null
              }, this.clear = function() {
                e = [], n = {}
              }, this.reset = function(t) {
                for (var i = 0; i < e.length; ++i) n[e[i]].reset(t)
              }
            },
            h = "disconnected",
            p = 0,
            b = null,
            v = 0,
            m = [],
            w = !1,
            y = 0,
            C = {},
            _ = 0,
            T = null,
            x = [],
            k = {},
            E = {},
            S = {},
            L = !1,
            I = !1,
            O = 0,
            N = 0,
            R = {
              protocol: null,
              stickyReconnect: !0,
              connectTimeout: 0,
              maxConnections: 2,
              backoffIncrement: 1e3,
              maxBackoff: 6e4,
              logLevel: "info",
              maxNetworkDelay: 1e4,
              requestHeaders: {},
              appendMessageTypeToURL: !0,
              autoBatch: !1,
              urls: {},
              maxURILength: 2e3,
              advice: {
                timeout: 6e4,
                interval: 0,
                reconnect: void 0,
                maxInterval: 0
              }
            };

          function M(e, n) {
            try {
              return e[n]
            } catch (e) {
              return
            }
          }

          function D(n) {
            return e.isString(n)
          }

          function U(e) {
            return void 0 !== e && null !== e && "function" == typeof e
          }

          function A(e, n) {
            for (var t = ""; --n > 0 && !(e >= Math.pow(10, n));) t += "0";
            return t += e
          }

          function F(e, n) {
            if (window.console) {
              var t = window.console[e];
              if (U(t)) {
                var i = new Date;
                [].splice.call(n, 0, 0, A(i.getHours(), 2) + ":" + A(i.getMinutes(), 2) + ":" + A(i.getSeconds(), 2) + "." + A(i.getMilliseconds(), 3)), t.apply(window.console, n)
              }
            }
          }

          function P(e) {
            return /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(e)
          }

          function q(e) {
            if (e) {
              var n = C[e.channel];
              n && n[e.id] && (delete n[e.id], l._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function B(e) {
            e && !e.listener && q(e)
          }

          function j() {
            for (var e in C)
              if (C.hasOwnProperty(e)) {
                var n = C[e];
                if (n)
                  for (var t in n) n.hasOwnProperty(t) && B(n[t])
              }
          }

          function G(e) {
            h !== e && (l._debug("Status", h, "->", e), h = e)
          }

          function W() {
            return "disconnecting" === h || "disconnected" === h
          }

          function H() {
            return "" + ++p
          }

          function Q(e, n, t, i, r) {
            try {
              return n.call(e, i)
            } catch (e) {
              var o = l.onExtensionException;
              if (U(o)) {
                l._debug("Invoking extension exception handler", t, e);
                try {
                  o.call(l, e, t, r, i)
                } catch (e) {
                  l._info("Exception during execution of extension exception handler", t, e)
                }
              } else l._info("Exception during execution of extension", t, e);
              return i
            }
          }

          function z(e) {
            for (var n = x.length - 1; n >= 0 && void 0 !== e && null !== e; --n) {
              var t = x[n],
                i = t.extension.outgoing;
              if (U(i)) {
                var r = Q(t.extension, i, t.name, e, !0);
                e = void 0 === r ? e : r
              }
            }
            return e
          }

          function X(e, n) {
            var t = C[e];
            if (t)
              for (var i in t)
                if (t.hasOwnProperty(i)) {
                  var r = t[i];
                  if (r) try {
                    r.callback.call(r.scope, n)
                  } catch (e) {
                    var o = l.onListenerException;
                    if (U(o)) {
                      l._debug("Invoking listener exception handler", r, e);
                      try {
                        o.call(l, e, r, r.listener, n)
                      } catch (e) {
                        l._info("Exception during execution of listener exception handler", r, e)
                      }
                    } else l._info("Exception during execution of listener", r, n, e)
                  }
                }
          }

          function J(e, n) {
            X(e, n);
            for (var t = e.split("/"), i = t.length - 1, r = i; r > 0; --r) {
              var o = t.slice(0, r).join("/") + "/*";
              r === i && X(o, n), X(o += "*", n)
            }
          }

          function V() {
            null !== T && e.clearTimeout(T), T = null
          }

          function K(n, t) {
            V();
            var i = k.interval + t;
            l._debug("Function scheduled in", i, "ms, interval =", k.interval, "backoff =", _, n), T = e.setTimeout(l, n, i)
          }

          function Z(e, n, i, r) {
            for (var o = 0; o < n.length; ++o) {
              var s = n[o],
                a = s.id;
              b && (s.clientId = b), void 0 !== (s = z(s)) && null !== s ? (s.id = a, n[o] = s) : (delete E[a], n.splice(o--, 1))
            }
            if (0 !== n.length) {
              var d = l.getURL();
              R.appendMessageTypeToURL && (d.match(/\/$/) || (d += "/"), r && (d += r));
              var f = {
                url: d,
                sync: e,
                messages: n,
                onSuccess: function(e) {
                  try {
                    u.call(l, e)
                  } catch (e) {
                    l._info("Exception during handling of messages", e)
                  }
                },
                onFailure: function(e, n, t) {
                  try {
                    var i = l.getTransport();
                    t.connectionType = i ? i.getType() : "unknown", c.call(l, e, n, t)
                  } catch (e) {
                    l._info("Exception during handling of failure", e)
                  }
                }
              };
              l._debug("Send", f), t.send(f, i)
            }
          }

          function $(e) {
            v > 0 || !0 === w ? m.push(e) : Z(!1, [e], !1)
          }

          function Y() {
            _ = 0
          }

          function ee() {
            var e = m;
            m = [], e.length > 0 && Z(!1, e, !1)
          }

          function ne(e) {
            G("connecting"), K(function() {
              ! function() {
                if (!W()) {
                  var e = {
                    id: H(),
                    channel: "/meta/connect",
                    connectionType: t.getType()
                  };
                  I || (e.advice = {
                    timeout: 0
                  }), G("connecting"), l._debug("Connect sent", e), Z(!1, [e], !0, "connect"), G("connected")
                }
              }()
            }, e)
          }

          function te(e) {
            e && (k = l._mixin(!1, {}, R.advice, e), l._debug("New advice", k))
          }

          function ie(e) {
            if (V(), e && t && t.abort(), b = null, G("disconnected"), v = 0, Y(), t = null, L = !1, I = !1, m.length > 0) {
              var n = m;
              m = [], c.call(l, void 0, n, {
                reason: "Disconnected"
              })
            }
          }

          function re(e, n, t) {
            var i = l.onTransportException;
            if (U(i)) {
              l._debug("Invoking transport exception handler", e, n, t);
              try {
                i.call(l, t, e, n)
              } catch (e) {
                l._info("Exception during execution of transport exception handler", e)
              }
            }
          }

          function oe(e, n) {
            U(e) && (n = e, e = void 0), b = null, j(), W() && g.reset(!0), te({}), v = 0, w = !0, s = e, a = n;
            var i = l.getURL(),
              r = g.findTransportTypes("1.0", f, i),
              o = {
                id: H(),
                version: "1.0",
                minimumVersion: "1.0",
                channel: "/meta/handshake",
                supportedConnectionTypes: r,
                advice: {
                  timeout: k.timeout,
                  interval: k.interval
                }
              },
              u = l._mixin(!1, {}, s, o);
            if (l._putCallback(u.id, n), !t && !(t = g.negotiateTransport(r, "1.0", f, i))) {
              var c = "Could not find initial transport among: " + g.getTransportTypes();
              throw l._warn(c), c
            }
            l._debug("Initial transport is", t.getType()), G("handshaking"), l._debug("Handshake sent", u), Z(!1, [u], !1, "handshake")
          }

          function se(e, n) {
            try {
              e.call(l, n)
            } catch (e) {
              var t = l.onCallbackException;
              if (U(t)) {
                l._debug("Invoking callback exception handler", e);
                try {
                  t.call(l, e, n)
                } catch (e) {
                  l._info("Exception during execution of callback exception handler", e)
                }
              } else l._info("Exception during execution of message callback", e)
            }
          }

          function ae(e) {
            var n = l._getCallback([e.id]);
            U(n) && (delete E[e.id], se(n, e))
          }

          function ue(n) {
            var t = S[n.id];
            if (delete S[n.id], t) {
              l._debug("Handling remote call response for", n, "with context", t);
              var i = t.timeout;
              i && e.clearTimeout(i);
              var r = t.callback;
              if (U(r)) return se(r, n), !0
            }
            return !1
          }

          function ce(e) {
            l._debug("Transport failure handling", e), e.transport && (t = e.transport), e.url && t.setURL(e.url);
            var n = e.action,
              i = e.delay || 0;
            switch (n) {
              case "handshake":
                ! function(e) {
                  G("handshaking"), w = !0, K(function() {
                    oe(s, a)
                  }, e)
                }(i);
                break;
              case "retry":
                ne(i);
                break;
              case "none":
                ie(!0);
                break;
              default:
                throw "Unknown action " + n
            }
          }

          function le(e, n) {
            ae(e), J("/meta/handshake", e), J("/meta/unsuccessful", e), W() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function de(e) {
            le(e, {
              cause: "failure",
              action: "handshake",
              transport: null
            })
          }

          function fe(e, n) {
            J("/meta/connect", e), J("/meta/unsuccessful", e), W() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function ge(e) {
            I = !1, fe(e, {
              cause: "failure",
              action: "retry",
              transport: null
            })
          }

          function he(e) {
            ie(!0), ae(e), J("/meta/disconnect", e), J("/meta/unsuccessful", e)
          }

          function pe(e) {
            he(e)
          }

          function be(e) {
            var n = C[e.subscription];
            if (n)
              for (var t in n)
                if (n.hasOwnProperty(t)) {
                  var i = n[t];
                  i && !i.listener && (delete n[t], l._debug("Removed failed subscription", i))
                } ae(e), J("/meta/subscribe", e), J("/meta/unsuccessful", e)
          }

          function ve(e) {
            be(e)
          }

          function me(e) {
            ae(e), J("/meta/unsubscribe", e), J("/meta/unsuccessful", e)
          }

          function we(e) {
            me(e)
          }

          function ye(e) {
            ue(e) || (ae(e), J("/meta/publish", e), J("/meta/unsuccessful", e))
          }

          function Ce(e) {
            ye(e)
          }

          function _e(e) {
            if (O = 0, void 0 !== (e = function(e) {
                for (var n = 0; n < x.length && void 0 !== e && null !== e; ++n) {
                  var t = x[n],
                    i = t.extension.incoming;
                  if (U(i)) {
                    var r = Q(t.extension, i, t.name, e, !1);
                    e = void 0 === r ? e : r
                  }
                }
                return e
              }(e)) && null !== e) switch (te(e.advice), e.channel) {
              case "/meta/handshake":
                ! function(e) {
                  var n = l.getURL();
                  if (e.successful) {
                    var i = l._isCrossDomain(P(n)[2]),
                      r = g.negotiateTransport(e.supportedConnectionTypes, e.version, i, n);
                    if (null === r) return e.successful = !1, void le(e, {
                      cause: "negotiation",
                      action: "none",
                      transport: null
                    });
                    t !== r && (l._debug("Transport", t.getType(), "->", r.getType()), t = r), b = e.clientId, w = !1, ee(), e.reestablish = L, L = !0, ae(e), J("/meta/handshake", e), N = e["x-messages"] || 0;
                    var o = W() ? "none" : k.reconnect || "retry";
                    switch (o) {
                      case "retry":
                        Y(), 0 === N ? ne(0) : l._debug("Processing", N, "handshake-delivered messages");
                        break;
                      case "none":
                        ie(!0);
                        break;
                      default:
                        throw "Unrecognized advice action " + o
                    }
                  } else le(e, {
                    cause: "unsuccessful",
                    action: k.reconnect || "handshake",
                    transport: t
                  })
                }(e);
                break;
              case "/meta/connect":
                ! function(e) {
                  if (I = e.successful) {
                    J("/meta/connect", e);
                    var n = W() ? "none" : k.reconnect || "retry";
                    switch (n) {
                      case "retry":
                        Y(), ne(_);
                        break;
                      case "none":
                        ie(!1);
                        break;
                      default:
                        throw "Unrecognized advice action " + n
                    }
                  } else fe(e, {
                    cause: "unsuccessful",
                    action: k.reconnect || "retry",
                    transport: t
                  })
                }(e);
                break;
              case "/meta/disconnect":
                ! function(e) {
                  e.successful ? (ie(!1), ae(e), J("/meta/disconnect", e)) : he(e)
                }(e);
                break;
              case "/meta/subscribe":
                ! function(e) {
                  e.successful ? (ae(e), J("/meta/subscribe", e)) : be(e)
                }(e);
                break;
              case "/meta/unsubscribe":
                ! function(e) {
                  e.successful ? (ae(e), J("/meta/unsubscribe", e)) : me(e)
                }(e);
                break;
              default:
                ! function(e) {
                  void 0 !== e.data ? ue(e) || (J(e.channel, e), N > 0 && 0 == --N && (l._debug("Processed last handshake-delivered message"), ne(0))) : void 0 === e.successful ? l._warn("Unknown Bayeux Message", e) : e.successful ? (ae(e), J("/meta/publish", e)) : ye(e)
                }(e)
            }
          }

          function Te(e) {
            var n = C[e];
            if (n)
              for (var t in n)
                if (n.hasOwnProperty(t) && n[t]) return !0;
            return !1
          }

          function xe(e, n) {
            var t = {
              scope: e,
              method: n
            };
            if (U(e)) t.scope = void 0, t.method = e;
            else if (D(n)) {
              if (!e) throw "Invalid scope " + e;
              if (t.method = e[n], !U(t.method)) throw "Invalid callback " + n + " for scope " + e
            } else if (!U(n)) throw "Invalid callback " + n;
            return t
          }

          function ke(e, n, t, i) {
            var r = xe(n, t);
            l._debug("Adding", i ? "listener" : "subscription", "on", e, "with scope", r.scope, "and callback", r.method);
            var o = ++y,
              s = {
                id: o,
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              a = C[e];
            return a || (a = {}, C[e] = a), a[o] = s, l._debug("Added", i ? "listener" : "subscription", s), s
          }
          this._mixin = function(e, n, t) {
            for (var i = n || {}, r = 2; r < arguments.length; ++r) {
              var o = arguments[r];
              if (void 0 !== o && null !== o)
                for (var s in o)
                  if (o.hasOwnProperty(s)) {
                    var a = M(o, s),
                      u = M(i, s);
                    if (a === n) continue;
                    if (void 0 === a) continue;
                    if (e && "object" == typeof a && null !== a)
                      if (a instanceof Array) i[s] = this._mixin(e, u instanceof Array ? u : [], a);
                      else {
                        var c = "object" != typeof u || u instanceof Array ? {} : u;
                        i[s] = this._mixin(e, c, a)
                      }
                    else i[s] = a
                  }
            }
            return i
          }, this._warn = function() {
            F("warn", arguments)
          }, this._info = function() {
            "warn" !== R.logLevel && F("info", arguments)
          }, this._debug = function() {
            "debug" === R.logLevel && F("debug", arguments)
          }, this._isCrossDomain = function(e) {
            return !!(window.location && window.location.host && e) && e !== window.location.host
          }, this.send = $, this._getCallback = function(e) {
            return E[e]
          }, this._putCallback = function(e, n) {
            var t = this._getCallback(e);
            return U(n) && (E[e] = n), t
          }, this.onTransportFailure = function(e, n, i) {
            this._debug("Transport failure", n, "for", e);
            var r = this.getTransportRegistry(),
              o = this.getURL(),
              s = this._isCrossDomain(P(o)[2]),
              a = r.findTransportTypes("1.0", s, o);
            if ("none" === n.action) {
              if ("/meta/handshake" === e.channel && !n.transport) {
                var u = "Could not negotiate transport, client=[" + a + "], server=[" + e.supportedConnectionTypes + "]";
                this._warn(u), re(t.getType(), null, {
                  reason: u,
                  connectionType: t.getType(),
                  transport: t
                })
              }
            } else if (n.delay = this.getBackoffPeriod(), "/meta/handshake" === e.channel) {
              if (!n.transport) {
                var c = r.negotiateTransport(a, "1.0", s, o);
                c ? (this._debug("Transport", t.getType(), "->", c.getType()), re(t.getType(), c.getType(), e.failure), n.action = "handshake", n.transport = c) : (this._warn("Could not negotiate transport, client=[" + a + "]"), re(t.getType(), null, e.failure), n.action = "none")
              }
              "none" !== n.action && this.increaseBackoffPeriod()
            } else {
              var d = (new Date).getTime();
              if (0 === O && (O = d), "retry" === n.action) {
                n.delay = this.increaseBackoffPeriod();
                var f = k.maxInterval;
                if (f > 0) {
                  var g = k.timeout + k.interval + f;
                  d - O + _ > g && (n.action = "handshake")
                }
              }
              "handshake" === n.action && (n.delay = 0, r.reset(!1), this.resetBackoffPeriod())
            }
            i.call(l, n)
          }, this.receive = _e, u = function(e) {
            l._debug("Received", e);
            for (var n = 0; n < e.length; ++n) _e(e[n])
          }, c = function(e, n, t) {
            l._debug("handleFailure", e, n, t), t.transport = e;
            for (var i = 0; i < n.length; ++i) {
              var r = n[i],
                o = {
                  id: r.id,
                  successful: !1,
                  channel: r.channel,
                  failure: t
                };
              switch (t.message = r, r.channel) {
                case "/meta/handshake":
                  de(o);
                  break;
                case "/meta/connect":
                  ge(o);
                  break;
                case "/meta/disconnect":
                  pe(o);
                  break;
                case "/meta/subscribe":
                  o.subscription = r.subscription, ve(o);
                  break;
                case "/meta/unsubscribe":
                  o.subscription = r.subscription, we(o);
                  break;
                default:
                  Ce(o)
              }
            }
          }, this.registerTransport = function(e, n, t) {
            var i = g.add(e, n, t);
            return i && (this._debug("Registered transport", e), U(n.registered) && n.registered(e, this)), i
          }, this.unregisterTransport = function(e) {
            var n = g.remove(e);
            return null !== n && (this._debug("Unregistered transport", e), U(n.unregistered) && n.unregistered()), n
          }, this.unregisterTransports = function() {
            g.clear()
          }, this.getTransportTypes = function() {
            return g.getTransportTypes()
          }, this.findTransport = function(e) {
            return g.find(e)
          }, this.getTransportRegistry = function() {
            return g
          }, this.configure = function(e) {
            (function(e) {
              l._debug("Configuring cometd object with", e), D(e) && (e = {
                url: e
              }), e || (e = {}), R = l._mixin(!1, R, e);
              var n = l.getURL();
              if (!n) throw "Missing required configuration parameter 'url' specifying the Bayeux server URL";
              var t = P(n),
                i = t[2],
                r = t[8],
                o = t[9];
              if (f = l._isCrossDomain(i), R.appendMessageTypeToURL)
                if (void 0 !== o && o.length > 0) l._info("Appending message type to URI " + r + o + " is not supported, disabling 'appendMessageTypeToURL' configuration"), R.appendMessageTypeToURL = !1;
                else {
                  var s = r.split("/"),
                    a = s.length - 1;
                  r.match(/\/$/) && (a -= 1), s[a].indexOf(".") >= 0 && (l._info("Appending message type to URI " + r + " is not supported, disabling 'appendMessageTypeToURL' configuration"), R.appendMessageTypeToURL = !1)
                }
            }).call(this, e)
          }, this.init = function(e, n) {
            this.configure(e), this.handshake(n)
          }, this.handshake = function(e, n) {
            if ("disconnected" !== h) throw "Illegal state: handshaken";
            oe(e, n)
          }, this.disconnect = function(e, n, t) {
            if (!W()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), U(n) && (t = n, n = void 0);
              var i = {
                  id: H(),
                  channel: "/meta/disconnect"
                },
                r = this._mixin(!1, {}, n, i);
              l._putCallback(r.id, t), G("disconnecting"), Z(!0 === e, [r], !1, "disconnect")
            }
          }, this.startBatch = function() {
            ++v, l._debug("Starting batch, depth", v)
          }, this.endBatch = function() {
            ! function() {
              if (--v, l._debug("Ending batch, depth", v), v < 0) throw "Calls to startBatch() and endBatch() are not paired";
              0 !== v || W() || w || ee()
            }()
          }, this.batch = function(e, n) {
            var t = xe(e, n);
            this.startBatch();
            try {
              t.method.call(t.scope), this.endBatch()
            } catch (e) {
              throw this._info("Exception during execution of batch", e), this.endBatch(), e
            }
          }, this.addListener = function(e, n, t) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            return ke(e, n, t, !0)
          }, this.removeListener = function(e) {
            if (!(e && e.channel && "id" in e)) throw "Invalid argument: expected subscription, not " + e;
            q(e)
          }, this.clearListeners = function() {
            C = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (W()) throw "Illegal state: disconnected";
            U(n) && (r = i, i = t, t = n, n = void 0), U(i) && (r = i, i = void 0);
            var o = !Te(e),
              s = ke(e, n, t, !1);
            if (o) {
              var a = {
                  id: H(),
                  channel: "/meta/subscribe",
                  subscription: e
                },
                u = this._mixin(!1, {}, i, a);
              l._putCallback(u.id, r), $(u)
            }
            return s
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (W()) throw "Illegal state: disconnected";
            U(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!Te(i)) {
              var r = {
                  id: H(),
                  channel: "/meta/unsubscribe",
                  subscription: i
                },
                o = this._mixin(!1, {}, n, r);
              l._putCallback(o.id, t), $(o)
            }
          }, this.resubscribe = function(e, n) {
            if (B(e), e) return this.subscribe(e.channel, e.scope, e.callback, n)
          }, this.clearSubscriptions = function() {
            j()
          }, this.publish = function(e, n, t, i) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (/^\/meta\//.test(e)) throw "Illegal argument: cannot publish to meta channels";
            if (W()) throw "Illegal state: disconnected";
            U(n) ? (i = n, n = {}, t = void 0) : U(t) && (i = t, t = void 0);
            var r = {
                id: H(),
                channel: e,
                data: n
              },
              o = this._mixin(!1, {}, t, r);
            l._putCallback(o.id, i), $(o)
          }, this.publishBinary = function(e, n, t, i, r) {
            U(n) ? (r = n, n = new ArrayBuffer(0), t = !0, i = void 0) : U(t) ? (r = t, t = !0, i = void 0) : U(i) && (r = i, i = void 0);
            var o = {
              meta: i,
              data: n,
              last: t
            };
            this.publish(e, o, {
              ext: {
                binary: {}
              }
            }, r)
          }, this.remoteCall = function(n, t, i, r, o) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!D(n)) throw "Illegal argument type: target must be a string";
            if (W()) throw "Illegal state: disconnected";
            if (U(t) ? (o = t, t = {}, i = R.maxNetworkDelay, r = void 0) : U(i) ? (o = i, i = R.maxNetworkDelay, r = void 0) : U(r) && (o = r, r = void 0), "number" != typeof i) throw "Illegal argument type: timeout must be a number";
            n.match(/^\//) || (n = "/" + n);
            var s = "/service" + n,
              a = {
                id: H(),
                channel: s,
                data: t
              },
              u = this._mixin(!1, {}, r, a),
              c = {
                callback: o
              };
            i > 0 && (c.timeout = e.setTimeout(l, function() {
              l._debug("Timing out remote call", u, "after", i, "ms"), ye({
                id: u.id,
                error: "406::timeout",
                successful: !1,
                failure: {
                  message: u,
                  reason: "Remote Call Timeout"
                }
              })
            }, i), l._debug("Scheduled remote call timeout", u, "in", i, "ms")), S[u.id] = c, $(u)
          }, this.remoteCallBinary = function(e, n, t, i, r, o) {
            U(n) ? (o = n, n = new ArrayBuffer(0), t = !0, i = void 0, r = R.maxNetworkDelay) : U(t) ? (o = t, t = !0, i = void 0, r = R.maxNetworkDelay) : U(i) ? (o = i, i = void 0, r = R.maxNetworkDelay) : U(r) && (o = r, r = R.maxNetworkDelay);
            var s = {
              meta: i,
              data: n,
              last: t
            };
            this.remoteCall(e, s, r, {
              ext: {
                binary: {}
              }
            }, o)
          }, this.getStatus = function() {
            return h
          }, this.isDisconnected = W, this.setBackoffIncrement = function(e) {
            R.backoffIncrement = e
          }, this.getBackoffIncrement = function() {
            return R.backoffIncrement
          }, this.getBackoffPeriod = function() {
            return _
          }, this.increaseBackoffPeriod = function() {
            return _ < R.maxBackoff && (_ += R.backoffIncrement), _
          }, this.resetBackoffPeriod = function() {
            Y()
          }, this.setLogLevel = function(e) {
            R.logLevel = e
          }, this.registerExtension = function(e, n) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: extension name must be a string";
            for (var t = !1, i = 0; i < x.length; ++i)
              if (x[i].name === e) {
                t = !0;
                break
              } return t ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (x.push({
              name: e,
              extension: n
            }), this._debug("Registered extension", e), U(n.registered) && n.registered(e, this), !0)
          }, this.unregisterExtension = function(e) {
            if (!D(e)) throw "Illegal argument type: extension name must be a string";
            for (var n = !1, t = 0; t < x.length; ++t) {
              var i = x[t];
              if (i.name === e) {
                x.splice(t, 1), n = !0, this._debug("Unregistered extension", e);
                var r = i.extension;
                U(r.unregistered) && r.unregistered();
                break
              }
            }
            return n
          }, this.getExtension = function(e) {
            for (var n = 0; n < x.length; ++n) {
              var t = x[n];
              if (t.name === e) return t.extension
            }
            return null
          }, this.getName = function() {
            return d
          }, this.getClientId = function() {
            return b
          }, this.getURL = function() {
            if (t) {
              var e = t.getURL();
              if (e) return e;
              if (e = R.urls[t.getType()]) return e
            }
            return R.url
          }, this.getTransport = function() {
            return t
          }, this.getConfiguration = function() {
            return this._mixin(!0, {}, R)
          }, this.getAdvice = function() {
            return this._mixin(!0, {}, k)
          }, window.WebSocket && this.registerTransport("websocket", new o), this.registerTransport("long-polling", new i), this.registerTransport("callback-polling", new r)
        },
        Transport: n,
        RequestTransport: t,
        LongPollingTransport: i,
        CallbackPollingTransport: r,
        WebSocketTransport: o,
        Utils: e,
        Z85: {
          encode: function(e) {
            var n = null;
            if (e instanceof ArrayBuffer ? n = e : e.buffer instanceof ArrayBuffer ? n = e.buffer : Array.isArray(e) && (n = new Uint8Array(e).buffer), null == n) throw "Cannot Z85 encode " + e;
            for (var t = n.byteLength, i = t % 4, r = 4 - (0 === i ? 4 : i), o = new DataView(n), a = "", u = 0, c = 0; c < t + r; ++c) {
              var l = c >= t;
              if (u = 256 * u + (l ? 0 : o.getUint8(c)), (c + 1) % 4 == 0) {
                for (var d = 52200625, f = 5; f > 0; --f) {
                  if (!l || f > r) {
                    var g = Math.floor(u / d) % 85;
                    a += s[g]
                  }
                  d /= 85
                }
                u = 0
              }
            }
            return a
          },
          decode: function(e) {
            for (var n = e.length % 5, t = 5 - (0 === n ? 5 : n), i = 0; i < t; ++i) e += s[s.length - 1];
            for (var r = e.length, o = new ArrayBuffer(4 * r / 5 - t), u = new DataView(o), c = 0, l = 0, d = 0, f = 0; f < r; ++f) {
              var g = e.charCodeAt(l++) - 32;
              if (c = 85 * c + a[g], l % 5 == 0) {
                for (var h = 16777216; h >= 1;) d < u.byteLength && u.setUint8(d++, Math.floor(c / h) % 256), h /= 256;
                c = 0
              }
            }
            return o
          }
        }
      }
    }, e.exports = i()
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(0),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };
    n.default = function() {
      var e = new o.default("amb.GraphQLSubscriptionExtension"),
        n = {};
      this.isGraphQLChannel = function(e) {
        return e && e.startsWith("/rw/graphql")
      }, this.addGraphQLChannel = function(e, t) {
        n[e] = t
      }, this.removeGraphQLChannel = function(e) {
        delete n[e]
      }, this.getGraphQLSubscriptions = function() {
        return n
      }, this.outgoing = function(t) {
        return "/meta/subscribe" === t.channel && this.isGraphQLChannel(t.subscription) && (t.ext || (t.ext = {}), n[t.subscription] && (e.debug("Subscribing with GraphQL subscription:" + n[t.subscription]), t.ext.serializedGraphQLSubscription = n[t.subscription])), t
      }
    }
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i, r = t(7),
      o = (i = r) && i.__esModule ? i : {
        default: i
      };

    function s(e) {
      return e.MSInputMethodContext && e.document.documentMode
    }

    function a(e, n) {
      if (void 0 !== e.getClientWindow && e.getClientWindow() === n) return e;
      var t = function(e, n) {
        for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
        return e
      }({}, e);
      return t.getChannel = function(t, i, r) {
        return e.getChannel(t, i, r || n)
      }, t.subscribeToEvent = function(t, i, r) {
        return e.subscribeToEvent(t, i, r || n)
      }, t.unsubscribeFromEvent = function(t, i) {
        return e.unsubscribeFromEvent(t, i || n)
      }, t.getClientWindow = function() {
        return n
      }, t
    }
    n.default = function() {
      var e = function(e) {
        try {
          if (!s(e))
            for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
          if (e.g_ambClient) return e.g_ambClient
        } catch (e) {
          console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
        }
        return null
      }(window);
      e || function(e) {
        var n = window.self;
        n.g_ambClient = e, n.addEventListener("unload", function() {
          n.g_ambClient.disconnect()
        }), "complete" === (n.document ? n.document.readyState : null) ? i() : n.addEventListener("load", i), setTimeout(i, 1e4);
        var t = !1;

        function i() {
          t || (t = !0, n.g_ambClient.connect())
        }
      }(e = a(function(e) {
        return n = new o.default, t = function() {
          var e = [];

          function n(e, n, i) {
            if (e && i) {
              var r = t(e);
              if (r)
                for (var o = r.subscriptions, s = o.length - 1; s >= 0; s--) o[s].id === n && o[s].callback === i && o.splice(s, 1)
            }
          }

          function t(n) {
            for (var t = 0, i = e.length; t < i; t++)
              if (e[t].window === n) return e[t];
            return null
          }

          function i(n) {
            var t = {
              window: n,
              onUnload: function() {
                t.unloading = !0;
                for (var n = t.subscriptions, i = void 0; i = n.pop();) i.unsubscribe();
                ! function(n) {
                  for (var t = 0, i = e.length; t < i; t++)
                    if (e[t].window === n.window) {
                      e.splice(t, 1);
                      break
                    } n.subscriptions = [], n.window.removeEventListener("unload", n.onUnload), n.onUnload = null, n.window = null
                }(t)
              },
              unloading: !1,
              subscriptions: []
            };
            return n.addEventListener("unload", t.onUnload), e.push(t), t
          }
          return {
            add: function(e, r, o, s) {
              if (e && o && s) {
                n(e, r, o);
                var a = t(e);
                a || (a = i(e)), a.unloading || a.subscriptions.push({
                  id: r,
                  callback: o,
                  unsubscribe: s
                })
              }
            },
            remove: n
          }
        }(), i = n.getServerConnection(), e && i.setLoginWindowEnabled(!1), {
          getServerConnection: function() {
            return i
          },
          connect: function() {
            n.connect()
          },
          abort: function() {
            n.abort()
          },
          disconnect: function() {
            n.disconnect()
          },
          getConnectionState: function() {
            return n.getConnectionState()
          },
          getState: function() {
            return n.getConnectionState()
          },
          getClientId: function() {
            return n.getClientId()
          },
          getChannel: function(e, i, r) {
            var o = n.getChannel(e, i),
              s = o.subscribe,
              a = o.unsubscribe;
            return r = r || window, o.subscribe = function(i) {
              return t.add(r, o, i, function() {
                o.unsubscribe(i)
              }), r.addEventListener("unload", function() {
                n.removeChannel(e)
              }), s.call(o, i), o
            }, o.unsubscribe = function(e) {
              return t.remove(r, o, e), a.call(o, e)
            }, o
          },
          getChannel0: function(e, t) {
            return n.getChannel(e, t)
          },
          registerExtension: function(e, t) {
            n.registerExtension(e, t)
          },
          unregisterExtension: function(e) {
            n.unregisterExtension(e)
          },
          batch: function(e) {
            n.batch(e)
          },
          subscribeToEvent: function(e, i, r) {
            r = r || window;
            var o = n.subscribeToEvent(e, i);
            return t.add(r, o, !0, function() {
              n.unsubscribeFromEvent(o)
            }), o
          },
          unsubscribeFromEvent: function(e, i) {
            i = i || window, t.remove(i, e, !0), n.unsubscribeFromEvent(e)
          },
          isLoggedIn: function() {
            return n.isLoggedIn()
          },
          getConnectionEvents: function() {
            return n.getConnectionEvents()
          },
          getEvents: function() {
            return n.getConnectionEvents()
          },
          loginComplete: function() {
            n.loginComplete()
          },
          getChannels: function() {
            return n.getChannels()
          }
        };
        var n, t, i
      }(s(window) && null !== window.frameElement), window));
      return a(e, window)
    }
  }])
});
amb.getClient();;
/*! RESOURCE: /scripts/app.ng.amb/app.ng.amb.js */
angular.module("ng.amb", ['sn.common.presence', 'sn.common.util'])
  .value("ambLogLevel", 'info')
  .value("ambServletURI", '/amb')
  .value("cometd", angular.element.cometd)
  .value("ambLoginWindow", 'true');;
/*! RESOURCE: /scripts/app.ng.amb/service.AMB.js */
angular.module("ng.amb").service("amb", function(AMBOverlay, $window, $q, $log, $rootScope, $timeout) {
  "use strict";
  var ambClient = null;
  var _window = $window.self;
  var loginWindow = null;
  var sameScope = false;
  ambClient = amb.getClient();
  if (_window.g_ambClient) {
    sameScope = true;
  }
  if (sameScope) {
    var serverConnection = ambClient.getServerConnection();
    serverConnection.loginShow = function() {
      if (!serverConnection.isLoginWindowEnabled())
        return;
      if (loginWindow && loginWindow.isVisible())
        return;
      if (serverConnection.isLoginWindowOverride())
        return;
      loginWindow = new AMBOverlay();
      loginWindow.render();
      loginWindow.show();
    };
    serverConnection.loginHide = function() {
      if (!loginWindow)
        return;
      loginWindow.hide();
      loginWindow.destroy();
      loginWindow = null;
    }
  }
  var AUTO_CONNECT_TIMEOUT = 20 * 1000;
  var connected = $q.defer();
  var connectionInterrupted = false;
  var monitorAMB = false;
  $timeout(startMonitoringAMB, AUTO_CONNECT_TIMEOUT);
  connected.promise.then(startMonitoringAMB);

  function startMonitoringAMB() {
    monitorAMB = true;
  }

  function ambInterrupted() {
    var state = ambClient.getState();
    return monitorAMB && state !== "opened" && state !== "initialized"
  }
  var interruptionTimeout;
  var extendedInterruption = false;

  function setInterrupted(eventName) {
    connectionInterrupted = true;
    $rootScope.$broadcast(eventName);
    if (!interruptionTimeout) {
      interruptionTimeout = $timeout(function() {
        extendedInterruption = true;
      }, 30 * 1000)
    }
    connected = $q.defer();
  }
  var connectOpenedEventId = ambClient.subscribeToEvent("connection.opened", function() {
    $rootScope.$broadcast("amb.connection.opened");
    if (interruptionTimeout) {
      $timeout.cancel(interruptionTimeout);
      interruptionTimeout = null;
    }
    extendedInterruption = false;
    if (connectionInterrupted) {
      connectionInterrupted = false;
      $rootScope.$broadcast("amb.connection.recovered");
    }
    connected.resolve();
  });
  var connectClosedEventId = ambClient.subscribeToEvent("connection.closed", function() {
    setInterrupted("amb.connection.closed");
  });
  var connectBrokenEventId = ambClient.subscribeToEvent("connection.broken", function() {
    setInterrupted("amb.connection.broken");
  });
  var onUnloadWindow = function() {
    ambClient.unsubscribeFromEvent(connectOpenedEventId);
    ambClient.unsubscribeFromEvent(connectClosedEventId);
    ambClient.unsubscribeFromEvent(connectBrokenEventId);
    angular.element($window).off('unload', onUnloadWindow);
  };
  angular.element($window).on('unload', onUnloadWindow);
  var documentReadyState = $window.document ? $window.document.readyState : null;
  if (documentReadyState === 'complete') {
    autoConnect();
  } else {
    angular.element($window).on('load', autoConnect);
  }
  $timeout(autoConnect, 10000);
  var initiatedConnection = false;

  function autoConnect() {
    if (!initiatedConnection) {
      initiatedConnection = true;
      ambClient.connect();
    }
  }
  return {
    getServerConnection: function() {
      return ambClient.getServerConnection();
    },
    connect: function() {
      if (initiatedConnection) {
        ambClient.connect();
      }
      return connected.promise;
    },
    get interrupted() {
      return ambInterrupted();
    },
    get extendedInterruption() {
      return extendedInterruption;
    },
    get connected() {
      return connected.promise;
    },
    abort: function() {
      ambClient.abort();
    },
    disconnect: function() {
      ambClient.disconnect();
    },
    getConnectionState: function() {
      return ambClient.getConnectionState();
    },
    getClientId: function() {
      return ambClient.getClientId();
    },
    getChannel: function(channelName) {
      return ambClient.getChannel(channelName);
    },
    registerExtension: function(extensionName, extension) {
      ambClient.registerExtension(extensionName, extension);
    },
    unregisterExtension: function(extensionName) {
      ambClient.unregisterExtension(extensionName);
    },
    batch: function(batch) {
      ambClient.batch(batch);
    },
    getState: function() {
      return ambClient.getState();
    },
    getFilterString: function(filter) {
      filter = filter.
      replace(/\^EQ/g, '').
      replace(/\^ORDERBY(?:DESC)?[^^]*/g, '').
      replace(/^GOTO/, '');
      return btoa(filter).replace(/=/g, '-');
    },
    getChannelRW: function(table, filter) {
      var t = '/rw/default/' + table + '/' + this.getFilterString(filter);
      return this.getChannel(t);
    },
    isLoggedIn: function() {
      return ambClient.isLoggedIn();
    },
    subscribeToEvent: function(event, callback) {
      return ambClient.subscribeToEvent(event, callback);
    },
    getConnectionEvents: function() {
      return ambClient.getConnectionEvents();
    },
    getEvents: function() {
      return ambClient.getConnectionEvents();
    },
    loginComplete: function() {
      ambClient.loginComplete();
    }
  };
});;
/*! RESOURCE: /scripts/app.ng.amb/controller.AMBRecordWatcher.js */
angular.module("ng.amb").controller("AMBRecordWatcher", function($scope, $timeout, $window) {
  "use strict";
  var amb = $window.top.g_ambClient;
  $scope.messages = [];
  var lastFilter;
  var watcherChannel;
  var watcher;

  function onMessage(message) {
    $scope.messages.push(message.data);
  }
  $scope.getState = function() {
    return amb.getState();
  };
  $scope.initWatcher = function() {
    angular.element(":focus").blur();
    if (!$scope.filter || $scope.filter === lastFilter)
      return;
    lastFilter = $scope.filter;
    console.log("initiating watcher on " + $scope.filter);
    $scope.messages = [];
    if (watcher) {
      watcher.unsubscribe();
    }
    var base64EncodeQuery = btoa($scope.filter).replace(/=/g, '-');
    var channelId = '/rw/' + base64EncodeQuery;
    watcherChannel = amb.getChannel(channelId)
    watcher = watcherChannel.subscribe(onMessage);
  };
  amb.connect();
});
/*! RESOURCE: /scripts/app.ng.amb/factory.snRecordWatcher.js */
angular.module("ng.amb").factory('snRecordWatcher', function($rootScope, amb, $timeout, snPresence, $log, urlTools) {
  "use strict";
  var watcherChannel;
  var connected = false;
  var diagnosticLog = true;

  function initWatcher(table, sys_id, query) {
    if (!table)
      return;
    if (sys_id)
      var filter = "sys_id=" + sys_id;
    else
      filter = query;
    if (!filter)
      return;
    return initChannel(table, filter);
  }

  function initList(table, query) {
    if (!table)
      return;
    query = query || "sys_idISNOTEMPTY";
    return initChannel(table, query);
  }

  function initTaskList(list, prevChannel) {
    if (prevChannel)
      prevChannel.unsubscribe();
    var sys_ids = list.toString();
    var filter = "sys_idIN" + sys_ids;
    return initChannel("task", filter);
  }

  function initChannel(table, filter) {
    if (isBlockedTable(table)) {
      $log.log("Blocked from watching", table);
      return null;
    }
    if (diagnosticLog)
      log(">>> init " + table + "?" + filter);
    watcherChannel = amb.getChannelRW(table, filter);
    watcherChannel.subscribe(onMessage);
    amb.connect();
    return watcherChannel;
  }

  function onMessage(message) {
    var r = message.data;
    var c = message.channel;
    if (diagnosticLog)
      log(">>> record " + r.operation + ": " + r.table_name + "." + r.sys_id + " " + r.display_value);
    $rootScope.$broadcast('record.updated', r);
    $rootScope.$broadcast("sn.stream.tap");
    $rootScope.$broadcast('list.updated', r, c);
  }

  function log(message) {
    $log.log(message);
  }

  function isBlockedTable(table) {
    return table == 'sys_amb_message' || table.startsWith('sys_rw');
  }
  return {
    initTaskList: initTaskList,
    initChannel: initChannel,
    init: function() {
      var location = urlTools.parseQueryString(window.location.search);
      var table = location['table'] || location['sysparm_table'];
      var sys_id = location['sys_id'] || location['sysparm_sys_id'];
      var query = location['sysparm_query'];
      initWatcher(table, sys_id, query);
      snPresence.init(table, sys_id, query);
    },
    initList: initList,
    initRecord: function(table, sysId) {
      initWatcher(table, sysId, null);
      snPresence.initPresence(table, sysId);
    },
    _initWatcher: initWatcher
  }
});;
/*! RESOURCE: /scripts/app.ng.amb/factory.AMBOverlay.js */
angular.module("ng.amb").factory("AMBOverlay", function($templateCache, $compile, $rootScope) {
  "use strict";
  var showCallbacks = [],
    hideCallbacks = [],
    isRendered = false,
    modal,
    modalScope,
    modalOptions;
  var defaults = {
    backdrop: 'static',
    keyboard: false,
    show: true
  };

  function AMBOverlay(config) {
    config = config || {};
    if (angular.isFunction(config.onShow))
      showCallbacks.push(config.onShow);
    if (angular.isFunction(config.onHide))
      hideCallbacks.push(config.onHide);

    function lazyRender() {
      if (!angular.element('html')['modal']) {
        var bootstrapInclude = "/scripts/bootstrap3/bootstrap.js";
        ScriptLoader.getScripts([bootstrapInclude], renderModal);
      } else
        renderModal();
    }

    function renderModal() {
      if (isRendered)
        return;
      modalScope = angular.extend($rootScope.$new(), config);
      modal = $compile($templateCache.get("amb_disconnect_modal.xml"))(modalScope);
      angular.element("body").append(modal);
      modal.on("shown.bs.modal", function(e) {
        for (var i = 0, len = showCallbacks.length; i < len; i++)
          showCallbacks[i](e);
      });
      modal.on("hidden.bs.modal", function(e) {
        for (var i = 0, len = hideCallbacks.length; i < len; i++)
          hideCallbacks[i](e);
      });
      modalOptions = angular.extend({}, defaults, config);
      modal.modal(modalOptions);
      isRendered = true;
    }

    function showModal() {
      if (isRendered)
        modal.modal('show');
    }

    function hideModal() {
      if (isRendered)
        modal.modal('hide');
    }

    function destroyModal() {
      if (!isRendered)
        return;
      modal.modal('hide');
      modal.remove();
      modalScope.$destroy();
      modalScope = void(0);
      isRendered = false;
      var pos = showCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        showCallbacks.splice(pos, 1);
      pos = hideCallbacks.indexOf(config.onShow);
      if (pos >= 0)
        hideCallbacks.splice(pos, 1);
    }
    return {
      render: lazyRender,
      destroy: destroyModal,
      show: showModal,
      hide: hideModal,
      isVisible: function() {
        if (!isRendered)
          false;
        return modal.visible();
      }
    }
  }
  $templateCache.put('amb_disconnect_modal.xml',
    '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">' +
    '	<div class="modal-dialog small-modal" style="width:450px">' +
    '		<div class="modal-content">' +
    '			<header class="modal-header">' +
    '				<h4 id="small_modal1_title" class="modal-title">{{title || "Login"}}</h4>' +
    '			</header>' +
    '			<div class="modal-body">' +
    '			<iframe class="concourse_modal" ng-src=\'{{iframe || "/amb_login.do"}}\' frameborder="0" scrolling="no" height="400px" width="405px"></iframe>' +
    '			</div>' +
    '		</div>' +
    '	</div>' +
    '</div>'
  );
  return AMBOverlay;
});;;
/*! RESOURCE: /scripts/sn/common/presence/snPresenceLite.js */
(function(exports, $) {
  'use strict';
  var PRESENCE_DISABLED = "true" === "true";
  if (PRESENCE_DISABLED) {
    return;
  }
  if (typeof $.Deferred === "undefined") {
    return;
  }
  var USER_KEY = '{{SYSID}}';
  var REPLACE_REGEX = new RegExp(USER_KEY, 'g');
  var COLOR_ONLINE = '#71e279';
  var COLOR_AWAY = '#fc8a3d';
  var COLOR_OFFLINE = 'transparent';
  var BASE_STYLES = [
    '.sn-presence-lite { display: inline-block; width: 1rem; height: 1rem; border-radius: 50%; }'
  ];
  var USER_STYLES = [
    '.sn-presence-' + USER_KEY + '-online [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_ONLINE + '; }',
    '.sn-presence-' + USER_KEY + '-away [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_AWAY + '; }',
    '.sn-presence-' + USER_KEY + '-offline [data-presence-id="' + USER_KEY + '"] { background-color: ' + COLOR_OFFLINE + '; }'
  ];
  var $head = $('head');
  var stylesheet = $.Deferred();
  var registeredUsers = {};
  var registeredUsersLength = 0;
  $(function() {
    updateRegisteredUsers();
  });
  $head.ready(function() {
    var styleElement = document.createElement('style');
    $head.append(styleElement);
    var $styleElement = $(styleElement);
    stylesheet.resolve($styleElement);
  });

  function updateStyles(styles) {
    stylesheet.done(function($styleElement) {
      $styleElement.empty();
      BASE_STYLES.forEach(function(baseStyle) {
        $styleElement.append(baseStyle);
      });
      $styleElement.append(styles);
    });
  }

  function getUserStyles(sysId) {
    var newStyles = '';
    for (var i = 0, iM = USER_STYLES.length; i < iM; i++) {
      newStyles += USER_STYLES[i].replace(REPLACE_REGEX, sysId);
    }
    return newStyles;
  }

  function updateUserStyles() {
    var userKeys = Object.keys(registeredUsers);
    var userStyles = "";
    userKeys.forEach(function(userKey) {
      userStyles += getUserStyles(userKey);
    });
    updateStyles(userStyles);
  }
  exports.applyPresenceArray = applyPresenceArray;

  function applyPresenceArray(presenceArray) {
    if (!presenceArray || !presenceArray.length) {
      return;
    }
    var users = presenceArray.filter(function(presence) {
      return typeof registeredUsers[presence.user] !== "undefined";
    });
    updateUserPresenceStatus(users);
  }

  function updateUserPresenceStatus(users) {
    var presenceStatus = getBaseCSSClasses();
    for (var i = 0, iM = users.length; i < iM; i++) {
      var presence = users[i];
      var status = getNormalizedStatus(presence.status);
      if (status === 'offline') {
        continue;
      }
      presenceStatus.push('sn-presence-' + presence.user + '-' + status);
    }
    setCSSClasses(presenceStatus.join(' '));
  }

  function getNormalizedStatus(status) {
    switch (status) {
      case 'probably offline':
      case 'maybe offline':
        return 'away';
      default:
        return 'offline';
      case 'online':
      case 'offline':
        return status;
    }
  }

  function updateRegisteredUsers() {
    var presenceIndicators = document.querySelectorAll('[data-presence-id]');
    var obj = {};
    for (var i = 0, iM = presenceIndicators.length; i < iM; i++) {
      var uid = presenceIndicators[i].getAttribute('data-presence-id');
      obj[uid] = true;
    }
    if (Object.keys(obj).length === registeredUsersLength) {
      return;
    }
    registeredUsers = obj;
    registeredUsersLength = Object.keys(registeredUsers).length;
    updateUserStyles();
  }

  function setCSSClasses(classes) {
    $('html')[0].className = classes;
  }

  function getBaseCSSClasses() {
    return $('html')[0].className.split(' ').filter(function(item) {
      return item.indexOf('sn-presence-') !== 0;
    });
  }
})(window, window.jQuery || window.Zepto);;
/*! RESOURCE: /scripts/sn/common/presence/_module.js */
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide', 'sn.common.auth']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "true" === "true");
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snPresence.js */
angular.module("sn.common.presence").factory('snPresence', function($rootScope, $window, $log, amb, $timeout, $http, snRecordPresence, snTabActivity, urlTools, PRESENCE_DISABLED) {
  "use strict";
  var REST = {
    PRESENCE: "/api/now/ui/presence"
  };
  var RETRY_INTERVAL = ($window.NOW.presence_interval || 15) * 1000;
  var MAX_RETRY_DELAY = RETRY_INTERVAL * 10;
  var initialized = false;
  var primary = false;
  var presenceArray = [];
  var serverTimeMillis;
  var skew = 0;
  var st = 0;

  function init() {
    var location = urlTools.parseQueryString($window.location.search);
    var table = location['table'] || location['sysparm_table'];
    var sys_id = location['sys_id'] || location['sysparm_sys_id'];
    return initPresence(table, sys_id);
  }

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!initialized) {
      initialized = true;
      initRootScopes();
      if (!primary) {
        CustomEvent.observe('sn.presence', onPresenceEvent);
        CustomEvent.fireTop('sn.presence.ping');
      } else {
        presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
        if (presenceArray)
          $timeout(schedulePresence, 100);
        else
          updatePresence();
      }
    }
    return snRecordPresence.initPresence(t, id);
  }

  function onPresenceEvent(parms) {
    presenceArray = parms;
    $timeout(broadcastPresence);
  }

  function initRootScopes() {
    if ($window.NOW.presence_scopes) {
      var ps = $window.NOW.presence_scopes;
      if (ps.indexOf($rootScope) == -1)
        ps.push($rootScope);
    } else {
      $window.NOW.presence_scopes = [$rootScope];
      primary = CustomEvent.isTopWindow();
    }
  }

  function setPresence(data, st) {
    var rt = new Date().getTime() - st;
    if (rt > 500)
      console.log("snPresence response time " + rt + "ms");
    if (data.result && data.result.presenceArray) {
      presenceArray = data.result.presenceArray;
      setLocalPresence(presenceArray);
      serverTimeMillis = data.result.serverTimeMillis;
      skew = new Date().getTime() - serverTimeMillis;
      var t = Math.floor(skew / 1000);
      if (t < -15)
        console.log(">>>>> server ahead " + Math.abs(t) + " seconds");
      else if (t > 15)
        console.log(">>>>> browser time ahead " + t + " seconds");
    }
    schedulePresence();
  }

  function updatePresence(numAttempts) {
    presenceArray = getLocalPresence($window.localStorage.getItem('snPresence'));
    if (presenceArray) {
      determineStatus(presenceArray);
      $timeout(schedulePresence);
      return;
    }
    if (!amb.isLoggedIn() || !snTabActivity.isPrimary) {
      $timeout(schedulePresence);
      return;
    }
    var p = {
      user_agent: navigator.userAgent,
      ua_time: new Date().toISOString(),
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      path: window.location.pathname + window.location.search
    };
    st = new Date().getTime();
    $http.post(REST.PRESENCE + '?sysparm_auto_request=true&cd=' + st, p).success(function(data) {
      setPresence(data, st);
    }).error(function(response, status) {
      console.log("snPresence " + status);
      schedulePresence(numAttempts);
    })
  }

  function schedulePresence(numAttempts) {
    numAttempts = isFinite(numAttempts) ? numAttempts + 1 : 0;
    var interval = getDecayingRetryInterval(numAttempts);
    $timeout(function() {
      updatePresence(numAttempts)
    }, interval);
    determineStatus(presenceArray);
    broadcastPresence();
  }

  function broadcastPresence() {
    if (angular.isDefined($window.applyPresenceArray)) {
      $window.applyPresenceArray(presenceArray);
    }
    $rootScope.$emit("sn.presence", presenceArray);
    if (!primary)
      return;
    CustomEvent.fireAll('sn.presence', presenceArray);
  }

  function determineStatus(presenceArray) {
    if (!presenceArray || !presenceArray.forEach)
      return;
    var t = new Date().getTime();
    t -= skew;
    presenceArray.forEach(function(p) {
      var x = 0 + p.last_on;
      var y = t - x;
      p.status = "online";
      if (y > (5 * RETRY_INTERVAL))
        p.status = "offline";
      else if (y > (3 * RETRY_INTERVAL))
        p.status = "probably offline";
      else if (y > (2.5 * RETRY_INTERVAL))
        p.status = "maybe offline";
    })
  }

  function setLocalPresence(value) {
    var p = {
      saved: new $window.Date().getTime(),
      presenceArray: value
    };
    $window.localStorage.setItem('snPresence', angular.toJson(p));
  }

  function getLocalPresence(p) {
    if (!p)
      return null;
    try {
      p = angular.fromJson(p);
    } catch (e) {
      p = {};
    }
    if (!p.presenceArray)
      return null;
    var now = new Date().getTime();
    if (now - p.saved >= RETRY_INTERVAL)
      return null;
    return p.presenceArray;
  }

  function getDecayingRetryInterval(numAttempts) {
    return Math.min(RETRY_INTERVAL * Math.pow(2, numAttempts), MAX_RETRY_DELAY);
  }
  return {
    init: init,
    initPresence: initPresence,
    _getLocalPresence: getLocalPresence,
    _setLocalPresence: setLocalPresence,
    _determineStatus: determineStatus
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/factory.snRecordPresence.js */
angular.module("sn.common.presence").factory('snRecordPresence', function($rootScope, $location, amb, $timeout, $window, PRESENCE_DISABLED, snTabActivity) {
  "use strict";
  var statChannel;
  var interval = ($window.NOW.record_presence_interval || 20) * 1000;
  var sessions = {};
  var primary = false;
  var currentJournalFieldName = "";
  var prevJournalFieldName = "";
  var table;
  var sys_id;

  function initPresence(t, id) {
    if (PRESENCE_DISABLED)
      return;
    if (!t || !id)
      return;
    if (t == table && id == sys_id)
      return;
    initRootScopes();
    if (!primary)
      return;
    termPresence();
    table = t;
    sys_id = id;
    var recordPresence = "/sn/rp/" + table + "/" + sys_id;
    $rootScope.me = NOW.session_id;
    statChannel = amb.getChannel(recordPresence);
    statChannel.subscribe(onStatus);
    amb.connected.then(function() {
      setStatus("entered");
      $rootScope.status = "viewing";
    });
    return statChannel;
  }

  function initRootScopes() {
    if ($window.NOW.record_presence_scopes) {
      var ps = $window.NOW.record_presence_scopes;
      if (ps.indexOf($rootScope) == -1) {
        ps.push($rootScope);
        CustomEvent.observe('sn.sessions', onPresenceEvent);
      }
    } else {
      $window.NOW.record_presence_scopes = [$rootScope];
      primary = true;
    }
  }

  function onPresenceEvent(sessionsToSend) {
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
  }

  function termPresence() {
    if (!statChannel)
      return;
    statChannel.unsubscribe();
    statChannel = table = sys_id = null;
  }

  function setStatus(status) {
    if (status == $rootScope.status && prevJournalFieldName === currentJournalFieldName)
      return;
    prevJournalFieldName = currentJournalFieldName;
    $rootScope.status = status;
    if (Object.keys(sessions).length == 0)
      return;
    if (getStatusPrecedence(status) > 1)
      return;
    publish($rootScope.status);
  }

  function publish(status) {
    if (!statChannel)
      return;
    if (amb.getState() !== "opened")
      return;
    statChannel.publish({
      presences: [{
        status: status,
        session_id: NOW.session_id,
        user_name: NOW.user_name,
        user_id: NOW.user_id,
        user_display_name: NOW.user_display_name,
        user_initials: NOW.user_initials,
        user_avatar: NOW.user_avatar,
        ua: navigator.userAgent,
        table: table,
        sys_id: sys_id,
        field_type: currentJournalFieldName,
        time: new Date().toString().substring(0, 24)
      }]
    });
  }

  function onStatus(message) {
    message.data.presences.forEach(function(d) {
      if (!d.session_id || d.session_id == NOW.session_id)
        return;
      var s = sessions[d.session_id];
      if (s)
        angular.extend(s, d);
      else
        s = sessions[d.session_id] = d;
      s.lastUpdated = new Date();
      if (s.status == 'exited')
        delete sessions[d.session_id];
    });
    broadcastSessions();
  }

  function broadcastSessions() {
    var sessionsToSend = getUniqueSessions();
    $rootScope.$emit("sn.sessions", sessionsToSend);
    $rootScope.$emit("sp.sessions", sessionsToSend);
    if (primary)
      $timeout(function() {
        CustomEvent.fire('sn.sessions', sessionsToSend);
      })
  }

  function getUniqueSessions() {
    var uniqueSessionsByUser = {};
    var sessionKeys = Object.keys(sessions);
    sessionKeys.forEach(function(key) {
      var session = sessions[key];
      if (session.user_id == NOW.user_id)
        return;
      if (session.user_id in uniqueSessionsByUser) {
        var otherSession = uniqueSessionsByUser[session.user_id];
        var thisPrecedence = getStatusPrecedence(session.status);
        var otherPrecedence = getStatusPrecedence(otherSession.status);
        uniqueSessionsByUser[session.user_id] = thisPrecedence < otherPrecedence ? session : otherSession;
        return
      }
      uniqueSessionsByUser[session.user_id] = session;
    });
    var uniqueSessions = {};
    angular.forEach(uniqueSessionsByUser, function(item) {
      uniqueSessions[item.session_id] = item;
    });
    return uniqueSessions;
  }

  function getStatusPrecedence(status) {
    switch (status) {
      case 'typing':
        return 0;
      case 'viewing':
        return 1;
      case 'entered':
        return 2;
      case 'exited':
      case 'probably left':
        return 4;
      case 'offline':
        return 5;
      default:
        return 3;
    }
  }
  $rootScope.$on("record.typing", function(evt, data) {
    currentJournalFieldName = data.field_type;
    setStatus(data.status);
  });
  var idleTable, idleSysID;
  snTabActivity.onIdle({
    onIdle: function RecordPresenceTabIdle() {
      idleTable = table;
      idleSysID = sys_id;
      sessions = {};
      termPresence();
      broadcastSessions();
    },
    onReturn: function RecordPresenceTabActive() {
      initPresence(idleTable, idleSysID, true);
      idleTable = idleSysID = void(0);
    },
    delay: interval * 4
  });
  return {
    initPresence: initPresence,
    termPresence: termPresence
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snPresence.js */
angular.module('sn.common.presence').directive('snPresence', function(snPresence, $rootScope, $timeout, i18n) {
  'use strict';
  $timeout(snPresence.init, 100);
  var presenceStatus = {};
  i18n.getMessages(['maybe offline', 'probably offline', 'offline', 'online', 'entered', 'viewing'], function(results) {
    presenceStatus.maybe_offline = results['maybe offline'];
    presenceStatus.probably_offline = results['probably offline'];
    presenceStatus.offline = results['offline'];
    presenceStatus.online = results['online'];
    presenceStatus.entered = results['entered'];
    presenceStatus.viewing = results['viewing'];
  });
  var presences = {};
  $rootScope.$on('sn.presence', function(event, presenceArray) {
    if (!presenceArray) {
      angular.forEach(presences, function(p) {
        p.status = "offline";
      });
      return;
    }
    presenceArray.forEach(function(presence) {
      presences[presence.user] = presence;
    });
  });
  return {
    restrict: 'EA',
    replace: false,
    scope: {
      userId: '@?',
      snPresence: '=?',
      user: '=?',
      profile: '=?',
      displayName: '=?'
    },
    link: function(scope, element) {
      if (scope.profile) {
        scope.user = scope.profile.userID;
        scope.profile.tabIndex = -1;
        if (scope.profile.isAccessible)
          scope.profile.tabIndex = 0;
      }
      if (!element.hasClass('presence'))
        element.addClass('presence');

      function updatePresence() {
        var id = scope.snPresence || scope.user;
        if (!angular.isDefined(id) && angular.isDefined(scope.userId)) {
          id = scope.userId;
        }
        if (presences[id]) {
          var status = presences[id].status;
          if (status === 'maybe offline' || status === 'probably offline') {
            element.removeClass('presence-online presence-offline presence-away');
            element.addClass('presence-away');
          } else if (status == "offline" && !element.hasClass('presence-offline')) {
            element.removeClass('presence-online presence-away');
            element.addClass('presence-offline');
          } else if ((status == "online" || status == "entered" || status == "viewing") && !element.hasClass('presence-online')) {
            element.removeClass('presence-offline presence-away');
            element.addClass('presence-online');
          }
          status = status.replace(/ /g, "_");
          if (scope.profile)
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.profile.userName + ' ' + presenceStatus[status]);
          else
            angular.element('div[user-avatar-id="' + id + '"]').attr("aria-label", scope.displayName + ' ' + presenceStatus[status]);
        } else {
          if (!element.hasClass('presence-offline'))
            element.addClass('presence-offline');
        }
      }
      var unbind = $rootScope.$on('sn.presence', updatePresence);
      scope.$on('$destroy', unbind);
      updatePresence();
    }
  };
});;
/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snComposing.xml"),
    replace: true,
    scope: {
      conversation: "="
    },
    controller: function($scope, $element) {
      var child = $element.children();
      if (child && child.tooltip)
        child.tooltip({
          'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
          'placement': 'top',
          'container': 'body'
        });
      $scope.snComposingPresence = snComposingPresence;
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/presence/service.snComposingPresence.js */
angular.module('sn.common.presence').service('snComposingPresence', function(i18n) {
  "use strict";
  var viewing = {};
  var typing = {};
  var allStrings = {};
  var shortStrings = {};
  var typing1 = "{0} is typing",
    typing2 = "{0} and {1} are typing",
    typingMore = "{0}, {1}, and {2} more are typing",
    viewing1 = "{0} is viewing",
    viewing2 = "{0} and {1} are viewing",
    viewingMore = "{0}, {1}, and {2} more are viewing";
  i18n.getMessages(
    [
      typing1,
      typing2,
      typingMore,
      viewing1,
      viewing2,
      viewingMore
    ],
    function(results) {
      typing1 = results[typing1];
      typing2 = results[typing2];
      typingMore = results[typingMore];
      viewing1 = results[viewing1];
      viewing2 = results[viewing2];
      viewingMore = results[viewingMore];
    });

  function set(conversationID, newPresenceValues) {
    if (newPresenceValues.viewing)
      viewing[conversationID] = newPresenceValues.viewing;
    if (newPresenceValues.typing)
      typing[conversationID] = newPresenceValues.typing;
    generateAllString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    generateShortString(conversationID, {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    });
    return {
      viewing: viewing[conversationID],
      typing: typing[conversationID]
    }
  }

  function get(conversationID) {
    return {
      viewing: viewing[conversationID] || [],
      typing: typing[conversationID] || []
    }
  }

  function generateAllString(conversationID, members) {
    var result = "";
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    if (typingLength < 4 && viewingLength < 4)
      return "";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        result += i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      default:
        var allButLastTyper = "";
        for (var i = 0; i < typingLength; i++) {
          if (i < typingLength - 2)
            allButLastTyper += members.typing[i].name + ", ";
          else if (i === typingLength - 2)
            allButLastTyper += members.typing[i].name + ",";
          else
            result += i18n.format(typing2, allButLastTyper, members.typing[i].name);
        }
    }
    if (viewingLength > 0 && typingLength > 0)
      result += "\n\n";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        result += i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        result += i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      default:
        var allButLastViewer = "";
        for (var i = 0; i < viewingLength; i++) {
          if (i < viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ", ";
          else if (i === viewingLength - 2)
            allButLastViewer += members.viewing[i].name + ",";
          else
            result += i18n.format(viewing2, allButLastViewer, members.viewing[i].name);
        }
    }
    allStrings[conversationID] = result;
  }

  function generateShortString(conversationID, members) {
    var typingLength = members.typing.length;
    var viewingLength = members.viewing.length;
    var typingString = "",
      viewingString = "";
    var inBetween = " ";
    switch (typingLength) {
      case 0:
        break;
      case 1:
        typingString = i18n.format(typing1, members.typing[0].name);
        break;
      case 2:
        typingString = i18n.format(typing2, members.typing[0].name, members.typing[1].name);
        break;
      case 3:
        typingString = i18n.format(typing2, members.typing[0].name + ", " + members.typing[1].name + ",", members.typing[2].name);
        break;
      default:
        typingString = i18n.format(typingMore, members.typing[0].name, members.typing[1].name, (typingLength - 2));
    }
    if (viewingLength > 0 && typingLength > 0)
      inBetween = ". ";
    switch (viewingLength) {
      case 0:
        break;
      case 1:
        viewingString = i18n.format(viewing1, members.viewing[0].name);
        break;
      case 2:
        viewingString = i18n.format(viewing2, members.viewing[0].name, members.viewing[1].name);
        break;
      case 3:
        viewingString = i18n.format(viewing2, members.viewing[0].name + ", " + members.viewing[1].name + ",", members.viewing[2].name);
        break;
      default:
        viewingString = i18n.format(viewingMore, members.viewing[0].name, members.viewing[1].name, (viewingLength - 2));
    }
    shortStrings[conversationID] = typingString + inBetween + viewingString;
  }

  function getAllString(conversationID) {
    if ((viewing[conversationID] && viewing[conversationID].length > 3) ||
      (typing[conversationID] && typing[conversationID].length > 3))
      return allStrings[conversationID];
    return "";
  }

  function getShortString(conversationID) {
    return shortStrings[conversationID];
  }

  function remove(conversationID) {
    delete viewing[conversationID];
  }
  return {
    set: set,
    get: get,
    generateAllString: generateAllString,
    getAllString: getAllString,
    generateShortString: generateShortString,
    getShortString: getShortString,
    remove: remove
  }
});;;
/*! RESOURCE: /scripts/sn/common/user_profile/js_includes_user_profile.js */
/*! RESOURCE: /scripts/sn/common/user_profile/_module.js */
angular.module("sn.common.user_profile", ['sn.common.ui']);;
/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http, $injector) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope, element) {
      scope.showDirectMessagePromptFn = function() {
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          return false;
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
            !scope.profile.hasConnectRoles ||
            (scope.profile.document && activeUserID === scope.profile.document));
        } else {
          return false;
        }
      };
      $timeout(function() {
        element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
      }, 0, false);
    },
    controller: function($scope, snConnectService) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
        $scope.$emit("sn-user-profile.ready");
      } else {
        $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
          angular.merge($scope.profile, response.data.result);
          avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
          $scope.$emit("sn-user-profile.ready");
        })
      }
      $scope.openDirectMessageConversation = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $timeout(function() {
          snConnectService.openWithProfile($scope.profile);
        }, 0, false);
        angular.element('.popover').each(function() {
          angular.element('body').off('click.snUserAvatarPopoverClose');
          angular.element(this).popover('hide');
        });
      };
    }
  }
});;;
/*! RESOURCE: /scripts/sn/common/avatar/_module.js */
angular.module('sn.common.avatar', ['sn.common.presence', 'sn.common.messaging', 'sn.common.user_profile']).config(function($provide) {
  $provide.value("liveProfileID", '');
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@",
      nopopover: "=",
      directconversation: '@',
      conversation: '=',
      primaryNonAssign: '=?'
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        if (scope.directconversation) {
          if (scope.directconversation === "true")
            scope.directconversation = true;
          else
            scope.directconversation = false;
          scope.showdirectconversation = !scope.directconversation;
        } else {
          scope.showdirectconversation = true;
        }
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          scope.showdirectconversation = false;
        if (scope.primaryNonAssign) {
          scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
          if (scope.users && scope.users[0])
            scope.users[0] = scope.primary;
        }

        function recompile() {
          if (scope.primaryNonAssign) {
            scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
            if (scope.users && scope.users[0])
              scope.users[0] = scope.primary;
          }
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('primaryNonAssign', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip && scope.nopopover) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
      };
    },
    controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
      $scope.randId = Math.random();
      $scope.loadEvent = 'sn-user-profile.ready';
      $scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
      $scope.popoverConfig = {
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      if ($scope.primaryNonAssign) {
        $scope.primary = angular.extend({}, $scope.primary, $scope.primaryNonAssign);
        if ($scope.users && $scope.users[0])
          $scope.users[0] = $scope.primary;
      }
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          buildAvatar();
      });
      $scope.noPopover = function() {
        $scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2)) ? "default" : "pointer";
        return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
      }
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("avatar-duo")
        if ($scope.users.length === 3)
          result.push("avatar-trio")
        if ($scope.users.length >= 4)
          result.push("avatar-quad")
        return result;
      }
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.stopPropCheck = function(evt) {
        $scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
        if (!$scope.nopopover) {
          evt.stopPropagation();
        }
      };
      $scope.$on("snAvatar.closeOtherPopovers", function(id) {
        if (id !== $scope.randId)
          snCustomEvent.fireTop('snAvatar.closePopover');
      });
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
      $scope.loadFullProfile = function() {
        if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
          $http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
            function(response) {
              try {
                angular.extend($scope.primary, response.data.result);
                avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
              } catch (e) {}
            });
        }
      }
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatar.js */
angular.module('sn.common.avatar')
  .factory('snAvatarFactory', function($http, $compile, $templateCache, $q, snCustomEvent, snConnectService) {
    'use strict';
    return function() {
      return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
          members: '=',
          primary: '=',
          showPresence: '=?',
          enableContextMenu: '=?',
          enableTooltip: '=?',
          enableBindOnce: '@',
          displayMemberCount: "=?",
          groupAvatar: "@"
        },
        compile: function(tElement) {
          var template = tElement.html();
          return function(scope, element, attrs, controller, transcludeFn) {
            var newElement = $compile(template, transcludeFn)(scope);
            element.html(newElement);
            if (scope.enableTooltip) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
            }
            if (attrs.enableBindOnce === 'false') {
              scope.$watch('primary', recompile);
              scope.$watch('members', recompile);
            }
            if (scope.enableTooltip) {
              var usersWatch = scope.$watch('users', function() {
                if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
                  element.tooltip({
                    placement: 'auto top',
                    container: 'body'
                  }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
                  if (element.hideFix)
                    element.hideFix();
                  usersWatch();
                }
              });
            }
            if (scope.enableContextMenu !== false) {
              scope.contextOptions = [];
              var gUser = null;
              try {
                gUser = g_user;
              } catch (err) {}
              if (scope.users && scope.users.length === 1 && scope.users[0] && (scope.users[0].userID || scope.users[0].sys_id)) {
                scope.contextOptions = [
                  ["Open user's profile", function() {
                    if (scope.users && scope.users.length > 0) {
                      window.open('/nav_to.do?uri=' + encodeURIComponent('sys_user.do?sys_id=' + scope.users[0].userID), '_blank');
                    }
                  }]
                ];
                if ((gUser && scope.users[0].userID && scope.users[0].userID !== gUser.userID) ||
                  (scope.liveProfileID && scope.users[0] && scope.users[0].sysID !== scope.liveProfileID)) {
                  scope.contextOptions.push(["Open a new chat", function() {
                    snConnectService.openWithProfile(scope.users[0]);
                  }]);
                }
              }
            } else {
              scope.contextOptions = [];
            }
          };
        },
        controller: function($scope, liveProfileID) {
          var firstBuildAvatar = true;
          $scope.displayMemberCount = $scope.displayMemberCount || false;
          $scope.liveProfileID = liveProfileID;
          $scope.$watch('primary', function(newValue, oldValue) {
            if ($scope.primary && newValue !== oldValue) {
              if (!firstBuildAvatar)
                buildAvatar();
              if ($scope.contextOptions.length > 0) {
                $scope.contextOptions = [
                  ["Open user's profile", function() {
                    if ($scope.users && $scope.users.length > 0) {
                      window.location.href = 'sys_user.do?sys_id=' + $scope.users[0].userID || $scope.users[0].userID;
                    }
                  }]
                ];
                var gUser = null;
                try {
                  gUser = g_user;
                } catch (err) {}
                if ((!gUser && !liveProfileID) || ($scope.users && $scope.users.length === 1 && $scope.users[0])) {
                  if ((gUser && $scope.users[0].userID && $scope.users[0].userID !== gUser.userID) ||
                    ($scope.liveProfileID && $scope.users[0] && $scope.users[0].sysID !== $scope.liveProfileID)) {
                    $scope.contextOptions.push(["Open a new chat", function() {
                      snConnectService.openWithProfile($scope.users[0]);
                    }]);
                  }
                }
              }
            }
          });
          $scope.$watch('members', function() {
            if ($scope.members && !firstBuildAvatar)
              buildAvatar();
          });
          $scope.avatarType = function() {
            var result = [];
            if ($scope.groupAvatar || !$scope.users)
              return result;
            if ($scope.users.length > 1)
              result.push("group");
            if ($scope.users.length === 2)
              result.push("avatar-duo");
            if ($scope.users.length === 3)
              result.push("avatar-trio");
            if ($scope.users.length >= 4)
              result.push("avatar-quad");
            return result;
          };
          $scope.getBackgroundStyle = function(user) {
            var avatar = (user ? user.avatar : '');
            if ($scope.groupAvatar)
              avatar = $scope.groupAvatar;
            if (avatar && avatar !== '')
              return {
                'background-image': 'url(' + avatar + ')'
              };
            if (user && user.name)
              return '';
            return void(0);
          };
          $scope.maxStringWidth = function() {
            var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
            return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
          };

          function buildInitials(name) {
            if (!name)
              return "--";
            var initials = name.split(" ").map(function(word) {
              return word.toUpperCase();
            }).filter(function(word) {
              return word.match(/^[A-ZÀ-Ÿ]/);
            }).map(function(word) {
              return word.substring(0, 1);
            }).join("");
            return (initials.length > 3) ?
              initials.substr(0, 3) :
              initials;
          }
          $scope.avatartooltip = function() {
            if (!$scope.enableTooltip) {
              return '';
            }
            if (!$scope.users) {
              return '';
            }
            var names = [];
            $scope.users.forEach(function(user) {
              if (!user) {
                return;
              }
              names.push(user.name);
            });
            return names.join(', ');
          };

          function setPresence() {
            $scope.presenceEnabled = $scope.showPresence && !$scope.isDocument && $scope.users.length === 1;
            return $scope.presenceEnabled;
          }

          function buildAvatar() {
            if (firstBuildAvatar)
              firstBuildAvatar = false;
            if (typeof $scope.primary === 'string') {
              return $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
                $scope.users = [{
                  userID: $scope.primary,
                  name: response.data.result.name,
                  initials: buildInitials(response.data.result.name),
                  avatar: response.data.result.avatar
                }];
                return setPresence();
              });
            }
            if ($scope.primary) {
              if ($scope.primary.userImage)
                $scope.primary.avatar = $scope.primary.userImage;
              if (!$scope.primary.userID && $scope.primary.sys_id)
                $scope.primary.userID = $scope.primary.sys_id;
            }
            $scope.isDocument = $scope.primary && $scope.primary.table && $scope.primary.table !== "sys_user" && $scope.primary.table !== "chat_queue_entry";
            $scope.users = [$scope.primary];
            if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
              $scope.users = [$scope.primary];
            } else if ($scope.members && $scope.members.length > 0) {
              $scope.users = buildCompositeAvatar($scope.members);
            }
            return $q.when(setPresence());
          }

          function buildCompositeAvatar(members) {
            var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
            var users = angular.isArray(members) ? members.slice() : [members];
            users = users.sort(function(a, b) {
              var aID = a.userID || a.document;
              var bID = b.userID || b.document;
              if (a.table === "chat_queue_entry")
                return 1;
              if (aID === currentUser)
                return 1;
              else if (bID === currentUser)
                return -1;
              return 0;
            });
            if (users.length === 2)
              users = [users[0]];
            if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
              var index = -1;
              angular.forEach(users, function(user, i) {
                if (user.sys_id === $scope.primary.sys_id) {
                  index = i;
                }
              });
              if (index > -1) {
                users.splice(index, 1);
              }
              users.splice(1, 0, $scope.primary);
            }
            return users;
          }
          buildAvatar();
        }
      }
    }
  })
  .directive('snAvatar', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar.xml');
    return directive;
  })
  .directive('snAvatarOnce', function(snAvatarFactory, getTemplateUrl) {
    var directive = snAvatarFactory();
    directive.templateUrl = getTemplateUrl('sn_avatar_once.xml');
    return directive;
  });;
/*! RESOURCE: /scripts/sn/common/avatar/service.avatarProfilePersister.js */
angular.module('sn.common.avatar').service('avatarProfilePersister', function() {
  "use strict";
  var avatars = {};

  function setAvatar(id, payload) {
    avatars[id] = payload;
  }

  function getAvatar(id) {
    return avatars[id];
  }
  return {
    setAvatar: setAvatar,
    getAvatar: getAvatar
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_user_avatar.xml'),
    replace: true,
    scope: {
      profile: '=?',
      userId: '=?',
      avatarUrl: '=?',
      initials: '=?',
      enablePresence: '@',
      disablePopover: '=?',
      directConversationButton: '=?',
      userName: '=?',
      isAccessible: '=?'
    },
    link: function(scope, element) {
      scope.evaluatedProfile = undefined;
      scope.backgroundStyle = undefined;
      scope.enablePresence = scope.enablePresence !== 'false';
      if (scope.profile) {
        scope.evaluatedProfile = scope.profile;
        scope.userId = scope.profile.userID || "";
        scope.avatarUrl = scope.profile.avatar || "";
        scope.initials = scope.profile.initials || "";
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else if (scope.userId || scope.avatarUrl || scope.initials || scope.userName) {
        scope.evaluatedProfile = scope.profile = {
          'userID': scope.userId || "",
          'avatar': scope.avatarUrl || "",
          'initials': scope.initials || "",
          'userName': scope.userName || "",
          'isAccessible': scope.isAccessible || false
        };
        scope.backgroundStyle = scope.getBackgroundStyle();
      } else {
        var unwatch = scope.$watch('profile', function(newVal) {
          if (newVal) {
            scope.evaluatedProfile = newVal;
            scope.backgroundStyle = scope.getBackgroundStyle();
            unwatch();
          }
        })
      }
      scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
      scope.template = '<sn-user-profile tabindex="-1" id="sn-bootstrap-popover" profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
      scope.ariaRole = scope.disablePopover ? 'presentation' : 'button';
    },
    controller: function($scope) {
      $scope.getBackgroundStyle = function() {
        if (($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '')
          return {
            "background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'
          };
        return {
          "background-image": ""
        };
      };
    }
  }
});;
/*! RESOURCE: /scripts/sn/common/avatar/directive.snGroupAvatar.js */
angular.module('sn.common.avatar').directive('snGroupAvatar', function($http, $compile, getTemplateUrl, avatarProfilePersister) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_group_avatar.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      groupAvatar: "@"
    },
    controller: function($scope, liveProfileID) {
      $scope.liveProfileID = liveProfileID;
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          $scope.users = buildCompositeAvatar($scope.members);
      });
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("sn-avatar_duo")
        if ($scope.users.length === 3)
          result.push("sn-avatar_trio")
        if ($scope.users.length >= 4)
          result.push("sn-avatar_quad")
        return result;
      };
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            "background-image": "url(" + avatar + ")"
          };
        return {};
      };
      $scope.users = buildCompositeAvatar($scope.members);

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
    }
  }
});;;