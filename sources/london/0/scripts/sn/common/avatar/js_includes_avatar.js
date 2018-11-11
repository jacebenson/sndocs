/*! RESOURCE: /scripts/sn/common/avatar/js_includes_avatar.js */
/*! RESOURCE: /scripts/sn/common/presence/js_includes_presence.js */
/*! RESOURCE: /scripts/js_includes_ng_amb.js */
/*! RESOURCE: /scripts/js_includes_amb.js */
/*! RESOURCE: /scripts/amb-client-js.bundle.js */
! function(e, n) {
  "object" == typeof exports && "object" == typeof module ? module.exports = n() : "function" == typeof define && define.amd ? define([], n) : "object" == typeof exports ? exports.ambClientJs = n() : e.ambClientJs = n()
}(this, function() {
  return function(e) {
    function n(i) {
      if (t[i]) return t[i].exports;
      var r = t[i] = {
        i: i,
        l: !1,
        exports: {}
      };
      return e[i].call(r.exports, r, r.exports, n), r.l = !0, r.exports
    }
    var t = {};
    return n.m = e, n.c = t, n.d = function(e, t, i) {
      n.o(e, t) || Object.defineProperty(e, t, {
        configurable: !1,
        enumerable: !0,
        get: i
      })
    }, n.n = function(e) {
      var t = e && e.__esModule ? function() {
        return e.default
      } : function() {
        return e
      };
      return n.d(t, "a", t), t
    }, n.o = function(e, n) {
      return Object.prototype.hasOwnProperty.call(e, n)
    }, n.p = "", n(n.s = 8)
  }([function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(1),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e) {
        function n(n) {
          window.console && console.log(e + " " + n)
        }
        var t = "debug" == r.default.logLevel;
        return {
          debug: function(e) {
            t && n("[DEBUG] " + e)
          },
          addInfoMessage: function(e) {
            n("[INFO] " + e)
          },
          addErrorMessage: function(e) {
            n("[ERROR] " + e)
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = {
      servletURI: "amb/",
      logLevel: "info",
      loginWindow: "true"
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = function(e) {
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
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e, n, t, i) {
        var o = void 0,
          s = void 0,
          u = new r.default("amb.ChannelListener"),
          a = null,
          c = void 0,
          l = e;
        return {
          getCallback: function() {
            return s
          },
          getSubscriptionCallback: function() {
            return i
          },
          getID: function() {
            return o
          },
          subscribe: function(e) {
            return s = e, t && (a = t.subscribeToEvent(t.getEvents().CHANNEL_REDIRECT, this._switchToChannel.bind(this))), c = n.subscribeToEvent(n.getEvents().CONNECTION_OPENED, this._subscribeWhenReady.bind(this)), this
          },
          resubscribe: function() {
            return this.subscribe(s)
          },
          _switchToChannel: function(e, n) {
            e && n && e.getName() === l.getName() && (this.unsubscribe(), l = n, this.subscribe(s))
          },
          _subscribeWhenReady: function() {
            u.debug("Subscribing to '" + l.getName() + "'..."), o = l.subscribe(this)
          },
          unsubscribe: function() {
            return t && t.unsubscribeToEvent(a), l.unsubscribe(this), n.unsubscribeFromEvent(c), u.debug("Unsubscribed from channel: " + l.getName()), this
          },
          publish: function(e) {
            l.publish(e)
          },
          getName: function() {
            return l.getName()
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(2),
      o = i(r),
      s = t(0),
      u = i(s),
      a = t(1),
      c = i(a),
      l = function(e) {
        function n(e) {
          setTimeout(function() {
            e.successful && r()
          }, 0)
        }

        function t(n) {
          n.ext && (!1 === n.ext["glide.amb.active"] && I.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (amb.properties.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(amb.properties.logLevel)))
        }

        function i(e) {
          if (t(e), m) return void setTimeout(function() {
            v = !1, a()
          }, 0);
          var n = e.error;
          n && (x = n), d(e);
          var i = v;
          v = !0 === e.successful, !i && v ? s() : i && !v && l()
        }

        function r() {
          T.debug("Connection initialized"), C = "initialized", b(_.getEvents().CONNECTION_INITIALIZED)
        }

        function s() {
          T.debug("Connection opened"), C = "opened", b(_.getEvents().CONNECTION_OPENED)
        }

        function a() {
          T.debug("Connection closed"), C = "closed", b(_.getEvents().CONNECTION_CLOSED)
        }

        function l() {
          T.addErrorMessage("Connection broken"), C = "broken", b(_.getEvents().CONNECTION_BROKEN)
        }

        function d(e) {
          var n = e.ext;
          if (n) {
            var t = n["glide.session.status"];
            switch (S = !0 === n["glide.amb.login.window.override"], T.debug("session.status - " + t), t) {
              case "session.logged.out":
                y && g();
                break;
              case "session.logged.in":
                y || f();
                break;
              case "session.invalidated":
              case null:
                y && h();
                break;
              default:
                T.debug("unknown session status - " + t)
            }
          }
        }

        function f() {
          y = !0, T.debug("LOGGED_IN event fire!"), b(_.getEvents().SESSION_LOGGED_IN), I.loginHide()
        }

        function g() {
          y = !1, T.debug("LOGGED_OUT event fire!"), b(_.getEvents().SESSION_LOGGED_OUT), I.loginShow()
        }

        function h() {
          y = !1, T.debug("INVALIDATED event fire!"), b(_.getEvents().SESSION_INVALIDATED)
        }

        function b(e) {
          try {
            _.publish(e)
          } catch (n) {
            T.addErrorMessage("error publishing '" + e + "' - " + n)
          }
        }

        function p(e) {
          for (var n = "", t = 0; t < window.location.pathname.match(/\//g).length - 1; t++) n = "../" + n;
          return n + e
        }
        var v = !1,
          m = !1,
          _ = new o.default({
            CONNECTION_INITIALIZED: "connection.initialized",
            CONNECTION_OPENED: "connection.opened",
            CONNECTION_CLOSED: "connection.closed",
            CONNECTION_BROKEN: "connection.broken",
            SESSION_LOGGED_IN: "session.logged.in",
            SESSION_LOGGED_OUT: "session.logged.out",
            SESSION_INVALIDATED: "session.invalidated"
          }),
          C = "closed",
          T = new u.default("amb.ServerConnection");
        ! function() {
          e.addListener("/meta/handshake", this, n), e.addListener("/meta/connect", this, i)
        }();
        var y = !0,
          E = null,
          w = "true" === c.default.loginWindow,
          x = null,
          k = {
            UNKNOWN_CLIENT: "402::Unknown client"
          },
          S = !1,
          I = {};
        return I.connect = function() {
          if (v) return void console.log(">>> connection exists, request satisfied");
          T.debug("Connecting to glide amb server -> " + c.default.servletURI), e.configure({
            url: p(c.default.servletURI),
            logLevel: c.default.logLevel
          }), e.handshake()
        }, I.reload = function() {
          e.reload()
        }, I.abort = function() {
          e.getTransport().abort()
        }, I.disconnect = function() {
          T.debug("Disconnecting from glide amb server.."), m = !0, e.disconnect()
        }, I.getEvents = function() {
          return _.getEvents()
        }, I.getConnectionState = function() {
          return C
        }, I.getLastError = function() {
          return x
        }, I.setLastError = function(e) {
          x = e
        }, I.getErrorMessages = function() {
          return k
        }, I.isLoggedIn = function() {
          return y
        }, I.loginShow = function() {
          var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
          if (T.debug("Show login window"), w && !S) try {
            var n = new GlideModal("amb_disconnect_modal");
            n.renderWithContent ? (n.template = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">  <div class="modal-dialog small-modal" style="width:450px">     <div class="modal-content">        <header class="modal-header">           <h4 id="small_modal1_title" class="modal-title">Login</h4>        </header>        <div class="modal-body">        </div>     </div>  </div></div>', n.renderWithContent(e)) : (n.setBody(e), n.render()), E = n
          } catch (e) {
            T.debug(e)
          }
        }, I.loginHide = function() {
          E && (E.destroy(), E = null)
        }, I.loginComplete = function() {
          f()
        }, I.subscribeToEvent = function(e, n) {
          return _.getEvents().CONNECTION_OPENED === e && v && n(), _.subscribe(e, n)
        }, I.unsubscribeFromEvent = function(e) {
          _.unsubscribe(e)
        }, I.isLoginWindowEnabled = function() {
          return w
        }, I.isLoginWindowOverride = function() {
          return S
        }, I._metaConnect = i, I._metaHandshake = n, I
      };
    n.default = l
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(0),
      o = i(r),
      s = t(2),
      u = i(s),
      a = t(3),
      c = i(a),
      l = function(e, n, t) {
        var i = !1,
          r = e,
          s = new u.default({
            CHANNEL_REDIRECT: "channel.redirect"
          }),
          a = new o.default("amb.ChannelRedirect");
        return {
          subscribeToEvent: function(e, n) {
            return s.subscribe(e, n)
          },
          unsubscribeToEvent: function(e) {
            s.unsubscribe(e)
          },
          getEvents: function() {
            return s.getEvents()
          },
          initialize: function() {
            if (!i) {
              var e = "/sn/meta/channel_redirect/" + r.getClientId(),
                o = t(e);
              new c.default(o, n, null).subscribe(this._onAdvice), a.debug("ChannelRedirect initialized: " + e), i = !0
            }
          },
          _onAdvice: function(e) {
            a.debug("_onAdvice:" + e.data.clientId);
            var n = t(e.data.fromChannel),
              i = t(e.data.toChannel);
            s.publish(s.getEvents().CHANNEL_REDIRECT, [n, i]), a.debug("published channel switch event, fromChannel:" + n.getName() + ", toChannel:" + i.getName())
          }
        }
      };
    n.default = l
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function(e, n, t) {
        function i() {
          var n = e.getStatus();
          return "disconnecting" === n || "disconnected" === n
        }
        var o = null,
          s = null,
          u = [],
          a = [],
          c = new r.default("amb.Channel"),
          l = 0,
          d = t;
        return {
          subscribe: function(e) {
            if (i()) return void c.addErrorMessage("Illegal state: already disconnected");
            if (!e.getCallback()) return void c.addErrorMessage("Cannot subscribe to channel: " + n + ", callback not provided");
            if (!o && d) try {
              this.subscribeToCometD()
            } catch (e) {
              return void c.addErrorMessage(e)
            }
            for (var t = 0; t < u.length; t++)
              if (u[t] === e) return c.debug("Channel listener already in the list"), e.getID();
            u.push(e);
            var r = e.getSubscriptionCallback();
            return r && (s ? r(s) : a.push(r)), ++l
          },
          resubscribe: function() {
            o = null;
            for (var e = 0; e < u.length; e++) u[e].resubscribe()
          },
          subscribeOnInitCompletion: function() {
            d = !0, o = null;
            for (var e = 0; e < u.length; e++) u[e].resubscribe(), c.debug("On init completion successfully subscribed to channel: " + n)
          },
          _handleResponse: function(e) {
            for (var n = 0; n < u.length; n++) u[n].getCallback()(e)
          },
          unsubscribe: function(e) {
            if (!e) return void c.addErrorMessage("Cannot unsubscribe from channel: " + n + ", listener argument does not exist");
            for (var t = 0; t < u.length; t++)
              if (u[t].getID() === e.getID()) {
                u.splice(t, 1);
                break
              }
            u.length < 1 && o && !i() && this.unsubscribeFromCometD()
          },
          publish: function(t) {
            e.publish(n, t)
          },
          subscribeToCometD: function() {
            o = e.subscribe(n, this._handleResponse.bind(this), this.subscriptionCallback), c.debug("Successfully subscribed to channel: " + n)
          },
          subscriptionCallback: function(e) {
            c.debug("Cometd subscription callback completed for channel: " + n), c.debug("Listener callback queue size: " + a.length), s = e, a.map(function(e) {
              e(s)
            }), a = []
          },
          unsubscribeFromCometD: function() {
            null !== o && (e.unsubscribe(o), o = null, s = null, c.debug("Successfully unsubscribed from channel: " + n))
          },
          resubscribeToCometD: function() {
            c.debug("Resubscribe to " + n), this.subscribeToCometD()
          },
          getName: function() {
            return n
          },
          getChannelListeners: function() {
            return u
          },
          getListenerCallbackQueue: function() {
            return a
          },
          setSubscriptionCallbackResponse: function(e) {
            s = e
          }
        }
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(9),
      o = i(r),
      s = t(4),
      u = i(s),
      a = t(0),
      c = i(a),
      l = t(5),
      d = i(l),
      f = t(3),
      g = i(f),
      h = t(6),
      b = i(h),
      p = t(10),
      v = i(p),
      m = function() {
        function e() {
          _.debug("connection broken!"), w = !0
        }

        function n() {
          y = !0, s(), C.initialize(), _.debug("Connection initialized. Initializing " + E.length + " channels.");
          for (var e = 0; e < E.length; e++) E[e].subscribeOnInitCompletion();
          E = []
        }

        function t() {
          if (w) {
            if (_.debug("connection opened!"), p.getLastError() !== p.getErrorMessages().UNKNOWN_CLIENT) return;
            p.setLastError(null), _.debug("channel resubscribe!");
            var e = new XMLHttpRequest;
            e.open("GET", "/amb_session_setup.do", !0), e.setRequestHeader("Content-type", "application/json;charset=UTF-8"), e.setRequestHeader("X-UserToken", window.g_ck), e.send(), e.onload = function() {
              200 === this.status && (r(), w = !1)
            }
          }
        }

        function i() {
          _.debug("Unsubscribing from all!");
          for (var e in m) {
            var n = m[e];
            n && n.unsubscribeFromCometD()
          }
        }

        function r() {
          _.debug("Resubscribing to all!");
          for (var e in m) {
            var n = m[e];
            n && n.resubscribeToCometD()
          }
        }

        function s() {
          C || (C = new d.default(f, p, a))
        }

        function a(e) {
          if (e in m) return m[e];
          var n = new b.default(f, e, y);
          return m[e] = n, y || E.push(n), n
        }
        var l = new o.default,
          f = new l.CometD;
        f.registerTransport("long-polling", new l.LongPollingTransport), f.unregisterTransport("websocket"), f.unregisterTransport("callback-polling");
        var h = new v.default;
        f.registerExtension("graphQLSubscription", h);
        var p = new u.default(f),
          m = {},
          _ = new c.default("amb.MessageClient"),
          C = null,
          T = !1,
          y = !1,
          E = [];
        p.subscribeToEvent(p.getEvents().CONNECTION_BROKEN, e), p.subscribeToEvent(p.getEvents().CONNECTION_OPENED, t), p.subscribeToEvent(p.getEvents().CONNECTION_INITIALIZED, n), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_OUT, i), p.subscribeToEvent(p.getEvents().SESSION_INVALIDATED, i), p.subscribeToEvent(p.getEvents().SESSION_LOGGED_IN, r);
        var w = !1;
        return {
          getServerConnection: function() {
            return p
          },
          isLoggedIn: function() {
            return p.isLoggedIn()
          },
          loginComplete: function() {
            p.loginComplete()
          },
          connect: function() {
            if (T) return void _.addInfoMessage(">>> connection exists, request satisfied");
            T = !0, p.connect()
          },
          reload: function() {
            T = !1, p.reload()
          },
          abort: function() {
            T = !1, p.abort()
          },
          disconnect: function() {
            T = !1, p.disconnect()
          },
          isConnected: function() {
            return T
          },
          getConnectionEvents: function() {
            return p.getEvents()
          },
          subscribeToEvent: function(e, n) {
            return p.subscribeToEvent(e, n)
          },
          unsubscribeFromEvent: function(e) {
            p.unsubscribeFromEvent(e)
          },
          getConnectionState: function() {
            return p.getConnectionState()
          },
          getClientId: function() {
            return f.getClientId()
          },
          getChannel: function(e, n) {
            var t = n || {},
              i = t.subscriptionCallback,
              r = t.serializedGraphQLSubscription;
            s();
            var o = a(e);
            return h.isGraphQLChannel(e) && (r ? h.addGraphQLChannel(e, r) : _.addErrorMessage("Serialized subscription not present for GraphQL channel " + e)), new g.default(o, p, C, i)
          },
          removeChannel: function(e) {
            delete m[e], h.isGraphQLChannel(e) && h.removeGraphQLChannel(e)
          },
          getChannels: function() {
            return m
          },
          registerExtension: function(e, n) {
            f.registerExtension(e, n)
          },
          unregisterExtension: function(e) {
            f.unregisterExtension(e)
          },
          batch: function(e) {
            f.batch(e)
          },
          _connectionInitialized: n,
          _connectionOpened: t,
          _connectionBroken: e,
          _unsubscribeAll: i,
          _resubscribeAll: r,
          _isConnectionBroken: function() {
            return w
          }
        }
      };
    n.default = m
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      return e && e.__esModule ? e : {
        default: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = t(1),
      o = i(r),
      s = t(0),
      u = i(s),
      a = t(2),
      c = i(a),
      l = t(4),
      d = i(l),
      f = t(5),
      g = i(f),
      h = t(3),
      b = i(h),
      p = t(6),
      v = i(p),
      m = t(7),
      _ = i(m),
      C = t(11),
      T = i(C),
      y = {
        properties: o.default,
        Logger: u.default,
        EventManager: c.default,
        ServerConnection: d.default,
        ChannelRedirect: g.default,
        ChannelListener: b.default,
        Channel: v.default,
        MessageClient: _.default,
        getClient: T.default
      };
    n.default = y
  }, function(e, n, t) {
    "use strict";

    function i() {
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
                n()
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
          var e = [],
            n = {};
          this.getTransportTypes = function() {
            return e.slice(0)
          }, this.findTransportTypes = function(t, i, r) {
            for (var o = [], s = 0; s < e.length; ++s) {
              var u = e[s];
              !0 === n[u].accept(t, i, r) && o.push(u)
            }
            return o
          }, this.negotiateTransport = function(t, i, r, o) {
            for (var s = 0; s < e.length; ++s)
              for (var u = e[s], a = 0; a < t.length; ++a)
                if (u === t[a]) {
                  var c = n[u];
                  if (!0 === c.accept(i, r, o)) return c
                }
            return null
          }, this.add = function(t, i, r) {
            for (var o = !1, s = 0; s < e.length; ++s)
              if (e[s] === t) {
                o = !0;
                break
              }
            return o || ("number" != typeof r ? e.push(t) : e.splice(r, 0, t), n[t] = i), !o
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
              }
            return null
          }, this.clear = function() {
            e = [], n = {}
          }, this.reset = function() {
            for (var t = 0; t < e.length; ++t) n[e[t]].reset()
          }
        },
        t = function() {
          var n, t;
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
            throw "Conversion Error " + n + ", typeof " + (void 0 === n ? "undefined" : r(n))
          }, this.accept = function(e, n, t) {
            throw "Abstract"
          }, this.getType = function() {
            return n
          }, this.send = function(e, n) {
            throw "Abstract"
          }, this.reset = function() {
            this._debug("Transport", n, "reset")
          }, this.abort = function() {
            this._debug("Transport", n, "aborted")
          }, this.toString = function() {
            return this.getType()
          }
        };
      t.derive = function(e) {
        function n() {}
        return n.prototype = e, new n
      };
      var i = function() {
          function n(e) {
            for (; g.length > 0;) {
              var n = g[0],
                t = n[0],
                i = n[1];
              if (t.url !== e.url || t.sync !== e.sync) break;
              g.shift(), e.messages = e.messages.concat(t.messages), this._debug("Coalesced", t.messages.length, "messages from request", i.id)
            }
          }

          function i(e, n) {
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

          function r(e) {
            var n = ++l,
              t = {
                id: n,
                metaConnect: !1
              };
            f.length < this.getConfiguration().maxConnections - 1 ? (f.push(t), i.call(this, e, t)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), g.push([e, t]))
          }

          function o(e) {
            var n = e.id;
            if (this._debug("Transport", this.getType(), "metaConnect complete, request", n), null !== d && d.id !== n) throw "Longpoll request mismatch, completing request " + n;
            d = null
          }

          function s(t, i) {
            var o = e.inArray(t, f);
            if (o >= 0 && f.splice(o, 1), g.length > 0) {
              var s = g.shift(),
                u = s[0],
                a = s[1];
              if (this._debug("Transport dequeued request", a.id), i) this.getConfiguration().autoBatch && n.call(this, u), r.call(this, u), this._debug("Transport completed request", t.id, u);
              else {
                var c = this;
                this.setTimeout(function() {
                  c.complete(a, !1, a.metaConnect);
                  var e = {
                      reason: "Previous request failed"
                    },
                    n = a.xhr;
                  e.httpCode = c.xhrStatus(n), u.onFailure(n, u.messages, e)
                }, 0)
              }
            }
          }

          function u(e) {
            if (null !== d) throw "Concurrent metaConnect requests not allowed, request id=" + d.id + " not yet completed";
            var n = ++l;
            this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
            var t = {
              id: n,
              metaConnect: !0
            };
            i.call(this, e, t), d = t
          }
          var a = new t,
            c = t.derive(a),
            l = 0,
            d = null,
            f = [],
            g = [];
          return c.complete = function(e, n, t) {
            t ? o.call(this, e) : s.call(this, e, n)
          }, c.transportSend = function(e, n) {
            throw "Abstract"
          }, c.transportSuccess = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !0, n.metaConnect), t && t.length > 0 ? e.onSuccess(t) : e.onFailure(n.xhr, e.messages, {
              httpCode: 204
            }))
          }, c.transportFailure = function(e, n, t) {
            n.expired || (this.clearTimeout(n.timeout), this.complete(n, !1, n.metaConnect), e.onFailure(n.xhr, e.messages, t))
          }, c.send = function(e, n) {
            n ? u.call(this, e) : r.call(this, e)
          }, c.abort = function() {
            a.abort();
            for (var e = 0; e < f.length; ++e) {
              var n = f[e];
              this._debug("Aborting request", n), this.abortXHR(n.xhr)
            }
            d && (this._debug("Aborting metaConnect request", d), this.abortXHR(d.xhr)), this.reset()
          }, c.reset = function() {
            a.reset(), d = null, f = [], g = []
          }, c.abortXHR = function(e) {
            if (e) try {
              e.abort()
            } catch (e) {
              this._debug(e)
            }
          }, c.xhrStatus = function(e) {
            if (e) try {
              return e.status
            } catch (e) {
              this._debug(e)
            }
            return -1
          }, c
        },
        o = function() {
          var e = new i,
            n = t.derive(e),
            r = !0;
          return n.accept = function(e, n, t) {
            return r || !n
          }, n._setHeaders = function(e, n) {
            if (n)
              for (var t in n) "content-type" !== t.toLowerCase() && e.setRequestHeader(t, n[t])
          }, n.xhrSend = function(e) {
            var t = new XMLHttpRequest;
            return t.open("POST", e.url, !0), n._setHeaders(t, e.headers), t.setRequestHeader("Content-type", "application/json;charset=UTF-8"), t.xhrFields = {
              withCredentials: !0
            }, t.onload = function() {
              var n = this.status;
              n >= 200 && n < 400 ? e.onSuccess(this.response) : e.onError(n, this.statusText)
            }, t.send(e.body), t
          }, n.transportSend = function(e, n) {
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
                      var u = {
                        exception: i
                      };
                      u.httpCode = t.xhrStatus(n.xhr), t.transportFailure(e, n, u)
                    }
                  }
                },
                onError: function(o, s) {
                  r = !1;
                  var u = {
                    reason: o,
                    exception: s
                  };
                  u.httpCode = t.xhrStatus(n.xhr), i ? t.setTimeout(function() {
                    t.transportFailure(e, n, u)
                  }, 0) : t.transportFailure(e, n, u)
                }
              }), i = !1
            } catch (i) {
              r = !1, this.setTimeout(function() {
                t.transportFailure(e, n, {
                  exception: i
                })
              }, 0)
            }
          }, n.reset = function() {
            e.reset(), r = !0
          }, n
        },
        s = function() {
          var e = new i,
            n = t.derive(e);
          return n.accept = function(e, n, t) {
            return !0
          }, n.jsonpSend = function(e) {
            throw "Abstract"
          }, n.transportSend = function(e, n) {
            for (var t = this, i = 0, r = e.messages.length, o = []; r > 0;) {
              var s = JSON.stringify(e.messages.slice(i, i + r));
              if (e.url.length + encodeURI(s).length > 2e3) {
                if (1 === r) return void this.setTimeout(function() {
                  t.transportFailure(e, n, {
                    reason: "Bayeux message too big, max is 2000"
                  })
                }, 0);
                --r
              } else o.push(r), i += r, r = e.messages.length - i
            }
            var u = e;
            if (o.length > 1) {
              var a = 0,
                c = o[0];
              this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", o.join(" + ")), u = this._mixin(!1, {}, e), u.messages = e.messages.slice(a, c), u.onSuccess = e.onSuccess, u.onFailure = e.onFailure;
              for (var l = 1; l < o.length; ++l) {
                var d = this._mixin(!1, {}, e);
                a = c, c += o[l], d.messages = e.messages.slice(a, c), d.onSuccess = e.onSuccess, d.onFailure = e.onFailure, this.send(d, n.metaConnect)
              }
            }
            this._debug("Transport", this.getType(), "sending request", n.id, "envelope", u);
            try {
              var f = !0;
              this.jsonpSend({
                transport: this,
                url: u.url,
                sync: u.sync,
                headers: this.getConfiguration().requestHeaders,
                body: JSON.stringify(u.messages),
                onSuccess: function(e) {
                  var i = !1;
                  try {
                    var r = t.convertToMessages(e);
                    0 === r.length ? t.transportFailure(u, n, {
                      httpCode: 204
                    }) : (i = !0, t.transportSuccess(u, n, r))
                  } catch (e) {
                    t._debug(e), i || t.transportFailure(u, n, {
                      exception: e
                    })
                  }
                },
                onError: function(e, i) {
                  var r = {
                    reason: e,
                    exception: i
                  };
                  f ? t.setTimeout(function() {
                    t.transportFailure(u, n, r)
                  }, 0) : t.transportFailure(u, n, r)
                }
              }), f = !1
            } catch (e) {
              this.setTimeout(function() {
                t.transportFailure(u, n, {
                  exception: e
                })
              }, 0)
            }
          }, n
        },
        u = function() {
          function n() {
            if (!g) {
              g = !0;
              var e = o.getURL().replace(/^http/, "ws");
              this._debug("Transport", this.getType(), "connecting to URL", e);
              try {
                var n = o.getConfiguration().protocol,
                  t = n ? new WebSocket(e, n) : new WebSocket(e)
              } catch (e) {
                throw a = !1, this._debug("Exception while creating WebSocket object", e), e
              }
              l = !1 !== o.getConfiguration().stickyReconnect;
              var i = this,
                r = null,
                s = o.getConfiguration().connectTimeout;
              s > 0 && (r = this.setTimeout(function() {
                r = null, i._debug("Transport", i.getType(), "timed out while connecting to URL", e, ":", s, "ms");
                var n = {
                  code: 1e3,
                  reason: "Connect Timeout"
                };
                i.webSocketClose(t, n.code, n.reason), i.onClose(t, n)
              }, s));
              var u = function() {
                  i._debug("WebSocket opened", t), g = !1, r && (i.clearTimeout(r), r = null), h ? (o._warn("Closing Extra WebSocket Connections", t, h), i.webSocketClose(t, 1e3, "Extra Connection")) : i.onOpen(t)
                },
                c = function(e) {
                  e = e || {
                    code: 1e3
                  }, i._debug("WebSocket closing", t, e), g = !1, r && (i.clearTimeout(r), r = null), null !== h && t !== h ? i._debug("Closed Extra WebSocket Connection", t) : i.onClose(t, e)
                },
                d = function(e) {
                  i._debug("WebSocket message", e, t), t !== h && o._warn("Extra WebSocket Connections", t, h), i.onMessage(t, e)
                };
              t.onopen = u, t.onclose = c, t.onerror = function() {
                c({
                  code: 1002,
                  reason: "Error"
                })
              }, t.onmessage = d, this._debug("Transport", this.getType(), "configured callbacks on", t)
            }
          }

          function i(e, n, t) {
            var i = JSON.stringify(n.messages);
            e.send(i), this._debug("Transport", this.getType(), "sent", n, "metaConnect =", t);
            var r = this.getConfiguration().maxNetworkDelay,
              o = r;
            t && (o += this.getAdvice().timeout, b = !0);
            for (var s = this, u = [], a = 0; a < n.messages.length; ++a) ! function() {
              var t = n.messages[a];
              t.id && (u.push(t.id), f[t.id] = this.setTimeout(function() {
                s._debug("Transport", s.getType(), "timing out message", t.id, "after", o, "on", e);
                var n = {
                  code: 1e3,
                  reason: "Message Timeout"
                };
                s.webSocketClose(e, n.code, n.reason), s.onClose(e, n)
              }, o))
            }();
            this._debug("Transport", this.getType(), "waiting at most", o, "ms for messages", u, "maxNetworkDelay", r, ", timeouts:", f)
          }

          function r(e, t, r) {
            try {
              null === e ? n.call(this) : i.call(this, e, t, r)
            } catch (n) {
              this.setTimeout(function() {
                t.onFailure(e, t.messages, {
                  exception: n
                })
              }, 0)
            }
          }
          var o, s = new t,
            u = t.derive(s),
            a = !0,
            c = !1,
            l = !0,
            d = {},
            f = {},
            g = !1,
            h = null,
            b = !1,
            p = null;
          return u.reset = function() {
            s.reset(), a = !0, c = !1, l = !0, d = {}, f = {}, g = !1, h = null, b = !1, p = null
          }, u.onOpen = function(e) {
            this._debug("Transport", this.getType(), "opened", e), h = e, c = !0, this._debug("Sending pending messages", d);
            for (var n in d) {
              var t = d[n],
                r = t[0],
                o = t[1];
              p = r.onSuccess, i.call(this, e, r, o)
            }
          }, u.onMessage = function(n, t) {
            this._debug("Transport", this.getType(), "received websocket message", t, n);
            for (var i = !1, r = this.convertToMessages(t.data), o = [], s = 0; s < r.length; ++s) {
              var u = r[s];
              if ((/^\/meta\//.test(u.channel) || void 0 !== u.successful) && u.id) {
                o.push(u.id);
                var a = f[u.id];
                a && (this.clearTimeout(a), delete f[u.id], this._debug("Transport", this.getType(), "removed timeout for message", u.id, ", timeouts", f))
              }
              "/meta/connect" === u.channel && (b = !1), "/meta/disconnect" !== u.channel || b || (i = !0)
            }
            for (var c = !1, l = 0; l < o.length; ++l) {
              var g = o[l];
              for (var h in d) {
                var v = h.split(","),
                  m = e.inArray(g, v);
                if (m >= 0) {
                  c = !0, v.splice(m, 1);
                  var _ = d[h][0],
                    C = d[h][1];
                  delete d[h], v.length > 0 && (d[v.join(",")] = [_, C]);
                  break
                }
              }
            }
            c && this._debug("Transport", this.getType(), "removed envelope, envelopes", d), p.call(this, r), i && this.webSocketClose(n, 1e3, "Disconnect")
          }, u.onClose = function(e, n) {
            this._debug("Transport", this.getType(), "closed", e, n), a = l && c;
            for (var t in f) this.clearTimeout(f[t]);
            f = {};
            for (var i in d) {
              var r = d[i][0];
              d[i][1] && (b = !1), r.onFailure(e, r.messages, {
                websocketCode: n.code,
                reason: n.reason
              })
            }
            d = {}, h = null
          }, u.registered = function(e, n) {
            s.registered(e, n), o = n
          }, u.accept = function(e, n, t) {
            return a && !!org.cometd.WebSocket && !1 !== o.websocketEnabled
          }, u.send = function(e, n) {
            this._debug("Transport", this.getType(), "sending", e, "metaConnect =", n);
            for (var t = [], i = 0; i < e.messages.length; ++i) {
              var o = e.messages[i];
              o.id && t.push(o.id)
            }
            d[t.join(",")] = [e, n], this._debug("Transport", this.getType(), "stored envelope, envelopes", d), r.call(this, h, e, n)
          }, u.webSocketClose = function(e, n, t) {
            try {
              e.close(n, t)
            } catch (e) {
              this._debug(e)
            }
          }, u.abort = function() {
            if (s.abort(), h) {
              var e = {
                code: 1001,
                reason: "Abort"
              };
              this.webSocketClose(h, e.code, e.reason), this.onClose(h, e)
            }
            this.reset()
          }, u
        };
      return {
        CometD: function(t) {
          function i(e, n) {
            try {
              return e[n]
            } catch (e) {
              return
            }
          }

          function o(n) {
            return e.isString(n)
          }

          function s(e) {
            return void 0 !== e && null !== e && "function" == typeof e
          }

          function u(e, n) {
            if (window.console) {
              var t = window.console[e];
              s(t) && t.apply(window.console, n)
            }
          }

          function a(e) {
            ae._debug("Configuring cometd object with", e), o(e) && (e = {
              url: e
            }), e || (e = {}), ke = ae._mixin(!1, ke, e);
            var n = ae.getURL();
            if (!n) throw "Missing required configuration parameter 'url' specifying the Bayeux server URL";
            var t = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(n),
              i = t[2],
              r = t[8],
              s = t[9];
            if (le = ae._isCrossDomain(i), ke.appendMessageTypeToURL)
              if (void 0 !== s && s.length > 0) ae._info("Appending message type to URI " + r + s + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1;
              else {
                var u = r.split("/"),
                  a = u.length - 1;
                r.match(/\/$/) && (a -= 1), u[a].indexOf(".") >= 0 && (ae._info("Appending message type to URI " + r + " is not supported, disabling 'appendMessageTypeToURL' configuration"), ke.appendMessageTypeToURL = !1)
              }
          }

          function c(e) {
            if (e) {
              var n = me[e.channel];
              n && n[e.id] && (delete n[e.id], ae._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function l(e) {
            e && !e.listener && c(e)
          }

          function d() {
            for (var e in me) {
              var n = me[e];
              if (n)
                for (var t = 0; t < n.length; ++t) l(n[t])
            }
          }

          function f(e) {
            fe !== e && (ae._debug("Status", fe, "->", e), fe = e)
          }

          function g() {
            return "disconnecting" === fe || "disconnected" === fe
          }

          function h() {
            return ++ge
          }

          function b(e, n, t, i, r) {
            try {
              return n.call(e, i)
            } catch (e) {
              ae._debug("Exception during execution of extension", t, e);
              var o = ae.onExtensionException;
              if (s(o)) {
                ae._debug("Invoking extension exception callback", t, e);
                try {
                  o.call(ae, e, t, r, i)
                } catch (e) {
                  ae._info("Exception during execution of exception callback in extension", t, e)
                }
              }
              return i
            }
          }

          function p(e) {
            for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
              var t = ke.reverseIncomingExtensions ? Te.length - 1 - n : n,
                i = Te[t],
                r = i.extension.incoming;
              if (s(r)) {
                var o = b(i.extension, r, i.name, e, !1);
                e = void 0 === o ? e : o
              }
            }
            return e
          }

          function v(e) {
            for (var n = 0; n < Te.length && (void 0 !== e && null !== e); ++n) {
              var t = Te[n],
                i = t.extension.outgoing;
              if (s(i)) {
                var r = b(t.extension, i, t.name, e, !0);
                e = void 0 === r ? e : r
              }
            }
            return e
          }

          function m(e, n) {
            var t = me[e];
            if (t && t.length > 0)
              for (var i = 0; i < t.length; ++i) {
                var r = t[i];
                if (r) try {
                  r.callback.call(r.scope, n)
                } catch (e) {
                  ae._debug("Exception during notification", r, n, e);
                  var o = ae.onListenerException;
                  if (s(o)) {
                    ae._debug("Invoking listener exception callback", r, e);
                    try {
                      o.call(ae, e, r, r.listener, n)
                    } catch (e) {
                      ae._info("Exception during execution of listener callback", r, e)
                    }
                  }
                }
              }
          }

          function _(e, n) {
            m(e, n);
            for (var t = e.split("/"), i = t.length - 1, r = i; r > 0; --r) {
              var o = t.slice(0, r).join("/") + "/*";
              r === i && m(o, n), o += "*", m(o, n)
            }
          }

          function C() {
            null !== Ce && e.clearTimeout(Ce), Ce = null
          }

          function T(n) {
            C();
            var t = ye.interval + _e;
            ae._debug("Function scheduled in", t, "ms, interval =", ye.interval, "backoff =", _e, n), Ce = e.setTimeout(ae, n, t)
          }

          function y(e, n, t, i) {
            for (var r = 0; r < n.length; ++r) {
              var o = n[r],
                u = "" + h();
              o.id = u, he && (o.clientId = he);
              var a = void 0;
              s(o._callback) && (a = o._callback, delete o._callback), o = v(o), void 0 !== o && null !== o ? (o.id = u, n[r] = o, a && (Ee[u] = a)) : n.splice(r--, 1)
            }
            if (0 !== n.length) {
              var c = ae.getURL();
              ke.appendMessageTypeToURL && (c.match(/\/$/) || (c += "/"), i && (c += i));
              var l = {
                url: c,
                sync: e,
                messages: n,
                onSuccess: function(e) {
                  try {
                    Se.call(ae, e)
                  } catch (e) {
                    ae._debug("Exception during handling of messages", e)
                  }
                },
                onFailure: function(e, n, t) {
                  try {
                    t.connectionType = ae.getTransport().getType(), Ie.call(ae, e, n, t)
                  } catch (e) {
                    ae._debug("Exception during handling of failure", e)
                  }
                }
              };
              ae._debug("Send", l), oe.send(l, t)
            }
          }

          function E(e) {
            be > 0 || !0 === ve ? pe.push(e) : y(!1, [e], !1)
          }

          function w() {
            _e = 0
          }

          function x() {
            _e < ke.maxBackoff && (_e += ke.backoffIncrement)
          }

          function k() {
            ++be
          }

          function S() {
            var e = pe;
            pe = [], e.length > 0 && y(!1, e, !1)
          }

          function I() {
            if (--be < 0) throw "Calls to startBatch() and endBatch() are not paired";
            0 !== be || g() || ve || S()
          }

          function L() {
            if (!g()) {
              var e = {
                channel: "/meta/connect",
                connectionType: oe.getType()
              };
              xe || (e.advice = {
                timeout: 0
              }), f("connecting"), ae._debug("Connect sent", e), y(!1, [e], !0, "connect"), f("connected")
            }
          }

          function N() {
            f("connecting"), T(function() {
              L()
            })
          }

          function O(e) {
            e && (ye = ae._mixin(!1, {}, ke.advice, e), ae._debug("New advice", ye))
          }

          function R(e) {
            C(), e && oe.abort(), he = null, f("disconnected"), be = 0, w(), oe = null, pe.length > 0 && (Ie.call(ae, void 0, pe, {
              reason: "Disconnected"
            }), pe = [])
          }

          function M(e, n, t) {
            var i = ae.onTransportFailure;
            if (s(i)) {
              ae._debug("Invoking transport failure callback", e, n, t);
              try {
                i.call(ae, e, n, t)
              } catch (e) {
                ae._info("Exception during execution of transport failure callback", e)
              }
            }
          }

          function D(e, n) {
            s(e) && (n = e, e = void 0), he = null, d(), g() ? (de.reset(), O(ke.advice)) : O(ae._mixin(!1, ye, {
              reconnect: "retry"
            })), be = 0, ve = !0, se = e, ue = n;
            var t = ae.getURL(),
              i = de.findTransportTypes("1.0", le, t),
              r = {
                version: "1.0",
                minimumVersion: "1.0",
                channel: "/meta/handshake",
                supportedConnectionTypes: i,
                _callback: n,
                advice: {
                  timeout: ye.timeout,
                  interval: ye.interval
                }
              },
              o = ae._mixin(!1, {}, se, r);
            if (!oe && !(oe = de.negotiateTransport(i, "1.0", le, t))) {
              var u = "Could not find initial transport among: " + de.getTransportTypes();
              throw ae._warn(u), u
            }
            ae._debug("Initial transport is", oe.getType()), f("handshaking"), ae._debug("Handshake sent", o), y(!1, [o], !1, "handshake")
          }

          function U() {
            f("handshaking"), ve = !0, T(function() {
              D(se, ue)
            })
          }

          function A(e) {
            var n = Ee[e.id];
            s(n) && (delete Ee[e.id], n.call(ae, e))
          }

          function F(e) {
            A(e), _("/meta/handshake", e), _("/meta/unsuccessful", e), g() || "none" === ye.reconnect ? R(!1) : (x(), U())
          }

          function q(e) {
            if (e.successful) {
              he = e.clientId;
              var n = ae.getURL(),
                t = de.negotiateTransport(e.supportedConnectionTypes, e.version, le, n);
              if (null === t) {
                var i = "Could not negotiate transport with server; client=[" + de.findTransportTypes(e.version, le, n) + "], server=[" + e.supportedConnectionTypes + "]",
                  r = ae.getTransport();
                return M(r.getType(), null, {
                  reason: i,
                  connectionType: r.getType(),
                  transport: r
                }), ae._warn(i), oe.reset(), void F(e)
              }
              oe !== t && (ae._debug("Transport", oe.getType(), "->", t.getType()), oe = t), ve = !1, S(), e.reestablish = we, we = !0, A(e), _("/meta/handshake", e);
              var o = g() ? "none" : ye.reconnect;
              switch (o) {
                case "retry":
                  w(), N();
                  break;
                case "none":
                  R(!1);
                  break;
                default:
                  throw "Unrecognized advice action " + o
              }
            } else F(e)
          }

          function G(e) {
            var n = ae.getURL(),
              t = ae.getTransport(),
              i = de.findTransportTypes("1.0", le, n),
              r = de.negotiateTransport(i, "1.0", le, n);
            r ? (ae._debug("Transport", t.getType(), "->", r.getType()), M(t.getType(), r.getType(), e.failure), F(e), oe = r) : (M(t.getType(), null, e.failure), ae._warn("Could not negotiate transport; client=[" + i + "]"), oe.reset(), F(e))
          }

          function j(e) {
            _("/meta/connect", e), _("/meta/unsuccessful", e);
            var n = g() ? "none" : ye.reconnect;
            switch (n) {
              case "retry":
                N(), x();
                break;
              case "handshake":
                de.reset(), w(), U();
                break;
              case "none":
                R(!1);
                break;
              default:
                throw "Unrecognized advice action" + n
            }
          }

          function P(e) {
            if (xe = e.successful) {
              _("/meta/connect", e);
              var n = g() ? "none" : ye.reconnect;
              switch (n) {
                case "retry":
                  w(), N();
                  break;
                case "none":
                  R(!1);
                  break;
                default:
                  throw "Unrecognized advice action " + n
              }
            } else j(e)
          }

          function B(e) {
            xe = !1, j(e)
          }

          function W(e) {
            R(!0), A(e), _("/meta/disconnect", e), _("/meta/unsuccessful", e)
          }

          function H(e) {
            e.successful ? (R(!1), A(e), _("/meta/disconnect", e)) : W(e)
          }

          function z(e) {
            W(e)
          }

          function Q(e) {
            var n = me[e.subscription];
            if (n)
              for (var t = n.length - 1; t >= 0; --t) {
                var i = n[t];
                if (i && !i.listener) {
                  delete n[t], ae._debug("Removed failed subscription", i);
                  break
                }
              }
            A(e), _("/meta/subscribe", e), _("/meta/unsuccessful", e)
          }

          function J(e) {
            e.successful ? (A(e), _("/meta/subscribe", e)) : Q(e)
          }

          function X(e) {
            Q(e)
          }

          function K(e) {
            A(e), _("/meta/unsubscribe", e), _("/meta/unsuccessful", e)
          }

          function V(e) {
            e.successful ? (A(e), _("/meta/unsubscribe", e)) : K(e)
          }

          function Z(e) {
            K(e)
          }

          function $(e) {
            A(e), _("/meta/publish", e), _("/meta/unsuccessful", e)
          }

          function Y(e) {
            void 0 === e.successful ? void 0 !== e.data ? _(e.channel, e) : ae._warn("Unknown Bayeux Message", e) : e.successful ? (A(e), _("/meta/publish", e)) : $(e)
          }

          function ee(e) {
            $(e)
          }

          function ne(e) {
            if (void 0 !== (e = p(e)) && null !== e) {
              O(e.advice);
              switch (e.channel) {
                case "/meta/handshake":
                  q(e);
                  break;
                case "/meta/connect":
                  P(e);
                  break;
                case "/meta/disconnect":
                  H(e);
                  break;
                case "/meta/subscribe":
                  J(e);
                  break;
                case "/meta/unsubscribe":
                  V(e);
                  break;
                default:
                  Y(e)
              }
            }
          }

          function te(e) {
            var n = me[e];
            if (n)
              for (var t = 0; t < n.length; ++t)
                if (n[t]) return !0;
            return !1
          }

          function ie(e, n) {
            var t = {
              scope: e,
              method: n
            };
            if (s(e)) t.scope = void 0, t.method = e;
            else if (o(n)) {
              if (!e) throw "Invalid scope " + e;
              if (t.method = e[n], !s(t.method)) throw "Invalid callback " + n + " for scope " + e
            } else if (!s(n)) throw "Invalid callback " + n;
            return t
          }

          function re(e, n, t, i) {
            var r = ie(n, t);
            ae._debug("Adding", i ? "listener" : "subscription", "on", e, "with scope", r.scope, "and callback", r.method);
            var o = {
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              s = me[e];
            return s || (s = [], me[e] = s), o.id = s.push(o) - 1, ae._debug("Added", i ? "listener" : "subscription", o), o[0] = e, o[1] = o.id, o
          }
          var oe, se, ue, ae = this,
            ce = t || "default",
            le = !1,
            de = new n,
            fe = "disconnected",
            ge = 0,
            he = null,
            be = 0,
            pe = [],
            ve = !1,
            me = {},
            _e = 0,
            Ce = null,
            Te = [],
            ye = {},
            Ee = {},
            we = !1,
            xe = !1,
            ke = {
              protocol: null,
              stickyReconnect: !0,
              connectTimeout: 0,
              maxConnections: 2,
              backoffIncrement: 1e3,
              maxBackoff: 6e4,
              logLevel: "info",
              reverseIncomingExtensions: !0,
              maxNetworkDelay: 1e4,
              requestHeaders: {},
              appendMessageTypeToURL: !0,
              autoBatch: !1,
              advice: {
                timeout: 6e4,
                interval: 0,
                reconnect: "retry"
              }
            };
          this._mixin = function(e, n, t) {
            for (var o = n || {}, s = 2; s < arguments.length; ++s) {
              var u = arguments[s];
              if (void 0 !== u && null !== u)
                for (var a in u) {
                  var c = i(u, a),
                    l = i(o, a);
                  if (c !== n && void 0 !== c)
                    if (e && "object" === (void 0 === c ? "undefined" : r(c)) && null !== c)
                      if (c instanceof Array) o[a] = this._mixin(e, l instanceof Array ? l : [], c);
                      else {
                        var d = "object" !== (void 0 === l ? "undefined" : r(l)) || l instanceof Array ? {} : l;
                        o[a] = this._mixin(e, d, c)
                      }
                  else o[a] = c
                }
            }
            return o
          }, this._warn = function() {
            u("warn", arguments)
          }, this._info = function() {
            "warn" !== ke.logLevel && u("info", arguments)
          }, this._debug = function() {
            "debug" === ke.logLevel && u("debug", arguments)
          }, this._isCrossDomain = function(e) {
            return e && e !== window.location.host
          };
          var Se, Ie;
          this.send = E, this.receive = ne, Se = function(e) {
            ae._debug("Received", e);
            for (var n = 0; n < e.length; ++n) {
              ne(e[n])
            }
          }, Ie = function(e, n, t) {
            ae._debug("handleFailure", e, n, t), t.transport = e;
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
                  G(o);
                  break;
                case "/meta/connect":
                  B(o);
                  break;
                case "/meta/disconnect":
                  z(o);
                  break;
                case "/meta/subscribe":
                  o.subscription = r.subscription, X(o);
                  break;
                case "/meta/unsubscribe":
                  o.subscription = r.subscription, Z(o);
                  break;
                default:
                  ee(o)
              }
            }
          }, this.registerTransport = function(e, n, t) {
            var i = de.add(e, n, t);
            return i && (this._debug("Registered transport", e), s(n.registered) && n.registered(e, this)), i
          }, this.getTransportTypes = function() {
            return de.getTransportTypes()
          }, this.unregisterTransport = function(e) {
            var n = de.remove(e);
            return null !== n && (this._debug("Unregistered transport", e), s(n.unregistered) && n.unregistered()), n
          }, this.unregisterTransports = function() {
            de.clear()
          }, this.findTransport = function(e) {
            return de.find(e)
          }, this.configure = function(e) {
            a.call(this, e)
          }, this.init = function(e, n) {
            this.configure(e), this.handshake(n)
          }, this.handshake = function(e, n) {
            f("disconnected"), we = !1, D(e, n)
          }, this.disconnect = function(e, n, t) {
            if (!g()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), s(n) && (t = n, n = void 0);
              var i = {
                  channel: "/meta/disconnect",
                  _callback: t
                },
                r = this._mixin(!1, {}, n, i);
              f("disconnecting"), y(!0 === e, [r], !1, "disconnect")
            }
          }, this.startBatch = function() {
            k()
            I()
          }, this.batch = function(e, n) {
            var t = ie(e, n);
            this.startBatch();
            try {
              t.method.call(t.scope), this.endBatch()
            } catch (e) {
              throw this._info("Exception during execution of batch", e), this.endBatch(), e
            }
          }, this.addListener = function(e, n, t) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            return re(e, n, t, !0)
          }, this.removeListener = function(e) {
            if (!(e && e.channel && "id" in e)) throw "Invalid argument: expected subscription, not " + e;
            c(e)
          }, this.clearListeners = function() {
            me = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            if (g()) throw "Illegal state: already disconnected";
            s(n) && (r = i, i = t, t = n, n = void 0), s(i) && (r = i, i = void 0);
            var u = !te(e),
              a = re(e, n, t, !1);
            if (u) {
              var c = {
                channel: "/meta/subscribe",
                subscription: e,
                _callback: r
              };
              E(this._mixin(!1, {}, i, c))
            }
            return a
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (g()) throw "Illegal state: already disconnected";
            s(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!te(i)) {
              var r = {
                channel: "/meta/unsubscribe",
                subscription: i,
                _callback: t
              };
              E(this._mixin(!1, {}, n, r))
            }
          }, this.resubscribe = function(e, n) {
            if (l(e), e) return this.subscribe(e.channel, e.scope, e.callback, n)
          }, this.clearSubscriptions = function() {
            d()
          }, this.publish = function(e, n, t, i) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: channel must be a string";
            if (/^\/meta\//.test(e)) throw "Illegal argument: cannot publish to meta channels";
            if (g()) throw "Illegal state: already disconnected";
            s(n) ? (i = n, n = t = {}) : s(t) && (i = t, t = {});
            var r = {
              channel: e,
              data: n,
              _callback: i
            };
            E(this._mixin(!1, {}, t, r))
          }, this.getStatus = function() {
            return fe
          }, this.isDisconnected = g, this.setBackoffIncrement = function(e) {
            ke.backoffIncrement = e
          }, this.getBackoffIncrement = function() {
            return ke.backoffIncrement
          }, this.getBackoffPeriod = function() {
            return _e
          }, this.setLogLevel = function(e) {
            ke.logLevel = e
          }, this.registerExtension = function(e, n) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!o(e)) throw "Illegal argument type: extension name must be a string";
            for (var t = !1, i = 0; i < Te.length; ++i) {
              if (Te[i].name === e) {
                t = !0;
                break
              }
            }
            return t ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (Te.push({
              name: e,
              extension: n
            }), this._debug("Registered extension", e), s(n.registered) && n.registered(e, this), !0)
          }, this.unregisterExtension = function(e) {
            if (!o(e)) throw "Illegal argument type: extension name must be a string";
            for (var n = !1, t = 0; t < Te.length; ++t) {
              var i = Te[t];
              if (i.name === e) {
                Te.splice(t, 1), n = !0, this._debug("Unregistered extension", e);
                var r = i.extension;
                s(r.unregistered) && r.unregistered();
                break
              }
            }
            return n
          }, this.getExtension = function(e) {
            for (var n = 0; n < Te.length; ++n) {
              var t = Te[n];
              if (t.name === e) return t.extension
            }
            return null
          }, this.getName = function() {
            return ce
          }, this.getClientId = function() {
            return he
          }, this.getURL = function() {
            if (oe && "object" === r(ke.urls)) {
              var e = ke.urls[oe.getType()];
              if (e) return e
            }
            return ke.url
          }, this.getTransport = function() {
            return oe
          }, this.getConfiguration = function() {
            return this._mixin(!0, {}, ke)
          }, this.getAdvice = function() {
            return this._mixin(!0, {}, ye)
          }
        },
        Transport: t,
        RequestTransport: i,
        LongPollingTransport: o,
        CallbackPollingTransport: s,
        WebSocketTransport: u,
        Utils: e
      }
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var r = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
      return typeof e
    } : function(e) {
      return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
    };
    n.default = i
  }, function(e, n, t) {
    "use strict";
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var i = t(0),
      r = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(i),
      o = function() {
        var e = new r.default("amb.GraphQLSubscriptionExtension"),
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
      };
    n.default = o
  }, function(e, n, t) {
    "use strict";

    function i(e) {
      try {
        if (!e.MSInputMethodContext || !e.document.documentMode)
          for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
        if (e.g_ambClient) return e.g_ambClient
      } catch (e) {
        console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
      }
      return null
    }

    function r(e, n) {
      if (void 0 !== e.getClientWindow) {
        if (e.getClientWindow() === n) return e
      }
      var t = o({}, e);
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

    function o(e, n) {
      for (var t in n) Object.prototype.hasOwnProperty.call(n, t) && (e[t] = n[t]);
      return e
    }

    function s(e) {
      function n() {
        i || (i = !0, t.g_ambClient.connect())
      }
      var t = window.self;
      t.g_ambClient = e, t.addEventListener("unload", function() {
        t.g_ambClient.disconnect()
      }), "complete" === (t.document ? t.document.readyState : null) ? n() : t.addEventListener("load", n), setTimeout(n, 1e4);
      var i = !1
    }

    function u() {
      function e() {
        function e(e, r, o, s) {
          if (e && o && s) {
            n(e, r, o);
            var u = t(e);
            u || (u = i(e)), u.unloading || u.subscriptions.push({
              id: r,
              callback: o,
              unsubscribe: s
            })
          }
        }

        function n(e, n, i) {
          if (e && i) {
            var r = t(e);
            if (r)
              for (var o = r.subscriptions, s = o.length - 1; s >= 0; s--) o[s].id === n && o[s].callback === i && o.splice(s, 1)
          }
        }

        function t(e) {
          for (var n = 0, t = o.length; n < t; n++)
            if (o[n].window === e) return o[n];
          return null
        }

        function i(e) {
          var n = {
            window: e,
            onUnload: function() {
              n.unloading = !0;
              for (var e = n.subscriptions, t = void 0; t = e.pop();) t.unsubscribe();
              r(n)
            },
            unloading: !1,
            subscriptions: []
          };
          return e.addEventListener("unload", n.onUnload), o.push(n), n
        }

        function r(e) {
          for (var n = 0, t = o.length; n < t; n++)
            if (o[n].window === e.window) {
              o.splice(n, 1);
              break
            }
          e.subscriptions = [], e.window.removeEventListener("unload", e.onUnload), e.onUnload = null, e.window = null
        }
        var o = [];
        return {
          add: e,
          remove: n
        }
      }
      return function() {
        var n = new c.default,
          t = e();
        return {
          getServerConnection: function() {
            return n.getServerConnection()
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
              u = o.unsubscribe;
            return r = r || window, o.subscribe = function(i) {
              return t.add(r, o, i, function() {
                o.unsubscribe(i)
              }), r.addEventListener("unload", function() {
                n.removeChannel(e)
              }), s.call(o, i), o
            }, o.unsubscribe = function(e) {
              return t.remove(r, o, e), u.call(o, e)
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
          }
        }
      }()
    }
    Object.defineProperty(n, "__esModule", {
      value: !0
    });
    var a = t(7),
      c = function(e) {
        return e && e.__esModule ? e : {
          default: e
        }
      }(a),
      l = function() {
        var e = i(window);
        return e || (e = r(u(), window), s(e)), r(e, window)
      };
    n.default = l
  }])
});;
var amb = ambClientJs.default;
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
  var PRESENCE_DISABLED = "false" === "true";
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
angular.module('sn.common.presence', ['ng.amb', 'sn.common.glide']).config(function($provide) {
  "use strict";
  $provide.constant("PRESENCE_DISABLED", "false" === "true");
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
    if (status == $rootScope.status)
      return;
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
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
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
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          return !(!scope.profile ||
            activeUserID === scope.profile.sysID ||
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