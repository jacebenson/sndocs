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
      wsConnectTimeout: 1e4
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
        e.addListener("/meta/handshake", this, _), e.addListener("/meta/connect", this, L), e.addListener("/meta/subscribe", this, k), e.addListener("/meta/unsubscribe", this, k)
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
        C = new s.default(e, m),
        y = !1;

      function _(e) {
        setTimeout(function() {
          e.successful && I()
        }, 0)
      }

      function T(n) {
        if (n in l) return l[n];
        var t = new a.default(e, n, y);
        return l[n] = t, t
      }

      function x(e) {
        delete l[e]
      }

      function k(n) {
        n.ext && (!1 === n.ext["glide.amb.active"] && m.disconnect(), void 0 !== n.ext["glide.amb.client.log.level"] && "" !== n.ext["glide.amb.client.log.level"] && (o.default.logLevel = n.ext["glide.amb.client.log.level"], e.setLogLevel(o.default.logLevel)))
      }

      function E() {
        for (var e in d.debug("Resubscribing to all!"), l) {
          var n = l[e];
          n && n.resubscribeToCometD()
        }
      }

      function S() {
        for (var e in d.debug("Unsubscribing from all!"), l) {
          var n = l[e];
          n && n.unsubscribeFromCometD()
        }
      }

      function L(e) {
        if (k(e), t) setTimeout(function() {
          n = !1, d.debug("Connection closed"), c = "closed", D(u.getEvents().CONNECTION_CLOSED)
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
                    f && (f = !1, d.debug("LOGGED_OUT event fire!"), S(), D(u.getEvents().SESSION_LOGGED_OUT), m.loginShow());
                    break;
                  case "session.logged.in":
                    f || M();
                    break;
                  case "session.invalidated":
                  case null:
                    f && (f = !1, d.debug("INVALIDATED event fire!"), S(), D(u.getEvents().SESSION_INVALIDATED));
                    break;
                  default:
                    d.debug("unknown session status - " + t)
                }
              }
            }(e);
          var r = n;
          n = !0 === e.successful, !r && n ? N() : r && !n && (d.addErrorMessage("Connection broken"), c = "broken", w = !0, D(u.getEvents().CONNECTION_BROKEN))
        }
      }

      function I() {
        d.debug("Connection initialized"), y = !0, c = "initialized", D(u.getEvents().CONNECTION_INITIALIZED)
      }

      function N() {
        d.debug("Connection opened"), w ? m.getLastError() === m.getErrorMessages().UNKNOWN_CLIENT && (m.setLastError(null), R()) : C.initialize(O)
      }

      function O() {
        E(), c = "opened", D(u.getEvents().CONNECTION_OPENED)
      }

      function R() {
        var n = function() {
          d.debug("sending /amb_session_setup.do!");
          var n = new XMLHttpRequest;
          return n.open("GET", "/amb_session_setup.do", !0), n.setRequestHeader("Content-type", "application/json;charset=UTF-8"), n.setRequestHeader("X-UserToken", window.g_ck), n.setRequestHeader("X-CometD_SessionID", e.getClientId()), n
        }();
        n.onload = function() {
          200 === this.status && (w = !1, C.initialize(O))
        }, n.send()
      }

      function M() {
        f = !0, d.debug("LOGGED_IN event fire!"), E(), D(u.getEvents().SESSION_LOGGED_IN), m.loginHide()
      }

      function D(e) {
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
        S()
      }, m.resubscribeAll = function() {
        E()
      }, m.removeChannel = function(e) {
        x(e)
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
        return C
      }, m.getChannel = function(e) {
        return T(e)
      }, m.getChannels = function() {
        return l
      }, m.getState = function() {
        return c
      }, m.loginShow = function() {
        var e = '<iframe src="/amb_login.do" frameborder="0" height="400px" width="405px" scrolling="no"></iframe>';
        if (d.debug("Show login window"), h && !v) try {
          var n = new GlideModal("amb_disconnect_modal");
          n.renderWithContent ? (n.template = '<div id="amb_disconnect_modal" tabindex="-1" aria-hidden="true" class="modal" role="dialog">  <div class="modal-dialog small-modal" style="width:450px">     <div class="modal-content">        <header class="modal-header">           <h4 id="small_modal1_title" class="modal-title">Login</h4>        </header>        <div class="modal-body">        </div>     </div>  </div></div>', n.renderWithContent(e)) : (n.setBody(e), n.render()), g = n
        } catch (e) {
          d.debug(e)
        }
      }, m.loginHide = function() {
        g && (g.destroy(), g = null)
      }, m.loginComplete = function() {
        M()
      }, m.subscribeToEvent = function(e, t) {
        return u.getEvents().CONNECTION_OPENED === e && n && t(), u.subscribe(e, t)
      }, m.unsubscribeFromEvent = function(e) {
        u.unsubscribe(e)
      }, m.isLoginWindowEnabled = function() {
        return h
      }, m.isLoginWindowOverride = function() {
        return v
      }, m._metaConnect = L, m._metaHandshake = _, m._sendSessionSetupRequest = R, m._onChannelRedirectSubscriptionComplete = O, m._getChannel = T, m._removeChannel = x, m._connectionInitialized = I, m._connectionOpened = N, m
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
            C = 0,
            y = {},
            _ = 0,
            T = null,
            x = [],
            k = {},
            E = {},
            S = {},
            L = !1,
            I = !1,
            N = 0,
            O = 0,
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
              var n = y[e.channel];
              n && n[e.id] && (delete n[e.id], l._debug("Removed", e.listener ? "listener" : "subscription", e))
            }
          }

          function B(e) {
            e && !e.listener && q(e)
          }

          function j() {
            for (var e in y)
              if (y.hasOwnProperty(e)) {
                var n = y[e];
                if (n)
                  for (var t in n) n.hasOwnProperty(t) && B(n[t])
              }
          }

          function G(e) {
            h !== e && (l._debug("Status", h, "->", e), h = e)
          }

          function H() {
            return "disconnecting" === h || "disconnected" === h
          }

          function W() {
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
            var t = y[e];
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
                if (!H()) {
                  var e = {
                    id: W(),
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
            U(e) && (n = e, e = void 0), b = null, j(), H() && g.reset(!0), te({}), v = 0, w = !0, s = e, a = n;
            var i = l.getURL(),
              r = g.findTransportTypes("1.0", f, i),
              o = {
                id: W(),
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
            ae(e), J("/meta/handshake", e), J("/meta/unsuccessful", e), H() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
          }

          function de(e) {
            le(e, {
              cause: "failure",
              action: "handshake",
              transport: null
            })
          }

          function fe(e, n) {
            J("/meta/connect", e), J("/meta/unsuccessful", e), H() && (n.action = "none"), l.onTransportFailure.call(l, e, n, ce)
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
            var n = y[e.subscription];
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

          function Ce(e) {
            ue(e) || (ae(e), J("/meta/publish", e), J("/meta/unsuccessful", e))
          }

          function ye(e) {
            Ce(e)
          }

          function _e(e) {
            if (N = 0, void 0 !== (e = function(e) {
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
                    t !== r && (l._debug("Transport", t.getType(), "->", r.getType()), t = r), b = e.clientId, w = !1, ee(), e.reestablish = L, L = !0, ae(e), J("/meta/handshake", e), O = e["x-messages"] || 0;
                    var o = H() ? "none" : k.reconnect || "retry";
                    switch (o) {
                      case "retry":
                        Y(), 0 === O ? ne(0) : l._debug("Processing", O, "handshake-delivered messages");
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
                    var n = H() ? "none" : k.reconnect || "retry";
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
                  void 0 !== e.data ? ue(e) || (J(e.channel, e), O > 0 && 0 == --O && (l._debug("Processed last handshake-delivered message"), ne(0))) : void 0 === e.successful ? l._warn("Unknown Bayeux Message", e) : e.successful ? (ae(e), J("/meta/publish", e)) : Ce(e)
                }(e)
            }
          }

          function Te(e) {
            var n = y[e];
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
            var o = ++C,
              s = {
                id: o,
                channel: e,
                scope: r.scope,
                callback: r.method,
                listener: i
              },
              a = y[e];
            return a || (a = {}, y[e] = a), a[o] = s, l._debug("Added", i ? "listener" : "subscription", s), s
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
              if (0 === N && (N = d), "retry" === n.action) {
                n.delay = this.increaseBackoffPeriod();
                var f = k.maxInterval;
                if (f > 0) {
                  var g = k.timeout + k.interval + f;
                  d - N + _ > g && (n.action = "handshake")
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
                  ye(o)
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
            if (!H()) {
              "boolean" != typeof e && (t = n, n = e, e = !1), U(n) && (t = n, n = void 0);
              var i = {
                  id: W(),
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
              0 !== v || H() || w || ee()
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
            y = {}
          }, this.subscribe = function(e, n, t, i, r) {
            if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
            if (!D(e)) throw "Illegal argument type: channel must be a string";
            if (H()) throw "Illegal state: disconnected";
            U(n) && (r = i, i = t, t = n, n = void 0), U(i) && (r = i, i = void 0);
            var o = !Te(e),
              s = ke(e, n, t, !1);
            if (o) {
              var a = {
                  id: W(),
                  channel: "/meta/subscribe",
                  subscription: e
                },
                u = this._mixin(!1, {}, i, a);
              l._putCallback(u.id, r), $(u)
            }
            return s
          }, this.unsubscribe = function(e, n, t) {
            if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
            if (H()) throw "Illegal state: disconnected";
            U(n) && (t = n, n = void 0), this.removeListener(e);
            var i = e.channel;
            if (!Te(i)) {
              var r = {
                  id: W(),
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
            if (H()) throw "Illegal state: disconnected";
            U(n) ? (i = n, n = {}, t = void 0) : U(t) && (i = t, t = void 0);
            var r = {
                id: W(),
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
            if (H()) throw "Illegal state: disconnected";
            if (U(t) ? (o = t, t = {}, i = R.maxNetworkDelay, r = void 0) : U(i) ? (o = i, i = R.maxNetworkDelay, r = void 0) : U(r) && (o = r, r = void 0), "number" != typeof i) throw "Illegal argument type: timeout must be a number";
            n.match(/^\//) || (n = "/" + n);
            var s = "/service" + n,
              a = {
                id: W(),
                channel: s,
                data: t
              },
              u = this._mixin(!1, {}, r, a),
              c = {
                callback: o
              };
            i > 0 && (c.timeout = e.setTimeout(l, function() {
              l._debug("Timing out remote call", u, "after", i, "ms"), Ce({
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
          }, this.isDisconnected = H, this.setBackoffIncrement = function(e) {
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

    function s(e, n) {
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
          if (!e.MSInputMethodContext || !e.document.documentMode)
            for (; e !== e.parent && !e.g_ambClient;) e = e.parent;
          if (e.g_ambClient) return e.g_ambClient
        } catch (e) {
          console.log("AMB getClient() tried to access parent from an iFrame. Caught error: " + e)
        }
        return null
      }(window);
      return e || function(e) {
        var n = window.self;
        n.g_ambClient = e, n.addEventListener("unload", function() {
          n.g_ambClient.disconnect()
        }), "complete" === (n.document ? n.document.readyState : null) ? i() : n.addEventListener("load", i), setTimeout(i, 1e4);
        var t = !1;

        function i() {
          t || (t = !0, n.g_ambClient.connect())
        }
      }(e = s((n = new o.default, t = function() {
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
      }(), {
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
      }), window)), s(e, window);
      var n, t
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