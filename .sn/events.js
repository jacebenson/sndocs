/*! RESOURCE: /scripts/app.guided_tours/lib/events.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.gtaEvents == 'undefined') {
    (function(top) {
        var root = top,
            nativeForEach = Array.prototype.forEach,
            hasOwnProperty = Object.prototype.hasOwnProperty,
            slice = Array.prototype.slice,
            idCounter = 0;

        function miniscore() {
            return {
                keys: Object.keys || function(obj) {
                    if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
                        throw new TypeError("keys() called on a non-object");
                    }
                    var key, keys = [];
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            keys[keys.length] = key;
                        }
                    }
                    return keys;
                },
                uniqueId: function(prefix) {
                    var id = ++idCounter + '';
                    return prefix ? prefix + id : id;
                },
                has: function(obj, key) {
                    return hasOwnProperty.call(obj, key);
                },
                each: function(obj, iterator, context) {
                    if (obj == null) return;
                    if (nativeForEach && obj.forEach === nativeForEach) {
                        obj.forEach(iterator, context);
                    } else if (obj.length === +obj.length) {
                        for (var i = 0, l = obj.length; i < l; i++) {
                            iterator.call(context, obj[i], i, obj);
                        }
                    } else {
                        for (var key in obj) {
                            if (this.has(obj, key)) {
                                iterator.call(context, obj[key], key, obj);
                            }
                        }
                    }
                },
                once: function(func) {
                    var ran = false,
                        memo;
                    return function() {
                        if (ran) return memo;
                        ran = true;
                        memo = func.apply(this, arguments);
                        func = null;
                        return memo;
                    };
                }
            };
        }
        var _ = miniscore(),
            Events;
        Events = {
            on: function(name, callback, context) {
                if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
                this._events || (this._events = {});
                var events = this._events[name] || (this._events[name] = []);
                events.push({
                    callback: callback,
                    context: context,
                    ctx: context || this
                });
                return this;
            },
            once: function(name, callback, context) {
                if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
                var self = this;
                var once = _.once(function() {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                return this.on(name, once, context);
            },
            off: function(name, callback, context) {
                var retain, ev, events, names, i, l, j, k;
                if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
                if (!name && !callback && !context) {
                    this._events = {};
                    return this;
                }
                names = name ? [name] : _.keys(this._events);
                for (i = 0, l = names.length; i < l; i++) {
                    name = names[i];
                    if (events = this._events[name]) {
                        this._events[name] = retain = [];
                        if (callback || context) {
                            for (j = 0, k = events.length; j < k; j++) {
                                ev = events[j];
                                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                                    (context && context !== ev.context)) {
                                    retain.push(ev);
                                }
                            }
                        }
                        if (!retain.length) delete this._events[name];
                    }
                }
                return this;
            },
            trigger: function(name) {
                if (!this._events) return this;
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, 'trigger', name, args)) return this;
                var events = this._events[name];
                var allEvents = this._events.all;
                if (events) triggerEvents(events, args);
                if (allEvents) triggerEvents(allEvents, arguments);
                return this;
            },
            stopListening: function(obj, name, callback) {
                var listeners = this._listeners;
                if (!listeners) return this;
                var deleteListener = !name && !callback;
                if (typeof name === 'object') callback = this;
                if (obj)(listeners = {})[obj._listenerId] = obj;
                for (var id in listeners) {
                    listeners[id].off(name, callback, this);
                    if (deleteListener) delete this._listeners[id];
                }
                return this;
            }
        };
        var eventSplitter = /\s+/;
        var eventsApi = function(obj, action, name, rest) {
            if (!name) return true;
            if (typeof name === 'object') {
                for (var key in name) {
                    obj[action].apply(obj, [key, name[key]].concat(rest));
                }
                return false;
            }
            if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                for (var i = 0, l = names.length; i < l; i++) {
                    obj[action].apply(obj, [names[i]].concat(rest));
                }
                return false;
            }
            return true;
        };
        var triggerEvents = function(events, args) {
            var ev, i = -1,
                l = events.length,
                a1 = args[0],
                a2 = args[1],
                a3 = args[2];
            switch (args.length) {
                case 0:
                    while (++i < l)(ev = events[i]).callback.call(ev.ctx);
                    return;
                case 1:
                    while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
                    return;
                case 2:
                    while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
                    return;
                case 3:
                    while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
                    return;
                default:
                    while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
            }
        };
        var listenMethods = {
            listenTo: 'on',
            listenToOnce: 'once'
        };
        _.each(listenMethods, function(implementation, method) {
            Events[method] = function(obj, name, callback) {
                var listeners = this._listeners || (this._listeners = {});
                var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
                listeners[id] = obj;
                if (typeof name === 'object') callback = this;
                obj[implementation](name, callback, this);
                return this;
            };
        });
        Events.bind = Events.on;
        Events.unbind = Events.off;
        Events.emit = Events.trigger;
        Events.mixin = function(proto) {
            var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
                'listenToOnce', 'bind', 'unbind', 'emit'
            ];
            _.each(exports, function(name) {
                proto[name] = this[name];
            }, this);
            return proto;
        };
        root.NOW.gtaEvents = Events;
    })(top);
};